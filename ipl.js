let express = require("express");
let app = express();
var mongo = require("./db");
const Tesseract = require("tesseract.js");
let multer = require("multer");
const AWS = require("aws-sdk");
const { imageFromBuffer, getImageData } = require("@canvas/image");
let fs = require("fs");
const blockhash = require("blockhash-core");
let emailTemplate = require("./templates/emailtemplate");
let email = require("./modules/email.js");
const { Parser } = require("json2csv");

function readFile(path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, (err, data) => {
      if (err) reject(err);
      resolve(imageFromBuffer(data));
    });
  });
}

async function hash(imgPath) {
  try {
    const data = await readFile(imgPath);
    const hash = await blockhash.bmvbhash(getImageData(data), 8);
    return hash;
  } catch (error) {
    console.log(error);
  }
}

const FOLDER = "./images";
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, FOLDER);
  },
  filename: (req, file, cb) => {
    const fileName = file.originalname.toLowerCase().split(" ").join("-");

    cb(null, fileName);
  },
});
var upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
    }
  },
}).single("file");

var upload1 = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
    }
  },
}).single("file1");

//INSTAGRAM SCREEEN SHOT VALIDATION API
app.post("/instgramscreenshoot", async (req, res) => {
  try {
    upload(req, res, async (err) => {
      if (err) {
        return res.json({
          status: false,
          message: "Only .png,.jpeg,.jpg format is allowed",
        });
      } else {
        let file = req.file.filename;
        let hashimg = await hash(`./images/${file}`);
        // console.log("hashimg----", hashimg);
        var db = await mongo.connect();
        const campaignTbl = db.collection("worldcup_campaign");
        let checkhash = await campaignTbl.findOne({ hashimg: hashimg });
        // console.log("checkhash--", checkhash);
        if (checkhash != null) {
          fs.unlink(`./images/${file}`, (error) => {
            if (error) throw error;
          });
          return res.json({
            status: false,
            message: "Screenshot Already exits",
          });
        }
        let imageText;
        Tesseract.recognize(`./images/${file}`, "eng").then(
          async ({ data: { text } }) => {
            imageText = text;
            if (
              (imageText.indexOf("happi") > -1 ||
                imageText.indexOf("happimobiles") > -1) &&
              imageText.indexOf("Following") > -1
            ) {
              const fileData = fs.readFileSync(`./images/${file}`);
              const bucketName = "happimobiles";
              const fileName = `${hashimg}.jpg`;
              await uploadImageToS3(bucketName, fileName, fileData)
                .then(async (url) => {
                  console.log("Image uploaded successfully!");
                  console.log("URL:", url);
                  //   await campaignTbl.insertOne({
                  //     filename: req.file.filename,
                  //     hashimg: hashimg,
                  //     createdDate: new Date(),
                  //     image_url: url,
                  //   });
                  fs.unlink(`./images/${file}`, (error) => {
                    if (error) throw error;
                  });
                  return res.json({
                    status: true,
                    hashimg: hashimg,
                    image_url: url,
                    message: "Screen Shot Uploaded Successfully",
                  });
                })
                .catch((err) => {
                  console.error("Error uploading image:", err);
                  return res.json({
                    status: false,
                    data: "Error uploading image",
                  });
                });
            } else {
              fs.unlink(`./images/${file}`, (error) => {
                if (error) throw error;
              });
              return res.json({
                status: false,
                message: "Invalid Screen Shot",
              });
            }
          }
        );
      }
    });
  } catch (error) {
    console.log("error--", error);
    return res.json({
      status: false,
      message: error,
    });
  }
});

let crenditails = {
  accessKeyId: "AKIASTAEMZYQ3D75TOOZ",
  secretAccessKey: "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",
  region: "ap-south-1",
};
const s3 = new AWS.S3(crenditails);
async function uploadImageToS3(bucketName, fileName, fileData) {
  const params = {
    Bucket: bucketName,
    Key: `instagram-images/${fileName}`,
    Body: fileData,
    ACL: "public-read", // Set the ACL to allow public read access
  };

  return new Promise((resolve, reject) => {
    s3.upload(params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data.Location);
      }
    });
  });
}

//################### PUZZLE SCREEN SHOOT VALIDATION ##################
app.post("/puzzlescreenshot", async (req, res) => {
  try {
    upload1(req, res, async (err) => {
      if (err) {
        console.log("err", err);
        return res.json({
          status: false,
          err: err,
          message: "Only .png,.jpeg,.jpg format is allowed",
        });
      } else {
        let file = req.file.filename;
        let hashimg = await hash(`./images/${file}`);
        const fileData = fs.readFileSync(`./images/${file}`);
        const bucketName = "happimobiles";
        const fileName = `${hashimg}.jpg`;
        await uploadImageToS3(bucketName, fileName, fileData)
          .then(async (url) => {
            console.log("Image uploaded successfully!");
            console.log("URL:", url);
            fs.unlink(`./images/${file}`, (error) => {
              if (error) throw error;
            });
            return res.json({
              status: true,
              image_url2: url,
              message: "Screen Shot Uploaded Successfully",
            });
          })
          .catch((err) => {
            console.error("Error uploading image:", err);
            return res.json({
              status: false,
              data: "Error uploading image",
            });
          });
      }
    });
  } catch (error) {
    console.log("error", error);
    return res.json({
      status: false,
      message: "ERROR",
    });
  }
});

//################### SAVE IIPL WORLD COP COUPOUN CODE RECORDS #####################//

