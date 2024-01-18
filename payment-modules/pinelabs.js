var Razorpay = require('razorpay');
const { v4: uuidv4 } = require('uuid');
var crypto = require("crypto");
var smsModule = require('../modules/sms');
var shorturl = require('node-url-shortener');
var jsSHA = require("jssha");
const mongo = require("../db");
//mongo_db connection
const MONGO_DB_CONNECTION = process.env.MONGO_DB_CONNECTION || 'mongodb+srv://sowmya:iNNrxOhVfEdvsUaI@happinewsls.cnw2n.mongodb.net/happi-new-sls?replicaSet=atlas-11ilgn-shard-0&readPreference=primary&connectTimeoutMS=10000&authSource=admin&authMechanism=SCRAM-SHA-1';

//pinelab env process
const PINELABS_URL = process.env.PINELABS_URL || "https://pinepg.in/PinePGRedirect/index";
const PINELABS_MERCHANT_ID = process.env.PINELABS_MERCHANT_ID || "1550";
const PINELABS_MERCHANT_ACCESS_CODE = process.env.PINELABS_MERCHANT_ACCESS_CODE || "bdd01d1d-52ea-460b-a6a7-625a7384dbc1";
const PINELABS_PAYMODE_ONLANDING_PAGEL = process.env.PINELABS_PAYMODE_ONLANDING_PAGEL || "0,1,3,4,5,10,11,12";
const PINELABS_MERCHANT_RETURN_URL = process.env.PINELABS_MERCHANT_RETURN_URL || "https://dev-services.happimobiles.com/payment/pinelabpay/verify";
const PINELABS_NAVIGATION_MODE = process.env.PINELABS_NAVIGATION_MODE || "2";
const PINELABS_TRANSACTION_TYPE = process.env.PINELABS_TRANSACTION_TYPE || "1";
const PINELABS_LPC_SEQ = process.env.PINELABS_LPC_SEQ || "1"; // strSecretKey
const PINELABS_STR_SECRET_KEY = process.env.PINELABS_STR_SECRET_KEY || "42F2F10AE4AE40CC858096722371EF49";
const PINELABS_STR_HASH_TYPE = process.env.PINELABS_STR_HASH_TYPE || "SHA256";
const PINELABS_UNIQUE_MERCHANT_TXNID = process.env.PINELABS_UNIQUE_MERCHANT_TXNID || 'ppc_UniqueMerchantTxnID';


const TBL_CART = 'cart';
const TBL_PRODUCT = 'product';
const TBL_ORDER = "orders-v3";
const TBL_USER = "user";

const WEB_DOMIAN = process.env.WEB_DOMIAN || "www.happimobiles.com"


