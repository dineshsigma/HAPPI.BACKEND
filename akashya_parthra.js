var axios = require('axios');
var mongo = require("./db");


var list = [
    "+919100574444",
    "+918686836269",
    "+918341390202",
    "+919000247654",
    "+919441736366",
    "+918106838432"
];

/*
{
  "from":{
   "phone_number":"+919121863666"
  },
  "to":[
   {
     "phone_number":"{{lead.mobile_number}}"
   }
  ],
  "data":{
   "message_template":{
     "storage":"none",
     "namespace":"bccb4a1b_6c81_4b39_8472_d08f22ffd0cd",
     "template_name":"message_to_store_manager",
     "language":{
      "policy":"deterministic",
      "code":"en"
     },
     "rich_template_data":{

     "body":{
        "params":[
         {
           "data":"{{lead.cf_customer_name}}" // Customise the value
         },
        {
        "data": "{{lead.cf_customer_dob}}" // Customise the value
        },
        {
        "data":"{{lead.cf_customer_name}}" // Customise the value
        },
        {
        "data":"{{lead.cf_customer_number}}" // Customise the value
        }
        ]
      }
     }
   }
  }
}

 */

async function run(){
    for(var i = 0; i < list.length; i++){
        var data = JSON.stringify(
            {
                "lead":
                    {
                        "first_name": "sharan",
                        // "mobile_number": `+919100574444`,
                        // "mobile_number": `+918686836269`,
                        "mobile_number": list[i],
                        "address": "",
                        "custom_field": {
                            "cf_request_type": "Akshaya_Patra_Participation",
                        }
                    }
            });

        var config = {
            method: 'post',
            url: 'https://happimobiles1.freshsales.io/api/leads',
            headers: {
                'Authorization': 'Token token=jjDyYzo0QA5jmaAopMB6wQ',
                'Content-Type': 'application/json'
            },
            data: data
        };
        var result = JSON.stringify(config);

        // var req = await axios(config);

        console.log("config", {
            method: 'post',
            url: 'https://happimobiles1.freshsales.io/api/leads',
            headers: {
                'Authorization': 'Token token=jjDyYzo0QA5jmaAopMB6wQ',
                'Content-Type': 'application/json'
            },
            data: data
        }, req.data);
        // console.log("LeadID", req.data.lead.id);

        var data = JSON.stringify(
            {
                "lead":
                    {
                        "first_name": "Shanmukha",
                        "mobile_number": list[i],
                        "address": "",
                        "custom_field": {
                            "cf_url": `https://www.happimobiles.com/`,
                            // "cf_request_type": "message_to_customer",
                            "cf_request_type": "Akshaya_Patra_Participation",
                            "cf_mobile_model": "",
                            "cf_payment_type": ""
                        }
                    }
            });
        var config = {
            method: 'post',
            url: 'https://happimobiles1.freshsales.io/api/leads',
            headers: {
                'Authorization': 'Token token=jjDyYzo0QA5jmaAopMB6wQ',
                'Content-Type': 'application/json'
            },
            data: data
        };
        var req = await axios(config);
    }

    // console.log(req);
}
//run();



// async function storemanager(){


// try{
//     let database= await mongo.connect();
//     let storecoll= await database.collection('storemanager');
//     let storecode= await storecoll.findOne({"Code":req.body.code});
//     var data = JSON.stringify(
//         {

//                 "from":{
//                     "phone_number":"+919121863666"
//                    },
//                    "to":[
//                     {
//                       "phone_number":"+918106838432"
//                     }
//                    ],
//                    "data":{
//                     "message_template":{
//                       "storage":"none",
//                       "namespace":"bccb4a1b_6c81_4b39_8472_d08f22ffd0cd",
//                       "template_name":"message_to_store_manager",
//                       "language":{
//                        "policy":"deterministic",
//                        "code":"en"
//                       },
//                       "rich_template_data":{
//                         // "header":{
//                         //     "type":"image",
//                         //     "media_url":"http://redmatterapps.com/apps/apatra.jpeg"
//                         //     },
//                         "body":{
//                            "params":[
//                             {
//                               "data":"dinesh" // Customise the value
//                             },
//                    {
//                    "data": "28/04/1997" // Customise the value
//                    },
//                    {
//                    "data":"dinesh" // Customise the value
//                    },
//                    {
//                    "data":"+918106838432" // Customise the value
//                    }
//                            ]
//                          }
//                         }
//                     }
//                 }



