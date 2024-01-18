const serverless = require("serverless-http");
const express = require("express");
const cors = require("cors");
const app = express();
const axios = require("axios");
const qs = require("querystring");
var mongo = require("./db");
const { v4: uuidv4 } = require("uuid");
var crypto = require("crypto");
var shiprocket = require("./shipping");
//const { Parser } = require("json2csv")
const MONGO_DB_CONNECTION =
  process.env.MONGO_DB_CONNECTION ||
  "mongodb+srv://sowmya:iNNrxOhVfEdvsUaI@happinewsls.cnw2n.mongodb.net/happi-new-sls?replicaSet=atlas-11ilgn-shard-0&readPreference=primary&connectTimeoutMS=10000&authSource=admin&authMechanism=SCRAM-SHA-1";
var emailModule = require("./modules/email");
const { Parser } = require("json2csv");
let sendsms = require("./modules/sms");
let path = require("path");
const blockhash = require("blockhash-core");
const { imageFromBuffer, getImageData } = require("@canvas/image");
const Tesseract = require("tesseract.js");
let multer = require("multer");
let fs = require("fs");
var smsModule = require("./modules/campaignsms");
let awsmodule = require("./modules/aws");
const AWS = require("aws-sdk");

app.options("*", cors()); // include before other routes

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", function (req, res) {
  return res.send("api server is working.... ");
  //return res.redirect("https://www.happimobiles.com/thankyou");
});

app.post("/fetch-page", async function (req, res) {
  if (req.body.url != null) {
    axios
      .get(req.body.url)
      .then((resp) => {
        res.send(resp.data);
      })
      .catch((err) => {
        res.send("<html></html>");
      });
  } else {
    res.send("<html></html>");
  }
});

app.post("/91-mobiles-fetch", async function (req, res) {
  var db = await mongo.connect();
  var productTbl = db.collection("product");
  var products = await productTbl
    .find(
      { ispublished: true },
      {
        projection: { name: 1, mrp: 1, payPrice: 1, linker: 1, category: 1 },
      }
    )
    .toArray();
  res.json(products);
});

app.post("/offers-fetch", async function (req, res) {
  try {
    var db = await mongo.connect();
    var offersTbl = db.collection("offers");
    console.log(new Date());

    var offers = await offersTbl
      .find(
        {
          $and: [
            { status: true },
            { startDatetime: { $lte: new Date() } },
            { endDatetime: { $gte: new Date() } },
          ],
        },
        {}
      )
      .toArray();

    var selected_offers = [];
    //console.log("offers", offers);
    //console.log("lelkfnshb",req.body.apx_code.length );
    for (var i = 0; i < offers.length; i++) {
      var offer = offers[i];
      if (offer.rule === "mobile") {
        if (req.body != {} && req.body.apx_code.length !== 0) {
          // console.log("mobilesIDS",offer.mobileIds);
          let result = req.body.apx_code.filter((o1) =>
            offer.mobileIds.some((o2) => o1 === o2)
          );
          //console.log("----------------",result.length)

          if (result.length !== 0) {
            selected_offers.push(offer);
          }
        }
      } else if (
        offer.rule === "cart-value" ||
        offer.rule === "device-amount"
      ) {
        if (
          offer.amount.min <= req.body.price &&
          offer.amount.max >= req.body.price
        ) {
          selected_offers.push(offer);
        }
      }
    }
    console.log("selected", selected_offers);

    let selected_admin_offer = {
      id: "test",
      title: "Proceed Payment without offer",
      rule: "mobile",
      categoy_id: [],
      mobileIds: [],
      amount: {
        min: "1000",
        max: "15000",
        maxCashBack: "2000",
        percentage: "5",
      },
      paymentGateway: "PayU",
      offerKey: "",
      description:
        "All banks Payments with Credit Card/Credit Card EMI/Debit Card/Debit Card EMI/Net Banking, Wallet and UPI Options",
      status: false,
      ShowTimer: "yes",
      terms: "",
      URL: null,
      offerkey: "",
    };
    if (req.body.type == "admin") {
      selected_offers.push(selected_admin_offer);
    }
    return res.json(selected_offers);
  } catch (error) {
    return res.json({
      status: false,
      message: "ERROR",
    });
  }
});

