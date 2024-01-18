const serverless = require("serverless-http");
const express = require("express");
const app = express();
const { v4: uuidv4 } = require("uuid");
var cors = require("cors");
var jwt = require("jsonwebtoken");
var request = require("request");
let axios = require("axios");
const { ObjectId } = require("mongodb");

var mongo = require("../db");
const { Parser } = require("json2csv");
const { query } = require("express");
let PRODUCT_TB = "product";

async function download_product(req, res) {
  try {
    var dataBase = await mongo.connect();
    let productcoll = await dataBase.collection("product");
    // let data= await pricestock_coll.find({}).skip(skip).limit(limit || 100).toArray();

    let data = await productcoll
      .find(
        {},
        {
          projection: {
            id: 1,
            name: 1,
            stock: 1,
            "thirdPartyCodes.apxItemCode": 1,
            totalStock: 1,
            category: 1,
          },
        }
      )
      .toArray();

    data = data.map(function (e) {
      return {
        id: e.id,
        name: e.name,
        stock: e.stock,
        apx: e.thirdPartyCodes.apxItemCode || "",
        totalStock: e.totalStock,
        category: e.category.join("/"),
      };
    });

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
        res.json({
          status: false,
          message: error.message,
        });
      }
    } else {
      res.send("no data found");
    }
  } catch (error) {
    console.log(error);
    res.json({
      status: false,
      message: error,
    });
  }
}

async function getBrandList(req, res) {
  try {
    let name = req.query.name;
    var dataBase = await mongo.connect();
    let productcoll = await dataBase.collection("product");

    let productlist = await productcoll
      .find({ name: { $regex: name, $options: "i" } })
      .toArray();
    console.log(productlist.length);
    let branddata = [];
    let screendata = [];
    let batterydata = [];
    let ramdata = [];
    let pricedata = [];
    let network = [];
    let processor = [];
    let camdata = [];
    const brandcount = {};
    let screencount = {};
    let batterycount = {};
    let ramcount = {};
    let networkcount = {};
    let processorcount = {};
    let camcount = {};

    for (var i = 0; i < productlist.length; i++) {
      branddata.push(productlist[i].filter.brand);
      screendata.push(productlist[i].filter.screen);
      batterydata.push(productlist[i].filter.battery);
      ramdata.push(productlist[i].filter.ram);
      camdata.push(productlist[i].filter.cam);
      // pricedata.push(productlist[i].filter.price);
      // network.push(productlist[i].filter.network);
      // processor.push(productlist[i].filter.processor);
    }

    const brandresults = branddata.filter((element) => {
      return element !== "";
    });
    const screenresults = screendata.filter((element) => {
      return element !== "";
    });
    const batteryresults = batterydata.filter((element) => {
      return element !== "";
    });
    const ramresults = ramdata.filter((element) => {
      return element !== "" && element != undefined;
    });
    const camresults = camdata.filter((element) => {
      return element !== "" && element != undefined;
    });
    // const priceresults = pricedata.filter(element => {
    //     return element !== '' && element != undefined;
    // })
    // const networkresults = network.filter(element => {
    //     return element !== '' && element != undefined;
    // })
    // const processorresults = processor.filter(element => {
    //     return element !== '' && element != undefined;
    // })

    brandresults.forEach((element) => {
      brandcount[element] = (brandcount[element] || 0) + 1;
    });
    screenresults.forEach((element2) => {
      screencount[element2] = (screencount[element2] || 0) + 1;
    });
    batteryresults.forEach((element2) => {
      batterycount[element2] = (batterycount[element2] || 0) + 1;
    });

    ramresults.forEach((element2) => {
      ramcount[element2] = (ramcount[element2] || 0) + 1;
    });
    camresults.forEach((element2) => {
      camcount[element2] = (camcount[element2] || 0) + 1;
    });
    // networkresults.forEach(element2 => {
    //     networkcount[element2] = (networkcount[element2] || 0) + 1;
    // });
    // processorresults.forEach(element2 => {
    //     processorcount[element2] = (processorcount[element2] || 0) + 1;
    // });

    const keys = Object.keys(brandcount);
    let brandArray = [];
    for (var i = 0; i < keys.length; i++) {
      var obj = {};
      const key = keys[i];
      obj.brand = key;
      obj.count = brandcount[key];
      brandArray.push(obj);
    }

    const ramkeys = Object.keys(ramcount);
    let RamArray = [];
    for (var i = 0; i < ramkeys.length; i++) {
      var obj = {};
      const key = ramkeys[i];
      obj.ram = key;
      obj.count = ramcount[key];
      RamArray.push(obj);
    }

    const screenkeys = Object.keys(screencount);
    let screenArray = [];
    for (var i = 0; i < screenkeys.length; i++) {
      var obj = {};
      const key = screenkeys[i];
      obj.display = key;
      obj.count = screencount[key];
      screenArray.push(obj);
    }

    const batterykeys = Object.keys(batterycount);
    let batteryArray = [];
    for (var i = 0; i < batterykeys.length; i++) {
      var obj = {};
      const key = batterykeys[i];
      obj.battery = key;
      obj.count = batterycount[key];
      batteryArray.push(obj);
    }

    const camkeys = Object.keys(camcount);
    let camArray = [];
    for (var i = 0; i < camkeys.length; i++) {
      var obj = {};
      const key = camkeys[i];
      obj.cam = key;
      obj.count = camcount[key];
      camArray.push(obj);
    }

    return res.json({
      brandlist: brandArray,
      ramlist: RamArray,
      screenlist: screenArray,
      batterylist: batteryArray,
      camlist: camArray,

      // screendata:screencount,
      //  batterydata:batteryresults,
      //  ramcount:ramcount,
      //  priceArray:priceresults,
      //  networkcount:networkcount,
      //  processorcount:processorcount
    });
  } catch (error) {
    console.log(error);
    return res.json({
      status: false,
      message: error,
    });
  }
}

