// import statments 
const { createLogger, transports, format } = require("winston");
const LokiTransport = require("winston-loki");
let axios = require('axios');

// declerations 
let types = ['emerg', 'alert', 'crit', 'error', 'warning', 'notice', 'info', 'debug', "locally"]

// configutaions 
const l_log = createLogger({
    transports:
        [
            new LokiTransport({
                host: process.env.LOG_URL || "https://loki.iipl.app",
                labels: { app: process.env.APP_NAME || "HAPPI-API", env: process.env.ENV || "dev" },
                json: true,
                format: format.json(),
                replaceTimestamp: true,
                interval: 30,
                basicAuth: process.env.LOG_BASIC_AUTH || "dev:mlbi4a1iWagAKaw",
                onConnectionError: (err) => console.error(err)
            }),
            new transports.Console({
                format: format.combine(format.simple(), format.colorize())
            })
        ]
})

// log functions  
// exports.log1 = function (type, req = null, message) {
//     let params = {}
//     if (req != null) {
//         params.path = req.path;
//         params.method = req.method;
//         params.headers = req.headers;
//         params.query = req.query;
//         params.params = req.params;
//         if (params.method?.toLowerCase() == "post" || params.method?.toLowerCase() == "put") {
//             params.body = req.body
//         }
//     }
//     if (types.indexOf(type) == -1) {
//         return;
//     }
//     console.log("logger", { level: type, message: message, params: params })
//     l_log.log({ level: type, message: message, params: params })
// }


exports.log = function (type, req = null, message, json) {
    // console.log("log1", types.indexOf(type));
    var labels = {
        "level": type,
        "app": "HAPPI-API",
        env: "dev"
    }
    if (types.indexOf(type) == -1) {
        return;
    }
    // console.log("log2");
    if (req != null) {
        labels.path = req.path;
        labels.method = req.method;
        labels.headers = req.headers;
        labels.query = req.query;
        labels.params = req.params;
        labels.json = json 
        if (labels.method.toLowerCase() == "post" || labels.method.toLowerCase() == "put") {
            labels.body = req.body
        }
    }
    // console.log("log3");
    let data = {
        "streams": [
            {
                "stream": labels,
                "values": [
                    [
                        new Date().getTime() * 1000 * 1000 + "",
                        //message,
                        // "{\"level\":\"info\",\"message\":\"Hello bananas!\"}",
                        JSON.stringify({
                            "level": type,
                            message: message
                        }),
                    ]
                ]
            }
        ]
    };
    // console.log("log4", data);
    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        //  url: 'https://logs-prod-017.grafana.net/loki/api/v1/push',
        //https://loki.iipl.app/
        url: "https://loki.iipl.app/loki/api/v1/push",
        headers: {
            //'Authorization': 'Basic NDgwMzI2OmdsY19leUp2SWpvaU16WXpNRE0ySWl3aWJpSTZJbk4wWVdOckxURXlOamcxTnkxb2JDMWhjR2tpTENKcklqb2lNVWRYWVRsUU16bFVXbTl6UnpNMVFqUnBOelJETld0S0lpd2liU0k2ZXlKeUlqb2lkWE1pZlgwPQ==',
            'Authorization': 'Basic ZGV2Om1sYmk0YTFpV2FnQUthdw==',
            'Content-Type': 'application/json'
        },
        data: JSON.stringify(data)
    };
    // console.log("log5");
    axios.request(config)
        .then((response) => {
            console.log("sent success")
            // console.log(JSON.stringify(response.data));
        })
        .catch((error) => {
            console.log(error.response.data);
        });
}









