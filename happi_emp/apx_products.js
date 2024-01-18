const express = require("express");
var cors = require("cors");
const app = express();
var mongo = require(".././db.js");
const { ObjectId } = require("mongodb");
const axios = require("axios");
var qs = require("qs");
const AWS = require("aws-sdk");
let multer = require("multer");
const imageSize = require("image-size");
let fs = require("fs");
const moment = require("moment");
var bodyParser = require("body-parser");
const res = require("express/lib/response");
let logsService = require("./logservice.js");
const Tesseract = require("tesseract.js");
let apxheaders = require("./config.js");
var email = require("../jobs/email.js");
const { Parser } = require("json2csv");
const QRCode = require("qrcode");
const { truncate } = require("fs/promises");
app.use(bodyParser.json({ limit: "50mb" }));
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000,
  })
);
app.options("*", cors()); // include before other routes

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
var date = new Date();
var getYear = date.getFullYear().toString();
var month = date.getMonth() + 1;
if (month.toString().length > 1) {
  month = month.toString();
} else {
  month = "0" + month;
}

var day = date.getDate();
if (day.toString().length > 1) {
  day = day.toString();
} else {
  day = "0" + day;
}
var dateInput = getYear + month + day;

const TBL_Discount_Users = "discount_employee_management";
const TBL_Discount_Designation = "discount_designation";
const TBL_Discount_Department = "discount_department";
const TBL_Discount_Location = "discount_locations";
let Discount_Location = null;
let DiscountUsersTb = null;
let Discount_Designation = null;
let Discount_Department = null;

app.post("/discountUsers", discountUsers);
async function discountUsers(req, res) {
  try {
    const db = await mongo.connect();
    DiscountUsersTb = await db.collection(TBL_Discount_Users);
    let config = {
      method: "get",
      maxBodyLength: Infinity,
      url: "http://183.82.44.213/api/apxapi/GetSalespersonMasterInfo?CompanyCode=HM",
      headers: {
        UserId: "WEBSITE",
        SecurityCode: "3489-7629-9163-3979",
      },
    };
    let response = await axios(config);
    Discount_Designation = await db.collection(TBL_Discount_Designation);
    Discount_Department = await db.collection(TBL_Discount_Department);
    Discount_Location = await db.collection(TBL_Discount_Location);
    let bulk_write_commands = [];
    for (let i = 0; i < response?.data?.Data?.length; i++) {
      console.log("i", i);
      let designation = await Discount_Designation.findOne({
        designation_name: response?.data?.Data[i]?.DESIGNATION,
      });
      let department = await Discount_Department.findOne({
        department_name: response?.data?.Data[i]?.DEPARTMENT,
      });
      let location = await Discount_Location.findOne({
        location_name: response?.data?.Data[i].BRANCH_NAME,
      });
      let userData = await DiscountUsersTb.findOne(
        { mobile: response?.data?.Data[i].SLPR_PHONE },
        { projection: { access_control: 1, login_otp_required: 1 } }
      );
      let userObj = {
        emp_id: response?.data?.Data[i]?.SLPR_CODE,
        name: response?.data?.Data[i]?.SLPR_NAME,
        email: response?.data?.Data[i]?.SLPR_EMAIL,
        department: department?._id.toString() || null,
        designation: designation?._id.toString() || null, //
        mobile: response?.data?.Data[i].SLPR_PHONE,
        branch_code: response?.data?.Data[i].BRANCH_CODE,
        branch_name: response?.data?.Data[i].BRANCH_NAME, //location
        category: response?.data?.Data[i].SLPR_CATEGORY,
        created_on: response?.data?.Data[i]?.CREATED_ON,
        aadhar_no: response?.data?.Data[i]?.AADHAR_NO,
        access_control: userData?.access_control || [],
        login_otp_required: userData?.login_otp_required || false,
        status: response?.data?.Data[i]?.SLPR_STATUS,
        password:
          "$2b$10$lxP.wOVHOEGhNC50xAneYedg77vW0ozmNcktMAfdtGSmqhGPkdSua",
        createdDate: new Date(),
        region: "64bfb9b6335bfcbd33674336",
        work_location: location?._id.toString() || null,
      };
      bulk_write_commands.push({
        updateOne: {
          filter: { mobile: response?.data?.Data[i].SLPR_PHONE },
          update: {
            $set: {
              ...userObj,
              employee_sync_date: new Date(),
            },
          },
          upsert: true,
        },
      });
    }
    await DiscountUsersTb.bulkWrite(bulk_write_commands);
    return res.json({
      status: true,
      message: "Employee details updated successfully",
    });
  } catch (error) {
    console.log("error", error);
    return res.json({
      status: false,
      message: "ERROR",
    });
  }
}

function createUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

var currentDate = new Date();
currentDate.setDate(currentDate.getDate() + 1);
var year = currentDate.getFullYear();
var month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
var day = currentDate.getDate().toString().padStart(2, "0");
var tomorrowDate = year + month + day;
console.log(tomorrowDate);

//apx_products,iphoen terminal logs
//apx product Sync
app.get("/apxProductSync", apxProductSync);
async function apxProductSync(req, res) {
  try {
    var dataBase = await mongo.connect();
    let apx_productTB = await dataBase.collection("apx_product");
    let config = {
      method: "get",
      maxBodyLength: Infinity,
      url: "http://183.82.44.213/api/apxapi/GetItemModelInfo?CompanyCode=HM&Product=0&Brand=0&ItemCategory=0&CreatedOnStartDate=0&CreatedOnEndDate=0&ModifiedOnStartDate=0&ModifiedOnEndDate=0&ItemNameLike=0&Status=All&ItemClassificationType=NONE&ItemClassificationValue=0",
      headers: {
        UserId: "WEBSITE",
        SecurityCode: "3489-7629-9163-3979",
      },
    };
    let response = await axios(config);
    let bulk_write_commands = [];
    for (var i = 0; i < response?.data?.Data?.length; i++) {
      bulk_write_commands.push({
        updateOne: {
          filter: { ITEM_CODE: response?.data?.Data[i].ITEM_CODE },
          update: {
            $set: {
              ...response?.data?.Data[i],
              enable: true,
              apx_sync_date: new Date(),
            },
          },
          upsert: true,
        },
      });
    }
    await apx_productTB.bulkWrite(bulk_write_commands);
    return res.json({
      status: true,
      message: "Products Addedd successfully",
      successCount: response?.data?.Data.length,
    });
  } catch (error) {
    console.log("error", error);
    return res.json({
      status: false,
      message: "error",
    });
  }
}

//######### APX PRODUCT PRICE  SYNC ##################

