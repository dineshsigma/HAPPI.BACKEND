const nodemailer = require("nodemailer");
const ejs = require("ejs");

async function send_templates_mails(to, subject, template, message) {
  ejs.renderFile(
    __dirname + template,
    { name: message.name, coupoun: message.coupoun },
    async function (err, htmlTemplate) {
      const transporter = nodemailer.createTransport({
        host: "smtp.cloudzimail.com",
        port: 587,
        secure: true,
        auth: {
          user: "noreply@happimobiles.com",
          pass: "Iipl@13579",
        },
        timeout: 10000,
      });
      async function main() {
        const info = await transporter.sendMail({
          from: "noreply@happimobiles.com", // sender address
          to: to, // list of receivers
          subject: subject, // Subject line
          html: htmlTemplate,
          attachments: [],
        });
        console.log("Message sent: %s", info.messageId);
      }

      main().catch(console.error);
    }
  );
}


module.exports.send_templates_mails = send_templates_mails