//         });



//     var config = {
//         method: 'post',
//         "url": "https://api.freshchat.com/v2/outbound-messages/whatsapp",
//         headers: {
//             'Authorization': 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJpS216TTVkenRIWmprdmdSY3VrVHgxTzJ2SFlTM0U5YmVJME9XbXRNR1ZzIn0.eyJqdGkiOiI1ZTE4M2IzNS0zYzUyLTQwMTMtYWM4NC02OWI2ZGM4ZjNmODEiLCJleHAiOjE5MTM5NDg3OTEsIm5iZiI6MCwiaWF0IjoxNTk4NTg4NzkxLCJpc3MiOiJodHRwOi8vaW50ZXJuYWwtZmMtdXNlMS0wMC1rZXljbG9hay1vYXV0aC0xMzA3MzU3NDU5LnVzLWVhc3QtMS5lbGIuYW1hem9uYXdzLmNvbS9hdXRoL3JlYWxtcy9wcm9kdWN0aW9uIiwiYXVkIjoiMjAyMDQ0OTMtYmFlYS00MTgwLTk4MzMtM2UxNzMyMDVhYTdlIiwic3ViIjoiYTg0NmU0NTktMDcwNy00ZWY4LWEzNDgtNTkzMzFkN2M4M2U2IiwidHlwIjoiQmVhcmVyIiwiYXpwIjoiMjAyMDQ0OTMtYmFlYS00MTgwLTk4MzMtM2UxNzMyMDVhYTdlIiwiYXV0aF90aW1lIjowLCJzZXNzaW9uX3N0YXRlIjoiZDFhY2M3N2UtMDI4My00MDE1LTgwMzMtYmUwNmY0MjI4N2I0IiwiYWNyIjoiMSIsImFsbG93ZWQtb3JpZ2lucyI6W10sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJvZmZsaW5lX2FjY2VzcyIsInVtYV9hdXRob3JpemF0aW9uIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwic2NvcGUiOiJhZ2VudDp1cGRhdGUgbWVzc2FnZTpjcmVhdGUgYWdlbnQ6Y3JlYXRlIG1lc3NhZ2U6Z2V0IGRhc2hib2FyZDpyZWFkIHJlcG9ydHM6ZXh0cmFjdDpyZWFkIHJlcG9ydHM6cmVhZCBhZ2VudDpyZWFkIGNvbnZlcnNhdGlvbjp1cGRhdGUgdXNlcjpkZWxldGUgY29udmVyc2F0aW9uOmNyZWF0ZSBvdXRib3VuZG1lc3NhZ2U6Z2V0IG91dGJvdW5kbWVzc2FnZTpzZW5kIHVzZXI6Y3JlYXRlIHJlcG9ydHM6ZmV0Y2ggdXNlcjp1cGRhdGUgdXNlcjpyZWFkIGJpbGxpbmc6dXBkYXRlIHJlcG9ydHM6ZXh0cmFjdCBjb252ZXJzYXRpb246cmVhZCIsImNsaWVudEhvc3QiOiIxOTIuMTY4LjEyOC4xNTkiLCJjbGllbnRJZCI6IjIwMjA0NDkzLWJhZWEtNDE4MC05ODMzLTNlMTczMjA1YWE3ZSIsImNsaWVudEFkZHJlc3MiOiIxOTIuMTY4LjEyOC4xNTkifQ.4YC8BlJrmddahLw0iowvDxKamlS4P795yhazn9NBIegxZ1w80Q6LAtd_P5xUHWgW7djIBlzPY5tgB6aq92oRDGt2GcqOjJ8Odz-Y1ya_hPuGkkiF3baWzuS_NaSRIwskIGhnkPpvl5l0MoguiyV7RFyphtJ7EvomyghxJ9YNYg8B18sT1eJvOwPULJdiluoe3teyGIPdO7mjOIZtJfv_6hnIFOY8wsD2DvV3Wn28w0Mpn4uQftRLvuYvD62g4i4sZyTmYpRfDSE1tDdcpkVoTUf-VTsFcdFG7PCYfW5U8K1ykjwZ9iOMaoGMQszIeeLHNezICubosBJjFEWKy11aUQ',
//             'Content-Type': 'application/json',
//             "User-Agent": "Freshsales 1.0",
//             "Accept": "*/*",
//         },
//         data: data
//     };

