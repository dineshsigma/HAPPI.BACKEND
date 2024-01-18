const mongo = require("./db.js");
var axios = require("axios");
var qs = require("qs");
async function priceupdateFromApx(req, res) {
  try {
    let db = await mongo.connect();
    let productTb = db.collection("product");
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
    console.log("dateInput", dateInput);
    var queryData = {
      CompanyCode: "HM",
      PriceTemplate: "ECOMMERCE",
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
    let apx_response = await axios(options);
    //console.log("response", response.data.Table);
    let product = await productTb.findOne(
      {
        id: req.query.id,
        ispublished: true,
      },
      { projection: { id: 1, "thirdPartyCodes.apxItemCode": 1, payPrice: 1 } }
    );

    let priceFilter = apx_response?.data?.Table?.find((apxitem, index) => {
      return apxitem.ITEM_CODE == product?.thirdPartyCodes.apxItemCode;
    });
    console.log("priceFilter", priceFilter);
    if (priceFilter == undefined) {
    } else {
      console.log("priceFilter.ITEM_PRICE == listOfProducts[0]?.payPrice");
      if (priceFilter.ITEM_PRICE == product?.payPrice) {
      } else {
        await productTb.findOneAndUpdate(
          { id: req.query.id },
          {
            $set: {
              payPrice: priceFilter?.ITEM_PRICE,
              stockSyncDate: new Date(),
            },
          }
        );
      }
    }

    return res.json({
      status: true,
      message: "SUCCESS",
    });
  } catch (error) {
    // console.log("error", error);
    return res.json({
      status: false,
      message: "Error",
    });
  }
}
module.exports.priceupdateFromApx = priceupdateFromApx;
