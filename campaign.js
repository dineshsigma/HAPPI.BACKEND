

let fs = require('fs');
let express = require('express');
let multer = require('multer');
let app = express();
let path = require('path');
const blockhash = require("blockhash-core");
const { imageFromBuffer, getImageData } = require("@canvas/image");
var cors = require("cors");
var mongo = require("./db");
const Tesseract = require('tesseract.js');
app.use(cors());
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);


const FOLDER = './images';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, FOLDER);
  },
  filename: (req, file, cb) => {


    const fileName = file.originalname
      .toLowerCase()
      .split(' ')
      .join('-');


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
      file.mimetype == 'image/png' ||
      file.mimetype == 'image/jpg' ||
      file.mimetype == 'image/jpeg' ||
      file.mimetype == 'image/webp'
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(
        new Error(
          'Only .png, .jpg and .jpeg format allowed!'
        )
      );
    }
  },
}).single("file")

async function hash(imgPath) {
  try {
    const data = await readFile(imgPath);
    const hash = await blockhash.bmvbhash(getImageData(data), 8);
    return hash;
  } catch (error) {
    console.log(error);
  }
}

function readFile(path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, (err, data) => {
      if (err) reject(err);
      resolve(imageFromBuffer(data));
    });
  });
}

function hexToBin(hexString) {
  const hexBinLookup = {
    0: "0000",
    1: "0001",
    2: "0010",
    3: "0011",
    4: "0100",
    5: "0101",
    6: "0110",
    7: "0111",
    8: "1000",
    9: "1001",
    a: "1010",
    b: "1011",
    c: "1100",
    d: "1101",
    e: "1110",
    f: "1111",
    A: "1010",
    B: "1011",
    C: "1100",
    D: "1101",
    E: "1110",
    F: "1111",
  };
  let result = "";
  for (i = 0; i < hexString.length; i++) {
    result += hexBinLookup[hexString[i]];
  }

  return result;
}



app.post('/uploadimages',(req,res)=>{
  try {
    upload(req, res, (err) => {
      if(err) {
       return res.status(400).send("Only .png,.jpg,.jpeg,.webp format is allowed");
      }
      let file = req.file.filename;
      let hashimg = await hash(`./images/${file}`);
      console.log("hashimg----", hashimg);
      var db = await mongo.connect();
      const campaignTbl = db.collection("campaign");
      let checkhash = await campaignTbl.findOne({ "hashimg": hashimg });
      if (checkhash != null) {
        fs.unlink(
          `./images/${file}`,
          error => {
            if (error) throw error;
          }
        );
        let imageText;
        Tesseract.recognize(`./images/${file}`, 'eng').then(({ data: { text } }) => {
          imageText = text
          if (imageText.indexOf('happi') > -1) {
            fs.unlink(
              `./images/${file}`,
              error => {
                if (error) throw error;
              }
            );
            await campaignTbl.insertOne({
              "filename": req.file.filename,
              "hashimg": hashimg,
            });
            return res.json({
              status:true,
              message:"Screen Shot Uploaded Successfully"
            })
    
          }
          else {
            return res.json({
              status: false,
              message: "Invalid Screen Shot"
            })
          }
        })
        return res.json({
          status: false,
          message: "Invalid Screenshot"
        })
      }
     
    });

   
   
   
  }
  catch (error) {
    console.log("error--", error);
    return res.json({
      status: false,
      message: error
    })
  }

})



app.post('/createCampaign', happiCampaign)
async function happiCampaign(req, res) {
  console.log("req.body--------", req.body);
  try {
    var db = await mongo.connect();
    const campaignTbl = db.collection("campaign");
    await campaignTbl.findOneAndUpdate({ "hashimg": req.body.image.hashimg }, {
      $set: {
        "name": req.body.name,
        "phonenumber": req.body.phonenumber,
        "location": req.body.location,
        "influencername": req.body.influencer,
        "instragramId": req.body.inst_handle

      }
    })

    return res.json({
      status: true,
      message: "submitted successfully"
    })
  }
  catch (error) {
    console.log("error--", error);
    return res.json({
      status: false,
      message: error
    })
  }

}



module.exports = app;



