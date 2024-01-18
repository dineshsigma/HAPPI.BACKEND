var mongo = require("./db.js");
var axios = require("axios");
var email = require("./email");
let qs = require('qs');

//jjDyYzo0QA5jmaAopMB6wQ
var customer_count = 0;
var manager_count = 0;

  async function akshayaPatra(req,res){
    if(req.headers['x-api-key']!="jnkjnkjkjbkjhitfuyfdyaewxjkhvjhfthrs"){
      return res.json({
        message:"invalid signature"
      })
  }
  let currentdate = new Date();
  console.log(currentdate);
  let lastsevendays = new Date(currentdate.getFullYear(), currentdate.getMonth(), currentdate.getDate() - 7);
  let db = await mongo.connect();
  // ship rocket token fetch init
  var data = JSON.stringify({
    email: "shanmukh@redmattertech.com",
    password: "Happi@123",
  });

  var auth_config = {
    method: "post",
    url: "https://apiv2.shiprocket.in/v1/external/auth/login",
    headers: {
      "Content-Type": "application/json",
    },
    data: data,
  };

  var response = await axios(auth_config);
  //  console.log(response.data);

  const collection = db.collection("config");
  if (response.data && response.data.token) {
    await collection.updateOne(
      {
        key: "shiprocketauth",
      },
      {
        $set: {
          key: "shiprocketauth",
          token: response.data.token,
          updated_on: new Date(),
        },
      },
      { upsert: true }
    );
  }
  var date = new Date().toISOString().split("T")[0].substring(5);
  var list = await db
    .collection("akshaya_patra")
    .find({ customer_dob: date })
    .toArray();
  var data = JSON.stringify({
    lead: {
      first_name: "SHARAN",
      mobile_number: "+919100574444",
      address: "",
      custom_field: {
        cf_url: `https://www.happimobiles.com/`,
        cf_request_type: "message_to_customer",
        cf_mobile_model: "",
        cf_payment_type: "",
      },
    },
  });
  var config = {
    method: "post",
    url: "https://happimobiles1.freshsales.io/api/leads",
    headers: {
      Authorization: "Token token=OeAE29Hsg428NHe1MjjmTA",
      "Content-Type": "application/json",
    },
    data: data,
  };

  var result = await axios(config);
  // console.log("result---",result);
  var logs_customer = {
    customer_name: "SHARAN",
    customer_mobile: "+919100574444",
    created_on: new Date(),
    freshsales_logs: result.data,
  };

  // push to elastic search

  // var config_es_link_test_customer = {
  //   method: "post",
  //   url:
  //     "https://my-deployment-031377.es.ap-south-1.aws.elastic-cloud.com:9243/akshaya-patra/_doc/" +
  //     new Date().getTime(),
  //   headers: {
  //     "Content-Type": "application/json",
  //     Authorization: "Basic ZWxhc3RpYzo2SmVITmhBWFdmWFBDWTVQMzFpcGVNSUo=",
  //   },
  //   data: JSON.stringify(logs_customer),
  // };

  // await axios(config_es_link_test_customer);
  
  
  await db.collection("akshaya_patra_logs").insertOne(logs_customer);
  await db.collection("akshaya_patra_logs").deleteMany({"created_on":{$lte:lastsevendays}})

  data = JSON.stringify({
    lead: {
      first_name: "SIVA",
      mobile_number: "+918341562869",
      address: "",
      custom_field: {
        cf_url: `https://www.happimobiles.com/`,
        cf_request_type: "message_to_customer",
        cf_mobile_model: "",
        cf_payment_type: "",
      },
    },
  });
  config = {
    method: "post",
    url: "https://happimobiles1.freshsales.io/api/leads",
    headers: {
      Authorization: "Token token=OeAE29Hsg428NHe1MjjmTA",
      "Content-Type": "application/json",
    },
    data: data,
  };

  var result = await axios(config);
  var logs = {
    customer_name: "SIVA",
    customer_mobile: "+918341562869",
    created_on: new Date(),
    freshsales_logs: result.data,
  };
  await db.collection("akshaya_patra_logs").insertOne(logs);
  await db.collection("akshaya_patra_logs").deleteMany({"created_on":{$lte:lastsevendays}})



   for (var i = 0; i < list.length; i++) {

    
    // console.log(
    //   `${new Date().toISOString()} ${list[i].customer_name} ${list[i].customer_mobile
    //   }  ${list[i].customer_dob}`
    // );
    var data = JSON.stringify({
      lead: {
        first_name: list[i].customer_name,
        mobile_number: "+91" + list[i].customer_mobile,
        address: "",
        custom_field: {
          cf_url: `https://www.happimobiles.com/`,
          cf_request_type: "message_to_customer",
          cf_mobile_model: "",
          cf_payment_type: "",
        },
      },
    });
    var config = {
      method: "post",
      url: "https://happimobiles1.freshsales.io/api/leads",
      headers: {
        Authorization: "Token token=OeAE29Hsg428NHe1MjjmTA",
        "Content-Type": "application/json",
      },
      data: data,
    };

    customer_count++;
    var result = await axios(config);
    var logs = {
      customer_name: list[i].customer_name,
      customer_mobile: "+91" + list[i].customer_mobile,
      created_on: new Date(),
      freshsales_logs: result.data,
      template_name: "message_to_customer",
    };

    // var config_es_link_test = {
    //   method: "post",
    //   url:
    //     "https://my-deployment-031377.es.ap-south-1.aws.elastic-cloud.com:9243/akshaya-patra/_doc/" +
    //     new Date().getTime(),
    //   headers: {
    //     "Content-Type": "application/json",
    //     Authorization: "Basic ZWxhc3RpYzo2SmVITmhBWFdmWFBDWTVQMzFpcGVNSUo=",
    //   },
    //   data: JSON.stringify(logs),
    // };

    // await axios(config_es_link_test);
    await db.collection("akshaya_patra_logs").insertOne(logs);
    await db.collection("akshaya_patra_logs").deleteMany({"created_on":{$lte:lastsevendays}})
    //storemanager fetch

    console.log()

    if (list[i].store_code != null) {

      let storeinfo = await db
        .collection("store-manager-phone")
        .findOne({ Code: list[i].store_code });
      if (storeinfo != null) {

        var data = JSON.stringify({
          lead: {
            first_name: storeinfo["COORDINATOR NAMES"],
            // "mobile_number": `+919100574444`,
            // "mobile_number": `+918686836269`,
            mobile_number: "+91" + storeinfo["COORDINATOR PH NO"],
            address: "",
            custom_field: {
              cf_url: `https://www.happimobiles.com/`,
              cf_request_type: "message_to_store_manager",
              // "cf_mobile_model": "",
              cf_customer_dob: "Today",
              cf_customer_name: list[i].customer_name,
              cf_customer_number: "+91" + list[i].customer_mobile,
            },
          },
        });
        var config = {
          method: "post",
          url: "https://happimobiles1.freshsales.io/api/leads",
          headers: {
            Authorization: "Token token=OeAE29Hsg428NHe1MjjmTA",
            "Content-Type": "application/json",
          },
          data: data,
        };
        await axios(config);
        var logs = {
          customer_name: list[i].customer_name,
          customer_mobile: "+91" + list[i].customer_mobile,
          created_on: new Date(),
          freshsales_logs: result.data,
          template_name: "akshaya_patra",
        };

        manager_count++;

        // var config_es_link_test = {
        //   method: "post",
        //   url:
        //     "https://my-deployment-031377.es.ap-south-1.aws.elastic-cloud.com:9243/akshaya-patra-store-manager/_doc/" +
        //     new Date().getTime(),
        //   headers: {
        //     "Content-Type": "application/json",
        //     Authorization: "Basic ZWxhc3RpYzo2SmVITmhBWFdmWFBDWTVQMzFpcGVNSUo=",
        //   },
        //   data: JSON.stringify(logs),
        // };

        // await axios(config_es_link_test);
        await db.collection("akshaya_patra_store_manager").insertOne(logs);
        await db.collection("akshaya_patra_store_manager").deleteMany({"created_on":{$lte:lastsevendays}})
      }


    }


    // await db.collection("akshaya_patra_logs").insertOne(logs);
  }

  


  console.log(`AKSHAYA PATRA JOB TRIGGER RUN SUCCESS:${new Date().toISOString()}---------CUSTOMER_COUNT:${customer_count}--------------STORE MANAGER COUNT:${manager_count}`)
  
  await email.send_mail(
    ["srk@iipl.work", "sharan@happimobiles.com","dinesh@iipl.work","shiva.kaushik@iipl.work"],
    "Akshaya Patra Job Triggred " + new Date().toISOString(),
    `Akshaya Patra Job Triggred " + ${new Date().toISOString()}
    Customer Count : ${customer_count}
    Manager Count : ${manager_count}
    `,
    []
  );
  return;
  }

  
  //akshayaPatra();

  module.exports.akshayaPatra = akshayaPatra;