app.post("/laptop-leads", async function (req, res) {
  let db = await mongo.connect();
  let laptops = db.collection("laptop-leads");
  let getlaptopLeads = await laptops.findOne({ phone: req.body.phone });
  console.log(getlaptopLeads);
  if (getlaptopLeads == null) {
    await laptops.insertOne({
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
      type: req.body.type,
    });
  } else {
    await laptops.deleteOne({ phone: req.body.phone });
    await laptops.insertOne({
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
      type: req.body.type,
    });
  }

  if (req.body.type == "samsung-s23") {
    var SamsungS23data = JSON.stringify({
      from: {
        phone_number: "+919121863666",
      },
      to: [
        {
          phone_number: `+91${req.body.phone}`,
        },
      ],
      data: {
        message_template: {
          storage: "none",
          namespace: "bccb4a1b_6c81_4b39_8472_d08f22ffd0cd",
          template_name: "samsung_s23",
          language: {
            policy: "deterministic",
            code: "en",
          },
          rich_template_data: {
            header: {
              type: "image",
              media_url:
                "https://static.dezeen.com/uploads/2013/12/S001B-Stock-watch.jpg",
            },
          },
        },
      },
    });
    var samsung_S23config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://api.freshchat.com/v2/outbound-messages/whatsapp",
      headers: {
        Authorization:
          "Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJpS216TTVkenRIWmprdmdSY3VrVHgxTzJ2SFlTM0U5YmVJME9XbXRNR1ZzIn0.eyJqdGkiOiI1ZTE4M2IzNS0zYzUyLTQwMTMtYWM4NC02OWI2ZGM4ZjNmODEiLCJleHAiOjE5MTM5NDg3OTEsIm5iZiI6MCwiaWF0IjoxNTk4NTg4NzkxLCJpc3MiOiJodHRwOi8vaW50ZXJuYWwtZmMtdXNlMS0wMC1rZXljbG9hay1vYXV0aC0xMzA3MzU3NDU5LnVzLWVhc3QtMS5lbGIuYW1hem9uYXdzLmNvbS9hdXRoL3JlYWxtcy9wcm9kdWN0aW9uIiwiYXVkIjoiMjAyMDQ0OTMtYmFlYS00MTgwLTk4MzMtM2UxNzMyMDVhYTdlIiwic3ViIjoiYTg0NmU0NTktMDcwNy00ZWY4LWEzNDgtNTkzMzFkN2M4M2U2IiwidHlwIjoiQmVhcmVyIiwiYXpwIjoiMjAyMDQ0OTMtYmFlYS00MTgwLTk4MzMtM2UxNzMyMDVhYTdlIiwiYXV0aF90aW1lIjowLCJzZXNzaW9uX3N0YXRlIjoiZDFhY2M3N2UtMDI4My00MDE1LTgwMzMtYmUwNmY0MjI4N2I0IiwiYWNyIjoiMSIsImFsbG93ZWQtb3JpZ2lucyI6W10sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJvZmZsaW5lX2FjY2VzcyIsInVtYV9hdXRob3JpemF0aW9uIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwic2NvcGUiOiJhZ2VudDp1cGRhdGUgbWVzc2FnZTpjcmVhdGUgYWdlbnQ6Y3JlYXRlIG1lc3NhZ2U6Z2V0IGRhc2hib2FyZDpyZWFkIHJlcG9ydHM6ZXh0cmFjdDpyZWFkIHJlcG9ydHM6cmVhZCBhZ2VudDpyZWFkIGNvbnZlcnNhdGlvbjp1cGRhdGUgdXNlcjpkZWxldGUgY29udmVyc2F0aW9uOmNyZWF0ZSBvdXRib3VuZG1lc3NhZ2U6Z2V0IG91dGJvdW5kbWVzc2FnZTpzZW5kIHVzZXI6Y3JlYXRlIHJlcG9ydHM6ZmV0Y2ggdXNlcjp1cGRhdGUgdXNlcjpyZWFkIGJpbGxpbmc6dXBkYXRlIHJlcG9ydHM6ZXh0cmFjdCBjb252ZXJzYXRpb246cmVhZCIsImNsaWVudEhvc3QiOiIxOTIuMTY4LjEyOC4xNTkiLCJjbGllbnRJZCI6IjIwMjA0NDkzLWJhZWEtNDE4MC05ODMzLTNlMTczMjA1YWE3ZSIsImNsaWVudEFkZHJlc3MiOiIxOTIuMTY4LjEyOC4xNTkifQ.4YC8BlJrmddahLw0iowvDxKamlS4P795yhazn9NBIegxZ1w80Q6LAtd_P5xUHWgW7djIBlzPY5tgB6aq92oRDGt2GcqOjJ8Odz-Y1ya_hPuGkkiF3baWzuS_NaSRIwskIGhnkPpvl5l0MoguiyV7RFyphtJ7EvomyghxJ9YNYg8B18sT1eJvOwPULJdiluoe3teyGIPdO7mjOIZtJfv_6hnIFOY8wsD2DvV3Wn28w0Mpn4uQftRLvuYvD62g4i4sZyTmYpRfDSE1tDdcpkVoTUf-VTsFcdFG7PCYfW5U8K1ykjwZ9iOMaoGMQszIeeLHNezICubosBJjFEWKy11aUQ",
        "Content-Type": "application/json",
      },
      data: SamsungS23data,
    };
    try {
      await axios(samsung_S23config);
      return res.json({
        status: true,
        message: "success",
      });
    } catch (error) {
      return res.json({
        status: false,
        message: "Sms template is not working",
      });
    }

    // return res.redirect(`https://www.happimobiles.com/${req.body.type}/thankyou`);
  } else if (req.body.type == "smart-watches") {
    return res.redirect("https://www.happimobiles.com/smart-watches-thankyou");
  }

  return res.redirect(`https://www.happimobiles.com/${req.body.type}/thankyou`);
});

