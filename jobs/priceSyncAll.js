const mongo = require("../db.js");
var axios = require("axios");
var qs = require("qs");
let moment = require("moment");
let whatsApptemplate = require("../templates/pricetemplate.js");
async function priceSyncAll(req, res) {
  try {
    const now = moment();
    const formattedDateTime = now.format("MM-DD-YYYY HH:mm:ss");
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
    let listOfProducts = await productTb
      .find(
        { ispublished: true, vendor: "Happi" },
        { projection: { id: 1, "thirdPartyCodes.apxItemCode": 1, payPrice: 1 } }
      )
      .toArray();
    // console.log("listOfProducts", listOfProducts);
    let count = 0;
    for (let i = 0; i <= listOfProducts?.length - 1; i++) {
      let priceFilter = apx_response?.data?.Table?.find((apxitem, index) => {
        return (
          apxitem.ITEM_CODE == listOfProducts[i].thirdPartyCodes.apxItemCode
        );
      });
      //   console.log(priceFilter?.ITEM_PRICE == listOfProducts[i]?.payPrice);
      // console.log("priceFilter", priceFilter);
      if (priceFilter == undefined) {
      } else {
        if (priceFilter.ITEM_PRICE == listOfProducts[i]?.payPrice) {
        } else {
          console.log("update", priceFilter);
          console.log("listOfProducts", listOfProducts[i]);
          await productTb.findOneAndUpdate(
            { id: listOfProducts[i]?.id },
            {
              $set: {
                payPrice: priceFilter?.ITEM_PRICE,
                stockSyncDate: new Date(),
              },
            }
          );
          count = count + 1;
        }
      }
    }

    let list = [
      {
        name: "SHARAN",
        mobile: "9100574444",
      },
      {
        name: "SHIVA REDDY",
        mobile: "9100782666",
      },

      {
        name: "BHANU",
        mobile: "8977441666",
      },
      {
        name: "KHAN",
        mobile: "9121786666",
      },
      {
        name: "PALLAVI",
        mobile: "9381946477",
      },
      {
        name: "SHANUMUKA",
        mobile: "8686836269",
      },
      {
        name: "DINESH",
        mobile: "8106838432",
      }
    ];

    if (count != 0) {
      //sms templates need to trigger
      for (var i = 0; i < list.length; i++) {
        let templateObj = {
          from: {
            phone_number: "+919121863666",
          },
          to: [
            {
              phone_number: `+91${list[i].mobile}`,
            },
          ],
          data: {
            message_template: {
              storage: "none",
              namespace: "bccb4a1b_6c81_4b39_8472_d08f22ffd0cd",
              template_name: "price_sync",
              language: {
                policy: "deterministic",
                code: "en",
              },
              rich_template_data: {
                body: {
                  params: [
                    {
                      data: list[i].name,
                    },
                    {
                      data: formattedDateTime,
                    },
                    {
                      data: count,
                    },
                    {
                      data: "https://www.happimobiles.com/",
                    },
                  ],
                },
              },
            },
          },
        };
        await whatsApptemplate.whatAppTemplate(templateObj);
      }
    }
    return res.json({
      status: true,
      message: "SUCCESS",
    });
  } catch (error) {
    console.log("error", error);
    return res.json({
      status: false,
      message: "Error",
    });
  }
}

//priceSyncAll();
module.exports.priceSyncAll = priceSyncAll;
