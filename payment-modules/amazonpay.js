const {v4: uuidv4} = require('uuid');
var crypto = require("crypto");
var config = require("../config.js");
var transaction = require('../modules/transactionUpdate');
var generateUuidModule = require('../modules/generate-uuid');
var leadsModule = require('../modules/leads');
var cryptoJS = require('crypto-js');
var wrap = require('word-wrap');
const querystring = require('querystring');
var freshworks = require('../modules/freshworks');

var smsModule = require('../modules/sms');
var shorturl = require('node-url-shortener');
const fetch = require('node-fetch');
const mongo = require("../db");
const EventEmitter = require('events');
const axios = require("axios");
const myEmitter = new EventEmitter();
const MONGO_DB_CONNECTION =
    process.env.MONGO_DB_CONNECTION ||
    "mongodb+srv://sowmya:iNNrxOhVfEdvsUaI@happinewsls.cnw2n.mongodb.net/happi-new-sls?replicaSet=atlas-11ilgn-shard-0&readPreference=primary&connectTimeoutMS=10000&authSource=admin&authMechanism=SCRAM-SHA-1";
//const Agent = require("sqlagent/mongodb").connect(MONGO_DB_CONNECTION);

const AMAZON_MERCHANT_ID = "A1XOFDGGQI7TV4";
const AMAZON_ACCESSKEY_ID = "c0c68ee5-473e-4ed4-9e44-ef56c569717a";
const AMAZON_SECRET_KEY = "0BVBaXpOZVHDLKUvYgbKXgzFJPDmOGWAbRlHDjj3921lAqNk5AYrcXDrUu1otfTC";
const AMAZON_MERCHANT_STORE_ID = "happi-website-001";
const AMAZON_PUBLIC_RSA_KEY = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAq92yAzXaCQbGIid0mMBfulkGK8HqvAardDowtgbfGUZ+hIx6lhYKFMrluTr7bIlQ4qgJY85c9adkZSxHtr/DhTV/ch5CCHDET3YC/DaFTKDp5t2uHKQAIb2Rl/73HQOd/pgImTiaLHPBr/gyz4iztYmlJQIm0vVuPktIANDGpK8qhizdztA3as1bLtILQZ5VtOjNn/xl1HQ+JDtBhUVr13BuJPosecQz6ouhEtR+5i/grg6sUzayqPD1dY6AGRLR9ao/6DCeHT5arSYjlkx6BECuKoiARo7ItDfLameXJ1gLd8lkMzArIG275jbxAiPd4OchHEfcqBADYB51FYDTwQIDAQAB";

const TBL_CART = 'cart';
const TBL_PRODUCT = 'product';
const TBL_ORDER = "orders-v3";
const TBL_USER = "user";

const WEB_DOMIAN = process.env.WEB_DOMIAN || "dev-sls.happimobiles.com"