app.get("/lead-reports", require("./reports").leadReports);
app.get("/lead-filters", require("./reports").filters);

app.get("/lead-export", async (req, res) => {
  let formdate = req.query.sdate;
  let todate = req.query.edate;

  utmsource = req.query.utmsource;
  utmcampaign = req.query.utmcampaign;
  leadstyle = req.query.leadstype;
  utmmedium = req.query.utmmedium;
  status = req.query.status;

  var collectionname = req.query.collectionname;

  var dataBase = await mongo.connect();
  console.log("collectionname-----", collectionname);
  var collectionclient = await dataBase.collection(collectionname);
  var query = {};
  //from date and todate
  if (formdate != "all" && todate != "all") {
    formdate = new Date(formdate);
    todate = new Date(todate);
    todate.setDate(todate.getDate() + 1);
    console.log("formdate------", formdate);

    query.date = { $gte: formdate, $lte: todate };
  }

  //utm source
  if (utmsource != undefined && utmsource != "") {
    query.utm_source = utmsource;
  }
  if (utmcampaign != undefined && utmcampaign != "") {
    query.utm_campaign = utmcampaign;
  }
  if (leadstyle != undefined && leadstyle != "") {
    query.type = leadstyle;
  }
  if (utmmedium != undefined && utmmedium != "") {
    query.utm_medium = utmmedium;
  }
  if (status != undefined && status != "") {
    query.status = status;
  }
  var data = await collectionclient.find(query).toArray();
  const fields = data[0].keys;
  const opts = { fields };

  try {
    const parser = new Parser(opts);
    const csv = parser.parse(data);
    res.setHeader("Content-disposition", "attachment; filename=data.csv");
    res.set("Content-Type", "text/csv");
    res.status(200).send(csv);
  } catch (err) {
    console.error(err);
  }
});

function selectFewerProps(show) {
  const { id, name, payPrice, linker, stock, pictures_new, pictures, mrp } =
    show;
  return { id, name, payPrice, linker, stock, pictures_new, pictures, mrp };
}

app.get("/combination", async function (req, res) {
  var db = await mongo.connect();
  var collection = db.collection("product");

  var query = {
    $and: [
      {
        model_name: req.query.model_name,
      },
      {
        ispublished: true,
      },
    ],
  };
  var projection = {
    model_name: 1.0,
    linker: 1.0,
    color_name: 1.0,
    memory_info: 1.0,
    payPrice: 1.0,
    id: 1.0,
    pictures: 1,
    pictures_new: 1,
  };
  console.log("Q", query);
  var cursor = await collection.find(query).project(projection).toArray();
  var memory = [];
  var colors = [];

  for (var i = 0; i < cursor.length; i++) {
    cursor[i].memory_info = cursor[i].memory_info.trim();
    cursor[i].color_name = cursor[i].color_name.trim();
    memory.push(cursor[i].memory_info.trim());
    colors.push(cursor[i].color_name.trim());
  }

  colors = colors.filter(onlyUnique);
  memory = memory.filter(onlyUnique);
  res.json({ combi: cursor, index: { colors: colors, memory: memory } });
});

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

app.post("/subscribers_user", async function (req, res) {
  var db = await mongo.connect();
  try {
    var subscribers_user = await db
      .collection("subscribers_user")
      .insertOne(req.body);
  } catch (e) {
    return res.json({
      message: "Thanks for you will updates for the offers & latest products",
    });
  }
  return res.json({
    message: "Thanks for you will updates for the offers & latest products",
  });
});

app.get("/banner", async function (req, res) {
  var db = await mongo.connect();
  var collection = db.collection("slider");

  var banners = await collection
    .find(
      { active: true },
      {
        sort: {
          weight: -1.0,
        },
      }
    )
    .toArray();

  var response = {};
  response.bannerDesktop = banners.filter((e) => e.devicetype === "desktop");
  response.bannerMobile = banners.filter((e) => e.devicetype === "mobile");

  res.json(response);
});

//contact-us
app.post("/contact-us", function (req, res) {
  var form = req.body;
  var mailBody = "";

  mailBody += "\n\n========================================================\n";

  mailBody += `Name : ${form.name}\n`;
  mailBody += `Email : ${form.email}\n`;
  mailBody += `Phone Number : ${form.phoneNo}\n`;
  mailBody += `Comment : ${form.comment}\n`;

  mailBody += "========================================================\n";

  console.log(mailBody);

  var email = {
    to: [
      "it@happimobiles.com",
      "sharan@happimobiles.com",
      "lead@happimobiles.com",
    ],
    //to: ["srk@iipl.work", "nikitha@iipl.work", "rishab@iipl.work"],
    subject: `Get In Touch by : ${form.name}`,
    body: mailBody,
    attachments: [],
  };

  emailModule.send_mail(
    email.to,
    email.subject,
    email.body,
    email.attachments,
    function (err, result1) {
      console.log("Email Res", err, result1);
      if (err) {
        res.json({
          status: false,
          message: "Mail Sent Failed.",
        });
        return;
      } else {
        res.json({
          status: true,
          message: "Mail Sent Successfully.",
        });
      }
    }
  );
});

