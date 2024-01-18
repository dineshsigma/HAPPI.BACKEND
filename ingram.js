const serverless = require('serverless-http');
const express = require('express')
const app = express();
const { v4: uuidv4 } = require('uuid');
var cors = require('cors')
var jwt = require('jsonwebtoken');
var request = require('request');
let axios = require('axios');
const {
    ObjectId
} = require('mongodb');

var qs = require('qs');


var mongo = require("./db");
const { Parser } = require('json2csv');





async function getAPXitemCode() {

    let db = await mongo.connect();
    productTbl = db.collection('product');
    console.time("LOG-product-query");
    let product = await productTbl.find({"vendor":"INGRAM"}, {
        projection: { "id": 1, "payPrice": 1, "name": 1, "stock": 1, "thirdPartyCodes": 1 }
    }).toArray();
    console.timeEnd("LOG-product-query");

    console.log(product.length);
    await run(product);
}



async function run(data) {
    console.log("INSIDE RUN");
    for (let i = 0; i <= data.length - 1; i++) {
        await iteratee(data[i], i);
    }
    return;

}



async function iteratee(item, i) {
    const element = item;
    // console.log(element.APXitemCode);
    if (element == null || element.thirdPartyCodes == undefined || element.thirdPartyCodes.apxItemCode == undefined || element.thirdPartyCodes.apxItemCode == '') {
        console.log(`${i} - ${element.id} - ${element.name} - No Apex Code `);
        return;
    }

    var date = new Date();
    var getYear = date.getFullYear().toString();
    var month = date.getMonth() + 1;

    if (month.toString().length > 1) {
        month = month.toString();
    }
    else {
        month = '0' + month;
    }

    var day = date.getDate();
    if (day.toString().length > 1) {
        day = day.toString();
    }
    else {
        day = '0' + day;
    }
    var dateInput = getYear + month + day;
    var queryData = {
        'CompanyCode': 'HM',
        'PriceTemplate': "ECOMMERCE",
        'PriceEffetiveFrom': dateInput,
        'ItemCode': element.thirdPartyCodes.apxItemCode
    };



    var query = qs.stringify(queryData);
    var options = {
        method: 'GET',
        url: 'http://183.82.44.213/api/apxapi/GetPriceFromPriceTemplate?' + query,
        //headers: {}
        headers: {
            UserId: 'WEBSITE',
            SecurityCode: '3489-7629-9163-3979'
        }
    };
    try {

        let response = await axios(options);
        // console.log("response length ",response.data.Table.length)

        if (response.data.Table.length > 0) {
            var raw = response.data.Table[0];
            var newPrice = raw.ITEM_PRICE;


            console.log("HAPPI PRICE", newPrice);


            //INGRAM AVALIABITY 



           
            var data = JSON.stringify({
                "availabilityByWarehouse": [
                    {
                        "availabilityByWarehouseId": 31
                    }
                ],
                "products": [
                    {
                        "ingramPartNumber": "GD103AE27M1"
                    }
                ]
            });

            var config = {
                method: 'post',
                url: 'https://api.ingrammicro.com:443/sandbox/resellers/v6/catalog/priceandavailability?includeAvailability=true&includePricing=true&includeProductAttributes=true',
                headers: {
                    'IM-CustomerNumber': '21-HEMOPR',
                    'IM-CountryCode': 'IA',
                    'IM-CorrelationID': 'fbac82ba-cf0a-4bcf-fc03-0c50841',
                    'IM-SenderID': '21-HEMOPR-SandboxApp',
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': 'Bearer THi9Rh6QV15nyNiSs7EY9D8RzNwU'
                },
                data: data
            };

            axios(config)
                .then(function (response) {
                    console.log("INGRAM AVALIABILITY STOCK",JSON.stringify(response.data[0].availability.totalAvailability));
                    let stock=JSON.stringify(response.data[0].availability.totalAvailability);
                   productTbl.updateOne({id:element.id},{$set:{payPrice: newPrice, stock:stock }} );
                })
                .catch(function (error) {
                    console.log(error);
                });








        }
        else {



        }
    }
    catch (err) {
        // console.log("request" ,options )
        //console.log({name:element.name, APXitemCode:element.thirdPartyCodes.apxItemCode, status:"APX fetch Error", err: err});
        // var config_es_link_test = {
        //     method: 'post',
        //     url: 'https://my-deployment-031377.es.ap-south-1.aws.elastic-cloud.com:9243/online-price-sync/_doc/' + new Date().getTime(),
        //     headers: {
        //         'Content-Type': 'application/json',
        //         'Authorization': 'Basic ZWxhc3RpYzo2SmVITmhBWFdmWFBDWTVQMzFpcGVNSUo='
        //     },
        //     data: JSON.stringify({ name: element.name, APXitemCode: element.thirdPartyCodes.apxItemCode, status: "APX fetch Error", err: err, createdOn: new Date() })
        // };
        // await axios(config_es_link_test);
        // return;
    }
}



getAPXitemCode();