app.get("/apxDiscountPriceSync", apxDiscountPriceSync);
async function apxDiscountPriceSync(req, res) {
  try {
    var dataBase = await mongo.connect();
    let apx_productTB = await dataBase.collection("apx_product");
    var date = new Date();
    var getYear = date.getFullYear().toString();
    var month = date.getMonth() + 1;
    if (month.toString().length > 1) {
      month = month.toString();
    } else {
      month = "0" + month;
    }
    var day = date.getDate();
    if (day.toString().length > 1) {
      day = day.toString();
    } else {
      day = "0" + day;
    }
    var dateInput = getYear + month + day;
    var queryData = {
      CompanyCode: "HM",
      PriceTemplate: "MINIMUM PRICE",
      PriceEffetiveFrom: dateInput,
      ItemCode: 0, //0
    };
    var query = qs.stringify(queryData);
    var options = {
      method: "GET",
      url: "http://183.82.44.213/api/apxapi/GetPriceFromPriceTemplate?" + query,
      headers: {
        UserId: "WEBSITE",
        SecurityCode: "3489-7629-9163-3979",
      },
    };

    let response = await axios(options);
    let bulk_write_commands = [];

    for (var i = 0; i < response?.data?.Table?.length; i++) {
      bulk_write_commands.push({
        updateOne: {
          filter: { ITEM_CODE: response?.data?.Table?.[i].ITEM_CODE },
          update: {
            $set: {
              ITEM_PRICE: response?.data?.Table?.[i].ITEM_PRICE,
              price_sync_date: new Date(),
            },
          },
        },
      });
    }
    await apx_productTB.bulkWrite(bulk_write_commands);
    return res.json({
      status: true,
      message: "Products Price Sync  Successfully",
      successCount: response?.data?.Table?.length,
    });
  } catch (error) {
    console.log("error", error);
    return res.json({
      status: false,
      message: "error",
    });
  }
}

//get price with Apxcode

async function getApxprice(req, res) {
  try {
    let config = {
      method: "get",
      maxBodyLength: Infinity,
      url: "http://183.82.44.213/api/apxapi/GetImeiSerialNoCurrentStatus?CompanyCode=HM&ImeiSerialNo=356955703567979",
      headers: {
        UserId: "WEBSITE",
        SecurityCode: "3489-7629-9163-3979",
      },
    };

    let apxCodeResponse = await axios(config);
    console.log("apxCodeResponse", apxCodeResponse);
  } catch (error) {
    console.log("error", error);
    return res.json({
      status: false,
      message: error,
    });
  }
}

//search Iteam Name
app.get("/searchIteamName", searchIteamName);
async function searchIteamName(req, res) {
  console.log("req.query", req.query);
  let name = req.query.name;
  try {
    var dataBase = await mongo.connect();
    let apx_productTB = await dataBase.collection("apx_product");
    let productlist = await apx_productTB
      .find(
        { ITEM_NAME: { $regex: name, $options: "i" } },
        { projection: { ITEM_CODE: 1, ITEM_NAME: 1 } }
      )
      .toArray();
    return res.json({
      status: true,
      data: productlist,
    });
  } catch (error) {
    console.log("error", error);
    return res.josn({
      status: false,
      message: "No data found",
    });
  }
}

app.post("/apxPrice", apxPrice);

async function apxPrice(req, res) {
  console.log("req.body", req.body);
  var dataBase = await mongo.connect();
  let apx_productTB = await dataBase.collection("apx_product");
  let queryData;
  var ITEM_CODE = "";
  //IMEI
  if (req.body.type == "imei") {
    queryData = {
      CompanyCode: "HM",
      ImeiSerialNo: req.body.ImeiSerialNo,
    };
    var query = qs.stringify(queryData);
    console.log("query", query);
    let IMEIconfig = {
      method: "get",
      maxBodyLength: Infinity,
      url: `http://183.82.44.213/api/apxapi/GetImeiSerialNoCurrentStatus?CompanyCode=HM&ImeiSerialNo=${req.body.ImeiSerialNo}`,
      headers: {
        UserId: "WEBSITE",
        SecurityCode: "3489-7629-9163-3979",
      },
    };
    let getImeiSerialNo = await axios(IMEIconfig);
    if (getImeiSerialNo.data.Data.length > 0) {
      ITEM_CODE = getImeiSerialNo.data.Data[0].ITEM_CODE;
    }
  }
  //search
  else {
    ITEM_CODE = req.body.ITEM_CODE;
  }

  if (ITEM_CODE == "" || ITEM_CODE == undefined || ITEM_CODE == null) {
    return res.json({
      status: true,
      message: "ITEM_CODE not found",
    });
  }
  queryData = {
    CompanyCode: "HM",
    PriceTemplate: "MINIMUM PRICE",
    PriceEffetiveFrom: dateInput,
    ItemCode: ITEM_CODE,
  };
  var query = qs.stringify(queryData);

  var options = {
    method: "GET",
    url: "http://183.82.44.213/api/apxapi/GetPriceFromPriceTemplate?" + query,
    headers: {
      UserId: "WEBSITE",
      SecurityCode: "3489-7629-9163-3979",
    },
  };

  let Priceresponse = await axios(options);
  let apxProductRes = await apx_productTB.findOne(
    { ITEM_CODE: ITEM_CODE },
    {
      projection: {
        PROD_CATG_NAME: 1,
        BRAND_NAME: 1,
        ITEM_NAME: 1,
        ITEM_CODE: 1,
      },
    }
  );
  // console.log("apxProductRes", apxProductRes);
  if (Priceresponse.data.Table.length > 0) {
    return res.json({
      status: true,
      data: Priceresponse?.data?.Table,
      apxProductRes: apxProductRes,
    });
  } else {
    return res.json({
      status: true,
      data: "No Data Found",
    });
  }
}

app.post("/getFileUploadUrl", getFileUploadUrl);
async function getFileUploadUrl(req, res) {
  console.log("req.body", req.body);
  let imageBase64 = req.body.base64;
  console.log("req.body.filename", req.body.filename.name);
  try {
    const imageBuffer = Buffer.from(imageBase64, "base64");
    AWS.config.update({
      accessKeyId: "AKIASTAEMZYQ3D75TOOZ",
      secretAccessKey: "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",
      region: "ap-south-1",
    });
    const s3 = new AWS.S3();
    const params = {
      Bucket: "happimobiles",
      Key: `cyechampProductImages/${"product"}/${req.body.filename?.name}`,
      ACL: "public-read",
      Body: imageBuffer,
      ContentType: "image/png",
    };
    s3.upload(params, (err, data) => {
      if (err) {
        console.error(err);
      } else {
        console.log(`Image uploaded successfully. URL: ${data.Location}`);
        return res.json({
          status: true,
          data: data.Location,
        });
      }
    });
  } catch (error) {
    console.log(error);
    res.json({
      status: false,
      message: "something went wrong please try again",
      error: error.message,
    });
  }
}

