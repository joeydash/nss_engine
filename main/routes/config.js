let graphql_host = process.env.GRAPHQL_ENGINE_DATABASE_HOST || "localhost";

let config = {
    google_clientId: "108714462312-35l9judrs9fh2oeoj9hj5eeihbglhg3p.apps.googleusercontent.com",
    // V_2MBOl4vBE6xvm0XXIg-s34
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