app.get("/stores", async function (req, res) {
  var db = await mongo.connect();
  var storesTbl = db.collection("stores");
  var query = {};
  if (req.query.q != undefined) {
    query = { $text: { $search: req.query.q } };
  }

  try {
    var cities = [];
    const storeList = await storesTbl.find(query).toArray();
    if (storeList.length > 0) {
      await storeList.filter((item) => {
        if (cities.indexOf(item.city) == -1) {
          cities.push(item.city);
        }
      });
    }

    return res.json({
      cities: cities,
      storeList: storeList,
    });
  } catch (e) {
    return res.json({
      cities: [],
      storeList: [],
    });
  }
});

app.get("/getStoreById", async function (req, res) {
  var db = await mongo.connect();
  var storesTbl = db.collection("stores");
  try {
    const storeObject = await storesTbl.findOne({
      RetailerLocalityArea: req.query.RetailerLocalityArea,
    });
    res.json({
      state: true,
      data: storeObject,
    });
  } catch (e) {
    res.json({
      state: false,
      message: "Some thing went wrong",
      error: e,
    });
  }
});

app.post("/shipping-info", async function (req, res) {
  let db = await mongo.connect();
  const collection = db.collection("config");
  var result = await collection.findOne({ key: "shiprocketauth" });
  var query = qs.stringify(req.body);
  var config = {
    method: "get",
    url:
      "https://apiv2.shiprocket.in/v1/external/courier/serviceability/?" +
      query,
    headers: {
      Authorization: "Bearer " + result.token,
    },
  };
  axios(config)
    .then(function (response) {
      res.json(response.data);
    })
    .catch(function (error) {
      console.log(error);
    });
});

app.get("/shiprocket", async function (req, res) {
  console.log("RED");

  res.json(await shiprocket.fetchShippingDetailsByOrderId(req.query));
  //var result = await axios(options);
});

app.post("/shiprocket-createOrder", async function (req, res) {
  console.log("RED");

  res.json(await shiprocket.createOrder(req.body));
  //var result = await axios(options);
});