//upload Images

const FOLDER = "./images/imei_images";
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, FOLDER);
  },
  filename: (req, file, cb) => {
    //console.log("file",file);
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

//upload s3 bucket

let crenditails = {
  accessKeyId: "AKIASTAEMZYQ3D75TOOZ",
  secretAccessKey: "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",
  region: "ap-south-1",
};
const s3 = new AWS.S3(crenditails);
async function uploadImageToS3(bucketName, fileName, fileData) {
  const params = {
    Bucket: bucketName,
    Key: `cyechampProductImages/${"product"}/${fileName}`,
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

//7.9 1.1
//MAttching with IMEI NUMBER

app.post("/matchIMEINumber", matchIMEINumber);
async function matchIMEINumber(req, res) {
  let buff = Buffer.from(req.body.base64, "base64");
  fs.writeFile(
    `./images/imei_images/${req.body.filename.name}`,
    buff,
    async function (err) {
      try {
        const dimension = imageSize(
          `./images/imei_images/${req.body.filename.name}`
        );
        console.log("dimension", dimension);
        console.log(dimension.width); // Image width
        console.log(dimension.height); // Image height
      } catch (error) {
        return res.json({
          status: false,
          message: "Please send  valid Screenshots",
        });
      }
      console.log(
        req.body.filename.type,
        req.body.filename.type !== "image/png",
        req.body.filename.type !== "image/jpeg",
        req.body.filename.type !== "image/jpg"
      );
      if (
        req.body.filename.type !== "image/png" &&
        req.body.filename.type !== "image/jpeg" &&
        req.body.filename.type !== "image/jpg"
      ) {
        return res.json({
          status: false,
          message: "Only .png,.jpeg,.jpg format is allowed",
        });
      } else {
        let file = req.body.filename.name;
        console.log("file", file);
        Tesseract.recognize(`./images/imei_images/${file}`, "eng").then(
          async ({ data: { text } }) => {
            text = text.slice(text.indexOf("IMEI "));
            text = text.slice(4, text.indexOf("\n"));
            text = text.replace(/ /g, "");
            console.log("IMEI: ", text);
            const bucketName = "happimobiles";
            const fileData = fs.readFileSync(`./images/imei_images/${file}`);
            await uploadImageToS3(bucketName, file, fileData).then(
              async (url) => {
                console.log("url", url);
                fs.unlink(`./images/imei_images/${file}`, (error) => {
                  if (error) throw error;
                });
                return res.json({
                  status: true,
                  url: url,
                  imei: text,
                });
              }
            );
          }
        );
      }
    }
  );
}

///-----------------------------get offers based on price ----------------------------------------//

//---------------------sending IPHON ETERMINAL LOGS -------------------------------------------//
app.post("/createEmailsConfig", createEmailsConfig);
async function createEmailsConfig(req, res) {
  // console.log("req", req.body);
  try {
    var db = await mongo.connect();
    var emailCOnfigTbl = db.collection("email_config");
    let EmailArray = req.body.mails.split(",");
    console.log("EmailArray", EmailArray);
    await emailCOnfigTbl.findOneAndUpdate(
      { type: "email" },
      { $set: { email: EmailArray } }
    );
    return res.json({
      status: true,
      data: "Emails saved Successfully",
    });
  } catch (error) {
    console.log("error", error);
    return res.json({});
  }
}

//--------------------------------------------get Store wise reports-------------------------------------------//
app.get("/getStoreWiseReports", getStoreWiseReports);
async function getStoreWiseReports(req, res) {
  try {
    let user_id = req.query.id; /// send login id
    var dataBase = await mongo.connect();
    let iphoneEMILOGSTB = await dataBase.collection("iphone_imei_logs");
    //get  success and failure case data and count
    let succcessLogs = await iphoneEMILOGSTB
      .find({ user_id: user_id, status: "SUCCESS" })
      .toArray();
    let failureLogs = await iphoneEMILOGSTB
      .find({ user_id: user_id, status: "FAILED" })
      .toArray();
    return res.json({
      status: true,
      successCount: succcessLogs.length,
      failureCount: failureLogs.length,
      succcessLogs: succcessLogs,
      failureLogs: failureLogs,
    });
  } catch (error) {
    console.log("error", error);
    return res.json({
      status: false,
      message: "error",
    });
  }
}

///-------------------------------generate QR CODE with validation of invoice number----------------------------------------//
//SI/SKKM/649
//##### check invoive number validation from APX APIS
//Add invoice_number check that invoice number is validate or not? if validate get success response.
app.post("/checkInvoiceNumber", checkInvoiceNumber);
async function checkInvoiceNumber(req, res) {
  try {
    const indianTimeZoneOffset = 330;
    const currentUTCTime = moment.utc();
    const currentTimeInIndia = currentUTCTime.add(
      indianTimeZoneOffset,
      "minutes"
    );
    let formattedDate = currentTimeInIndia.format("YYYYMMDD");
    if (
      req.body.date != null &&
      req.body.date != "" &&
      req.body.date != undefined &&
      req.body.date != "null"
    ) {
      formattedDate = req.body.date;
    }
    console.log("formattedDate", formattedDate); //20231009 after deploy 20231008
    var dataBase = await mongo.connect();
    let iphoneEMILOGSTB = await dataBase.collection("iphone_imei_logs");
    let invoice_no = req.body.invoice_no;
    let invoiceconfig = {
      method: "GET",
      url: `http://183.82.44.213/api/apxapi/GetInvoiceDetails?CompanyCode=HM&Invoice_No=${invoice_no}&Invoice_Date=${formattedDate}`,
      headers: {
        UserId: "WEBSITE",
        SecurityCode: "3489-7629-9163-3979",
      },
    };
    logsService.log(
      "debug",
      req,
      `CHECK APX INVOICE NUMBER STEP-1${invoice_no}`,
      invoiceconfig
    );
    let checkValidInvoiceResponse = await axios(invoiceconfig);
    if (checkValidInvoiceResponse?.data.Table?.length > 0) {
      logsService.log(
        "debug",
        req,
        `VALID INVOICE NUMBER STEP-1${invoice_no}`,
        checkValidInvoiceResponse?.data.Table
      );
      let query = {};
      query.status = "SUCCESS";
      let from = new Date();
      from.setHours(0, 0, 0, 0);
      let to = new Date();
      to.setHours(23, 59, 59, 999);
      query.invoice_no = invoice_no;
      query.createdDate = {
        $gte: from,
        $lte: to,
      };
      let checkTodaySuccessRecord = await iphoneEMILOGSTB.findOne(query);
      if (checkTodaySuccessRecord != null) {
        logsService.log(
          "debug",
          req,
          `${invoice_no}  Invoive Already Uploaded Step-1`,
          checkTodaySuccessRecord
        );
        return res.json({
          status: false,
          message: `${invoice_no} \n\n This Invoice Number has already been matched with the associated IMEI number`,
        });
      }
      return res.json({
        status: true,
        message: "VALID INVOICE NUMBER",
        invoice_no: invoice_no,
        imei_array:
          checkValidInvoiceResponse?.data?.Table[0]?.ITEMDETAILS?.Table,
      });
    } else {
      logsService.log(
        "debug",
        req,
        `INVALID INVOICE NUMBER STEP-1${invoice_no}`,
        checkValidInvoiceResponse?.data.Table
      );
      return res.json({
        status: false,
        message: "INVALID INVOICE NUMBER",
        invoice_no: invoice_no,
      });
    }
  } catch (error) {
    logsService.log("error", req, error + "");
    console.log("err", error);
    return res.json({
      status: false,
      message: "ERROR",
    });
  }
}
//############ if invoice number is valid to generate the QR code for that particular invoice number########
app.post("/generateQRcode", generateQRCode);
async function generateQRCode(req, res) {
  try {
    let invoice_no = req.body.invoice_no;
    var dataBase = await mongo.connect();
    let iphoneEMILOGSTB = await dataBase.collection("iphone_imei_logs");
    //generate one QR CODE and send to the front end developers
    let uuid = createUUID();
    let dataURL = `https://www.happimobiles.com/iphone-verification/${uuid}`;
    console.log(dataURL, "dataURL");
    logsService.log("debug", req, "GENERATE QR CODE DATA URL", dataURL);
    QRCode.toDataURL(dataURL, async function (err, data) {
      if (err) throw err;
      let id = uuid;
      let QRcodeObj = {
        id: id,
        invoice_no: invoice_no,
        user_id: req.body.user_id,
        emp_code: req.body.emp_code,
        imei_array: req.body.imei_array,
        message: "NOT UPLOADED",
        createdDate: new Date(),
        status: "FAILED",
        emp_name: req.body.emp_name,
        email: req.body.email,
      };
      await iphoneEMILOGSTB.insertOne(QRcodeObj);
      logsService.log("debug", req, "GENERATE QR CODE STEP-2", QRcodeObj);
      return res.send({ data: data, id: id });
    });
  } catch (error) {
    logsService.log("error", req, error + "");
    return res.json({
      status: false,
      message: "ERROR",
    });
  }
}
// Upload IMEI SCREEN SHOT
const upload3 = multer({ dest: "./images/imei_images" });
app.post(
  "/getQRCodeUploadIMEINumber",
  upload3.single("file"),
  async function (req, res) {
    try {
      try {
        var dataBase = await mongo.connect();
        let iphoneEMILOGSTB = await dataBase.collection("iphone_imei_logs");
        logsService.log(
          "debug",
          req,
          "GETTING UPLOAD FILE DETAILS STEP-4",
          req.file
        );
        if (req.file == undefined) {
          return res.json({
            status: false,
            message: "Only .png,.jpeg,.jpg format is allowed",
          });
        } else {
          if (
            req.file.mimetype == "image/jpeg" ||
            req.file.mimetype == "image/jpg" ||
            req.file.mimetype == "image/png"
          ) {
            const fileData = fs.readFileSync(
              `./images/imei_images/${req.file.filename}`
            );
            const bucketName = "happimobiles";
            await uploadImageToS3(
              bucketName,
              req.file.originalname,
              fileData
            ).then(async (url) => {
              console.log("url", url);
              // await iphoneEMILOGSTB.findOneAndUpdate({ "id": req.body.id }, { $set: { "image_url": url } })
              logsService.log(
                "debug",
                req,
                "GETTING S3 BUCKET URL STEP-5",
                url
              );
              fs.unlink(
                `./images/imei_images/${req.file.filename}`,
                (error) => {
                  if (error) throw error;
                }
              );
              Tesseract.recognize(url, "eng")
                .then(async ({ data: { text } }) => {
                  let responseArray = [];
                  let errorArray = [];

                  const imeiIndex = text.indexOf("IME|");
                  if (imeiIndex !== -1) {
                    const imeiText = text.slice(imeiIndex);
                    const pattern = /(IME\|)\s(\d+)/g;
                    const match = pattern.exec(imeiText);
                    if (match) {
                      logsService.log(
                        "debug",
                        req,
                        "IMEI MATCH(IME| match with pipe)",
                        match
                      );
                      const textAfterIMEI = match[0].split("|")[1];
                      responseArray.push({ url: url, imei: textAfterIMEI }); // Extract the captured text
                      return res.json({
                        status: true,
                        url: url,
                        imei: textAfterIMEI,
                        responseArray: responseArray,
                      });
                    } else {
                      const imei2Index = text.indexOf("IMEI2");
                      if (imei2Index !== -1) {
                        const imei2Text = text.slice(imei2Index);
                        const pattern2 = /IMEI2\s(\d+)/;
                        const match2 = pattern2.exec(imei2Text);
                        if (match2) {
                          const textAfterIMEI2 = match2[1].split(" ")[1];
                          responseArray.push({
                            url: url,
                            imei: textAfterIMEI2,
                          }); // Extract the captured text
                          return res.json({
                            status: true,
                            url: url,
                            imei: textAfterIMEI2,
                            responseArray: responseArray,
                          });
                        } else {
                          errorArray.push({ url: url, imei: "" });
                          return res.json({
                            status: true,
                            url: url,
                            imei: "",
                            errorArray: errorArray,
                          });
                        }
                      } else {
                        errorArray.push({ url: url, imei: "" });
                        return res.json({
                          status: true,
                          url: url,
                          imei: "",
                          errorArray: errorArray,
                        });
                      }
                    }
                  } else {
                    const imeiIndex = text.indexOf("IMEI");
                    console.log("imeiIndex00000000000", imeiIndex);
                    if (imeiIndex !== -1) {
                      const imeiText = text.slice(imeiIndex);
                      const pattern = /(IMEI|IME\|)\s(\d+)/g;
                      const match = pattern.exec(imeiText);
                      console.log("match3333", match);
                      logsService.log(
                        "debug",
                        req,
                        "IMEI MATCH(IMEI match with Normal)",
                        match
                      );
                      if (match) {
                        const textAfterIMEI = match[0].split(" ")[1];
                        responseArray.push({ url: url, imei: textAfterIMEI }); // Extract the captured text
                        return res.json({
                          status: true,
                          url: url,
                          imei: textAfterIMEI,
                          responseArray: responseArray,
                        });
                      } else {
                        const imeipipiIndex = text.indexOf("IMEI|");
                        console.log("imeipipiIndex", imeipipiIndex);
                        if (imeipipiIndex !== -1) {
                          const imeiText = text.slice(imeipipiIndex);
                          const pattern3 = /(IMEI|||IME\|)\s(\d+)/g;
                          const match3 = pattern3.exec(imeiText);
                          if (match3) {
                            const textAfterIMEI3 = match3[2];
                            responseArray.push({
                              url: url,
                              imei: textAfterIMEI3,
                            });
                            return res.json({
                              status: true,
                              url: url,
                              imei: textAfterIMEI3,
                              responseArray: responseArray,
                            });
                          } else {
                            errorArray.push({ url: url, imei: "" });
                            return res.json({
                              status: true,
                              url: url,
                              imei: "",
                              errorArray: errorArray,
                            });
                          }
                        } else {
                          errorArray.push({ url: url, imei: "" });
                          return res.json({
                            status: true,
                            url: url,
                            imei: "",
                            errorArray: errorArray,
                          });
                        }
                      }
                    } else {
                      errorArray.push({ url: url, imei: "" });
                      return res.json({
                        status: true,
                        url: url,
                        imei: "",
                        errorArray: errorArray,
                      });
                    }
                  }
                })
                .catch((error) => {
                  console.log("error", error);
                  return res.json({
                    status: false,
                    message: "Error",
                  });
                });
            });
          } else {
            return res.json({
              status: false,
              message: "Only .png,.jpeg,.jpg format is allowed",
            });
          }
        }
      } catch (error) {
        logsService.log("error", req, error + "");
        return res.json({
          status: false,
          message: error,
        });
      }
    } catch (error) {
      console.log("error", error);
      return res.json({
        status: false,
        message: error,
      });
    }
  }
);

app.post("/checkUploadIMEINumberScreenShoot", checkUploadIMEINumberScreenShoot);
async function checkUploadIMEINumberScreenShoot(req, res) {
  try {
    let data = req.body;
    var dataBase = await mongo.connect();
    let iphoneEMILOGSTB = await dataBase.collection("iphone_imei_logs");
    let iphoneEmailTb = await dataBase.collection(
      "iphone_terminals_emails_log"
    );
    let iphoneTerminalLogs = await iphoneEMILOGSTB.findOne({ id: data.id });
    let IMEICodeMatch = iphoneTerminalLogs?.imei_array?.filter(
      (item, index) => {
        return item.ITEM_SERIAL_NOS == data.imageResponse.imei?.trim();
      }
    );

    if (IMEICodeMatch?.length > 0) {
      await iphoneEMILOGSTB.deleteOne({ imei_no: data.imageResponse.imei });
      logsService.log(
        "debug",
        req,
        "IMEI NUMBER SCREEN SHOT VALIDATION STEP-6",
        data
      );
      // await iphoneEMILOGSTB.findOneAndUpdate({ "id": data.id }, { $set: { "imei_no": data.imageResponse.imei, "item_code": IMEICodeMatch[0].ITEM_SERIAL_NOS, "status": "SUCCESS", message: "IMEI  MATCH", "createdDate": new Date(), "invoice_no": iphoneTerminalLogs?.invoice_no, "user_id": iphoneTerminalLogs?.user_id, emp_code: IMEICodeMatch[0].SALESPERSONCODE, "emp_name": iphoneTerminalLogs?.emp_name } })
      await iphoneEMILOGSTB.findOneAndUpdate(
        { id: data.id },
        {
          $set: {
            image_url: data.imageResponse.url,
            imei_no: data.imageResponse.imei,
            item_code: IMEICodeMatch[0].ITEM_SERIAL_NOS,
            status: "SUCCESS",
            message: "IMEI  MATCH",
            createdDate: new Date(),
            invoice_no: iphoneTerminalLogs?.invoice_no,
            user_id: iphoneTerminalLogs?.user_id,
            emp_code: IMEICodeMatch[0].SALESPERSONCODE,
            emp_name: iphoneTerminalLogs?.emp_name,
          },
        }
      );
      logsService.log(
        "debug",
        req,
        "IMEI NUMBER SCREEN SHOT VALIDATION STEP-6",
        data
      );
      let iphoneDetails = await iphoneEMILOGSTB.findOne({ id: data.id });
      return res.json({
        status: true,
        message: "IMEI NUMBER MATCH",
        data: iphoneDetails,
      });
    } else {
      await iphoneEMILOGSTB.findOneAndUpdate(
        { id: data.id },
        {
          $set: {
            image_url: data.imageResponse.url,
            imei_no: data.imageResponse.imei,
            item_code: "",
            status: "FAILED",
            message: "VERIFICATION FAILED",
            createdDate: new Date(),
            invoice_no: iphoneTerminalLogs?.invoice_no,
            user_id: iphoneTerminalLogs?.user_id,
            emp_code: iphoneTerminalLogs?.emp_code,
            emp_name: iphoneTerminalLogs?.emp_name,
          },
        }
      );
      //await iphoneEMILOGSTB.findOneAndUpdate({ "id": data.id }, { $set: { "imei_no": data.imageResponse.imei, "item_code": "", "status": "FAILED", message: "VERIFICATION FAILED", "createdDate": new Date(), "invoice_no": iphoneTerminalLogs?.invoice_no, "user_id": iphoneTerminalLogs?.user_id, "emp_code": iphoneTerminalLogs?.emp_code, "emp_name": iphoneTerminalLogs?.emp_name } })
      logsService.log(
        "debug",
        req,
        "IMEI NUMBER SCREEN SHOT VALIDATION STEP-6",
        data
      );
      let iphoneDetails = await iphoneEMILOGSTB.findOne({ id: data.id });
      let code = iphoneTerminalLogs?.invoice_no;
      code = code?.split("/");
      let emailDataRes = await iphoneEmailTb.findOne({ code: code[1] });
      if (emailDataRes == null) {
        return res.json({
          status: false,
          message: "IMEI NUMBER NOT MATCH PLEASE TRY AGAIN",
          data: iphoneDetails,
        });
      }
      await email.send_mail(
        [
          emailDataRes?.storeemail,
          emailDataRes?.asmemail,
          emailDataRes?.adminemail,
        ],
        "Iphone Terminal " + new Date().toISOString(),
        `Iphone Terminal" : ${new Date().toISOString()}
                IMEI : ${data.imageResponse.imei}
                status : ${"FAILED"}
                INVOICENUMBER : ${iphoneTerminalLogs?.invoice_no}
                `,
        []
      );
      return res.json({
        status: false,
        message: "IMEI NUMBER NOT MATCH PLEASE TRY AGAIN",
        data: iphoneDetails,
      });
    }
  } catch (error) {
    logsService.log("error", req, error + "");
    return res.json({
      status: false,
      message: "error",
    });
  }
}

//send success and failure  count sending emails
app.get("/iphoneTerminalYesterdayLogs", iphoneTerminalYesterdayLogs);
async function iphoneTerminalYesterdayLogs(req, res) {
  try {
    var from = new Date();
    from.setHours(0, 0, 0, 0);
    var to = new Date();
    to.setHours(23, 59, 59, 999);
    from.setDate(from.getDate() - 1);
    to.setDate(to.getDate() - 1);
    console.log("from", from, to);
    var dataBase = await mongo.connect();
    let iphoneEMILOGSTB = await dataBase.collection("iphone_imei_logs");
    let emailCOnfig = await dataBase.collection("email_config");
    let emailArray = await emailCOnfig.find({}).toArray();
    let iphone_logs = await iphoneEMILOGSTB
      .aggregate([
        {
          $match: {
            status: { $in: ["SUCCESS", "FAILED"] },
            createdDate: {
              $gt: from,
              $lte: to,
            },
          },
        },
        {
          $group: {
            _id: {
              status: "$status",
              // user_id: "$user_id",
            },
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            status: "$_id.status",
            //user_id: "$_id.user_id",
            count: 1,
            _id: 0,
          },
        },
      ])
      .toArray();
    console.log("iphone_logs", iphone_logs);

    const outputObject = {};

    for (const item of iphone_logs) {
      outputObject[item.status] = item.count;
    }
    console.log(outputObject);
    await email.send_mail(
      emailArray[0]?.email,
      "Iphone Terminal " + new Date().toISOString(),
      `Iphone Terminal" + ${new Date().toISOString()}
            Success: ${outputObject.SUCCESS || 0} 
            Failure: ${outputObject.FAILED || 0}
            `,
      []
    );
    return res.json({
      status: true,
      message: "Send Success Count And Failure Count",
    });
  } catch (error) {
    console.log("error", error);
    return res.json({
      status: false,
      message: "error",
    });
  }
}
///################  store wis eduplicate reports #############################//
app.get("/getStoreWiseReports1", getStoreWiseReports1);
async function getStoreWiseReports1(req, res) {
  try {
    let user_id = req.query.id; /// send login id
    let from_date = req.query.from_date;
    let to_date = req.query.to_date;
    var dataBase = await mongo.connect();
    let succcessLogs;
    let failureLogs;
    let iphoneEMILOGSTB = await dataBase.collection("iphone_imei_logs");
    let query = {
      user_id: user_id,
      // status: { $ne: null },
    };
    let statusquery = {
      user_id: user_id,
      status: "SUCCESS",
    };
    let statusquery1 = {
      user_id: user_id,
      status: "FAILED",
    };

    if (from_date !== "all" && to_date !== "all") {
      from_date = new Date(from_date);
      to_date = new Date(to_date);
      to_date.setDate(to_date.getDate() + 1);
      from_date.setHours(0, 0, 0, 0);
      to_date.setHours(0, 0, 0, 0);
      query.createdDate = { $gte: from_date, $lte: to_date };
      statusquery.createdDate = { $gte: from_date, $lte: to_date };
    }
    console.log("query", query);
    succcessLogs = await iphoneEMILOGSTB.find(statusquery).toArray();
    failureLogs = await iphoneEMILOGSTB.find(statusquery1).toArray();
    let reportsData = await iphoneEMILOGSTB
      .aggregate([
        { $match: query },
        {
          $project: {
            id: 1,
            invoice_no: 1,
            user_id: 1,
            emp_code: 1,
            message: 1,
            createdDate: 1,
            status: 1,
            image_url: 1,
            imei_no: 1,
            item_code: 1,
          },
        },
      ])
      .sort({ createdDate: -1 })
      .toArray();
    return res.json({
      status: true,
      successCount: succcessLogs?.length,
      failureCount: failureLogs?.length,
      data: reportsData,
    });
  } catch (error) {
    console.log("error", error);
    return res.json({
      status: false,
      message: "error",
    });
  }
}

//############### verification #########################
app.get("/verifyImeiNumber", verifyImeiNumber);
async function verifyImeiNumber(req, res) {
  try {
    var dataBase = await mongo.connect();
    let iphoneEMILOGSTB = await dataBase.collection("iphone_imei_logs");
    let iphonelogResponse = await iphoneEMILOGSTB.findOne({ id: req.query.id });
    return res.json({
      status: true,
      data: iphonelogResponse,
    });
  } catch (error) {
    console.log("error", error);
    return res.json({
      status: false,
      message: "ERROR",
    });
  }
}

//##################################get ALL IPHONE TERMINAL LOGS################################
app.get("/iphoneTerminalLogsCount", iphoneTerminalLogsCount);
async function iphoneTerminalLogsCount(req, res) {
  try {
    var dataBase = await mongo.connect();
    let iphoneEMILOGSTB = await dataBase.collection("iphone_imei_logs");
    let query = {};
    let formdate = req.query.fromdate;
    let todate = req.query.todate;
    query.status = req.query.status;
    if (formdate != "all" && todate != "all") {
      formdate = new Date(formdate);
      todate = new Date(todate);
      todate.setDate(todate.getDate() + 1);
      formdate.setHours(0, 0, 0, 0);
      todate.setHours(0, 0, 0, 0);
      query.createdDate = {
        $gte: formdate,
        $lte: todate,
      };
    }
    if (
      req.query.imei_no != null &&
      req.query.imei_no != "" &&
      req.query.imei_no != undefined &&
      req.query.imei_no != "null"
    ) {
      // query.imei_no = req.query.imei_no
      query.imei_no = { $regex: req.query.imei_no, $options: "i" };
    }
    if (
      req.query.invoice_no != null &&
      req.query.invoice_no != "" &&
      req.query.invoice_no != undefined &&
      req.query.invoice_no != "null"
    ) {
      query.invoice_no = { $regex: req.query.invoice_no, $options: "i" };
    }
    if (
      req.query.approved_by != null &&
      req.query.approved_by != "" &&
      req.query.approved_by != undefined &&
      req.query.approved_by != "null"
    ) {
      query.approved_by = "ADMIN";
    }

    let totolCountData = await iphoneEMILOGSTB.find({}).toArray();
    let iphoneLogsResponse = await iphoneEMILOGSTB
      .find(query, {
        projection: {
          invoice_no: 1,
          emp_code: 1,
          message: 1,
          createdDate: 1,
          status: 1,
          email: 1,
          image_url: 1,
          imei_no: 1,
          id: 1,
          approved_by: 1,
        },
      })
      .sort({ createdDate: -1 })
      .toArray();
    if (req.query.type == "display") {
      return res.json({
        status: true,
        data: iphoneLogsResponse,
        count: iphoneLogsResponse?.length,
        TotalCount: totolCountData?.length,
      });
    } else {
      if (iphoneLogsResponse.length > 0) {
        const fields = iphoneLogsResponse[0].keys;
        const opts = {
          fields,
        };
        const parser = new Parser(opts);
        const csv = parser.parse(iphoneLogsResponse);
        res.setHeader(
          "Content-disposition",
          "attachment; filename=iphone-terminal-logs.csv"
        );
        res.set("Content-Type", "text/csv");
        res.status(200).send(csv);
      } else {
        res.send("no data found");
      }
    }
  } catch (error) {
    console.log("erroro", error);
    return res.json({
      status: false,
      message: "ERROR",
    });
  }
}

app.post("/getIMEINumber", getIMEINumber);
async function getIMEINumber(req, res) {
  try {
    let invoice_no = req.body.invoice_no;
    const indianTimeZoneOffset = 330;
    const currentUTCTime = moment.utc();
    const currentTimeInIndia = currentUTCTime.add(
      indianTimeZoneOffset,
      "minutes"
    );
    let formattedDate = currentTimeInIndia.format("YYYYMMDD");
    let invoiceconfig = {
      method: "GET",
      url: `http://183.82.44.213/api/apxapi/GetInvoiceDetails?CompanyCode=HM&Invoice_No=${invoice_no}&Invoice_Date=${formattedDate}`,
      headers: {
        UserId: "WEBSITE",
        SecurityCode: "3489-7629-9163-3979",
      },
    };
    let checkValidInvoiceResponse = await axios(invoiceconfig);
    if (checkValidInvoiceResponse?.data.Table?.length > 0) {
      const filteredArray =
        checkValidInvoiceResponse?.data.Table[0]?.ITEMDETAILS?.Table?.filter(
          (item) => item.ITEM_SERIAL_NOS !== ""
        );
      logsService.log(
        "debug",
        req,
        "VALID INVOICE NUMBER",
        checkValidInvoiceResponse?.data.Table
      );
      return res.json({
        status: true,
        message: "VALID INVOICE NUMBER",
        invoice_no: invoice_no,
        imei_no: filteredArray[0]?.ITEM_SERIAL_NOS,
      });
    } else {
      logsService.log(
        "debug",
        req,
        "INVALID INVOICE NUMBER",
        checkValidInvoiceResponse?.data.Table
      );
      return res.json({
        status: false,
        message: "INVALID INVOICE NUMBER",
        invoice_no: invoice_no,
      });
    }
  } catch (error) {
    console.log("error", error);
    logsService.log("error", req, error + "");
    return res.json({
      status: false,
      message: "ERROR",
    });
  }
}

//########################## NON HAPPI CARE REPORT##################################//
app.get("/happiCareReport", happiCareReport);
async function happiCareReport(req, res) {
  try {
    var dataBase = await mongo.connect();
    let happiCareReportsTB = await dataBase.collection("happiCareReports");
    let query = {};
    if (req.query.fromdate != "all" && req.query.todate != "all") {
      let fromdate = new Date(req.query.fromdate);
      let todate = new Date(req.query.todate);
      todate.setDate(todate.getDate() + 1);
      query.date = {
        $gte: fromdate,
        $lte: todate,
      };
    }
    let nonHappiCareResponse = await happiCareReportsTB.find(query).toArray();
    if (nonHappiCareResponse.length > 0) {
      const fields = nonHappiCareResponse[0].keys;
      const opts = {
        fields,
      };
      try {
        const parser = new Parser(opts);
        const csv = parser.parse(nonHappiCareResponse);
        res.setHeader(
          "Content-disposition",
          "attachment; filename=non-happi-care-report.csv"
        );
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
      message: "ERROR",
    });
  }
}

//############################### STORE OFFDESR ###########################//

app.post("/storeOffers", async function (req, res) {
  console.log("-------------------", req.body);
  console.log("new", new Date().toISOString().substring(0, 10).toString());
  var db = await mongo.connect();
  var offersStoresTbl = db.collection("offers_store");
  let offersStores = await offersStoresTbl
    .aggregate([
      {
        $match: {
          status: true,
          start_date: {
            $lte: new Date(
              new Date().toISOString().substring(0, 10).toString()
            ),
          },
          end_date: {
            $gte: new Date(
              new Date().toISOString().substring(0, 10).toString()
            ),
          },
          model: req.body.apx_code,
        },
      },
      {
        $project: {
          brandLength: { $size: "$brand_rules" },
          cardLength: { $size: "$card_rules" },
          happiLength: { $size: "$happi_rules" },
          financeLength: { $size: "$finance_rules" },
        },
      },
      {
        $group: {
          _id: null,
          totalBrandOffers: { $sum: "$brandLength" },
          totalCardOffers: { $sum: "$cardLength" },
          totalHappiOffers: { $sum: "$happiLength" },
          totalFinanceOffers: { $sum: "$financeLength" },
        },
      },
    ])
    .toArray();
  console.log("offersStores", offersStores);
  if (offersStores?.length == 0) {
    return res.json({
      status: false,
      message: "NO OFFERS FOUND",
    });
  }
  return res.json({
    status: true,
    message: "OFFERS FOUND",
    data: offersStores,
  });
});

//################### LIST OF STORE OFFERS ###########################//
app.post("/listOfStoreOffers", listOfStoreOffers);
async function listOfStoreOffers(req, res) {
  try {
    var db = await mongo.connect();
    var offersStoresTbl = db.collection("offers_store");
    let offersStores = await offersStoresTbl
      .aggregate([
        {
          $match: {
            model: { $eq: req.body.apx_code },
            status: { $eq: true },
            start_date: {
              $lte: new Date(
                new Date().toISOString().substring(0, 10).toString()
              ),
            },
            end_date: {
              $gte: new Date(
                new Date().toISOString().substring(0, 10).toString()
              ),
            },
          },
        },
        {
          $project: {
            title: 1,
            brand_rules: 1,
            card_rules: 1,
            happi_rules: 1,
            finance_rules: 1,
          },
        },
      ])
      .toArray();
    let BrandArray = [];
    let cardArray = [];
    let happiArray = [];
    let finanaceArray = [];

    offersStores.forEach((item) => {
      BrandArray = BrandArray.concat(item.brand_rules);
      cardArray = cardArray.concat(item.card_rules);
      happiArray = happiArray.concat(item.happi_rules);
      finanaceArray = finanaceArray.concat(item.finance_rules);
    });
    return res.json({
      status: true,
      BrandArray: BrandArray,
      cardArray: cardArray,
      happiArray: happiArray,
      finanaceArray: finanaceArray,
    });
  } catch (error) {
    console.log("error", error);
    return res.json({
      status: false,
      message: "ERRRO",
    });
  }
}

//######################UPDATE STORE OFFERS WITH BARND RULES,CARD RULUES,HAppi Rules,Finanace Rules #####//
app.post("/addingOffersArray", addingOffersArray);
async function addingOffersArray(req, res) {
  try {
    var db = await mongo.connect();
    var offersStoresTbl = await db.collection("offers_store");
    let getofferlist = await offersStoresTbl.findOne({ id: req.body.id });
    if (req.body.key == "brand") {
      let newObject = {
        discount_Rule: req.body.discount_Rule,
        brand_title: req.body.brand_title,
        start_date: req.body.start_date,
        end_date: req.body.end_date,
        brand_offer_id: req.body.brand_offer_id,
      };
      if (typeof getofferlist.brand_rules === "object") {
        getofferlist.brand_rules = getofferlist.brand_rules;
      }
      getofferlist.brand_rules.push(newObject);
      getofferlist.brand_rules = getofferlist.brand_rules.filter(
        (item) => !Array.isArray(item) || item.length > 0
      );
    } else if (req.body.key == "card") {
      let newObject = {
        card_rule: req.body.card_rule,
        card_title: req.body.card_title,
        start_date: req.body.start_date,
        end_date: req.body.end_date,
        card_offer_id: req.body.card_offer_id,
      };
      if (typeof getofferlist.card_rules === "object") {
        getofferlist.card_rules = getofferlist.card_rules;
      }
      getofferlist.card_rules.push(newObject);
      getofferlist.card_rules = getofferlist.card_rules.filter(
        (item) => !Array.isArray(item) || item.length > 0
      );
    } else if (req.body.key == "happi") {
      let newObject = {
        happi_rule: req.body.happi_rule,
        happi_title: req.body.happi_title,
        start_date: req.body.start_date,
        end_date: req.body.end_date,
        happi_offer_id: req.body.happi_offer_id,
      };
      if (typeof getofferlist.happi_rules === "object") {
        getofferlist.happi_rules = getofferlist.happi_rules;
      }
      getofferlist.happi_rules.push(newObject);
      getofferlist.happi_rules = getofferlist.happi_rules.filter(
        (item) => !Array.isArray(item) || item.length > 0
      );
    } else if (req.body.key == "finance") {
      let newObject = {
        finance_rule: req.body.finance_rule,
        finance_title: req.body.finance_title,
        start_date: req.body.start_date,
        end_date: req.body.end_date,
        finance_offer_id: req.body.finance_offer_id,
      };
      if (typeof getofferlist.finance_rules === "object") {
        getofferlist.finance_rules = getofferlist.finance_rules;
      }
      getofferlist.finance_rules.push(newObject);
      getofferlist.finance_rules = getofferlist.finance_rules.filter(
        (item) => !Array.isArray(item) || item.length > 0
      );
    }
    await offersStoresTbl.findOneAndUpdate(
      { id: req.body.id },
      { $set: getofferlist }
    );
    return res.json({
      status: true,
      message: "Updated successfully",
    });
  } catch (error) {
    console.log("error", error);
    return res.json({
      status: false,
      message: "ERROR",
    });
  }
}

//##################### UPDATE OFFERS ARRAY #############################//
app.put("/updateOffersArray", updateOffersArray);
async function updateOffersArray(req, res) {
  try {
    var db = await mongo.connect();
    var offersStoresTbl = await db.collection("offers_store");
    let getofferlist = await offersStoresTbl.findOne({ id: req.body.id });
    console.log(req.body);
    if (req.body.key == "brand") {
      let updateJson = {
        discount_Rule: req.body.discount_Rule,
        brand_title: req.body.brand_title,
        start_date: req.body.start_date,
        end_date: req.body.end_date,
        brand_offer_id: req.body.brand_offer_id,
      };
      var index = getofferlist.brand_rules.findIndex(
        (item) => item.brand_offer_id === req.body.brand_offer_id
      );
      getofferlist.brand_rules[index] = updateJson;
      console.log("getofferlist", getofferlist);
    } else if (req.body.key == "card") {
      let updateJson = {
        card_rule: req.body.card_rule,
        card_title: req.body.card_title,
        start_date: req.body.start_date,
        end_date: req.body.end_date,
        card_offer_id: req.body.card_offer_id,
      };
      var index = getofferlist.card_rules.findIndex(
        (item) => item.card_offer_id === req.body.card_offer_id
      );
      getofferlist.card_rules[index] = updateJson;
      console.log("getofferlist", getofferlist);
    } else if (req.body.key == "happi") {
      let updateJson = {
        happi_rule: req.body.happi_rule,
        happi_title: req.body.happi_title,
        start_date: req.body.start_date,
        end_date: req.body.end_date,
        happi_offer_id: req.body.happi_offer_id,
      };
      var index = getofferlist.happi_rules.findIndex(
        (item) => item.happi_offer_id === req.body.happi_offer_id
      );
      getofferlist.happi_rules[index] = updateJson;
      console.log("getofferlist", getofferlist);
    } else if (req.body.key == "finance") {
      let updateJson = {
        finance_rule: req.body.finance_rule,
        finance_title: req.body.finance_title,
        start_date: req.body.start_date,
        end_date: req.body.end_date,
        finance_offer_id: req.body.finance_offer_id,
      };
      var index = getofferlist.finance_rules.findIndex(
        (item) => item.finance_offer_id === req.body.finance_offer_id
      );
      getofferlist.finance_rules[index] = updateJson;
      console.log("getofferlist", getofferlist);
    }

    //console.log("getofferlist", getofferlist);
    await offersStoresTbl.findOneAndUpdate(
      { id: req.body.id },
      { $set: getofferlist }
    );
    return res.json({
      status: true,
      message: "updated succesfully",
    });
  } catch (error) {
    console.log("error", error);
    return res.json({
      status: false,
      message: "ERROR",
    });
  }
}

module.exports = app;
