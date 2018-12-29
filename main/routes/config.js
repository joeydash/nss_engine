let graphql_host = process.env.GRAPHQL_ENGINE_DATABASE_HOST || "localhost";

let config = {
    google_clientId: "486280821758-hmhh5k16bq1mh3h5ttht28j4bb3k40dl.apps.googleusercontent.com",
    cloudinary_api_id: {
        cloud_name: 'joeydash',
        api_key: '571664355428984',
        api_secret: 'Br8_bTtFahHJkytcibUAxvrsyjk'
    },
    graphql_engine: {
        graphql_host: graphql_host,
        graphql_port: "8090",
        graphql_url: "http://" + graphql_host + ":" + "8090" + "/v1alpha1/graphql"
    },
};

module.exports = config;