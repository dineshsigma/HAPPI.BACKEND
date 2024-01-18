const express = require("express");
const app = express();
var cors = require("cors");
var mongo = require("./db");
let email = require("./modules/email");
app.options("*", cors()); // include before other routes
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/leads", tirupathi_launches);
async function tirupathi_launches(req, res) {
  try {
    let data = req.body;
    var db = await mongo.connect();
    let laptopleadsColl = db.collection("laptop-leads");
    let validuser = await laptopleadsColl.findOne({
      type: "tirupathi_launch",
      phone: req.body.phone,
    });
    (data.type = "tirupathi_launch"), (data.createdDate = new Date());
    if (validuser != null) {
      return res.json({
        status: false,
        message: "You Have Already Participated",
      });
    } else {
      return res.json({
        status: true,
        message: "Successully",
      });
    }
  } catch (error) {
    console.log("error", error);
    return res.json({
      status: false,
      message: "ERRROR",
    });
  }
}

//insert laptop leads

app.post("/tptleads", tptleads);
async function tptleads(req, res) {
  try {
    var db = await mongo.connect();
    let laptopleadsColl = db.collection("laptop-leads");
    let spinnerColl = db.collection("tpt_spinner_code");
    var query = {
      spin_id: { $exists: false },
    };
    let spincoderesponse = await spinnerColl.find(query).limit(1).toArray();
    let obj = {
      name: req.body.name,
      phone: req.body.phone,
      brand: req.body.Brand,
      email: req.body.email,
      id: new Date().toISOString(),
      date: new Date(),
      utm_source: req.body.utm_source,
      utm_medium: req.body.utm_medium,
      utm_campaign: req.body.utm_campaign,
      status: "open",
      type: "tirupathi_launch",
      prize: req.body.prize,
    };
    if (req.body.prize == "Free Neck Band") {
      obj.coupoun_code = `NBA${spincoderesponse[0].code}`;
    } else if (req.body.prize == "Free smart watch") {
      obj.coupoun_code = `SWA${spincoderesponse[0].code}`;
    } else if (req.body.prize == "Free ear phones") {
      obj.coupoun_code = `EPH${spincoderesponse[0].code}`;
    } else if (req.body.prize == "Rs 500 coupon") {
      obj.coupoun_code = `500c${spincoderesponse[0].code}`;
    } else if (req.body.prize == "Rs 1000 coupon") {
      obj.coupoun_code = `1000c${spincoderesponse[0].code}`;
    }
    console.log("obj", obj);
    await laptopleadsColl.insertOne(obj);
    await spinnerColl.findOneAndUpdate(
      { code: spincoderesponse[0].code },
      { $set: { spin_id: new Date() } }
    );
    await email.send_mail(
      [req.body.email],
      "Congratulations, You have won Spin and win!!!!",

      `Congratulations, you've won the ${req.body.prize}, Grand Prize in our Tirupahti Grand opening Spin and Win contest! Here is your Uniquely Generated Coupon Code :${obj.coupoun_code},. Please claim your reward at Tirupati Happi mobile store, Call 9100412345,

Terms and Conditions
• By entering the competition you agree to be bound by these terms and conditions.
• You will be rewarded with As per the availability of stock
• No purchase is necessary. Winners will not be required to pay to enter the competition.
• The Prize shall be only claimed from a specified date. Any claim after the given date will not be accepted
• The unique coupon code can only be redeemed once per winning.
• Instagram or Facebook is not affiliated with or involved in the competition.
• Only one entry per person per competition will be accepted
• The promoter will not be held liable for any failure to receive entries. The promoter takes no responsibility for any lost, delayed, illegible, corrupted, damaged, incomplete, or otherwise invalid entries.
• Prizes are non-negotiable, non-transferable, and non-refundable.
• Coupon Code is only valid till 22nd October 2023

To claim your prize, please follow these steps:
• Claim your reward by showing the message with the 'Unique Coupon Code' to the store manager at Tirupathi  Air bypass road store only
• A screenshot of the email will not be accepted; only the original email can be used to claim your winnings.
• You will be required to carry a government-issued identification to verify your identity to us.
Thank you
Happi Mobiles
      `,
      []
    );

    return res.json({
      status: true,
      message: "Leads created successfully",
    });
  } catch (error) {
    console.log("error", error);
    return res.json({
      status: false,
      message: "ERRRO",
    });
  }
}

module.exports = app;