app.get("/sitemap", async function (req, res) {
  var db = await mongo.connect();
  const productTbl = db.collection("product");
  var product_url = await productTbl
    .find(
      {
        ispublished: true,
      },
      {
        projection: { linker: 1 },
      }
    )
    .toArray();
  var links = [
    {
      Url: "mobiles/apple",
      Title: "Buy Apple Mobiles Online",
      Description:
        "Buy Mobile Online. Read Product Specifications, Features And Customer Reviews. *One Year Of Brand Warranty * Emi Available",
      Keyword:
        "latest Apple mobiles, Apple mobiles online, Apple mobile price, Apple mobiles offers",
    },
    {
      Url: "mobiles/samsung",
      Title:
        "Buy Samsung Mobiles Online in India | Best Samsung Mobiles at Best Prices",
      Description:
        "Explore the full range of Samsung Mobile devices and android smartphones. Buy samsung mobiles online at best prices in India.",
      Keyword:
        "latest SAMSUNG mobiles, SAMSUNG mobiles online, SAMSUNG mobile price, SAMSUNG mobiles offers",
    },
    {
      Url: "mobiles/xiaomi",
      Title:
        "Buy Mi Mobiles Online in India | Xiaomi MI Mobiles at Best Prices",
      Description:
        "Buy Xiaomi MI Mobiles online from a variety of choices depending on colors, features, specifications, design and much more.",
      Keyword:
        "latest MI mobiles, MI mobiles online, MI mobile price, MI mobiles offers, Xiaomi mobiles",
    },
    {
      Url: "mobiles/vivo",
      Title: "Buy Vivo Mobiles Online in India | Vivo Mobiles at Best Prices",
      Description:
        "Buy Vivo latest smartphones and accessories online at Happi Mobiles at best prices and exciting offers",
      Keyword:
        "latest vivo mobiles, vivo mobiles online, vivo mobile price, vivo mobiles offers",
    },
    {
      Url: "mobiles/oppo",
      Title:
        "Buy Oppo Mobiles Online in India | Best Oppo Mobiles at Best Prices",
      Description:
        "Explore the range of Oppo Mobile devices which has great features and specifications. Buy Oppo mobiles online at best prices in India.",
      Keyword:
        "latest oppo mobiles, oppo mobiles online, oppo mobile price, oppo mobiles offers",
    },
    {
      Url: "mobiles/realme",
      Title:
        "Buy Realme Mobiles Online in India | Realme Smartphones at Best Prices",
      Description:
        "Buy Realme Mobiles online at best prices in India. Read Product Specifications, Features and much more.",
      Keyword:
        "realme oppo mobiles, realme mobiles online, realme mobile price, realme mobiles offers",
    },
    {
      Url: "mobiles/buy-realme-mobiles-online",
      cat: "mobiles/realme",
      Title:
        "Buy Realme Mobiles Online in India | Realme Smartphones at Best Prices",
      Description:
        "Buy Realme Mobiles online at best prices in India. Read Product Specifications, Features and much more.",
      Keyword:
        "realme oppo mobiles, realme mobiles online, realme mobile price, realme mobiles offers",
    },
    {
      Url: "mobiles/buy-oppo-mobiles-online",
      cat: "mobiles/oppo",
      Title:
        "Buy Oppo Mobiles Online in India | Best Oppo Mobiles at Best Prices",
      Description:
        "Explore the range of Oppo Mobile devices which has great features and specifications. Buy Oppo mobiles online at best prices in India.",
      Keyword:
        "latest oppo mobiles, oppo mobiles online, oppo mobile price, oppo mobiles offers",
    },
    {
      Url: "mobiles/nokia",
      Title: "Nokia Mobiles: Buy Online at Discounted Prices | Offers in India",
      Description:
        "Buy Latest Nokia mobile phones online at the best price in india with multiple payment options, home delivery, emi option from happimobiles.",
      Keyword:
        "latest nokia mobiles, nokia mobiles online, nokia mobile price, nokia mobiles offers",
    },
    {
      Url: "mobiles/oneplus",
      Title:
        "OnePlus Mobiles: Buy Online at Discounted Prices | Offers in India",
      Description:
        "Buy latest oneplus mobile phones online at the best price in india with multiple payment options, home delivery, emi option from happimobiles.",
      Keyword:
        "latest oneplus mobiles, oneplus mobiles online, oneplus mobile price, oneplus mobiles offers",
    },
    {
      Url: "mobiles/buy-vivo-mobiles-online",
      cat: "mobiles/vivo",
      Title: "Buy Vivo Mobiles Online in India | Vivo Mobiles at Best Prices",
      Description:
        "Buy Vivo latest smartphones and accessories online at Happi Mobiles at best prices and exciting offers",
      Keyword:
        "latest vivo mobiles, vivo mobiles online, vivo mobile price, vivo mobiles offers",
    },
    {
      Url: "mobiles/buy-mi-mobiles-online",
      cat: "mobiles/xiaomi",
      Title:
        "Buy Mi Mobiles Online in India | Xiaomi MI Mobiles at Best Prices",
      Description:
        "Buy Xiaomi MI Mobiles online from a variety of choices depending on colors, features, specifications, design and much more.",
      Keyword:
        "latest MI mobiles, MI mobiles online, MI mobile price, MI mobiles offers, Xiaomi mobiles",
    },
    {
      Url: "mobiles/buy-samsung-mobiles-online",
      cat: "mobiles/samsung",
      Title:
        "Buy Samsung Mobiles Online in India | Best Samsung Mobiles at Best Prices",
      Description:
        "Explore the full range of Samsung Mobile devices and android smartphones. Buy samsung mobiles online at best prices in India.",
      Keyword:
        "latest SAMSUNG mobiles, SAMSUNG mobiles online, SAMSUNG mobile price, SAMSUNG mobiles offers",
    },
    {
      Url: "mobiles/motorola",
      Title: "Motorola Mobiles | Buy Online at Best Prices in India",
      Description:
        "Buy motorola mobile phones online at the best price in india with multiple payment options, home delivery, emi option from happimobiles.",
      Keyword:
        "latest MOTOROLA mobiles, motorola mobiles online, motorola mobile price, motorola mobiles offers",
    },
    {
      Url: "mobiles/honor",
      Title: "Honor Mobiles: Buy Online at Discounted Prices | Offers in India",
      Description:
        "Buy honor mobile phones online at the best price in india with multiple payment options, home delivery, emi option from happimobiles.",
      Keyword:
        "latest honor mobiles, honor mobiles online, honor mobile price, honor mobiles offers",
    },
    {
      Url: "mobiles/lg",
      Title: "LG Mobiles: Buy Online at Discounted Prices | Offers in India",
      Description:
        "Buy LG mobile phones online at the best price in india with multiple payment options, home delivery, emi option from happimobiles.",
      Keyword:
        "LG honor mobiles, LG mobiles online, LG mobile price, LG mobiles offers",
    },
    {
      Url: "mobiles/all",
      Title: "Buy Latest Mobiles Online at best prices only at Happi Mobiles",
      Description:
        "Shop latest mobiles, android mobiles, branded mobiles online at best prices in India. Read product specifications and offers before purchase.",
      Keyword:
        "latest mobiles, best mobiles, online mobile store, android mobiles",
    },
    {
      Url: "accessories/headset",
      Title: "Headsets | Buy Headphones | Earphones Online at Happi Mobiles",
      Description:
        "Buy headset online at best prices. Shop all branded wired and wireless headphones and earphones in India at happi mobiles.",
      Keyword:
        "headset, headphones, earphones, earbuds, latest headphones, wireless earphones",
    },
    {
      Url: "accessories/storage-drivers",
      Title: "Storage Drivers | Buy Storage Devices Online at Best Prices",
      Description:
        "Get latest storage drivers online at discounted prices. Shop from all top brands accessories with best offers at happi mobiles.",
      Keyword: "storage driver, happi mobiles, storage devices",
    },
    {
      Url: "accessories/data-cables",
      Title: "Data Cable | Buy Mobile Cables Online at best prices in India",
      Description:
        "Buy data cable online at happimobiles. Read product specifications, features and customer reviews. one year of brand warranty emi available.",
      Keyword: "data cables, mobile cable, mobile dat cable. best data cable",
    },
    {
      Url: "accessories/bluetooth",
      Title:
        "Bluetooth | Buy Bluetooth Devices, Accessories Online at Happi Mobiles",
      Description:
        "Get latest bluetooth devices online at discounted prices. Shop from all top brands accessories with best offers at happi mobiles.",
      Keyword: "bluetooth earphone, bluetooth devices, bluetooth",
    },
    {
      Url: "accessories/projectors",
      Title: "Projectors | Buy HD Led Projector at best prices | Happi Mobiles",
      Description:
        "Buy latest LED projectors online at the best price in india with multiple payment options, home delivery, emi option from happimobiles.",
      Keyword: "projector, hd projector, led projector",
    },
    {
      Url: "accessories/smart-watches",
      Title: "Smart Watch | Buy Premium Watches for Men | Women",
      Description:
        "Buy latest smart watches online at the best price in india with multiple payment options, home delivery, emi option from happimobiles.",
      Keyword:
        "smart watch, health watch, android watch, latest smart watch, mens smart watch, womens smart watches",
    },
    {
      Url: "accessories/chargers",
      Title: "Buy Chargers Online at Best Prices only at Happi Mobiles",
      Description:
        "Buy mobile chargers online at happimobiles. Read product specifications, features and customer reviews. one year of brand warranty emi available.",
      Keyword: "chargers,mobile chargers, best charger, online charger store",
    },
    {
      Url: "accessories/all",
      Title:
        "Buy All type Accessories Chargers Headsets Storage Drivers Happi Mobiles",
      Description:
        "Buy mobile chargers online at happimobiles. Read product specifications, features and customer reviews. one year of brand warranty emi available.",
      Keyword: "chargers,mobile chargers, best charger, online charger store",
    },
    {
      Url: "tablets/all",
      Title: "Buy Tablets Online at Best Prices in India | Happi Mobiles",
      Description:
        "Get latest tablets online at best | discounted prices. Shop all top brands tablets with free home delivery at happi mobiles.",
      Keyword: "latest tablets , buy tablet online, tablet online store",
    },
    {
      Url: "tvs/mi",
      Title: "Mi TV | Buy Xiaomi LED Televisions Online at Best Prices",
      Description:
        "Buy mi tv online at best | discounted prices at happi mobiles. Read product specifications, features and customer reviews.",
      Keyword:
        "mi tv, mi tv online, best mi tv for home, latest mi tv, mi televisions",
    },
    {
      Url: "tvs/lg",
      Title:
        "LG TV |  Buy Smart HD LED TV's Online at Best Prices | Happi Mobiles",
      Description:
        "Buy lg tv online at best | discounted prices at happi mobiles. Read product specifications, features and customer reviews.",
      Keyword:
        "lg tv, lg tv online, best lg tv for home, latest lg tv, lg televisions",
    },
    {
      Url: "tvs/tcl",
      Title: "Buy TCL Smart TV's Online at Best Prices | Happi Mobiles",
      Description:
        "Buy tcl tv hd smart online at best | discounted prices at happi mobiles. Read product specifications, features and customer reviews.",
      Keyword:
        "tcl tv, tcl tv online, best tcl tv for home, latest tcl tv, tcl televisions",
    },
    {
      Url: "tvs/all",
      Title:
        "Latest | Smart Android TV's Online at Best Prices | Happi Mobiles",
      Description:
        "Buy latest | smart android tv online at best | discounted prices. Shop all brands televisions with free home delivery at happi mobiles.",
      Keyword:
        "smart tv, latest tv, led tv, android tv, hd tv, best tv, televisions",
    },
    {
      Url: "laptops/all",
      Title: "Buy Laptops Online at Best Prices in India | Happi Mobiles",
      Description:
        "Get latest laptops online at best | discounted prices. Shop all top brands laptop with free home delivery at happi mobiles.",
      Keyword: "branded laptops, latest laptops, laptop",
    },
    {
      Url: "pages/blood-donation",
      Title: "Blood Donation - Your donation can make a family Happi",
      Description:
        "At Happi we encouraged customers to share their blood group. We Believe this noble cause, we need more people to help us",
      Keyword: "blood donation, donation, happi customers",
    },
    {
      Url: "akshaya-patra",
      Title: "Akshaya Patra's Mid Day Meal Scheme | Happi Mobiles",
      Description:
        "At Happi Mobiles with our Motto to spread Happiness took an initiative to be a part of Akshaya Patra�s Mid Day Meal Scheme.",
      Keyword: "akshaya patra, mid day meal scheme at happi mobiles",
    },
  ];
  links.forEach(function (e) {
    product_url.push({ linker: e["Url"] });
  });
  res.json(product_url);
});

