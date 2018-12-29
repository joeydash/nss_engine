const express = require('express');
const router = express.Router();
const verifier = require('google-id-token-verifier');
const config = require('./config');

const jd_qql_helper = require('./jd_gql_helper');

const clientId = config.google_clientId;



const verify_user = function (id_token, h_id, roles) {
    return new Promise(function (resolve, reject) {
        verifier.verify(id_token, clientId, function (err, tokenInfo) {
                if (!err) {
                    jd_qql_helper.check_role(h_id, roles)
                        .then(() => resolve())
                        .catch(err => reject(err));
                } else {
                    reject(err);
                }
            }
        );
    })
};

const remove_null_field = (obj) => {
    Object.entries(obj).forEach(([key, val])  =>
        (val && typeof val === 'object') && remove_null_field(val) ||
        (val === null || val === "") && delete obj[key]
    );
    return obj;
};

const jsonConcat = function (o1, o2) {
    for (var key in o2) {
        o1[key] = o2[key];
    }
    return o1;
};

router.get('/', function (req, res, next) {
    // if (req.cookies.bc2k19_user_details !== undefined) {
    //     verify_user(JSON.parse(req.cookies.bc2k19_user_details).id_token, JSON.parse(req.cookies.bc2k19_user_details).h_id, ["volunteer", "manager"])
    //         .then(() => {
    //             res.render('main/home/index');
    //         })
    //         .catch((err) => {
    //             console.log(err);
    //             res.render('single/getting_ready');
    //         })
    // } else {
    //     res.render('single/getting_ready');
    // }
    res.render('main/home/index');

});

router.get('/termsandconditions', function (req, res, next) {
    res.render('single/termsandconditions');
});

router.get('/privacypolicy', function (req, res, next) {
    res.render('single/privacypolicy');
});


router.get('/ticket/:id', function (req, res, next) {
    res.render('single/ticket_confirmed',{ticket_id : req.params.id});
});


module.exports = router;