async function pinelabs_init(req, res) {
    let db = await mongo.connect();
    let cartTbl = db.collection(TBL_CART);
    let productTbl = db.collection(TBL_PRODUCT);
    let userTbl = db.collection(TBL_USER)

    let formData = req.query;

    var timestamp = new Date().getTime();

    var url = PINELABS_URL;
    var formID = "PostForm";

    strForm = "<form id=\"" + formID + "\" name=\"" + formID + "\" action=\"" + url + "\" method=\"POST\">";


    if (formData.cartId == null) {
        res.render("error", { message: "Cart id missing" });
        return;
    }

    var cart = await cartTbl.findOne({
        cartId: formData.cartId
    });

    if (cart == null) {
        res.render("error", { status: false, message: "Invalid cartId" });
        return;
    }

    var CartSubtotal = 0;
    var CartQuantity = 0;


    if (cart.items === null && cart.items.length === 0) {
        res.render("error", { status: false, message: "No Items in Cart" });
    }
    for (let i = 0; i < cart.items.length; i++) {
        let item = cart.items[i];



        let product = await productTbl.findOne({ id: item.productId }, {
            "id": 1, "payPrice": 1, "name": 1, "stock": 1, "pictures": 1, thirdPartyCodes: 1
        });

        item.payPrice = product.payPrice;
        item.name = product.name;
        item.stock = product.stock;
        item.pictures = product.pictures;
        item.thirdPartyCodes = product.thirdPartyCodes;
        // console.log(item.cartPrice,":::::::::::::::",item.payPrice);
        if (item.cartPrice !== item.payPrice) {
            item.priceMsg = "Sorry Price has been changed";
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
    }
    var tranId = crypto.randomBytes(15).toString("hex");
    var data = {};
    data.ppc_UniqueMerchantTxnID = tranId;
    data.ppc_Amount = CartSubtotal + "00"; // 1
    data.ppc_MerchantID = PINELABS_MERCHANT_ID;
    data.ppc_MerchantAccessCode = PINELABS_MERCHANT_ACCESS_CODE;
    data.ppc_PayModeOnLandingPage = PINELABS_PAYMODE_ONLANDING_PAGEL;
    data.ppc_MerchantReturnURL = PINELABS_MERCHANT_RETURN_URL;
    data.ppc_NavigationMode = PINELABS_NAVIGATION_MODE;
    data.ppc_TransactionType = PINELABS_TRANSACTION_TYPE;
    data.ppc_LPC_SEQ = PINELABS_LPC_SEQ;
    // console.log("cart.items[0]", cart.items[0])
    if (cart.items[0].thirdPartyCodes && cart.items[0].thirdPartyCodes.pinelabsProductCode !== null) {
        data.ppc_Product_Code = cart.items[0].thirdPartyCodes.pinelabsProductCode;
    }

    // var userDetails =  await userTbl.findOne({id:cart.userId});
    //
    // if(userDetails == null) {
    //     return res.send({status:false, message:"User not found"})
    // }

    var keys = Object.keys(data);
    //keys.sort();
    keys.sort(function (a, b) { });

    var msgString = "";

    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (key === PINELABS_UNIQUE_MERCHANT_TXNID) {
            msgString += String(key) + "=" + String(data[key] + '-' + timestamp) + "&";
        } else if (data[key] != null && data[key] !== undefined && key !== 'ppc_DIA_SECRET' && key !== 'ppc_DIA_SECRET_TYPE') {
            msgString += String(key) + "=" + String(data[key]) + "&";
        }
    }

    msgString = msgString.slice(0, -1);

    strSecretKey = PINELABS_STR_SECRET_KEY;
    strHashType = PINELABS_STR_HASH_TYPE;

    strDIA_SECRET = HMAC(msgString, strSecretKey);

    //if hash generation failed

    if (strDIA_SECRET === "") {
        console.log("hash generation failed-----------------------")

        return res.redirect(`https://www.happimobiles.com/cart?step=4`);
    } else {
        data['ppc_DIA_SECRET'] = strDIA_SECRET
        data['ppc_DIA_SECRET_TYPE'] = strHashType

        for (key in data) {
            if (key === PINELABS_UNIQUE_MERCHANT_TXNID) {
                strForm += "<input type=\"hidden\" name=\"" + key + "\" value=\"" + data[key] + '-' + timestamp + "\">";
                console.log("PINELABS DATA", key, data[key] + '-' + timestamp);
            } else if (data[key] !== null && data[key] !== undefined) {
                strForm += "<input type=\"hidden\" name=\"" + key + "\" value=\"" + data[key] + "\">";
                console.log("PINELABS DATA", key, data[key]);
            }
        }
        var pinelabParams = {};

        strForm += "</form>";
        strScript = "<script language='javascript'>";
        strScript += "var v" + formID + " = document." + formID + ";";
        strScript += "v" + formID + ".submit();";
        strScript += "</script>";
        //  pinelabParams.happi_cart_id = formData.cartId;
        //  pinelabParams.happi_tran_id = tranId;
        //  pinelabParams.cartPrice = CartSubtotal * 100;
        // // pinelabParams.payu_key_id = PAYU_KEY;
        //
        //  var payment_info = {
        //      cart: cart,
        //      count: CartQuantity,
        //      total: CartSubtotal
        //  };

        await cartTbl.updateOne({
            cartId: formData.cartId
        }, {
            $set: {
                order_info: cart.items,
                tran_id: tranId,
                CartQuantity: CartQuantity,
                CartSubtotal: CartSubtotal,
            }
        })
        res.send(strForm + strScript);
    }
}

