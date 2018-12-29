const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const minifyHTML = require('express-minify-html');
const compression = require('compression');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const sm = require('sitemap');
let sitemap = sm.createSitemap ({
    hostname: 'https://nss.iitm.ac.in',
    cacheTime: 600000,
    urls: [
        { url: '/',  changefreq: 'daily', priority: 0.7 },
        { url: '/dashboard/events',  changefreq: 'weekly',  priority: 0.10 },
        { url: '/dashboard/tickets', changefreq: 'weekly',  priority: 0.10},
        { url: '/dashboard/past_speakers', changefreq: 'weekly',  priority: 0.10}
    ]
});


const indexRouter = require('./routes/index');
const dbRouter = require('./routes/db');
const dashboardRouter = require('./routes/dashboard');



const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(bodyParser.json({limit: '20mb', type: 'application/json'}));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(minifyHTML({
    override:      true,
    exception_url: false,
    htmlMinifier: {
        removeComments:            true,
        collapseWhitespace:        true,
        collapseBooleanAttributes: true,
        removeAttributeQuotes:     true,
        removeEmptyAttributes:     true,
        minifyJS:                  true
    }
}));
app.use(compression());
app.use(helmet());


app.use('/', indexRouter);
app.use('/db', dbRouter);
app.use('/dashboard', dashboardRouter);
app.use('/sitemap.xml',(req, res) =>{
    sitemap.toXML( function (err, xml) {
        if (err) {
            return res.status(500).end();
        }
        res.header('Content-Type', 'application/xml');
        res.send( xml );
    });
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('single/error');
});

module.exports = app;
