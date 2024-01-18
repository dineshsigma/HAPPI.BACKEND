const mongo = require("./db");

var axios = require("axios");
var qs = require("qs");
const TBL_CART = "cart";
const TBL_PRODUCT = "product";
const TBL_PRICESYNC = "priceSync";
const TBL_ORDER = "orders-v3";
const TBL_USER = "user";
const TBL_PRODUCT_STOCK = "product-stock";
var as = require("async");
const log = require("log-to-file");

let productTbl = null;
let priceSyncTb1 = null;

var stores = [
  "CHANDANAGAR",
  "HYDERNAGAR",
  "KPHB",
  "MADHAPUR",
  "GREENLANDS",
  "AMEERPET",
  "SDROAD",
  "SRNAGAR",
  "UPPAL",
  "BODUPPAL",
  "MALKAJGIRI",
  "RAMANTHAPUR",
  "LANGERHOUSE",
  "SHAMSHABAD",
  "KARMANGHAT",
  "DILSUKHNAGAR",
  "CHAITANYAPURI",
  "SAROORNAGAR",
  "SANTOSH NAGAR",
  "KARKHANA",
  "ASRAONAGAR",
  "ECIL",
  "ATTAPUR",
  "RTC X ROAD",
  "SANGAREDDY",
  "CHINTAL",
  "HIMAYATNAGAR",
  "SHARATHCITYMALL",
  "BANJARAHILLS",
  "VANASTALIPURAM",
  "WAREHOUSE TG",
  "ECOMMERCE - TS",
  "HIMAYATHNAGAR",
  "KHARKHANA",
  "KHARMANGHAT",
  "KUKATPALLY",
  "LANGARHOUSE",
  "S.D.ROAD",
];

async function getAPXitemCode() {
  let db = await mongo.connect();
  productTbl = db.collection(TBL_PRODUCT);
  priceSyncTb1 = db.collection(TBL_PRICESYNC);
  console.time("LOG-product-query");
  let product = await productTbl
    .find(
      { ispublished: true, vendor: "Happi" },
      {
        projection: {
          id: 1,
          payPrice: 1,
          name: 1,
          stock: 1,
          thirdPartyCodes: 1,
        },
      }
    )
    .sort({ stockSyncDate: 1 })
    .limit(30)
    .toArray();
  console.timeEnd("LOG-product-query");
  await run(product);
}

async function run(data) {
  console.log("INSIDE RUN");
  for (let i = 0; i <= data.length - 1; i++) {
    await iteratee(data[i], i);
  }
  return "success";
}

async function iteratee(item, i) {
  const element = item;
  if (
    element == null ||
    element == undefined ||
    element.thirdPartyCodes == undefined ||
    element.thirdPartyCodes.apxItemCode == undefined ||
    element.thirdPartyCodes.apxItemCode == ""
  ) {
    console.log(
      `${i} -----${element.id} ------------- ${element.name} - No Apex Code `
    );
    await productTbl.updateOne(
      { id: element.id },
      { $set: { stockSyncDate: new Date() } }
    );
    return;
  }

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
    PriceTemplate: "ECOMMERCE",
    PriceEffetiveFrom: dateInput,
    ItemCode: element.thirdPartyCodes.apxItemCode, //0
  };

  var query = qs.stringify(queryData);
  var options = {
    method: "GET",
    url: "http://183.82.44.213/api/apxapi/GetPriceFromPriceTemplate?" + query,
    //headers: {}
    headers: {
      UserId: "WEBSITE",
      SecurityCode: "3489-7629-9163-3979",
    },
  };
  try {
    let response = await axios(options);
    //console.log("response",response.data.Table)
    //priceSyncAll filrname
    //Apx products latest price fetch
    //db query  projection ---id,apxCode,price ----findAll
    //each element fro db array
    //db.apxcode find In Apx Array and compare price
    //if price same ignore
    //else update price and sync time
    //minutes confiramtion from bhanu
    if (response.data.Table.length > 0) {
      if (element.thirdPartyCodes.apxItemCode != {}) {
        var raw = response.data.Table[0];
        var newPrice = raw.ITEM_PRICE;
        // console.log({ count: i, name: element.name, APXitemCode: element.thirdPartyCodes.apxItemCode, status: "Price Done" });
        await productTbl.updateOne(
          { id: element.id },
          { $set: { payPrice: newPrice, stockSyncDate: new Date() } }
        );
        await priceSyncTb1.insertOne({
          name: element.name,
          APXitemCode: element.thirdPartyCodes.apxItemCode,
          payPrice: newPrice,
          status: "Price Done",
          createdOn: new Date(),
        });
        //console.log({name:element.name, APXitemCode:element.thirdPartyCodes.apxItemCode, status:"Price Done",payPrice:payPrice});
      } else {
        log("name:" + element.name + "pricesync_fail.log", "\r\n");
      }
    } else {
      await priceSyncTb1.insertOne({
        name: element.name,
        APXitemCode: element.thirdPartyCodes.apxItemCode,
        status: "Price Not Found In APX",
        createdOn: new Date(),
      });
    }
  } catch (err) {
    console.log("error", err);
    await priceSyncTb1.insertOne({
      name: element.name,
      APXitemCode: element.thirdPartyCodes.apxItemCode,
      status: "Price Not Found In APX",
      createdOn: new Date(),
    });
    return;
  }
}

async function priceSync(req, res) {
  try {
    if (req.headers["x-api-key"] != "jnkjnkjkjbkjhitfuyfdyaewxjkhvjhfthrs") {
      return res.json({
        message: "invalid signature",
      });
    }
    await getAPXitemCode();
    return res.json({
      status: true,
      message: "priceSYNC DONE",
    });

    // process.exit(1);
  } catch (error) {
    console.log(error);
    return res.json({
      status: false,
      message: error,
    });
  }
}

module.exports.priceSync = priceSync;