async function amazonpay_init(req, res) {
    var formData = req.query;

    let db = await mongo.connect();
    let cartTbl = db.collection(TBL_CART);
    let productTbl = db.collection(TBL_PRODUCT);
    let userTbl = db.collection(TBL_USER);
    let orderTbl = db.collection(TBL_ORDER);

    var CartSubtotal = 0;
    var CartQuantity = 0;

    if (formData.cartId == null) {
        res.render("error", {message: "Cart id missing"});
        return;
    }
    var cart = await cartTbl.findOne({cartId: formData.cartId});

    if (cart == null && cart.items == null) {
        res.render("error", {status: false, message: "Invalid cartId", cart: cart});
        return;
    }

    var tranId = crypto.randomBytes(15).toString("hex");

    var eachItemString = [];
    var eachItemObj = [];
    //console.log("CART", cart);
    for (let i = 0; i < cart.items.length; i++) {
        let item = cart.items[i];

        let product = await productTbl.findOne({id: item.productId}, {
            "id": 1, "payPrice": 1, "name": 1, "stock": 1, "pictures": 1
        });

        item.payPrice = product.payPrice;
        item.name = product.name;
        item.stock = product.stock;
        item.pictures = product.pictures;

        if (item.cartPrice !== item.payPrice) {
            item.priceMsg = "Sorry Price has been changed"
        }

        if (item.quantity > item.stock) {
            item.stockMsg = "Stock issue";
            item.itemTotal = item.stock * item.payPrice;
            item.liveQuantity = item.stock;
            CartQuantity = CartQuantity + item.stock;
        } else {
            item.liveQuantity = item.quantity;
            item.itemTotal = item.quantity * item.payPrice;
            CartQuantity = CartQuantity + item.quantity;
        }

        CartSubtotal = CartSubtotal + item.itemTotal;

        product.name = product.name.replace('|', ' ');
        var asin_code = "";
        if (product.asin_code !== null && product.asin_code !== undefined) {
            asin_code = product.asin_code;
        } else {
            asin_code = product.name;
        }

        var string = `{unitPrice=${item.payPrice}.00, quantity=${item.liveQuantity}, productNote=${product.name}, asin=${asin_code}, brand=${product.name.split(' ')[0]}}`
        eachItemString.push(string);
        eachItemObj.push({
            "unitPrice": item.payPrice + ".00",
            "quantity": item.liveQuantity + "",
            "productNote": product.name,
            "asin": asin_code,
            "brand": product.name.split(' ')[0]
        })
    }

    var transactionObj = {
        "transactionid": 'SNS_R_' + tranId,
        "orderid": formData.cartId,
        "amount": CartSubtotal,
        "transaction_type": "amazon",
        "status": "pending",
        "isSuccess": false,
        "datecreated": new Date()
    }
    await transaction.saveOrderTransaction(transactionObj);

    var payment_info = {
        cart: JSON.stringify(cart),
        tran_id: transactionObj.transactionid,
        CartQuantity: CartQuantity,
        CartSubtotal: CartSubtotal,
        cart_items: cart.items,
    };


    var date = new Date();
    var eachCatalogue = eachItemString.join(", ");
    var fields = {
        "merchantId": AMAZON_MERCHANT_ID,
        "amount": CartSubtotal + "",
        "signatureMethod": "HmacSHA384",
        "signatureVersion": 4,
        "sandbox": "false",
        "currencyCode": "INR",
        "merchantTransactionId": transactionObj.transactionid, // transaction id
        "storeDetail": `{storeIdType=MERCHANT_STORE_ID, storeId=${AMAZON_MERCHANT_STORE_ID}}`,
        "accessKeyId": AMAZON_ACCESSKEY_ID,
        "timeStamp": date.getTime(),
        "transactionTimeout": 900,
        "catalogueDetails": `[${eachCatalogue}]`
    };

    var plaintext = {
        "amount": CartSubtotal + "",
        "currencyCode": "INR",
        "merchantId": AMAZON_MERCHANT_ID,
        "merchantTransactionId": transactionObj.transactionid, // transaction id
        "signatureMethod": "HmacSHA384",
        "signatureVersion": 4,
        "accessKeyId": AMAZON_ACCESSKEY_ID,
        "timeStamp": date.getTime(), //    "customerFriendlyBillPageMessage": "Buy Items worth 10k and get 1k back",
        "transactionTimeout": 900,
        "sandbox": "false",
        "storeDetail": {
            "storeIdType": "MERCHANT_STORE_ID",
            "storeId": AMAZON_MERCHANT_STORE_ID,
            // "terminalId": "happitest001", // "storeName": "Happi Store", // "brand": "Happi"
        },
        "catalogueDetails": eachItemObj
    };

    var dateToParse = date.toUTCString();
    var paresedDate = Date.parse(dateToParse.replace(/(....)(..)(..T..)(..)/, "$1-$2-$3:$4:"));
    var DateJson = new Date(paresedDate).toJSON();
    var dt = DateJson.replace(/:/g, "");
    var mt = dt.replace(/-/g, "");
    var ndl = mt.slice(0, 15);
    var newdateLong = ndl + "Z";
    var n = newdateLong.split("T");
    var newdatesmall = n[0];
    //console.log(newdateLong, "=====", newdatesmall);

    var formatted_params = create_formated_params(fields);

    //console.log(formatted_params);

    // var canonical_request = create_canonical_request("POST", "amazonpay.amazon.in", "payment/token/QR_CODE/v1", formatted_params);
    // v1/smart-store/payment/token/QR_CODE
    var canonical_request = create_canonical_request("POST", "amazonpay.amazon.in", "v1/smart-store/payment/token/QR_CODE", formatted_params);

    //console.log("#####Canonical Request#######")

    //console.log(canonical_request);

    var hashed_canonical_request = create_hashed_canonocal_request(canonical_request);

    //console.log("#####Hashed Canonical Request#######")

    //console.log(hashed_canonical_request);

    var stringToSign = "AWS4-HMAC-SHA384" + "\n" + newdateLong + "\n" + newdatesmall + "/eu-west-1/AmazonPay/aws4_request" + "\n" + hashed_canonical_request;

    //console.log("#####stringToSign#######")

    //console.log(stringToSign);

    var kSecret = AMAZON_SECRET_KEY;

    var signatureKey = getSignatureKey(kSecret, newdatesmall, "eu-west-1", "AmazonPay");

    //console.log("#####Signature Key#######")

    var hash = cryptoJS.HmacSHA384(stringToSign, signatureKey);

    var signature = cryptoJS.enc.Base64.stringify(hash);

    signature = Base64EncodeUrl(signature);

    //console.log('signature:' + Base64EncodeUrl(signature));

    //console.log('payload for signature', fields);


    plaintext.signature = signature;
    fields.signature = signature;

    //console.log('payload for AES', plaintext);

    var key = crypto.randomBytes(16);
    var iv = crypto.randomBytes(16);

    var mode = 'aes-' + 128 + '-gcm';
    var cipher = crypto.createCipheriv(mode, key, iv);
    cipher.setAutoPadding(false);
    var encrypted = cipher.update(JSON.stringify(plaintext), 'utf8', 'binary');
    encrypted += cipher.final('binary');
    encrypted += cipher.getAuthTag().toString('binary');
    var buffer = new Buffer(encrypted, 'binary');


    var publicKey = "-----BEGIN PUBLIC KEY-----\n" + wrap(AMAZON_PUBLIC_RSA_KEY, {
        width: 64,
        newline: '\r\n',
        cut: true
    }) + "\n-----END PUBLIC KEY-----";
    var encryptedSessionKey = crypto.publicEncrypt(publicKey, key);

    var body = {
        payload: Base64EncodeUrl(buffer.toString('base64')),
        iv: Base64EncodeUrl(iv.toString('base64')),
        key: Base64EncodeUrl(encryptedSessionKey.toString("base64"))
    };

    //console.log(body);
    await cartTbl.updateOne({
        cartId: formData.cartId
    }, {
        $set: payment_info
    })

    var options = {
        method: 'post',
        data: JSON.stringify(body),
        url: 'https://amazonpay.amazon.in/v1/smart-store/payment/token/QR_CODE',
        headers: {'Content-Type': 'application/json', 'merchantId': AMAZON_MERCHANT_ID},
    }

    let responce = await axios(options);
    res.render('apay', responce.data);

    // fetch('https://amazonpay.amazon.in/v1/smart-store/payment/token/QR_CODE', {
    //     method: 'post',
    //     body: JSON.stringify(body),
    //     headers: {'Content-Type': 'application/json', 'merchantId': AMAZON_MERCHANT_ID},
    // }).then(resp => resp.json()).then(json => {
    //     //console.log("json", json)
    //     res.render('apay', json);
    // });


}