async function getIngramPrice(req, res) {
  try {
    let cart_items = req.body.price.cart_items;
    var dataBase = await mongo.connect();
    let orderscoll = await dataBase.collection("orders-v3");

    let priceArray = [];
    let orderresponse = await orderscoll.findOne({
      order_id: req.body.price.order_id,
    });
    let orders = orderresponse.ingram_info.orders;
    for (var i = 0; i < orders.length; i++) {
      for (var j = 0; j < orders[i].lines.length; j++) {
        if (cart_items[0].quantity == 1) {
          priceArray.push({
            unitPrice: orders[i].lines[j].unitPrice,
            freightCharges: orders[i].freightCharges,
          });
        } else {
          priceArray.push({
            unitPrice: 2 * orders[i].lines[j].unitPrice,
            freightCharges: orders[i].freightCharges,
          });
        }
      }
    }

    return res.json({
      status: true,
      data: priceArray,
    });
  } catch (error) {
    console.log(error);
    return res.json({
      status: false,
      message: error,
    });
  }
}

async function productFilters(req, res) {
  try {
    var data = JSON.stringify({
      query: "",
      filters: {
        category: ["accessories"],
      },
      sort: {
        latest_score: "desc",
      },
    });

    var config = {
      method: "post",
      url: "https://my-deployment-031377.ent.ap-south-1.aws.elastic-cloud.com/api/as/v1/engines/happi/search",
      headers: {
        Authorization: "Bearer search-tiaqdm43y6ae16a1isz5uonb",
        "Content-Type": "application/json",
      },
      data: data,
    };

    let response = await axios(config);

    console.log("response", response.data.results);
    let branddata = [];
    let stockarray = [];
    let specification = [];
    let displayPrice = [];

    for (var i = 0; i < response.data.results.length; i++) {
      branddata.push({
        brand: response.data.results[i].brand || 0,
      });
      stockarray.push({
        stock: response.data.results[i].stock.raw,
      });

      displayPrice.push({
        displayprice: response.data.results[i].display_price,
      });
    }

    return res.json({
      brand: branddata,
      stockdata: stockarray,
      specification: specification,
      displayPrice: displayPrice,
    });
  } catch (error) {
    console.log(error);
  }
}

async function getThirdPartycodes(req, res) {
  // "thirdPartyCodes" : {
  //     "bajajModelCode" : "",
  //     "asinCode" : "B07XVLMXYH",
  //     "apxItemCode" : "11 128GB WHITE",
  //     "pinelabsProductCode" : "MWM22HN/A",
  //     "ingramPartNumber" : "GD103AK55B2C"
  // },

  try {
    var dataBase = await mongo.connect();
    let productcoll = await dataBase.collection("product");
    let third_party_codes = await productcoll
      .find({
        projection: {
          name: 1,
          "thirdPartyCodes.ingramPartNumber": 1,
          "thirdPartyCodes.pinelabsProductCode": 1,
          "thirdPartyCodes.apxItemCode": 1,
          "thirdPartyCodes.bajajModelCode": 1,
          "thirdPartyCodes.asinCode": 1,
        },
      })
      .toArray();

    return res.json({
      status: true,
      data: third_party_codes,
    });
  } catch (error) {
    return res.json({
      status: false,
      message: error,
    });
  }
}

