
var axios = require('axios');
const mongo = require("../db.js");

async function ingramCreateOrders(customerOrderNumber,ingramPartNumber,quantity){
    let db= await mongo.connect();
    let configcoll= db.collection('config');
    let ingramauth= await configcoll.findOne({"key":"ingramauth"});


    try{
        var data = JSON.stringify({
            "customerOrderNumber": customerOrderNumber,

            "billToAddressId": "006",
            "shipToInfo": {
              "addressId": "209"
            },
            "lines": [
              {

                "ingramPartNumber": ingramPartNumber,
                "quantity": quantity
              }
            ],

            "shipmentDetails": {
              "carrierCode": "ZO"
            }
          });

        //https://api.ingrammicro.com:443/resellers/v6/orders----PRODUCTION URL
          var config = {
            method: 'POST',
            url: 'https://api.ingrammicro.com:443/resellers/v6/orders',
            headers: {
              'IM-CustomerNumber': '21-HEMOPR',
              'IM-CountryCode': 'IN',
              'IM-CorrelationID': 'fbac82ba-cf0a-4bcf-fc03-0c50841',
              'IM-SenderID': '21-HEMOPR-happi',
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Authorization': `Bearer ${ingramauth.token}`
            },
            data : data
          };

          let response= await axios(config);

          //console.log(response.data);

          //send notification email and sms for ingram team


          // var SMS_config = {
          //   method: 'get',
          //   url: `http://www.mobiglitz.com/vb/apikey.php?apikey=ehYw60GDMkBW4pqc&senderid=MHAPPI&number=91${req.body.phone}&message=${encodeURI(message)}`,
          //   headers: { }
          // };

          // var resp = await axios(SMS_config);
          // console.log("happimobiles-sms---", resp.data);



          return response.data



    }
    catch(error){
        console.log(error);
        return {}
    }

}

module.exports.ingramCreateOrders = ingramCreateOrders;

// this.ingramCreateOrders('202207070B9780-2','GD103Y118M1',1);

