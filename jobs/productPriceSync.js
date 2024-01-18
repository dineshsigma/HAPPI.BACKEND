const mongo = require("./db");


var axios = require('axios');
var qs = require('qs');
const TBL_CART = 'cart';
const TBL_PRODUCT = 'product';
const TBL_ORDER = "orders-v3";
const TBL_USER = "user";
const TBL_PRODUCT_STOCK = 'product-stock';
var as = require('async');
const log = require('log-to-file');

let productTbl = null;


var stores = [
    'CHANDANAGAR',
    'HYDERNAGAR',
    'KPHB',
    'MADHAPUR',
    'GREENLANDS',
    'AMEERPET',
    'SDROAD',
    'SRNAGAR',
    'UPPAL',
    'BODUPPAL',
    'MALKAJGIRI',
    'RAMANTHAPUR',
    'LANGERHOUSE',
    'SHAMSHABAD',
    'KARMANGHAT',
    'DILSUKHNAGAR',
    'CHAITANYAPURI',
    'SAROORNAGAR',
    'SANTOSH NAGAR',
    'KARKHANA',
    'ASRAONAGAR',
    'ECIL',
    'ATTAPUR',
    'RTC X ROAD',
    'SANGAREDDY',
    'CHINTAL',
    'HIMAYATNAGAR',
    'SHARATHCITYMALL',
    'BANJARAHILLS',
    'VANASTALIPURAM',
    'WAREHOUSE TG',
    'ECOMMERCE - TS',
    'HIMAYATHNAGAR',
    'KHARKHANA',
    'KHARMANGHAT',
    'KUKATPALLY',
    'LANGARHOUSE',
    'S.D.ROAD'
];










async function getAPXStockSync() {
    console.log("getAPXStockSync--run");
    let db = await mongo.connect();
    productTbl = db.collection(TBL_PRODUCT);
    productStockTbl = db.collection(TBL_PRODUCT_STOCK);

    console.time("LOG-product-query");
    let products = await productTbl.find({ ispublished: true, "vendor": "Happi" }, {
        projection: { "id": 1, "payPrice": 1, "name": 1, "stock": 1, "thirdPartyCodes": 1 }
    }).sort({ "stockSyncDate": 1 }).limit(30).toArray();
    console.timeEnd("LOG-product-query");

    console.log("INSIDE RUN ", products.length);
    for (let i = 0; i <= products.length - 1; i++) {

        await stockSyncRunner(products[i], i);
    }
    return 'success';
}

async function stockSyncRunner(item, x) {
    const element = item;

    if (element == null || element.thirdPartyCodes == undefined || element.thirdPartyCodes.apxItemCode == undefined || element.thirdPartyCodes.apxItemCode == '') {


        await productTbl.updateOne({ id: element.id }, { $set: { stockSyncDate: new Date() } });
        console.log(`${x} - ${element.name} - No Apex Code - ${element.id}`);
        return;
    }

    var queryData = {
        'CompanyCode': 'HM',
        'ItemCode': element.thirdPartyCodes.apxItemCode,
        'AsonDate': 0,
        Brand: 0,
        BranchCode: 0
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
    //console.log("REQUEST", options);


    try {
        let response = await axios(options);
        // console.log("response", response.data);
        if (response.data.Data.length > 0) {

            var stock = 0;
            var totalStock = 0;
            var raw = response.data.Data;
            //console.table(raw);

            //await productStockTbl.deleteMany({id: element.id });
            var stock = 0;
            var multiStockInsertQuery = [];
            for (let j = 0; j < raw.length; j++) {


                const element1 = raw[j];
                totalStock = totalStock + element1.SALEABLE_STOCK;
                //element1.BRANCH_NAME
                if (stores.indexOf(element1.BRANCH_NAME) != -1) {
                    stock = stock + element1.SALEABLE_STOCK;
                }
                multiStockInsertQuery.push({
                    id: element.id,
                    stock: element1.SALEABLE_STOCK,
                    APXitemCode: element.thirdPartyCodes.apxItemCode,
                    name: element.name,
                    branch: element1.BRANCH_NAME,
                    stockSyncOn: new Date()
                })

            }

            //await productStockTbl.insertMany(multiStockInsertQuery);
            await productTbl.updateOne({ id: element.id }, { $set: { stock: stock, totalStock: totalStock, stockSyncDate: new Date() } });
            //console.log(JSON.stringify({counter:x, name:element.name, APXitemCode:element.thirdPartyCodes.apxItemCode,totalStock: totalStock, status:"Stock Sync Done", multiStockCount:multiStockInsertQuery.length}));

        } else {


            await productTbl.updateOne({ id: element.id }, { $set: { stockSyncDate: new Date(), stock: 0, totalStock: 0 } });
            //console.log(JSON.stringify({id:element.id,name:element.name, APXitemCode:element.thirdPartyCodes.apxItemCode, status:"APX Stock Zero"}));


        }
    } catch (err) {
        console.log({ name: element.name, APXitemCode: element.thirdPartyCodes.apxItemCode, status: "APX fetch Error", err: err });
        //return;
    }


}





async function runner(req, res) {
    try {
        if (req.headers['x-api-key'] != "jnkjnkjkjbkjhitfuyfdyaewxjkhvjhfthrs") {
            return res.json({
                message: "invalid signature"

            })
        }

        await getAPXStockSync();
        return res.json({
            status: true,
            message: "success"
        })

        //process.exit(1);
    }
    catch (error) {
        return res.json({
            status: false,
            message: error
        })
    }




}

//runner();
module.exports.runner = runner;