async function getThirdPartycodes(req, res) {
  var dataBase = await mongo.connect();
  let product_coll = await dataBase.collection("product");
  let thirdPartyCodes;
  let query = {};

  try {
    console.log(req.query.name != undefined);

    if (req.query.name != undefined) {
      let name = req.query.name;
      query.name = { $regex: name, $options: "i" };

      //   thirdPartyCodes = await product_coll.find(query,{projection:{"name":1,"thirdPartyCodes.ingramPartNumber":1,"thirdPartyCodes.pinelabsProductCode":1,"thirdPartyCodes.bajajModelCode":1,"thirdPartyCodes.asinCode":1,"thirdPartyCodes.apxItemCode":1}}).toArray();
      thirdPartyCodes = await product_coll
        .find(query, { projection: { name: 1, thirdPartyCodes: 1, id: 1 } })
        .toArray();
    } else {
      thirdPartyCodes = await product_coll
        .find({}, { projection: { name: 1, thirdPartyCodes: 1, id: 1 } })
        .toArray();
    }

    // console.log("ingram_response",thirdPartyCodes);

    thirdPartyCodes = thirdPartyCodes.map(function (e) {
      return {
        id: e.id,
        name: e.name,

        ingramPartNumber: e.thirdPartyCodes.ingramPartNumber || "",
        pinelabsProductCode: e.thirdPartyCodes.pinelabsProductCode,
        bajajModelCode: e.thirdPartyCodes.bajajModelCode,
        asinCode: e.thirdPartyCodes.asinCode,
        apxItemCode: e.thirdPartyCodes.apxItemCode,
      };
    });

    return res.json({
      status: true,
      message: thirdPartyCodes,
    });
  } catch (error) {
    console.log(error);
    return res.json({
      status: false,
      message: error,
    });
  }
}

async function updateThirdpartyCodes(req, res) {
  let updatecodes = req.body.updaterecords;
  try {
    var dataBase = await mongo.connect();
    let product_thirdparty = await dataBase.collection("product");

    for (var i = 0; i < updatecodes.length; i++) {
      let thirdPartyCodes = {
        ingramPartNumber: updatecodes[i].ingramPartNumber,
        pinelabsProductCode: updatecodes[i].pinelabsProductCode,
        bajajModelCode: updatecodes[i].bajajModelCode,
        asinCode: updatecodes[i].asinCode,
        apxItemCode: updatecodes[i].apxItemCode,
      };
      await product_thirdparty.findOneAndUpdate(
        { id: updatecodes[i].id },
        { $set: { thirdPartyCodes: thirdPartyCodes } }
      );
    }
    return res.json({
      message: " updated success",
    });
  } catch (error) {
    console.log(error);
    return res.json({
      status: false,
      message: error,
    });
  }
}

async function offersverified(req, res) {
  try {
    let apxItemCode = req.body.apxItemCode.split(",");
    console.log(apxItemCode.length);

    var dataBase = await mongo.connect();
    let productColl = await dataBase.collection("product");
    let apxItemarray = [];
    for (var i = 0; i < apxItemCode.length; i++) {
      let getproductName = await productColl.findOne(
        { "thirdPartyCodes.apxItemCode": apxItemCode[i] },
        { projection: { name: 1, payPrice: 1, id: 1 } }
      );
      apxItemarray.push(getproductName);
    }
    return res.json({
      data: apxItemarray,
    });
  } catch (error) {
    console.log(error);
    return res.json({
      status: false,
      message: error,
    });
  }
}

async function offers(req, res) {
  try {
    var dataBase = await mongo.connect();
    let productColl = await dataBase.collection("offers");
    let query = {};

    query.mobileIds = {
      $in: [
        "T975 S7+ Black",
        "T975 S7+ Bronze",
        "T975 S7+ Silver",
        "T975 S7+ Blue",
      ],
    };

    let response = await productColl.find(query).toArray();
    return res.json({
      data: response,
    });
  } catch (error) {}
}

