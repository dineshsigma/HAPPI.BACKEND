var axios = require("axios");
// create uuid module import
var generateUuidModule = require('../modules/generate-uuid');
var ejs=require('ejs');
const nodemailer = require("nodemailer");
// send sms
function sendSMS(phone, message) {
    var JOB_ID = generateUuidModule.createUUID();
    var options = {
        'method': 'POST',
        "url": `http://www.mobiglitz.com/vb/apikey.php?apikey=h4vQpqE6LYuReCEP&senderid=MHAPPI&number=91${phone}&message=${encodeURI(message)}`,
        'headers': {
            'Content-Type': 'application/json'
        }
    };
    console.log("SMS TRIGGER",JOB_ID, JSON.stringify(options));
    axios(options)
      .then(function (response) {
          console.log("SMS SUCCESS",JOB_ID, response.data);
      })
      .catch(function (error) {
          console.log("SMS FAIL",JOB_ID, error.data);
      });
    
}

module.exports.sendSMS = sendSMS;

//sendSMS("8106838432", "Thankyou for placing order in Happi Mobiles. Your order is underprocess for more information click LINK");