/*
{"response":
{"payLoad":",
"timeStamp":1633944390371,
"billPageUrl":"https://amazon.in/ts/bill/7792848e-c54f-41fa-8526-0cdf2b1770b9",
"amount":10,"currencyCode":"INR",
"merchantTransactionId":"SNS_R_890546001gy61b-890546001ue61b",
"tokenStatus":"OPEN"},
"signature":"8AY_zPwuvnihC6OXUbnUoxXa4Cpye1l82ieN7Au2EN3zQeJs6TSVEnRcju9iXoU-",
"requestId":"507b7d52-0e93-49eb-b7bc-4a5a89682044"}
*/

async function amazonPayFetchTransaction(req, res) {
    console.log("amazonPayFetchTransaction", req.query.transactionId)
    let db = await mongo.connect();
    let cartTbl = db.collection(TBL_CART);
    let productTbl = db.collection(TBL_PRODUCT);
    let userTbl = db.collection(TBL_USER);
    let orderTbl = db.collection(TBL_ORDER);
    var tranTbl = db.collection('transaction_details');

    var transactionId = req.query.transactionId;

    var transaction = await tranTbl.findOne({
        transactionid: transactionId
    })

    if (transaction == null) {
        res.json({
            status: false,
            message: "INVALID TRANSACTION_ID"
        });
        return;
    }

    if (transaction.status !== "pending") {
        res.json({
            status: false,
            message: "TRANSACTION DONE",
            data: transaction
        });
        return;
    }
    var date = new Date();

    var plaintext = {
        "merchantId": AMAZON_MERCHANT_ID,
        "transactionIdType": "MERCHANT_TXN_ID",
        "transactionId": transactionId,
        "signatureMethod": "HmacSHA384",
        "signatureVersion": "4",
        "accessKeyId": AMAZON_ACCESSKEY_ID,
        "timeStamp": date.getTime()
    };

    var dateToParse = date.toUTCString();
    var paresedDate = Date.parse(dateToParse.replace(/(....)(..)(..T..)(..)/, "$1-$2-$3:$4:"));
    var DateJson = new Date(paresedDate).toJSON();
    var dt = DateJson.replace(/:/g, "");
    var mt = dt.replace(/-/g, "");
    var ndl = mt.slice(0, 15);
    var newdateLong = ndl + "Z";
    var n = newdateLong.split("T");
    var newdatesmall = n[0];
    console.log(newdateLong, "=====", newdatesmall);

    var formatted_params = create_formated_params(plaintext);

    console.log(formatted_params);

    // var canonical_request = create_canonical_request("POST", "amazonpay.amazon.in", "payment/token/QR_CODE/v1", formatted_params);
    // v1/smart-store/payment/token/QR_CODE
    var canonical_request = create_canonical_request("GET", "amazonpay.amazon.in", "v1/smart-store/payment/charge/status", formatted_params);

    console.log("#####Canonical Request#######")

    console.log(canonical_request);

    var hashed_canonical_request = create_hashed_canonocal_request(canonical_request);

    console.log("#####Hashed Canonical Request#######")

    console.log(hashed_canonical_request);

    var stringToSign = "AWS4-HMAC-SHA384" + "\n" + newdateLong + "\n" + newdatesmall + "/eu-west-1/AmazonPay/aws4_request" + "\n" + hashed_canonical_request;

    console.log("#####stringToSign#######")

    console.log(stringToSign);

    var kSecret = AMAZON_SECRET_KEY;

    var signatureKey = getSignatureKey(kSecret, newdatesmall, "eu-west-1", "AmazonPay");

    console.log("#####Signature Key#######")

    var hash = cryptoJS.HmacSHA384(stringToSign, signatureKey);

    var signature = cryptoJS.enc.Base64.stringify(hash);

    signature = Base64EncodeUrl(signature);

    console.log('signature:' + Base64EncodeUrl(signature));

    console.log('payload for signature', plaintext);


    plaintext.signature = signature;
    //fields.signature = signature;

    console.log('payload for AES', plaintext);

    var key = crypto.randomBytes(16);
    var iv = crypto.randomBytes(16);

    var mode = 'aes-' + 128 + '-gcm';
    var cipher = crypto.createCipheriv(mode, key, iv);
    cipher.setAutoPadding(false);
    var encrypted = cipher.update(JSON.stringify(plaintext), 'utf8', 'binary');
    encrypted += cipher.final('binary');
    encrypted += cipher.getAuthTag().toString('binary');
    var buffer = new Buffer(encrypted, 'binary');


    var publicKey = "-----BEGIN PUBLIC KEY-----\n" + wrap(AMAZON_PUBLIC_RSA_KEY, {
        width: 64,
        newline: '\r\n',
        cut: true
    }) + "\n-----END PUBLIC KEY-----";
    var encryptedSessionKey = crypto.publicEncrypt(publicKey, key);

    var body = {
        payload: Base64EncodeUrl(buffer.toString('base64')),
        iv: Base64EncodeUrl(iv.toString('base64')),
        key: Base64EncodeUrl(encryptedSessionKey.toString("base64"))
    };

    console.log(body);
    var params = querystring.stringify(body);


    var options = {
        method: 'GET',
        url: 'https://amazonpay.amazon.in/v1/smart-store/payment/charge/status?' + params,
        headers: {'Content-Type': 'application/json', 'merchantId': AMAZON_MERCHANT_ID},
    }

    let responce = await axios(options);
    var json = responce.data;

    console.log("JSON", json);
    /*
    JSON {
          response: {
            merchantTransactionId: 'SNS_R_ea24863e4757fdee8e3820bf3261ca',
            amazonTransactionId: 'P04-0275241-9388972',
            amount: 1,
            currencyCode: 'INR',
            status: 'SUCCESS',
            timeStamp: 1638501440793,
            statusDescription: 'UpfrontChargeSuccess'
          },
          signature: 'szCTd8Yg8G4vUihCEEuqpi59zmTzQT_fdqyMXlxnFsiNt2vwJ6xs2qoMzFy29yxb',
          requestId: 'aee2e8c3-5aff-4d39-97ef-0a50fcfad7fb'
        }

     */
    if (json.response.status === 'PENDING') {
        res.json({status: true});
        return;
    }  else if (json.response.status === "SUCCESS") {

        //myEmitter.emit('order-post-payment-workflow', transaction.orderid, JSON.stringify(transaction), JSON.stringify(json.response));

        let cart = await cartTbl.findOne({
            tran_id: transactionId
        });

        if (cart == null) {
            res.render("error", {status: false, message: "Invalid cartId"});
            return;
        }

        cart.order_id =
            new Date().toISOString().split("T")[0] +
            "-" +
            crypto.randomBytes(3).toString("hex");
        cart.order_id = cart.order_id.replace(/-/g, "");
        cart.order_id = cart.order_id.toUpperCase();
        cart.tag = "paid";
        cart.gateway = "AMAZONPAY";
        cart.payment_id = json.response.amazonTransactionId;
        cart.pay_signature = json.signature;
        cart.v = "V3";
        cart.status = "ORDER PLACED";
        cart.datecreated = new Date();
        cart.gateway_info = req.body;
        cart.paymentUniqueId = cart.gateway +"/"+cart.payment_id;
        delete cart._id;
        shorturl.short('https://www.happimobiles.com/account/order-detail/?id=' + cart.order_id, function (err, url) {
            //console.log("SHORT URL", url, err);
            var message = `Thankyou for placing order in Happi Mobiles. Your order is underprocess for more information click ${url}`;
            smsModule.sendSMS(cart.userInfo.phone, message);
        });

        await orderTbl.insertOne(cart);
        await cartTbl.deleteOne({
            tran_id: transactionId
        });
        try {
            await freshworks.orderPush(cart.userInfo.name, `+91${cart.userInfo.phone}`,
            "", cart.order_id,"order_done",cart.cart_items[0].name, "paid" );
        } catch (e) {
            console.log("freshworks", e.request.data)
        }

        setTimeout(function () {
            res.json({status: false, message: "TRANSACTION SUCCESS", data: json.response, order_id: cart.order_id});
        }, 4000);
    }else{
        res.json(json);
    }
}