async function productValidations(req, res) {
  try {
    let db = await mongo.connect();
    let productTb = db.collection(PRODUCT_TB);
    let bajajcodesTb = db.collection("Bajaj_Emi_ModelCodes");
    let data = req.body;
    console.log("product/productValidation------", data);
    let linkerName = await productTb.findOne({ linker: data.linker });
    let getProductName = await productTb.findOne({ name: data.name });
    if (data.type == "create") {
      if (getProductName) {
        return res.json({
          status: false,
          message: "This product name is Already exists",
        });
      }
      if (linkerName || getProductName) {
        return res.json({
          status: false,
          message: "This linker is already exists",
        });
      }
      if (data.slug != data.linker) {
        return res.json({
          status: false,
          message: "Linker and slug both are mismatch",
        });
      }
      if (
        data.category[0] == null ||
        data.category[0] == undefined ||
        data.category[0] == ""
      ) {
        return res.json({
          status: false,
          message: "Level-1 Category  not there",
        });
      }
      if (
        data.category[1] == null ||
        data.category[1] == undefined ||
        data.category[1] == ""
      ) {
        return res.json({
          status: false,
          message: "Level-2 Category  not there",
        });
      }
      //thirdPartyCodes.bajajModelCode
      if (
        data.bajajModelCode != null &&
        data.bajajModelCode != "" &&
        data.bajajModelCode != undefined &&
        data.bajajModelCode != "null"
      ) {
        let bajajModelCodeProduRes = await productTb.findOne({
          "thirdPartyCodes.bajajModelCode": data.bajajModelCode.toString(),
        });
        let bajajModelCodeRes = await bajajcodesTb.findOne({
          modelId: parseInt(data.bajajModelCode),
        });
        if (bajajModelCodeProduRes != null) {
          return res.json({
            status: false,
            message: "bajaj code already exists",
          });
        } else if (bajajModelCodeRes == null) {
          return res.json({ status: false, message: "bajaj code not found" });
        }
      }
      if (data.payPrice <= data.mrp) {
        return res.json({ status: true, message: "success" });
      } else {
        return res.json({
          status: false,
          message: "MRP Should be greater than Payprice",
        });
      }
    } else {
      // console.log("data.id", data.id)
      let productId = data.id;
      console.log(data.payPrice <= data.mrp);
      if (
        data.id == undefined ||
        data.id == "" ||
        data.id == "null" ||
        data.id == "undefined"
      ) {
        return res.json({
          status: false,
          message: "Please Valid ID",
        });
      }
      if (data.slug != data.linker) {
        return res.json({
          status: false,
          message: "Linker and slug both are mismatch..",
        });
      }
      if (
        data.category[0] == null ||
        data.category[0] == undefined ||
        data.category[0] == ""
      ) {
        return res.json({
          status: false,
          message: "Level-1 Category  not there",
        });
      }
      if (
        data.category[1] == null ||
        data.category[1] == undefined ||
        data.category[1] == ""
      ) {
        return res.json({
          status: false,
          message: "Level-2 Category  not there",
        });
      }
      if (data.payPrice > data.mrp) {
        return res.json({
          status: false,
          message: "MRP Should be greater than Payprice",
        });
      }
      if (getProductName) {
        if (getProductName.id !== data.id) {
          return res.json({
            status: false,
            message: " Product already exists",
          });
        } else if (linkerName) {
          if (linkerName.id !== data.id) {
            return res.json({
              status: false,
              message: " Linker already exists",
            });
          }
          // else {
          //     return res.json({
          //         status: true,
          //         message: "success"
          //     })
          // }
        } else {
          return res.json({
            status: true,
            message: "success",
          });
        }
      }
      if (
        data.bajajModelCode != null &&
        data.bajajModelCode != "" &&
        data.bajajModelCode != undefined &&
        data.bajajModelCode != "null"
      ) {
        let bajajModelCodeProduRes = await productTb.findOne({
          "thirdPartyCodes.bajajModelCode": data.bajajModelCode.toString(),
        });
        console.log("bajajModelCodeProduRes", bajajModelCodeProduRes);
        let bajajModelCodeRes = await bajajcodesTb.findOne({
          modelId: parseInt(data.bajajModelCode),
        });
        console.log("bajajModelCodeRes", bajajModelCodeRes);
        if (bajajModelCodeRes == null) {
          return res.json({ status: false, message: "Bajaj code not found" });
        } else if (bajajModelCodeProduRes != null) {
          return res.json({
            status: false,
            message: "bajaj code already exists",
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
    console.log(error);
    return res.json({ status: false, message: error });
  }
}

//update productValidation

module.exports.download_product = download_product;
module.exports.getBrandList = getBrandList;
module.exports.getIngramPrice = getIngramPrice;
module.exports.productFilters = productFilters;
module.exports.getThirdPartycodes = getThirdPartycodes;
module.exports.updateThirdpartyCodes = updateThirdpartyCodes;
module.exports.offersverified = offersverified;
module.exports.offers = offers;
module.exports.productValidations = productValidations;

//{{urlparams.id}}
