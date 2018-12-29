const express = require('express');
const router = express.Router();
const hash = require('object-hash');
const verifier = require('google-id-token-verifier');

// const reCAPTCHA = require('recaptcha2');
// const recaptcha = new reCAPTCHA({
//     siteKey: '6Ldnw3oUAAAAAEgDmCzTURSuY8qaNq8Eowzk9Rev',
//     secretKey: '6Ldnw3oUAAAAABSCX5HRXdhYalJ1LK0D0uctp6yY',
//     ssl: false
// });

const config = require('./config');
const jd_gql_helper = require('./jd_gql_helper');

const clientId = config.google_clientId;




router.get('/', function (req, res, next) {
    res.json({RESPONSE_CODE: 108200});
});




router.post('/google/sign_in', function (req, res, next) {
    if (req.cookies.nss_user_details !== undefined) {
        verifier.verify(JSON.parse(req.cookies.nss_user_details).id_token, clientId, function (err, tokenInfo) {
            if (!err) {
                jd_gql_helper.upsert_table('users', [{
                    h_id: tokenInfo.sub,
                    email: tokenInfo.email,
                    role: 'user',
                    image_url: tokenInfo.picture
                }], ["email", "image_url"])
                    .then(data => {
                        res.json({RESPONSE_CODE: 108200});
                    })
                    .catch(error => {
                        console.log(error);
                        res.status(400);
                        res.json({RESPONSE_CODE: 108400});
                    });
            } else {
                console.log(err);
                res.json({
                    RESPONSE_CODE: 108400
                });

            }
        });
    } else {
        res.status(400);
        res.json({RESPONSE_CODE: 108400});
    }
});


router.post('/select/users/:limit/:offset', function (req, res, next) {
    jd_qql_helper.query_table_by_anonymous("users", req.params.limit, req.params.offset, {created_at: "desc"}, ["h_id","name", "image_url", "email", "role"])
        .then(data => {
            res.json({
                RESPONSE_CODE: 108200,
                results: data.data.users
            });
        })
        .catch(error => {
            console.log(error);
            res.status(400);
            res.json({RESPONSE_CODE: 108400});
        });
});




router.post('/ticket/save', function (req, res, next) {

    let ticket = jd_gql_helper.remove_null_field(jd_gql_helper.jsonConcat({
        h_id: hash(req.body) + new Date().getTime()
    }, req.body));

    jd_gql_helper.upsert_table('tickets', [ticket], Object.keys(ticket))
        .then(data => {
            res.json({
                RESPONSE_CODE: 108200,
                h_id: ticket.h_id
            });
        })
        .catch(error => {
            console.log(error);
            res.status(400);
            res.json({RESPONSE_CODE: 108400});
        });
});

router.post('/select_by_user_h_id/tickets/:limit/:offset', function (req, res, next) {
    if (req.cookies.nss_user_details !== undefined) {
        jd_gql_helper.query_table_by_user_h_id("tickets", req.params.limit, req.params.offset,{created_at: "desc"},JSON.parse(req.cookies.nss_user_details).h_id,["h_id","user_h_id","event_h_id", "usersByuserHId { name email phone_number dob school_name school_city }", "eventsByeventHId { name price }", "payment_done", "created_at"])
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
    } else {
        res.status(400);
        res.json({RESPONSE_CODE: 108400});
    }
});




router.post('/anonymous/select/events/:limit/:offset', function (req, res, next) {
    jd_gql_helper.query_table_by_anonymous("events", req.params.limit, req.params.offset, new Object({created_at: "desc"}), ["h_id", "name", "details", "image_url","credits"])
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
});




router.post('/user/is_volunteer', function (req, res, next) {
    if (req.cookies.nss_user_details !== undefined) {
        verifier.verify(JSON.parse(req.cookies.nss_user_details).id_token, clientId, function (err, tokenInfo) {
            if (!err) {
                jd_gql_helper.check_role(JSON.parse(req.cookies.nss_user_details).h_id, ["volunteer"])
                    .then(() => res.json({RESPONSE_CODE: 108200}))
                    .catch(err => res.json({RESPONSE_CODE: 108400}));
            } else {
                console.log(err);
                res.status(400);
                res.json({RESPONSE_CODE: 108400});
            }
        });
    } else {
        res.status(400);
        res.json({RESPONSE_CODE: 108400});
    }
});




router.post('/user/is_manager', function (req, res, next) {
    if (req.cookies.nss_user_details !== undefined) {
        verifier.verify(JSON.parse(req.cookies.nss_user_details).id_token, clientId, function (err, tokenInfo) {
            if (!err) {
                jd_gql_helper.check_role(JSON.parse(req.cookies.nss_user_details).h_id, ["manager"])
                    .then(() => res.json({RESPONSE_CODE: 108200}))
                    .catch(err => res.json({RESPONSE_CODE: 108400}));
            } else {
                console.log(err);
                res.status(400);
                res.json({RESPONSE_CODE: 108400});
            }
        });
    } else {
        res.status(400);
        res.json({RESPONSE_CODE: 108400});
    }
});




// router.post('/user/count/designs/', function (req, res, next) {
//     if (req.cookies.accomox_user_details !== undefined) {
//         verifier.verify(JSON.parse(req.cookies.accomox_user_details).id_token, clientId, function (err, tokenInfo) {
//             if (!err) {
//                 jd_gql_helper.get_count_by_user_id("designs", tokenInfo.sub)
//                     .then(data => {
//                         res.json({
//                             RESPONSE_CODE: 108200,
//                             count: data.data.designs_aggregate.aggregate.sum
//                         });
//                     })
//                     .catch(error => {
//                         console.log(error);
//                         res.status(400);
//                         res.json({RESPONSE_CODE: 108400});
//                     });
//             } else {
//                 console.log(err);
//                 res.status(400);
//                 res.json({RESPONSE_CODE: 108400});
//             }
//         });
//     } else {
//         res.status(400);
//         res.json({RESPONSE_CODE: 108400});
//     }
// });

module.exports = router;