function HMAC(message, key) {
    var hmac = "";

    try {
        var shaObj = new jsSHA("SHA-256", "TEXT");
        shaObj.setHMACKey(key, "HEX");
        shaObj.update(message);
        hmac = shaObj.getHMAC("HEX");
    }
    catch (err) { }

    return hmac.toUpperCase();
}



async function pinelabs_verify(req, res) {
    let data = req.body;
    console.log("PINELAB", data);
    let db = await mongo.connect();
    let cartTbl = db.collection(TBL_CART);
    let productTbl = db.collection(TBL_PRODUCT);
    let userTbl = db.collection(TBL_USER);
    let orderTbl = db.collection(TBL_ORDER);

    // var tranId = crypto.randomBytes(15).toString("hex");


    var strMsgResponse = "";

    var keys = Object.keys(data);
    //keys.sort();
    keys.sort(function (a, b) { });

    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        strMsgResponse += "<strong>" + key + "</strong>" + " = " + data[key] + "<BR />";
    }

    msgString = "";


    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (data[key] != null && data[key] !== undefined && key !== 'ppc_DIA_SECRET' && key !== 'ppc_DIA_SECRET_TYPE') {
            msgString += String(key) + "=" + String(data[key]) + "&";
        }
    }

    msgString = msgString.slice(0, -1);

    strSecretKey = "42F2F10AE4AE40CC858096722371EF49";
    strHashType = "SHA256";

    strDIA_SECRET = HMAC(msgString, strSecretKey);

    strMsgResponse += "<BR /><strong>" + "Hash Generated on Response Page" + "</strong>" + " = " + strDIA_SECRET + "<BR />";
    strMsgResponse += "<strong>" + "Do Hashes match?: " + "</strong>";

    comment = "";
    var cart = await cartTbl.findOne({ tran_id: data.ppc_UniqueMerchantTxnID.split('-')[0] });


    if (data['ppc_TxnResponseCode'] === "1") {
        comment = "Transaction SUCCESSFUL";
        strMsgResponse += "YES" + "<BR />";


        cart.order_id = new Date().toISOString().split('T')[0] + '-' + crypto.randomBytes(3).toString("hex");
        cart.tag = "paid";
        cart.gateway = "PINELAB";
        cart.pinelab_payment_id = data['ppc_UniqueMerchantTxnID'];
        cart.pinelab_order_id = data['ppc_UniqueMerchantTxnID'];
        cart.pinelab_info = JSON.stringify(data);
        cart.v = "V3";
        cart.status = "ORDER PLACED";
        cart.datecreated = new Date();
        delete cart._id;
        await orderTbl.insertOne(cart);
        await cartTbl.deleteOne({ tran_id: data.ppc_UniqueMerchantTxnID.split('-')[0] })

        shorturl.short(`https://${WEB_DOMIAN}/account/order-detail?id=` + cart.order_id, function (err, url) {
            var message = `Thankyou for placing order in Happi Mobiles. Your order is underprocess for more information click ${url}`;
            smsModule.sendSMS(cart.user_details.phone, message);
        });


        return res.redirect(
            `https://www.happimobiles.com/account/payment-success?rid=${cart.order_id}&rpid=${data['ppc_UniqueMerchantTxnID']}`
        );

    }
    else {
        return res.redirect(
            `https://www.happimobiles.com/cart?step=4`
        );
    }

};


module.exports.pinelabs_init = pinelabs_init;
module.exports.pinelabs_verify = pinelabs_verify;