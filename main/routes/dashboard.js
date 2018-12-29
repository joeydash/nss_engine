const express = require('express');
const router = express.Router();
const hash = require('object-hash');
const verifier = require('google-id-token-verifier');
const cloudinary = require('cloudinary');

const config = require('./config');
const jd_gql_helper = require('./jd_gql_helper');

const clientId = config.google_clientId;




const verify_user = function (id_token, h_id, roles) {
    return new Promise(function (resolve, reject) {
        verifier.verify(id_token, clientId, function (err, tokenInfo) {
                if (!err) {
                    jd_gql_helper.check_role(h_id, roles)
                        .then(() => resolve())
                        .catch(err => reject(err));
                } else {
                    reject(err);
                }
            }
        );
    })
};




router.post('/upload/image', function (req, res, next) {
    if (req.cookies.nss_user_details !== undefined) {
        verify_user(JSON.parse(req.cookies.nss_user_details).id_token, JSON.parse(req.cookies.nss_user_details).h_id, ["volunteer", "manager"])
            .then(() => {
                cloudinary.config(config.cloudinary_api_id);
                cloudinary.v2.uploader.upload(req.body.file,
                    {folder: "nss2k19"},
                    function (error, result) {
                        if (!error) {
                            res.json({
                                RESPONSE_CODE: 108200,
                                secure_url: result.secure_url
                            });
                        } else {
                            console.log(error);
                            res.status(400);
                            res.json({RESPONSE_CODE: 108400});
                        }
                    });
            })
            .catch((err) => {
                console.log(err);
                res.status(400);
                res.json({RESPONSE_CODE: 108400});
            })
    } else {
        res.status(400);
        res.json({RESPONSE_CODE: 108400});
    }
});




router.get('/events', function (req, res, next) {
    if (req.cookies.nss_user_details !== undefined) {
        verify_user(JSON.parse(req.cookies.nss_user_details).id_token, JSON.parse(req.cookies.nss_user_details).h_id, ["manager"])
            .then(() => {
                res.render('dashboard/events/index')
            })
            .catch((err) => {
                console.log(err);
                res.render('single/dashboard_error', {msg: "You are not a manager only manager can access this page"})
            })
    } else {
        res.render('single/dashboard_error', {msg: "You need to sign in first"})
    }
});

router.post('/insert/event/', function (req, res, next) {
    if (req.cookies.nss_user_details !== undefined) {
        verify_user(JSON.parse(req.cookies.nss_user_details).id_token, JSON.parse(req.cookies.nss_user_details).h_id, ["manager"])
            .then(() => {
                let event = jd_gql_helper.remove_null_field(jd_gql_helper.jsonConcat({
                    h_id: hash(req.body),
                    user_h_id: JSON.parse(req.cookies.nss_user_details).h_id
                }, req.body));
                jd_gql_helper.upsert_table("events", [event], Object.keys(event))
                    .then((data) => {
                        res.json({
                            RESPONSE_CODE: 108200,
                        });
                    })
                    .catch(error => {
                        console.log(error);
                        res.status(400);
                        res.json({RESPONSE_CODE: 108400});
                    });
            })
            .catch((err) => {
                console.log(err);
                res.status(400);
                res.json({RESPONSE_CODE: 108400});
            })
    } else {
        res.status(400);
        res.json({RESPONSE_CODE: 108400});
    }
});

router.post('/select/events/:limit/:offset', function (req, res, next) {
    if (req.cookies.nss_user_details !== undefined) {
        verify_user(JSON.parse(req.cookies.nss_user_details).id_token, JSON.parse(req.cookies.nss_user_details).h_id, ["manager"])
            .then(() => {
                jd_gql_helper.query_table_by_anonymous("events", req.params.limit, req.params.offset, {created_at: "desc"}, ["h_id", "name", "details", "image_url","credits"])
                    .then(data => {
                        res.json({
                            RESPONSE_CODE: 108200,
                            results: data.data.events
                        });
                    })
                    .catch(error => {
                        console.log(error);
                        res.status(400);
                        res.json({RESPONSE_CODE: 108400});
                    });
            })
            .catch((err) => {
                console.log(err);
                res.status(400);
                res.json({RESPONSE_CODE: 108400});
            })
    } else {
        res.status(400);
        res.json({RESPONSE_CODE: 108400});
    }
});


router.post('/edit/event/:h_id', function (req, res, next) {
    if (req.cookies.nss_user_details !== undefined) {
        verify_user(JSON.parse(req.cookies.nss_user_details).id_token, JSON.parse(req.cookies.nss_user_details).h_id, ["manager"])
            .then(() => {
                let event = jd_gql_helper.remove_null_field(jd_gql_helper.jsonConcat({
                    h_id: req.params.h_id,
                    user_h_id: JSON.parse(req.cookies.nss_user_details).h_id
                }, req.body));
                jd_gql_helper.upsert_table("events", [event], Object.keys(event))
                    .then((data) => {
                        res.json({
                            RESPONSE_CODE: 108200,
                        });
                    })
                    .catch(error => {
                        console.log(error);
                        res.status(400);
                        res.json({RESPONSE_CODE: 108400});
                    });
            })
            .catch((err) => {
                console.log(err);
                res.status(400);
                res.json({RESPONSE_CODE: 108400});
            })
    } else {
        res.status(400);
        res.json({RESPONSE_CODE: 108400});
    }
});