//     var req = await axios(config);

// }
// catch(error){


// }

// }

// storemanager();


// async function customermessage(){
//     try{

//     var data = JSON.stringify({

//         "from":{
//             "phone_number":"+919121863666"
//             },
//             "to":[
//             {
//              "phone_number":"+918106838432"
//             }
//             ],
//             "data":{
//             "message_template":{
//              "storage":"none",
//              "namespace":"bccb4a1b_6c81_4b39_8472_d08f22ffd0cd",
//              "template_name":"message_to_customer_",
//              "language":{
//              "policy":"deterministic",
//              "code":"en"
//              },
//              "rich_template_data":{
//              "header":{
//              "type":"image",
//              "media_url":"http://redmatterapps.com/apps/apatra.jpeg"
//              },
//              "body":{
//              "params":[
//               {
//               "data":"dinesh" // Customise the value
//               }
//              ]
//              }
//              }
//             }
//             }



//         });


//     var config = {
//         method: 'post',
//         "url": "https://api.freshchat.com/v2/outbound-messages/whatsapp",
//         headers: {
//             'Authorization': 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJpS216TTVkenRIWmprdmdSY3VrVHgxTzJ2SFlTM0U5YmVJME9XbXRNR1ZzIn0.eyJqdGkiOiI1ZTE4M2IzNS0zYzUyLTQwMTMtYWM4NC02OWI2ZGM4ZjNmODEiLCJleHAiOjE5MTM5NDg3OTEsIm5iZiI6MCwiaWF0IjoxNTk4NTg4NzkxLCJpc3MiOiJodHRwOi8vaW50ZXJuYWwtZmMtdXNlMS0wMC1rZXljbG9hay1vYXV0aC0xMzA3MzU3NDU5LnVzLWVhc3QtMS5lbGIuYW1hem9uYXdzLmNvbS9hdXRoL3JlYWxtcy9wcm9kdWN0aW9uIiwiYXVkIjoiMjAyMDQ0OTMtYmFlYS00MTgwLTk4MzMtM2UxNzMyMDVhYTdlIiwic3ViIjoiYTg0NmU0NTktMDcwNy00ZWY4LWEzNDgtNTkzMzFkN2M4M2U2IiwidHlwIjoiQmVhcmVyIiwiYXpwIjoiMjAyMDQ0OTMtYmFlYS00MTgwLTk4MzMtM2UxNzMyMDVhYTdlIiwiYXV0aF90aW1lIjowLCJzZXNzaW9uX3N0YXRlIjoiZDFhY2M3N2UtMDI4My00MDE1LTgwMzMtYmUwNmY0MjI4N2I0IiwiYWNyIjoiMSIsImFsbG93ZWQtb3JpZ2lucyI6W10sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJvZmZsaW5lX2FjY2VzcyIsInVtYV9hdXRob3JpemF0aW9uIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwic2NvcGUiOiJhZ2VudDp1cGRhdGUgbWVzc2FnZTpjcmVhdGUgYWdlbnQ6Y3JlYXRlIG1lc3NhZ2U6Z2V0IGRhc2hib2FyZDpyZWFkIHJlcG9ydHM6ZXh0cmFjdDpyZWFkIHJlcG9ydHM6cmVhZCBhZ2VudDpyZWFkIGNvbnZlcnNhdGlvbjp1cGRhdGUgdXNlcjpkZWxldGUgY29udmVyc2F0aW9uOmNyZWF0ZSBvdXRib3VuZG1lc3NhZ2U6Z2V0IG91dGJvdW5kbWVzc2FnZTpzZW5kIHVzZXI6Y3JlYXRlIHJlcG9ydHM6ZmV0Y2ggdXNlcjp1cGRhdGUgdXNlcjpyZWFkIGJpbGxpbmc6dXBkYXRlIHJlcG9ydHM6ZXh0cmFjdCBjb252ZXJzYXRpb246cmVhZCIsImNsaWVudEhvc3QiOiIxOTIuMTY4LjEyOC4xNTkiLCJjbGllbnRJZCI6IjIwMjA0NDkzLWJhZWEtNDE4MC05ODMzLTNlMTczMjA1YWE3ZSIsImNsaWVudEFkZHJlc3MiOiIxOTIuMTY4LjEyOC4xNTkifQ.4YC8BlJrmddahLw0iowvDxKamlS4P795yhazn9NBIegxZ1w80Q6LAtd_P5xUHWgW7djIBlzPY5tgB6aq92oRDGt2GcqOjJ8Odz-Y1ya_hPuGkkiF3baWzuS_NaSRIwskIGhnkPpvl5l0MoguiyV7RFyphtJ7EvomyghxJ9YNYg8B18sT1eJvOwPULJdiluoe3teyGIPdO7mjOIZtJfv_6hnIFOY8wsD2DvV3Wn28w0Mpn4uQftRLvuYvD62g4i4sZyTmYpRfDSE1tDdcpkVoTUf-VTsFcdFG7PCYfW5U8K1ykjwZ9iOMaoGMQszIeeLHNezICubosBJjFEWKy11aUQ',
//             'Content-Type': 'application/json',
//             "User-Agent": "Freshsales 1.0",
//             "Accept": "*/*",
//         },
//         data: data
//     };

