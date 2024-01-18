const serverless = require('serverless-http');
const express = require('express')
const app = express();

const { Parser } = require('json2csv');
let nodemailer = require('nodemailer');


app.post('/api/happiticket/exportcsv',exportCSV);

async function exportCSV(req, res) {
    var csvData = req.body.data;
    var keys = Object.keys(csvData[0]);
    const parser = new Parser(keys);
    const csv = parser.parse(csvData);
    var attachments = [{
        filename: 'happiTicketMgmt.csv',
        content: csv,
    }]
    var fromAddress = "query@happimobiles.com";
    var email = {
        from: fromAddress,
        to: req.body.to,
        cc: req.body.cc,
        subject: req.body.subject,
        body: req.body.body,
        attachments: attachments
    };
    // send mail
    var options = {
        host: "smtp.cloudzimail.com",
        port: 587,
        ignoreTLS: true,
        secure: false, // use TLS
        auth: {
            user: "query@happimobiles.com",
            pass: "Rk@iipl.work1"
        },
        timeout: 100000
    }
    let smtpTransport = nodemailer.createTransport(options);

    
    let result;
    try {
        var resp = await smtpTransport.sendMail(email);
       
        console.log(`api/happiticket/exportcsv----------SMS TRIGGER--------`,resp);
        
         result = resp.response;
    } catch (e) {
        console.log(`api/happiticket/exportcsv----------SMS NOT TRIGGER--------${e}`)
         result = e;
        
    }
    
    return res.json({ status: true, message: result })
}



module.exports=app;