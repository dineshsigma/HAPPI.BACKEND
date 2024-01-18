
var axios = require('axios');
var md5 = require("md5");
const crypto = require('crypto');
const request = require('request');
var mongo = require("./db");

const serverless = require('serverless-http');
const express = require('express');
const { MongoAPIError } = require('mongodb');
var cors = require("cors");
const app = express();
app.options("*", cors()); // include before other routes
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/api/bajajlogs/customersearch', bajajcustomerrequest);

app.post('/api/bajajlogs/billingotp', billingotp);


async function bajajcustomerrequest(req, res) {

    let plaintext = {
        TXNTYPE: 'BILSRCH',
        Request_ID:  new Date().getTime()+"",
        Dealer_Code: '123888',
        Request_Date_Time: '20052021212121',
        Dealer_Validation_Key: '4462137033265896',
        Card_number: '2030401618767902',
        ACQCHANNEL: '22'
    }
    console.log("DATA", plaintext)

    const crypto = require('crypto');
    const ENCRYPTION_KEY = '1OY67PYHXN210322121936X6KCG559YT'; // Must be 256 bits (32 characters)
    const IV_LENGTH = 16; // For AES, this is always 16
    //console.log("plaintext", plaintext, "ENCRYPTION_KEY", ENCRYPTION_KEY, "IV_LENGTH", IV_LENGTH);
    let iv = '1234567887654321';
    iv = new Buffer(iv, "binary");
    console.log("ENCRYPTION_KEY", ENCRYPTION_KEY)
    console.log("IV", iv)
    //console.log("IV", iv.toString('hex'), iv);
    let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(JSON.stringify(plaintext));
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    var enc = encrypted.toString('base64');
    var seal = md5(enc + ENCRYPTION_KEY);
    console.log("***********************seal", seal);
    console.log("enc*****************", enc);
    var options = {
        'method': 'POST',
        'url': 'https://bfluat.in.worldline-solutions.com/worldlineinterfaceexperia/WorldlineInterfaceExperia.svc/BILINTRequest',
        'headers': {
            'SealValue': seal,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(enc)

    };
    console.log(options);


    request(options, function (error, response) {
        if (error) throw new Error(error);
        console.log("rrrrrr", response.body);
        res.json({
            status: true,
            data: response.body
        })


        // var data = response.body.split("|");
        // console.log("keyyyyyyyyyyyyyy", data[0]);
        // seperate with pipe send it to the bajajrequeryreturn()
        // var out = bajajrequeryreturn(data[0]);
        // callback1(out);

    });


}


async function billingotp() {

    let plaintext = {
        "TXNTYPE": "OTPREQ",
        "RequestID": new Date().getTime() + "",
        "Dealer_Validation_Key": "6693933506806786",
        "Dealer_Code": "123999",
        "Card_Number": "2030401618767902",
        "ORDERNO": new Date(),
        "Product": "22",
        "Advance_EMI_AMT": "10400",
        "Advance_EMI_Tenure": "3",
        "GROSS_LOAN_AMT": "1",
        "Gross_LOAN_Tenure": "5",
        "Delivery_PINCODE": "123456",
        "ACQCHANNEL": "22",
        "Request_Date_Time": "20052021212121"
    }

    const crypto = require('crypto');
    const ENCRYPTION_KEY = '5PP3LIZ8CB210322114958LBV9QBGE1F'; // Must be 256 bits (32 characters)
    const IV_LENGTH = 16; // For AES, this is always 16
    //console.log("plaintext", plaintext, "ENCRYPTION_KEY", ENCRYPTION_KEY, "IV_LENGTH", IV_LENGTH);
    let iv = '1234567887654321';
    iv = new Buffer(iv, "binary");
    console.log("ENCRYPTION_KEY", ENCRYPTION_KEY)
    console.log("IV", iv)
    //console.log("IV", iv.toString('hex'), iv);
    let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(JSON.stringify(plaintext));
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    var enc = encrypted.toString('base64');
    var seal = md5(enc + ENCRYPTION_KEY);
    console.log("***********************seal", seal);
    console.log("enc*****************", enc);
    var options = {
        'method': 'POST',
        'url': 'https://bfluat.in.worldline-solutions.com/worldlineinterfaceexperia/WorldlineInterfaceExperia.svc/BILINTRequest',
        'headers': {
            'SealValue': seal,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(enc)

    };
    request(options, function (error, response) {
        if (error) throw new Error(error);
        console.log("rrrrrr", response.body);
        // var data = response.body.split("|");
        // console.log("keyyyyyyyyyyyyyy", data[0]);
        // seperate with pipe send it to the bajajrequeryreturn()
        // var out = bajajrequeryreturn(data[0]);
        // callback1(out);

    });

}









module.exports=app;
