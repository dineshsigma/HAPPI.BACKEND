
var mongo = require("./db.js");
var axios = require("axios");
let qs = require('qs');


async function ingramTokenAPI(req, res) {

    try{
        if (req.headers['x-api-key'] != "jnkjnkjkjbkjhitfuyfdyaewxjkhvjhfthrs") {
            return res.json({
                message: "invalid signature"
            })
        }

    let db = await mongo.connect();
    const config_collection = db.collection("config");
    var ingram_data = qs.stringify({
        'grant_type': 'client_credentials',
        'client_id': 'vYt7RdGFDW54KqoHaSZGrZJOjYh9vCVQ',
        'client_secret': 'hvlSWESezZ0IvlXh'
    });
    var ingram_config = {
        method: 'post',
        url: 'https://api.ingrammicro.com:443/oauth/oauth20/token',

        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: ingram_data
    };

    var ingram_response = await axios(ingram_config);
    // console.log(ingram_response.data);

    if (ingram_response.data && ingram_response.data.access_token) {
        await config_collection.updateOne(
            {
                key: "ingramauth",
            },
            {
                $set: {
                    key: "ingramauth",
                    token: ingram_response.data.access_token,
                    updated_on: new Date(),
                },
            },
            { upsert: true }
        );
        console.log("INGRAM STOCK SYNC DONE");
        return res.json({
            status:true,
            message:"Ingram Token Api is Working Good"
        })
    }
    else{ 
        return res.json({
            status:false,
            message:ingram_response.data

        })
    }
}catch(error){
    console.log(error)
    return res.json({
        status:false,
        message:error
    })
}


}


//ingramTokenAPI();
module.exports.ingramTokenAPI = ingramTokenAPI