router.post('/delete/events/:h_id', function (req, res, next) {
    if (req.cookies.nss_user_details !== undefined) {
        verify_user(JSON.parse(req.cookies.nss_user_details).id_token, JSON.parse(req.cookies.nss_user_details).h_id, [ "manager"])
            .then(() => {
                jd_gql_helper.delete_rows_by_h_id("events", req.params.h_id)
                    .then((data) => {
                        res.json({
                            RESPONSE_CODE: 108200,
                        });
                    })
                    .catch(error => {
                        console.log(error);
                        res.status(400);
                        res.json({RESPONSE_CODE: 108400});
                    });
            })
            .catch((err) => {
                console.log(err);
                res.status(400);
                res.json({RESPONSE_CODE: 108400});
            })
    } else {
        res.status(400);
        res.json({RESPONSE_CODE: 108400});
    }
});

















router.get('/tickets', function (req, res, next) {
    if (req.cookies.nss_user_details !== undefined) {
        verify_user(JSON.parse(req.cookies.nss_user_details).id_token, JSON.parse(req.cookies.nss_user_details).h_id, ["volunteer", "manager"])
            .then(() => {
                res.render('dashboard/tickets/index')
            })
            .catch((err) => {
                console.log(err);
                res.render('single/dashboard_error', {msg: "You are not a volunteer/manager  only volunteer/manager can access this page"})
            })
    } else {
        res.render('single/dashboard_error', {msg: "You need to sign in first"})
    }
});

router.post('/insert/ticket/', function (req, res, next) {
    if (req.cookies.nss_user_details !== undefined) {
        verify_user(JSON.parse(req.cookies.nss_user_details).id_token, JSON.parse(req.cookies.nss_user_details).h_id, ["volunteer", "manager"])
            .then(() => {
                let ticket = jd_gql_helper.remove_null_field(jd_gql_helper.jsonConcat({
                    h_id: hash(req.body + new Date().getTime()),
                    user_h_id: JSON.parse(req.cookies.nss_user_details).h_id
                }, req.body));
                jd_gql_helper.upsert_table("tickets", [ticket], Object.keys(ticket))
                    .then((data) => {
                        res.json({
                            RESPONSE_CODE: 108200,
                        });
                    })
                    .catch(error => {
                        console.log(error);
                        res.status(400);
                        res.json({RESPONSE_CODE: 108400});
                    });
            })
            .catch((err) => {
                console.log(err);
                res.status(400);
                res.json({RESPONSE_CODE: 108400});
            })
    } else {
        res.status(400);
        res.json({RESPONSE_CODE: 108400});
    }
});

router.post('/select/tickets/:limit/:offset', function (req, res, next) {
    if (req.cookies.nss_user_details !== undefined) {
        verify_user(JSON.parse(req.cookies.nss_user_details).id_token, JSON.parse(req.cookies.nss_user_details).h_id, ["volunteer", "manager"])
            .then(() => {
                jd_gql_helper.query_table_by_anonymous("tickets", req.params.limit, req.params.offset, {created_at: "desc"}, ["h_id", "user_h_id", "event_h_id", "usersByuserHId { name email phone_number dob school_name school_city standard }", "eventsByeventHId { name price }", "payment_done", "created_at"])
                    .then(data => {
                        res.json({
                            RESPONSE_CODE: 108200,
                            results: data.data.tickets
                        });
                    })
                    .catch(error => {
                        console.log(error);
                        res.status(400);
                        res.json({RESPONSE_CODE: 108400});
                    });
            })
            .catch((err) => {
                console.log(err);
                res.status(400);
                res.json({RESPONSE_CODE: 108400});
            })
    } else {
        res.status(400);
        res.json({RESPONSE_CODE: 108400});
    }
});

router.post('/edit/ticket/confirm_payment/:bool', function (req, res, next) {
    if (req.cookies.nss_user_details !== undefined) {
        verify_user(JSON.parse(req.cookies.nss_user_details).id_token, JSON.parse(req.cookies.nss_user_details).h_id, ["volunteer", "manager"])
            .then(() => {
                let ticket = jd_gql_helper.remove_null_field(jd_gql_helper.jsonConcat(req.body, {payment_done: req.params.bool}));
                jd_gql_helper.upsert_table("tickets", [ticket], Object.keys(ticket))
                    .then((data) => {
                        res.json({
                            RESPONSE_CODE: 108200,
                        });
                    })
                    .catch(error => {
                        console.log(error);
                        res.status(400);
                        res.json({RESPONSE_CODE: 108400});
                    });
            })
            .catch((err) => {
                console.log(err);
                res.status(400);
                res.json({RESPONSE_CODE: 108400});
            })
    } else {
        res.status(400);
        res.json({RESPONSE_CODE: 108400});
    }
});


