app.get("/blogs", async function (req, res) {
  var db = await mongo.connect();
  const blogTbl = db.collection("blogs");
  const receivedData = await blogTbl.find({}).toArray();
  res.json({ data: receivedData });
});

app.get("/blog/:linker", async function (req, res) {
  var db = await mongo.connect();
  const blogTbl = db.collection("blogs");
  const receivedData = await blogTbl.findOne({ linker: req.params.linker });
  res.json({ data: receivedData });
});

app.get("/api/product/productnames", async function (req, res) {
  try {
    let db = await mongo.connect();
    let collection = db.collection("product");
    let data = await collection
      .find(
        { "filter.brand": "", ispublished: true, category: "mobile" },
        { projection: { name: 1 } }
      )
      .toArray();
    //console.log(data);
    if (data.length > 0) {
      const fields = data[0].keys;
      const opts = {
        fields,
      };
      const parser = new Parser(opts);
      const csv = parser.parse(data);
      res.setHeader("Content-disposition", "attachment; filename=data.csv");
      res.set("Content-Type", "text/csv");
      res.status(200).send(csv);
    } else {
      res.send("no data found");
    }
  } catch (error) {
    console.log(error);
  }
});
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
app.post("/uploadimages", async (req, res) => {
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
        console.log("hashimg----", hashimg);
        var db = await mongo.connect();
        const campaignTbl = db.collection("campaign");
        let checkhash = await campaignTbl.findOne({ hashimg: hashimg });
        console.log("checkhash--", checkhash);
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
                  await campaignTbl.insertOne({
                    filename: req.file.filename,
                    hashimg: hashimg,
                    createdDate: new Date(),
                    image_url: url,
                  });
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

app.post("/happicampaign", async (req, res) => {
  try {
    var db = await mongo.connect();
    const LeadsTbl = db.collection("happi-campaign-leads");
    const HappiCouponsTbl = db.collection("happi_coupons");
    const HappiCampaignTb1 = db.collection("campaign");
    // let getImageURL = await HappiCampaignTb1.findOne({ "phone": req.body.hashimg });
    // console.log("getImageURL",getImageURL);
    let getinfluencerLeads = await LeadsTbl.findOne({ phone: req.body.phone });
    var query = {
      lead_id: { $exists: false },
    };
    let happiCouponsresponse = await HappiCouponsTbl.find(query)
      .limit(1)
      .toArray();
    console.log("happiCouponsresponse", happiCouponsresponse);
    if (happiCouponsresponse == null) {
      return res.json({
        status: false,
        message: "No coupons Are Avaiable",
      });
    }
    if (
      req.body.image_url == null ||
      req.body.image_url == "" ||
      req.body.image_url == undefined
    ) {
      return res.json({
        status: false,
        message: "Invalid image",
      });
    }
    console.log(getinfluencerLeads, "getinfluencerLeads");
    if (getinfluencerLeads == null) {
      await LeadsTbl.insertOne({
        name: req.body.name,
        phone: req.body.phone,
        location: req.body.location,
        influencer: req.body.influencer,
        inst_handle: req.body.inst_handle,
        type: req.body.type,
        id: new Date().toISOString(),
        date: new Date(),
        utm_source: req.body.utm_source || "",
        utm_medium: req.body.utm_medium || "",
        utm_campaign: req.body.utm_campaign || "",
        status: "open",
        codes: happiCouponsresponse[0].codes,
        image_url: req.body.image_url,
        nearest_store: req.body.nearest_store,
      });
      var message = `Congratulations! U have won Earphones as a prize from Happi Mobiles, Please visit ur nearest store to claim ur freebie with ur unique coupon code:${happiCouponsresponse[0].codes}`;
      await smsModule.sendSMS(req.body.phone, message);
      await HappiCouponsTbl.findOneAndUpdate(
        { codes: happiCouponsresponse[0].codes },
        { $set: { lead_id: new Date() } }
      );
      return res.json({
        status: true,
        message: "campaign created success",
      });
    } else {
      return res.json({
        status: false,
        message: "user Already exits",
      });
    }
  } catch (error) {
    console.log("error", error);
    return res.json({
      status: false,
      message: error,
    });
  }
});

app.get("/influencercitynames", listofInfluencerCities);
async function listofInfluencerCities(req, res) {
  try {
    let database = await mongo.connect();
    let influencer_listcollection = await database.collection(
      "city_influencers"
    );
    let cityres = await influencer_listcollection.distinct("city_influencers");
    return res.json({
      status: true,
      data: cityres,
    });
  } catch (error) {
    console.log(error);
    return res.json({
      status: false,
      message: error,
    });
  }
}

app.get("/getinfluencernames", getInfluencerName);
async function getInfluencerName(req, res) {
  try {
    let city = req.query.city;
    let database = await mongo.connect();
    let influencer_listTb = await database.collection("influencer_list");
    let influencerResponse = await influencer_listTb
      .find({ city: city }, { projection: { influencer_code: 1 } })
      .toArray();
    let influencer_name = [];
    for (var i = 0; i < influencerResponse.length; i++) {
      influencer_name.push(influencerResponse[i].influencer_code);
    }
    return res.json({
      status: true,
      data: influencer_name,
    });
  } catch (error) {
    console.log(error);
    return res.json({
      status: false,
      message: error,
    });
  }
}

app.get("/getStorenames", getStorenames);
async function getStorenames(req, res) {
  try {
    let city = req.query.city;
    let database = await mongo.connect();
    let store_influencersTb = await database.collection("store_influencers");
    let influencerResponse = await store_influencersTb.findOne(
      { city: city },
      { projection: { store: 1 } }
    );
    // console.log("influencerResponse--",influencerResponse);

    return res.json({
      status: true,
      data: influencerResponse.store,
    });
  } catch (error) {
    console.log(error);
    return res.json({
      status: false,
      message: error,
    });
  }
}

app.get("/filterInfluencers", filterInfluencers);
async function filterInfluencers(req, res) {
  try {
    let fromdate = req.query.fromdate;
    let todate = req.query.todate;
    let location = req.query.location;
    let phone = req.query.phone;
    let database = await mongo.connect();
    let happiInfluencersTb = await database.collection("happi-campaign-leads");
    let query = {};
    if (fromdate != "all" && todate != "all") {
      fromdate = new Date(fromdate);
      todate = new Date(todate);
      todate.setDate(todate.getDate() + 1);
      fromdate.setHours(0, 0, 0, 0);
      todate.setHours(0, 0, 0, 0);
      query.date = { $gte: fromdate, $lte: todate };
    }
    if (location != "null") {
      query.location = location;
    }
    if (phone != "null") {
      query.phone = { $regex: phone, $options: "i" };
    }
    let data = await happiInfluencersTb
      .find(query)
      .sort({ date: -1 })
      .toArray();
    return res.json({ status: true, data: data });
  } catch (error) {
    console.log("error", error);
    return res.json({ status: false, message: error });
  }
}
app.get("/downloadInfluencers", downloadInfluencers);
async function downloadInfluencers(req, res) {
  try {
    let fromdate = req.query.fromdate;
    let todate = req.query.todate;
    let location = req.query.location;
    let phone = req.query.phone;
    let database = await mongo.connect();
    let happiInfluencersTb = await database.collection("happi-campaign-leads");
    let query = {};
    if (fromdate != "all" && todate != "all") {
      fromdate = new Date(fromdate);
      todate = new Date(todate);
      todate.setDate(todate.getDate() + 1);
      fromdate.setHours(0, 0, 0, 0);
      todate.setHours(0, 0, 0, 0);
      query.date = { $gte: fromdate, $lte: todate };
    }
    if (location != "") {
      query.location = location;
    }
    if (phone != "") {
      query.phone = { $regex: phone, $options: "i" };
    }
    let data = await happiInfluencersTb
      .find(query)
      .sort({ date: -1 })
      .toArray();
    if (data.length > 0) {
      const fields = data[0].keys;
      const opts = { fields };
      try {
        const parser = new Parser(opts);
        const csv = parser.parse(data);
        res.setHeader("Content-disposition", "attachment; filename=data.csv");
        res.set("Content-Type", "text/csv");
        res.status(200).send(csv);
      } catch (error) {
        console.log(error);
        res.json({ status: false, message: error.message });
      }
    } else {
      res.send("no data found");
    }
  } catch (error) {
    console.log("error", error);
    return res.json({ status: false, message: error });
  }
}

app.post("/getLandingPageDetails", getLandingPageDetails);
async function getLandingPageDetails(req, res) {
  try {
    let title = req.body.title;
    let database = await mongo.connect();
    let happilandingTb = await database.collection("happi_landing_pages");
    let landingPageDetails = await happilandingTb.findOne({ title: title });
    return res.json({
      status: true,
      data: landingPageDetails,
    });
  } catch (error) {
    console.log("error", error);
    return res.json({
      status: false,
      message: "ERROR",
    });
  }
}

// VALIADTION FOR CMS TITLE
app.post("/landingPageValidation", landingPageValidation);
async function landingPageValidation(req, res) {
  try {
    let data = req.body;
    let database = await mongo.connect();
    let happilandingTb = await database.collection("happi_landing_pages");
    let checktitle = await happilandingTb.findOne({ title: data.title });
    if (data.type == "create") {
      if (checktitle) {
        return res.json({
          status: false,
          message: "This product name is Already exits",
        });
      } else {
        return res.json({
          status: true,
          message: "success",
        });
      }
    } else {
      if (checktitle) {
        if (checktitle.id !== data.id) {
          return res.json({
            status: false,
            message: " Product already exits",
          });
        } else {
          return res.json({
            status: true,
            message: "success",
          });
        }
      } else {
        return res.json({
          status: true,
          message: "success",
        });
      }
    }
  } catch (error) {
    console.log("error", error);
    return res.json({
      status: false.valueOf,
      message: "ERROR",
    });
  }
}

module.exports = app;