function Base64EncodeUrl(str) {
    return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/\=+$/, '');
}

function getSignatureKey(key, dateStamp, regionName, serviceName) {
    var kSecret = Buffer.from("AWS4" + key, "UTF-8").toString('binary');
    var kDate = cryptoJS.HmacSHA384(dateStamp, kSecret);
    var kRegion = cryptoJS.HmacSHA384(regionName, kDate);
    var kService = cryptoJS.HmacSHA384(serviceName, kRegion);
    var kSigning = cryptoJS.HmacSHA384("aws4_request", kService);
    return kSigning;
}

function create_formated_params(fields) {
    var formated_params = "";
    var i = 0;
    Object.keys(fields).sort().forEach(function (key) {
        if (i === 0)
            formated_params += encodeURIComponent(key) + "=" + encodeURIComponent(fields[key]);
        else
            formated_params += "&" + encodeURIComponent(key) + "=" + encodeURIComponent(fields[key]);
        i++;
    });
    return formated_params;
}

function create_canonical_request(method, host, uri, params) {
    return method + "\n" + host + "/" + uri + "\n" + params;
}

function create_hashed_canonocal_request(canonical_request) {
    const hash = crypto.createHash('sha384');
    hash.update(canonical_request, 'utf-8');
    var hashed_canonical_request = hash.digest("hex");
    return hashed_canonical_request;
}

module.exports.amazonpay_init = amazonpay_init;
module.exports.amazonPayFetchTransaction = amazonPayFetchTransaction;