router.get('/past_speakers', function (req, res, next) {
    if (req.cookies.nss_user_details !== undefined) {
        verify_user(JSON.parse(req.cookies.nss_user_details).id_token, JSON.parse(req.cookies.nss_user_details).h_id, ["manager"])
            .then(() => {
                res.render('dashboard/past_speakers/index')
            })
            .catch((err) => {
                console.log(err);
                res.render('single/dashboard_error', {msg: "You are not a volunteer/manager  only volunteer/manager can access this page"})
            })
    } else {
        res.render('single/dashboard_error', {msg: "You need to sign in first"})
    }
});


router.post('/insert/past_speaker/', function (req, res, next) {
    if (req.cookies.nss_user_details !== undefined) {
        verify_user(JSON.parse(req.cookies.nss_user_details).id_token, JSON.parse(req.cookies.nss_user_details).h_id, ["manager"])
            .then(() => {
                let past_speaker = jd_gql_helper.remove_null_field(jd_gql_helper.jsonConcat({
                    h_id: hash(req.body),
                }, req.body));
                jd_gql_helper.upsert_table("past_speakers", [past_speaker], Object.keys(past_speaker))
                    .then((data) => {
                        res.json({
                            RESPONSE_CODE: 108200,
                        });
                    })
                    .catch(error => {
                        console.log(error);
                        res.status(400);
                        res.json({RESPONSE_CODE: 108400});
                    });
            })
            .catch((err) => {
                console.log(err);
                res.status(400);
                res.json({RESPONSE_CODE: 108400});
            })
    } else {
        res.status(400);
        res.json({RESPONSE_CODE: 108400});
    }
});

router.post('/select/past_speakers/:limit/:offset', function (req, res, next) {
    if (req.cookies.nss_user_details !== undefined) {
        verify_user(JSON.parse(req.cookies.nss_user_details).id_token, JSON.parse(req.cookies.nss_user_details).h_id, ["manager"])
            .then(() => {
                jd_gql_helper.query_table_by_anonymous("past_speakers", req.params.limit, req.params.offset, {created_at: "desc"}, ["h_id", "name", "image_url"])
                    .then(data => {
                        res.json({
                            RESPONSE_CODE: 108200,
                            results: data.data.past_speakers
                        });
                    })
                    .catch(error => {
                        console.log(error);
                        res.status(400);
                        res.json({RESPONSE_CODE: 108400});
                    });
            })
            .catch((err) => {
                console.log(err);
                res.status(400);
                res.json({RESPONSE_CODE: 108400});
            })
    } else {
        res.status(400);
        res.json({RESPONSE_CODE: 108400});
    }
});


router.post('/edit/past_speaker/:h_id', function (req, res, next) {
    if (req.cookies.nss_user_details !== undefined) {
        verify_user(JSON.parse(req.cookies.nss_user_details).id_token, JSON.parse(req.cookies.nss_user_details).h_id, ["manager"])
            .then(() => {
                let past_speaker = jd_gql_helper.remove_null_field(jd_gql_helper.jsonConcat({
                    h_id: req.params.h_id,
                }, req.body));
                jd_gql_helper.upsert_table("past_speakers", [past_speaker], Object.keys(past_speaker))
                    .then((data) => {
                        res.json({
                            RESPONSE_CODE: 108200,
                        });
                    })
                    .catch(error => {
                        console.log(error);
                        res.status(400);
                        res.json({RESPONSE_CODE: 108400});
                    });
            })
            .catch((err) => {
                console.log(err);
                res.status(400);
                res.json({RESPONSE_CODE: 108400});
            })
    } else {
        res.status(400);
        res.json({RESPONSE_CODE: 108400});
    }
});

router.post('/delete/past_speakers/:h_id', function (req, res, next) {
    if (req.cookies.nss_user_details !== undefined) {
        verify_user(JSON.parse(req.cookies.nss_user_details).id_token, JSON.parse(req.cookies.nss_user_details).h_id, [ "manager"])
            .then(() => {
                jd_gql_helper.delete_rows_by_h_id("past_speakers", req.params.h_id)
                    .then((data) => {
                        res.json({
                            RESPONSE_CODE: 108200,
                        });
                    })
                    .catch(error => {
                        console.log(error);
                        res.status(400);
                        res.json({RESPONSE_CODE: 108400});
                    });
            })
            .catch((err) => {
                console.log(err);
                res.status(400);
                res.json({RESPONSE_CODE: 108400});
            })
    } else {
        res.status(400);
        res.json({RESPONSE_CODE: 108400});
    }
});















































module.exports = router;
