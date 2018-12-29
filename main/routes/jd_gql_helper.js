const fetch = require('node-fetch');
const config = require('./config');
const graphql_url = config.graphql_engine.graphql_url;


let jd_gql_helper = {
    stringify_object_without_key_qoutes: function (object) {
        if (typeof object !== "object" || Array.isArray(object)) {
            // not an object, stringify using native function
            return JSON.stringify(object);
        }
        let props = Object
            .keys(object)
            .map(key => `${key}:${jd_gql_helper.stringify_object_without_key_qoutes(object[key])}`)
            .join(",");
        return `{${props}}`;
    },
    stringify_object_without_any_qoutes: function (object) {
        return JSON.stringify(object).replace(/\"/g, "");
    },
    stringify_array_objects: function (objects) {
        let string = '[';
        for (let i = 0; i < objects.length; i++) {
            string = string + jd_gql_helper.stringify_object_without_key_qoutes(objects[0]) + ',';
        }
        return string + ']';
    },
    stringify_string_array_to_array_without_quotes: function (string_array) {
        let string = '[';
        for (let i = 0; i < string_array.length; i++) {
            string = string + string_array[i] + ',';
        }
        return string + ']';
    },
    stringify_string_array_to_object_array_without_quotes: function (string_array) {
        let string = '{';
        for (let i = 0; i < string_array.length; i++) {
            string = string + string_array[i] + ',';
        }
        return string + '}';
    },
    remove_null_field: (obj) => {
        Object.entries(obj).forEach(([key, val]) =>
            (val && typeof val === 'object') && jd_gql_helper.remove_null_field(val) ||
            (val === null || val === "") && delete obj[key]
        );
        return obj;
    },
    jsonConcat: function (o1, o2) {
        for (var key in o2) {
            o1[key] = o2[key];
        }
        return o1;
    },
    check_role: function (h_id, roles) {
        return new Promise(function (resolve, reject) {
            let query = '{"query":"query{' + 'users' + '(limit :' +
                '1,' +
                'offset:' +
                '0' +
                'order_by:' +
                jd_gql_helper.stringify_object_without_any_qoutes({created_at: "asc"}) +
                'where:{h_id:{_eq:\\"' +
                h_id +
                '\\"}})' +
                jd_gql_helper.stringify_string_array_to_object_array_without_quotes(["role"]) +
                '}","variables":null}';
            fetch(graphql_url, {method: "POST", headers: {}, body: query})
                .then(data => data.json())
                .then(data => {
                    if (data.data.users.length > 0) {
                        if (roles.indexOf(data.data.users[0].role) > -1) {
                            resolve();
                        } else {
                            reject({RESPONSE: "role din't matched"});
                        }
                    } else {
                        reject({RESPONSE: "no users found"});
                    }
                })
                .catch(err => reject(err));
        });
    },
    upsert_table: function (table, objects, columns) {
        return new Promise(function (resolve, reject) {
            let query = 'mutation {\n' +
                '  insert_' + table + '(objects: ' + jd_gql_helper.stringify_array_objects(objects) + ',on_conflict: {action: update, constraint: ' + table + '_h_id_key, update_columns: ' + jd_gql_helper.stringify_string_array_to_array_without_quotes(columns) + '}) {\n' +
                '    affected_rows\n' +
                '  }\n' +
                '}';
            fetch(graphql_url, {method: "POST", headers: {}, body: JSON.stringify({query: query, variables: null})})
                .then(data => resolve(data.json()))
                .catch(err => reject(err));
        });
    },
    query_table_by_user_h_id: function (table, limit, offset, order_by, user_h_id, returning_columns) {
        return new Promise(function (resolve, reject) {
            let query = '{"query":"query{' + table + '(limit :' +
                limit +
                'offset:' +
                offset +
                'order_by:' +
                jd_gql_helper.stringify_object_without_any_qoutes(order_by) +
                'where:{user_h_id:{_eq:\\"' +
                user_h_id +
                '\\"}})' +
                jd_gql_helper.stringify_string_array_to_object_array_without_quotes(returning_columns) +
                '}","variables":null}';
            fetch(graphql_url, {method: "POST", headers: {}, body: query})
                .then(data => resolve(data.json()))
                .catch(err => reject(err));
        });
    },
    query_table_by_anonymous: function (table, limit, offset, order_by, returning_columns) {
        return new Promise(function (resolve, reject) {
            let query = '{"query":"query{' + table + '(limit :' +
                limit +
                'offset:' +
                offset +
                'order_by:' +
                jd_gql_helper.stringify_object_without_any_qoutes(order_by) +
                ')' +
                jd_gql_helper.stringify_string_array_to_object_array_without_quotes(returning_columns) +
                '}","variables":null}';
            fetch(graphql_url, {method: "POST", headers: {}, body: query})
                .then(data => resolve(data.json()))
                .catch(err => reject(err));
        });
    },
    get_count_by_user_id: function (table, user_h_id) {
        return new Promise(function (resolve, reject) {
            let query = '{"query":"query{' +
                table +
                '_aggregate(where:{user_h_id:{_eq:\\"' +
                user_h_id +
                '\\"}}){aggregate{sum:count}}}","variables":null}';
            fetch(graphql_url, {method: "POST", headers: {}, body: query})
                .then(data => resolve(data.json()))
                .catch(err => reject(err));
        });
    },
    delete_rows_by_h_id: function (table, h_id) {
        return new Promise(function (resolve, reject) {
            let query = '{"query":"mutation{delete_' +
                table +
                '(where:{h_id:{_eq:\\"' +
                h_id +
                '\\"}}){affected_rows}}","variables":null}';
            fetch(graphql_url, {method: "POST", headers: {}, body: query})
                .then(data => resolve(data.json()))
                .catch(err => reject(err));
        });
    },

    delete_rows_by_h_id_and_user_h_id: function (table, h_id, user_h_id) {
        return new Promise(function (resolve, reject) {
            let query = '{"query":"mutation{delete_' +
                table +
                '(where:{h_id:{_eq:\\"' +
                h_id +
                '\\"},user_h_id:{_eq:\\"' +
                user_h_id +
                '\\"}}){affected_rows}}","variables":null}';
            fetch(graphql_url, {method: "POST", headers: {}, body: query})
                .then(data => resolve(data.json()))
                .catch(err => reject(err));
        });
    },
};

module.exports = jd_gql_helper;