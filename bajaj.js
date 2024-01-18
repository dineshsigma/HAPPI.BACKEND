
var axios = require('axios');
var mongo = require("../db");
var qs = require('qs');
const log = require('log-to-file');
var as = require('async');

function createUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}


async function SyncDataToBajaj() {

    var db = await mongo.connect();
    let database = await mongo.connect();
    let SKUsMaster = await database.collection('UPDATED_FINAL_SKU_SHEET_16062022');
    // let query={};
    let SKUs = await SKUsMaster.find({}).toArray();
    // console.log("finalsku", SKUs.length)
    let bajajstore = await database.collection('BajajStoreMaster');
    let storemaster = await bajajstore.find({}).toArray();
    let stocksmap = new Map();
    let stock_array = [];

    for (var k =0; k < SKUs.length; k++) {


        console.log(k + "-------------- " + SKUs[k].sku)
    
        let response = SKUs[k];

        if (response != null) {

            try {


                // console.log(storemaster.length);
                var queryData = {
                    'CompanyCode': 'HM',
                    'ItemCode': SKUs[k].apx,
                    'AsonDate': 0,
                    Brand: 0,
                    // BranchCode: storeres.BRANCH_CODE,
                };
                var query = qs.stringify(queryData);

                var options = {
                    method: 'GET',
                    url:
                        'http://183.82.44.213:80/api/apxapi/GetStockInfo?' + query,
                    headers: {
                        UserId: 'WEBSITE',
                        SecurityCode: '3489-7629-9163-3979'
                    }
                }

                var stocks = await axios(options);

                console.log("stocks****************",stocks.data.Data.length);

                for (var i = 0; i < storemaster.length; i++) {
                    // console.log("stocksmap.get(storemaster[i].CITYID)",stocksmap.get(storemaster[i].CITYID))
                    var stockin = stocksmap.get(storemaster[i].CLUSTER_CODE) != undefined ? stocksmap.get(storemaster[i].CLUSTER_CODE) : 0



                    var stockin2 = stocks.data.Data.find(function (item) {


                        return item.BRANCH_CODE == storemaster[i].BRANCH_CODE;

                    })
                   // stockin += stockin2 == undefined ? 0 : stockin2.SALEABLE_STOCK
                    if (stockin2 != undefined) {
                        if (stockin2.SALEABLE_STOCK > stockin) {
                            stockin = stockin2.SALEABLE_STOCK
                        }
                    }
                    // stockin2==undefined?0:stockin2.SALEABLE_STOCK
                    // if(stockin2==undefined){
                    //     stockin2=0
                    // }
                    // else{
                    // stockin2=stockin2.SALEABLE_STOCK;
                    // }

                    // console.log("stockin2",stockin2);

                    // stock_array.push(stockin2);

                    // // console.log("stockin----",stockin,stockin2);
                    stocksmap.set(storemaster[i].CLUSTER_CODE, stockin);

                }
                // console.log("stockmap",stocksmap);

                // console.log("stock_array",stock_array);

                // let max_stock_value=Math.max(...stock_array);

                // console.log("max_stock_value",max_stock_value);





                for (var j = 0; j < storemaster.length; j++) {
                    // as.eachOfLimit(products, 25, async function(item, i){
                    // console.log("dinesg",storemaster[j]);




                    let storeres = storemaster[j];


                    if (storeres.BRANCH_CODE != null && storeres.BRANCH_CODE.trim() != '') {

                        if (response.apx != null) {

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
                                'ItemCode': SKUs[k].apx
                            };



                            var query = qs.stringify(queryData);

                            var options_price = {
                                method: 'GET',
                                url: 'http://183.82.44.213/api/apxapi/GetPriceFromPriceTemplate?' + query,
                                //headers: {}
                                headers: {
                                    UserId: 'WEBSITE',
                                    SecurityCode: '3489-7629-9163-3979'
                                }
                            };

                            // var price = await axios(options_price);

                            // console.log("------------------------",SKUs[k].MOP);


                            // console.log("skus", SKUs[k]['Happi MOP']);
                            let newPrice;
                            let num = SKUs[k]['Happi MOP'];
                            let low = SKUs[k].MOP || 0;
                            let high = SKUs[k].MRP;

                            if (num > low && num < high) {
                                // console.log("EQUAL -->sending happi value");
                                newPrice = SKUs[k]['Happi MOP']
                            }
                            else {
                                // console.log("not between happi price -->sending mop value")

                                newPrice = SKUs[k].MOP//mop value
                            }


                            let data;

                            // for(var i=0;i<stocks.data.Data.length;i++){
                            //     console.log("condition",stocks.data.Data[i].BRANCH_NAME ==storeres.BRANCH_NAME)
                            // }


                            // console.log("stocks",stocks.data.Data[1]);
                            // console.log("stotre",storeres);

                            // console.log("cond")

                            // let filterstock=stocks.data.Data.filter((a)=>{if(a.BRANCH_NAME==storeres.BRANCH_NAME){return a}})

                            // console.log("FILTERSTOCK",filterstock);

                            // console.log("stocks", stocks.data.Data);
                            // console.log("-----------", storeres);







                            // var stock = stocks.data.Data.find(function (item) {


                            //     if (item.BRANCH_CODE == storeres.BRANCH_CODE) {
                            //         console.log("item", item, storeres);




                            //         return item;
                            //     }

                            // })

                            //var stock = stocks.data.Data.find(function (item) {


                            // return item.BRANCH_CODE == storeres.BRANCH_CODE

                            //})

                            //    console.log("stock",stock);



                            var stockValue = stocksmap.get(storeres.CLUSTER_CODE);


                            // console.log("stockvalue_______________-",stockValue);
                            let status;

                            if(stockValue==0){
                                status =2

                            }
                            else{
                                status=1
                            }
                            // let max_stock_value = Math.max(...stockValue);
                            // let stockValue;

                            // if (stock != null) {

                            //     // stockValue += parseInt(stock.SALEABLE_STOCK) || 0;
                            //     stockValue = parseInt(stock.SALEABLE_STOCK) || 0;

                            // }

                            data = JSON.stringify(
                                {
                                    "dealer_grpid": "74586",
                                    "seller_id": storeres.SUPPLIERID,
                                    "data": [
                                        {
                                            "sku": SKUs[k].sku,
                                            "price_value": newPrice,
                                            "stock_value": stockValue ,
                                            "status": status
                                            
                                            // "stock_value":0,
                                            // "status":2
                                        }
                                    ]
                                });

                            // console.log("data--------------",data);




                            console.log(`${j} ------------ ${storemaster[j].BRANCH_CODE} ------ ${SKUs[k].sku} -----  ${stockValue}`);

                            // console.log("data",JSON.parse(data));
                            let dataresponse = JSON.parse(data);
                            // console.log("dataresponse",datares.data[0].sku);

                            var config = {
                                method: 'post',
                                //url: 'https://bfsd.qa.bfsgodirect.com/dps/web/api/updateinventorypricestatus',
                                url: "https://www.bajajfinservmarkets.in/dps/web/api/updateinventorypricestatus",
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Acceskeyid': 'b0tORkVMbXZzcmhNU3kyclJYRiszTjhHcjl0a2F1czN6M3RTWk9URi9ZLzAyMzZBMys3YSs4ajhaNjQ1TDMzSA==',
                                    'MarketPlaceId': 'MU5mVktWZGRlbWVtMmRYTXh1TnphZ2NKZ0dsSHVLa0lNR3d3YnNRT0t2cy80cmlSRGVMcGp4M0U1TFhxK3hFQQ==',
                                    'SecretAccessKey': 'dy91STczcVF2Z0E4Zjlpc2kzODNRRS9mR2ZHZW1tc1dROFVuSTlyUEMvOW9rdzFoMXpCVSt4dDZURHRFZDUvRg=='
                                },
                                data: data
                            };

                            // var result = await axios(config);

                            var logs = {
                                id: createUUID(),
                                request: JSON.parse(data),
                                created_on: new Date(),
                                sku: dataresponse.data[0].sku,
                                stock_value:stockValue,

                                
                                status_code:status

                                // bajaj_logs: result.data,
                                // bajaj_msg: result.data.data[0].status_msg,
                                // bajaj_status_code: parseInt(result.data.data[0].status_code),
                                // sku:data.data[0].sku,
                                // stock_value:data.data[0].stock_value


                                // bajaj_status_code:parseInt( result.data.data[0].status_code),
                            };


                            var config_es_link_test = {
                                method: 'post',
                                url: 'https://my-deployment-031377.es.ap-south-1.aws.elastic-cloud.com:9243/bajaj-log/_doc/' + logs.id,
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Basic ZWxhc3RpYzo2SmVITmhBWFdmWFBDWTVQMzFpcGVNSUo='
                                },
                                data: JSON.stringify(logs)
                            };

                            await axios(config_es_link_test);

                            await db.collection("bajaj_stock_logs").insertOne(logs);



                        }

                        else {

                            console.log(response.apx, " ==== ", "Apx Code not found ")
                            var logs = {
                                id: createUUID(),
                                request: SKUs[k].sku,
                                created_on: new Date(),
                                bajaj_logs: {
                                    SUPPLIERID: storeres.SUPPLIERID,
                                    msg: "Apx Code Not Found  In BajajSku_Master"
                                },
                                bajaj_msg: "Apx Code Not Found  In BajajSku_Master",
                                bajaj_status_code: 0
                            };

                            var config_es_link_test = {
                                method: 'post',
                                url: 'https://my-deployment-031377.es.ap-south-1.aws.elastic-cloud.com:9243/bajaj-log/_doc/' + logs.id,
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Basic ZWxhc3RpYzo2SmVITmhBWFdmWFBDWTVQMzFpcGVNSUo='
                                },
                                data: JSON.stringify(logs)
                            };
                            // await axios(config_es_link_test);

                            await db.collection("bajaj_stock_logs").insertOne(logs);

                        }

                        //}
                    } else {
                        // console.log(SKUs[k]);

                        //console.log(SKUs[k].sku, " ==== ", "Storeres Code Not Found Store Code: ", storeres.SUPPLIERID)
                        var logs = {
                            id: createUUID(),
                            request: SKUs[k].sku,
                            created_on: new Date(),
                            bajaj_logs: {
                                SUPPLIERID: storeres.SUPPLIERID,
                                msg: "Storeres Code Not Found Store Code"
                            },
                            bajaj_msg: "Storeres Code Not Found Store Code",
                            bajaj_status_code: 0
                        };
                        // console.log("BAJAJ", JSON.stringify(logs));



                        // var config_es_link_test2 = {
                        //     method: 'POST',
                        //     url: 'https://my-deployment-031377.es.ap-south-1.aws.elastic-cloud.com:9243/bajaj-log/_doc/' + logs.id,
                        //     headers: {
                        //       'Content-Type': 'application/json',
                        //       'Authorization': 'Basic ZWxhc3RpYzo2SmVITmhBWFdmWFBDWTVQMzFpcGVNSUo='
                        //     },
                        //     data: JSON.stringify(logs)
                        //   };

                        // //    await axios(config_es_link_test2);

                        // await db.collection("bajaj_stock_logs").insertOne(logs);

                    }


                }
            }
            catch (error) {
                console.log(error);
            }

        } else {
            console.log(SKUs[k].sku, " ==== ", "SKU NOT FOUND IN BAJAJ SKU MASTER")
            var logs = {
                id: createUUID(),
                request: SKUs[k].sku,
                created_on: new Date(),
                bajaj_logs: {
                    sku: SKUs[k].sku,
                    msg: "SKU NOT FOUND IN BAJAJ SKU MASTER"
                },
                bajaj_msg: "SKU NOT FOUND IN BAJAJ SKU MASTER",
                bajaj_status_code: 0
            };



            var config_es_link_test = {
                method: 'post',
                url: 'https://my-deployment-031377.es.ap-south-1.aws.elastic-cloud.com:9243/bajaj-log/_doc/' + logs.id,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Basic ZWxhc3RpYzo2SmVITmhBWFdmWFBDWTVQMzFpcGVNSUo='
                },
                data: JSON.stringify(logs)
            };
            // await axios(config_es_link_test);
            // await db.collection("bajaj_stock_logs").insertOne(logs);
        }

    }
}




SyncDataToBajaj();