//     var req = await axios(config);
// }
// catch(error){


// }

// }

// customermessage();


// async function run3(){
//     var akashya_obj = {
//         customer_name : req.body.objClass[0].customer_fname,
//         customer_mobile : req.body.objClass[0].customer_mobile,
//         customer_dob : req.body.objClass[0].customer_dob.substring(5),
//         store_code : req.body.objClass[0].store_code
//     };

//     var db = await mongo.connect();

//     let storecode = await db.collection('storemanager').findOne({"Code":req.body.objClass[0].store_code});

//     var date = new Date().toISOString().split("T")[0].substring(5);
//     if(akashya_obj.customer_dob == date){
//         var data = JSON.stringify(
//             {
//                 "lead":
//                     {
//                         "first_name": req.body.objClass[0].customer_fname,
//                         "mobile_number": "+91"+req.body.objClass[0].customer_mobile,
//                         "address": "",
//                         "custom_field": {
//                             "cf_url": `https://www.happimobiles.com/`,
//                             "cf_request_type": "message_to_customer",
//                             "cf_mobile_model": "",
//                             "cf_payment_type": ""
//                         }
//                     }
//             });
//             var config = {
//                 method: 'post',
//                 url: 'https://happimobiles1.freshsales.io/api/leads',
//                 headers: {
//                     'Authorization': 'Token token=jjDyYzo0QA5jmaAopMB6wQ',
//                     'Content-Type': 'application/json'
//                 },
//                 data: data
//             };

//             var result = await axios(config);

//             var logs = {
//                 customer_name : req.body.objClass[0].customer_fname || "Happimobiles",
//                 customer_mobile: "+91"+req.body.objClass[0].customer_mobile,
//                 created_on: new Date(),
//                 freshsales_logs : result.data
//             };

//             await db.collection("akshaya_patra_logs").insertOne(logs);
//             if(storecode != null){

//                 var data = JSON.stringify(
//                     {
//                         "lead":
//                             {
//                                 "first_name":storecode['COORDINATOR NAMES'] ,
//                                 "mobile_number": "+91"+storecode['COORDINATOR PH NO'],
//                                 "address": "",
//                                 "custom_field": {
//                                     "cf_url": `https://www.happimobiles.com/`,
//                                     "cf_request_type": "message_to_store_manager",
//                                     "cf_customer_dob": "today",
//                                     "cf_customer_name": req.body.objClass[0].customer_fname || "Happimobiles",
//                                     "cf_customer_number": "+91"+req.body.objClass[0].customer_mobile

//                                 }
//                             }
//                     });
//                     var config = {
//                         method: 'post',
//                         url: 'https://happimobiles1.freshsales.io/api/leads',
//                         headers: {
//                             'Authorization': 'Token token=jjDyYzo0QA5jmaAopMB6wQ',
//                             'Content-Type': 'application/json'
//                         },
//                         data: data
//                     };

//                     var result = await axios(config);

//             }

//     }
// }

// run3();
