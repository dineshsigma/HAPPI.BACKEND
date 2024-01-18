var axios = require('axios');
const csvtojsonV2=require("csvtojson/v2");

const csvFilePath='/c/Users/srk43/Downloads/STOCK 24.11.xls.csv"'

var jsonObj = [
    // {
    //     "EAN_No": "F19 6/128 Blue",
    //     "q": "2"
    // },
    // {
    //     "EAN_No": "F19 6/128 Silver",
    //     "q": "1"
    // },
    // {
    //     "EAN_No": "F19pro 8/128 Black",
    //     "q": "1"
    // },
    // {
    //     "EAN_No": "F127GG 4/64 Green",
    //     "q": "5"
    // },
    // {
    //     "EAN_No": "M127GG 4/64 Blue",
    //     "q": "2"
    // },
    // {
    //     "EAN_No": "M127GG 4/64 White",
    //     "q": "1"
    // },
    // {
    //     "EAN_No": "M326BH 8/128 Blue",
    //     "q": "3"
    // },
    // {
    //     "EAN_No": "M326BI 6/128 Black",
    //     "q": "1"
    // },
    // {
    //     "EAN_No": "M326BI 6/128 Blue",
    //     "q": "1"
    // },
    // {
    //     "EAN_No": "V20Pro 8/128 Jazz",
    //     "q": "1"
    // },
    // {
    //     "EAN_No": "V21e 5G 8/128 Jazz",
    //     "q": "2"
    // },
    // {
    //     "EAN_No": "V21e 5G 8/128 Pearl",
    //     "q": "1"
    // },
    // {
    //     "EAN_No": "Y12s 3/21 Black",
    //     "q": "1"
    // },
    // {
    //     "EAN_No": "Y1s 2/32 Black",
    //     "q": "7"
    // },
    // {
    //     "EAN_No": "Y1s 2/32 Blue",
    //     "q": "3"
    // },
    // {
    //     "EAN_No": "Y20G 4/64 Blue",
    //     "q": "5"
    // },
    // {
    //     "EAN_No": "Y20T 6/64 Blue",
    //     "q": "8"
    // },
    // {
    //     "EAN_No": "Y21 4/64 Blue",
    //     "q": "5"
    // },
    // {
    //     "EAN_No": "Y21 4/64 Glow",
    //     "q": "5"
    // },
    // {
    //     "EAN_No": "Y33s 8/128 Black",
    //     "q": "3"
    // },
    // {
    //     "EAN_No": "Y33s 8/128 Dream",
    //     "q": "8"
    // },
    // {
    //     "EAN_No": "Y51A 8/128 Saphire",
    //     "q": "0"
    // },
    // {
    //     "EAN_No": "Y73 8/128 Black",
    //     "q": "2"
    // },
    // {
    //     "EAN_No": "Y73 8/128 Flare",
    //     "q": "8"
    // },
    // {
    //     "EAN_No": "10 ProMax 6/128 BK",
    //     "q": "1"
    // },
    // {
    //     "EAN_No": "10Prime 4/64 Black",
    //     "q": "7"
    // },
    // {
    //     "EAN_No": "10Prime 4/64 Blue",
    //     "q": "1"
    // },
    // {
    //     "EAN_No": "10Prime 6/128 Black",
    //     "q": "17"
    // },
    // {
    //     "EAN_No": "10Prime 6/128 Blue",
    //     "q": "17"
    // },
    // {
    //     "EAN_No": "10Prime 6/128 White",
    //     "q": "1"
    // },
    // {
    //     "EAN_No": "11Lite NE 6/128 Blac",
    //     "q": "5"
    // },
    // {
    //     "EAN_No": "11Lite NE 8/128 Blac",
    //     "q": "3"
    // },
    // {
    //     "EAN_No": "11X 6/128 Black",
    //     "q": "2"
    // },
    // {
    //     "EAN_No": "11X 6/128 White",
    //     "q": "1"
    // },
    // {
    //     "EAN_No": "11X 8/128 White",
    //     "q": "16"
    // },
    // {
    //     "EAN_No": "11XPro 8/128 White",
    //     "q": "1"
    // },
    // {
    //     "EAN_No": "9A 2/32 Blue",
    //     "q": "1"
    // },
    // {
    //     "EAN_No": "9A 3/32 Green",
    //     "q": "9"
    // },
    // {
    //     "EAN_No": "9Activ 4/64 Black",
    //     "q": "5"
    // },
    // {
    //     "EAN_No": "9Activ 4/64 Green",
    //     "q": "2"
    // },
    // {
    //     "EAN_No": "9Activ 4/64 Purple",
    //     "q": "1"
    // },
    // {
    //     "EAN_No": "9Activ 6/128 Black",
    //     "q": "1"
    // },
    // {
    //     "EAN_No": "9Activ 6/128 Green",
    //     "q": "7"
    // },
    // {
    //     "EAN_No": "9Activ 6/128 Purple",
    //     "q": "5"
    // },
    // {
    //     "EAN_No": "9Power 4/64 Red",
    //     "q": "1"
    // },
    // {
    //     "EAN_No": "9Power 6/128 Green",
    //     "q": "2"
    // },
    // {
    //     "EAN_No": "Note 10s 6/128 Blue",
    //     "q": "3"
    // },
    // {
    //     "EAN_No": "Note 10s 6/64 Purple",
    //     "q": "1"
    // },
    // {
    //     "EAN_No": "Note 10s 6/64 white",
    //     "q": "1"
    // },
    // {
    //     "EAN_No": "Note10 Pro 6/128 Bro",
    //     "q": "1"
    // },
    // {
    //     "EAN_No": "Note10 Pro 6/128 Dar",
    //     "q": "1"
    // },
    // {
    //     "EAN_No": "Note10Lite 4/64 Blue",
    //     "q": "10"
    // },
    {
        "EAN_No": "10 ProMax 8/128 Bron",
        "q": "2"
    },

]


        jsonObj.forEach(function (e){
            var data = '{"inventories": [{"ean": "'+e.EAN_No+'","fcId": "WHTG","quantity": '+parseInt(e.q)+',"movementType": "RTW","transactionType": "overwrite"}],"createdDateTime": "2021-11-26 20:49:01"}';

            var config = {
                method: 'post',
                url: 'https://api-velocity.ailiens.com/velocity/api/delta/inventory/v2',
                headers: {
                    'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJlbWFpbF9pZCI6ImhhcHBpbW9iaWxlc0BvbXVuaS5jb20iLCJhdWQiOiJvZGluIiwiZmlyc3ROYW1lIjoidml2ZWtzIiwidXNlcl9pZCI6IjJkYmYwODViLWE0MzAtNDZhOS05Nzg0LTY3ODk0YTFmOWUzZCIsInNlc3Npb24iOiJiNDhmM2Q0NC1hZGMwLTQ4ZGUtYjZjZS1kYzZkMGNlNTYzYTIiLCJyb2xlcyI6WyJST0xFX0JVU0lORVNTX1VTRVIiXSwiaXNzIjoiYmxhY2tib2x0IiwidGVuYW50SWQiOiIwYzNmY2JmMy03ZTQ1LTQxYmEtOWU2OS04MDY4ZTRmZmQ1ZTIiLCJ0eXAiOiJCZWFyZXIiLCJpYXQiOjE2MzMwODI3MjMsImp0aSI6IjMzYjFkMTI1LTFmMWUtNGEzZC1iZmU4LWY2MDk1MjE5NTU5ZiJ9.iiJ9Jw__0MSEpa0IZR-ZbBR2du9_p6qj1PFTn8_AIrj6G-mdU2E6IIKpNa_3R0xtxEsElz2YDAIima8KvZLkXZ-sdQzkKlSqanOcsSyMPBkLLogdZP4qvcp2cL_MzqbaxeA07wBMeDNGZNDaATvPQpQa-ASc6FT33jjEgGRu_ukWC4ZnZYHd8BVO68qM8Hdgf6ZgOSNzD4K4gFlOQKK_oxZx7kQTLCdbohoAv42ZUZA__o4F0PDhiOG0eQ0Ql3f4bK3L232xXUVGJvQb-CUMQO4rJy0MFXZdczA-8wHQG-Rdh5BYexMyHuGUGYnrLTfVelfDBe4YW9ENa3PmyEv2Pg',
                    'Content-Type': 'application/json',
                    'Cookie': 'JSESSIONID=node0klu9e4d7x3nylavss6fqnwne231.node0'
                },
                data : data
            };

            axios(config)
                .then(function (response) {
                    console.log(`${new Date()} ------ ${data}  ==============  ${JSON.stringify(response.data)}`);
                })
                .catch(function (error) {
                    //console.log(error);
                })
        })

