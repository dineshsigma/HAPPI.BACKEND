var nodemailer = require("nodemailer");
var ejs = require("ejs");

// send mail
var options = {
  host: "smtp.cloudzimail.com",
  port: 587,
  ignoreTLS: true,
  // secure: true, // use TLS
  auth: {
    user: "noreply@happimobiles.com",
    pass: "Iipl@13579",
  },
  timeout: 10000,
};
let smtpTransport = nodemailer.createTransport(options);
var fromAddress = "noreply@happimobiles.com";
async function send_mail(to, subject, body, attachments) {
  var obj = {
    from: fromAddress, // sender address
    to: to, // list of receivers
    subject: subject, // Subject line
    text: body, // plain text body
    //html: html, // html body
    attachments: attachments,
  };
  var result = {};
  try {
    var resp = await smtpTransport.sendMail(obj);
    result.success = resp;
  } catch (e) {
    result.err = e;
  }
  console.log(result);

  return result;
}

async function orderEmail(to, output) {
  var obj = {
    from: fromAddress, // sender address
    to: to, // list of receivers
    subject: "ORDER DETAILS", // Subject line
    html: output, // html body
  };

  var result = {};
  try {
    var resp = await smtpTransport.sendMail(obj);
    result.success = resp;
  } catch (e) {
    result.err = e;
  }

  return result;
}

module.exports.send_mail = send_mail;

module.exports.orderEmail = orderEmail;

// this.send_mail("srk@iipl.work","HAPPPI MOBILE ORDER", "HI Test", [], function(err, data){
//     console.log(err, data);
// });