app.post("/worldcupleads", async (req, res) => {
   console.log("req.body", req.body);
  try {
    var db = await mongo.connect();
    const worldcampaignTbl = db.collection("worldcup_campaign");
    const iiplcoupounsTbl = db.collection("happi-ipl-coupouns");
    let worldCupLeads = await worldcampaignTbl.findOne({
      email: req.body.email,
    });
    let worldcupmobilecheck = await worldcampaignTbl.findOne({
      mobile: req.body.mobile,
    });
    var query = {
      lead_id: { $exists: false },
    };
    let happiCouponsresponse = await iiplcoupounsTbl
      .find(query)
      .limit(1)
      .toArray();
    // console.log("happiCouponsresponse", happiCouponsresponse);
    if (happiCouponsresponse == null) {
      return res.json({
        status: false,
        message: "No coupons Are Avaiable",
      });
    }
    if (worldCupLeads != null) {
      return res.json({
        status: false,
        message: "Email already exits",
      });
    }

    if (worldcupmobilecheck != null) {
      return res.json({
        status: false,
        message: "mobile already exits",
      });
    }

    let obj = {
      name: req.body.name,
      email: req.body.email,
      type: req.body.type,
      image_url: req.body.image_url,
      image_url1: req.body.image_url1,
      coupoun: happiCouponsresponse[0].codes,
      createdDate: new Date(),
      mobile: req.body.mobile,
    };
    await worldcampaignTbl.insertOne(obj);
    await iiplcoupounsTbl.findOneAndUpdate(
      { codes: happiCouponsresponse[0].codes },
      { $set: { lead_id: new Date() } }
    );
    let message = {
      name: req.body.name,
      email: req.body.email,
    };
    // await emailTemplate.send_templates_mails(
    //   req.body.email,
    //   "COUPON CODE",
    //   "/coupountemplate.ejs",
    //   message,
    //   ""
    // );

    // sending Email OTP
    await email.send_mail(
      [req.body.email],
      "HAPPI WORLD CUP MOMENT",
      `
      Congratulations, you've won the 'Happi pola wired earphone' Grand Prize in our Happi Days contest! Here is your Uniquely Generated Coupon Code- ${happiCouponsresponse[0].codes}. Please claim your reward on these dates mentioned i.e 19-11-2023 to 21-11-2023 from any Happi Mobile store.
      Terms and Conditions
      •	By entering the competition you agree to be bound by these terms and conditions.
      •	Users will be rewarded with 'Hapi pola wired earphone.'
      •	No purchase is necessary. Winners will not be required to pay to enter the competition.
      •	The Prize shall be only claimed from a specified date. Any claim after the given date will not be accepted
      •	The unique coupon code can only be redeemed once per winning.
      •	Instagram or Facebook is not affiliated with or involved in the competition.
      •	Only one entry per person per competition will be accepted
      •	The promoter will not be held liable for any failure to receive entries. The promoter takes no responsibility for any lost, delayed, illegible, corrupted, damaged, incomplete, or otherwise invalid entries.
      •	Prizes are non-negotiable, non-transferable, and non-refundable.
      •	Coupon Code is only valid till 21th Nov 2023
      To claim your prize, please follow these steps:
      •	Claim your reward by showing the message or email with the 'Unique Coupon Code' to the store manager at Happi Mobiles store.
      •	A screenshot of you following the Happi Mobiles Instagram Handle i.e @Happi Mobiles will not be accepted. You will have to verify it by showing it from your Instagram account at the store.
      •	A screenshot of the email will not be accepted; only the original email can be used to claim your winnings.
      •	You will be required to carry a government-issued identification to verify your identity to us.
      Thank you
      Happi Mobiles
      `,
      []
    );

    return res.json({
      status: true,
      message: "Success",
    });
  } catch (error) {
    console.log("error", error);
    return res.json({
      status: false,
      message: "ERROR",
    });
  }
});

//###################### GET IPL LEADS GETTING ##########################//
app.get("/getworldcupleads", async (req, res) => {
  try {
    var db = await mongo.connect();
    const worldcampaignTbl = db.collection("worldcup_campaign");
    let query = {};
    if (req.query.fromdate != "all" && req.query.todate != "all") {
      let fromdate = new Date(req.query.fromdate);
      let todate = new Date(req.query.todate);
      todate.setDate(todate.getDate() + 1);
      query.createdDate = {
        $gte: fromdate,
        $lte: todate,
      };
    }
    let worldCupLeadsResponse = await worldcampaignTbl.find(query).sort({"createdDate":-1}).toArray();
    return res.json({
      status: true,
      data: worldCupLeadsResponse,
    });
  } catch (error) {
    console.log("error", error);
    return res.json({
      status: false,
      message: "ERRROR",
    });
  }
});

app.get("/downloadworldcupleads", async (req, res) => {
  try {
    var db = await mongo.connect();
    const worldcampaignTbl = db.collection("worldcup_campaign");
    let query = {};
    if (req.query.fromdate != "all" && req.query.todate != "all") {
      let fromdate = new Date(req.query.fromdate);
      let todate = new Date(req.query.todate);
      todate.setDate(todate.getDate() + 1);
      query.createdDate = {
        $gte: fromdate,
        $lte: todate,
      };
    }
    let worldCupLeadsResponse = await worldcampaignTbl.find(query).sort({"createdDate":-1}).toArray();
    if (worldCupLeadsResponse.length > 0) {
      const fields = worldCupLeadsResponse[0].keys;
      const opts = {
        fields,
      };
      try {
        const parser = new Parser(opts);
        const csv = parser.parse(worldCupLeadsResponse);
        res.setHeader("Content-disposition", "attachment; filename=data.csv");
        res.set("Content-Type", "text/csv");
        res.status(200).send(csv);
      } catch (error) {
        console.log(error);
        res.json({
          status: false,
          message: error.message,
        });
      }
    } else {
      res.send("no data found");
    }
  } catch (error) {
    console.log("error", error);
    return res.json({
      status: false,
      message: "ERRROR",
    });
  }
});

module.exports = app;
