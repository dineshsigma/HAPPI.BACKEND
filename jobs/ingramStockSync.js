const mongo = require("./db");
var axios = require('axios');
var qs = require('qs');
const TBL_PRODUCT = 'product';
const TB1_INGRAM_Stock_SYNC = 'ingram_stock_sync'
let productTbl = null;
let ingramTb1 = null;

let db;


async function ingramStockSync(req, res) {

  try {
    if (req.headers['x-api-key'] != "jnkjnkjkjbkjhitfuyfdyaewxjkhvjhfthrs") {
      return res.json({
        message: "invalid signature"
      })

    }

    db = await mongo.connect();
    productTbl = db.collection(TBL_PRODUCT);
    ingramTb1 = db.collection(TB1_INGRAM_Stock_SYNC);
    let product = await productTbl.find({ ispublished: true, "vendor": "ingram" }, {
      projection: { "id": 1, "name": 1, "thirdPartyCodes": 1 }
    }).sort(
      {
        "ingramStockSync": 1
      }).limit(30).toArray();
    console.timeEnd("LOG-product-query");

    await run(product);
    return res.json({
      message: "success"
    })
  }
  catch (error) {
    return res.json({
      status: false,
      message: error
    })
  }

}


function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
async function run(data) {
  console.log("INSIDE RUN");
  for (let i = 0; i <= data.length - 1; i++) {

    await iteratee(data[i], i);
    await sleep(500)
  }
  return;

}




async function iteratee(item, i) {
  const element = item;
  if (element == null || element.thirdPartyCodes == undefined || element.thirdPartyCodes.ingramPartNumber == undefined || element.thirdPartyCodes.ingramPartNumber == '') {
    //console.log(`${i} - ${element.id} - ${element.name} - No ingramPartNumber `);
    await productTbl.updateOne({ id: element.id }, { $set: { ingramStockSync: new Date() } });
    return;
  }

  let configcoll = db.collection('config');
  let ingramauth = await configcoll.findOne({ "key": "ingramauth" });
  var ingramdata = JSON.stringify({
    "products": [
      {
        "ingramPartNumber": element.thirdPartyCodes.ingramPartNumber
        //"ingramPartNumber": 'GD103CM48B2C00'
      }
    ]
  });

  var priceAndAbility_config = {
    method: 'post',
    url: 'https://api.ingrammicro.com:443/resellers/v6/catalog/priceandavailability?includeAvailability=true&includePricing=true&includeProductAttributes=true',
    headers: {
      'IM-CustomerNumber': '21-HEMOPR',
      'IM-CountryCode': 'IA',
      'IM-CorrelationID': 'fbac82ba-cf0a-4bcf-fc03-0c50841',
      'IM-SenderID': '21-HEMOPR-happi',
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${ingramauth.token}`
    },
    data: ingramdata
  };

  try {
    let currentdate = new Date();
    let lastsevendays = new Date(currentdate.getFullYear(), currentdate.getMonth(), currentdate.getDate() - 3);
    let stock_response = await axios(priceAndAbility_config);
    let stock;
    if (stock_response.data.length > 0) {
      if (stock_response.data[0].availability.available) {
        stock = stock_response.data[0].availability.totalAvailability
      } else {
        stock = 0
      }
      console.log(`${i}----------"productName:"${element.name} ------------ "ingramdata:"${ingramdata} ------"stock:" ${stock} ----`);
      productTbl.updateOne({ id: element.id }, { $set: { stock: stock, ingramStockSync: new Date(), ingramStatus: 'Success' } });
      let ingram_data = { name: element.name, ingramPartNumber: element.thirdPartyCodes.ingramPartNumber, stock: stock, status: "Stock Sync Done", createdOn: new Date() }
      await ingramTb1.insertOne(ingram_data)
      await ingramTb1.deleteMany({ "createdOn": { $lte: lastsevendays } })
    }
    else {
      let nodata_stock = { name: element.name, ingramPartNumber: element.thirdPartyCodes.ingramPartNumber, status: "Stock not found", createdOn: new Date() }
      await ingramTb1.insertOne(nodata_stock)
      await ingramTb1.deleteMany({ "createdOn": { $lte: lastsevendays } })
    }
  }
  catch (err) {
    //return 
    console.log(err.response);
    let ingramerror = 'Failed'
    console.log(element.id);
    productTbl.updateOne({ id: element.id }, { $set: { ingramStatus: ingramerror, ingramStockSync: new Date() } });

  }
}

//ingramStockSync();

module.exports.ingramStockSync = ingramStockSync;