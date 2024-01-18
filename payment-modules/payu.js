const { v4: uuidv4 } = require("uuid");
var crypto = require("crypto");
var config = require("../config.js");
var transaction = require("../modules/transactionUpdate");
var generateUuidModule = require("../modules/generate-uuid");
var leadsModule = require("../modules/leads");
const mongo = require("../db");
var smsModule = require("../modules/sms");
var shorturl = require("node-url-shortener");
const freshworks = require("../modules/freshworks");
var ingramModule = require("../modules/ingram");
var ejs = require('ejs');
const nodemailer = require("nodemailer");
var emailSMS = require('../modules/email.js');
let fs = require('fs');
let axios = require('axios');

const PAYU_KEY = "xP0RQd";
const PAYU_SALT = "mmGMt8x8";

const WEB_DOMIAN = process.env.WEB_DOMIAN || "www.happimobiles.com";
const PAYU_RETURN_URL =
    process.env.PAYU_RETURN_URL || "https://dev-services.happimobiles.com/payment/payu/verify";
//   "http://localhost:3000/dev/payment/payu/verify";  "https://dev-services.happimobiles.com/payment/payu/verify";

//const PAYU_KEY = "gtKFFx";
//const PAYU_SALT = "wia56q6O";

const TBL_CART = 'cart';
const TBL_PRODUCT = 'product';
const TBL_ORDER = "orders-v3";
const TBL_USER = "user";
const TBL_TRAN = "transaction-v3"; // ingram

async function payu_init(req, res) {
    var formData = req.query;
    //var JOB_ID = generateUuidModule.createUUID();
    //var redirect = F.global.config.url + self.url;

    // console.log("formData", formData);
    if (formData.cartId == null) {
        res.render("error", { message: "Cart id missing" });
        return;
    }

    let db = await mongo.connect();
    let cartTbl = db.collection(TBL_CART);
    let productTbl = db.collection(TBL_PRODUCT);
    let userTbl = db.collection(TBL_USER);

    var cart = await cartTbl.findOne(
        { cartId: formData.cartId }
    );

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

        // ingram
        let product = await productTbl.findOne({ id: item.productId }, {
            id: 1,
            payPrice: 1,
            name: 1,
            stock: 1,
            image_url: 1,
            pictures: 1,
            category: 1,
            linker: 1,
            pictures_new: 1,
            thirdPartyCodes: 1,
            vendor: 1
        });

        item.payPrice = product.payPrice;
        item.name = product.name;
        item.stock = product.stock;
        item.image_url = product.image_url; // ingram
        item.thirdPartyCodes = product.thirdPartyCodes;
        item.vendor = product.vendor;

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

    var payuParms;


    if (cart.userInfo == null) {
        return res.render("error", {
            status: false,
            message: "User Information Missing",
        });
    }

    payuParms = {
        udf5: "PayUBiz_NODE_JS_KIT",
        // surl: "https://www.happimobiles.com/order/payu-return",
        // furl: "https://www.happimobiles.com/order/payu-return",
        // curl: "https://www.happimobiles.com/order/payu-return",
        surl: PAYU_RETURN_URL,
        furl: PAYU_RETURN_URL,
        curl: PAYU_RETURN_URL,
        // key: PAYU_KEY,
        amount: CartSubtotal + ".00",
        productinfo: "Happi",
        firstname: cart.userInfo.name,
        lastname: "",
        email: cart.userInfo.email,
        phone: cart.userInfo.phone,
        address1: "",
        address2: "",
        city: "",
        state: "",
        country: "India",
        zipcode: "",
        Pg: "",
        hash: "",
        txnid: tranId,
        //submit_url: "https://test.payu.in/_payment",
        submit_url: "https://secure.payu.in/_payment",
        // offer_key: "HDFC EMI 3@8765,HDFC DC EMI 3@9383,ICICI EMI 3@9395,ICICI Instant Discount@9401,HDFC@8669"
        offer_key: "",
    };

    if (cart.selectedOffer != null && cart.selectedOffer.offerKey != null) {
        payuParms.offer_key = cart.selectedOffer.offerKey
    }
    if (cart.type == "bajaj") {
        if (cart.advEmiAmt == 0 && cart.processingFee == 0) {
            payuParms.amount = (cart.additionalCharges) + ".00"
        }
        else {
            payuParms.amount = (cart.advEmiAmt + cart.processingFee + cart.additionalCharges) + ".00"
        }
    }
    var cryp = crypto.createHash("sha512");
    var text =
        PAYU_KEY +
        "|" +
        payuParms.txnid +
        "|" +
        payuParms.amount +
        "|" +
        payuParms.productinfo +
        "|" +
        payuParms.firstname +
        "|" +
        payuParms.email +
        "|||||" +
        payuParms.udf5 +
        "||||||" +
        PAYU_SALT;
    // console.log("PAUY", text);
    cryp.update(text);
    payuParms.hash = cryp.digest("hex");
    // console.log("PAYU", payuParms);

    payuParms.happi_cart_id = formData.cartId;
    payuParms.happi_tran_id = tranId;
    payuParms.cartPrice = CartSubtotal;
    payuParms.payu_key_id = PAYU_KEY;

    var payment_info = {
        cart: cart,
    };

    await cartTbl.updateOne({
        cartId: formData.cartId
    }, {
        $set: {
            tran_id: tranId,
            cart_items: cart.items,
            payment_info: payment_info,
            CartQuantity: CartQuantity,
            CartSubtotal: CartSubtotal,
        }
    });

    res.render("payupay", payuParms);
}

async function payu_verify(req, res) {

    var formdata = req.body;
    let db = await mongo.connect();
    let cartTbl = db.collection(TBL_CART);
    let productTbl = db.collection(TBL_PRODUCT);
    let userTbl = db.collection(TBL_USER)
    let orderTbl = db.collection(TBL_ORDER);
    let tranTbl = db.collection(TBL_TRAN); // ingram


    var verified = "No";
    var txnid = formdata.txnid;
    var amount = formdata.amount;
    var productinfo = formdata.productinfo;
    var firstname = formdata.firstname;
    var email = formdata.email;
    var udf5 = formdata.udf5;
    var mihpayid = formdata.mihpayid;
    var status = formdata.status;
    var resphash = formdata.hash;
    var additionalcharges = "";
    var keyString =
        PAYU_KEY +
        "|" +
        txnid +
        "|" +
        amount +
        "|" +
        productinfo +
        "|" +
        firstname +
        "|" +
        email +
        "|||||" +
        udf5 +
        "|||||";
    var keyArray = keyString.split("|");
    var reverseKeyArray = keyArray.reverse();
    var reverseKeyString =
        PAYU_SALT + "|" + status + "|" + reverseKeyArray.join("|");
    //check for presence of additionalcharges parameter in response.
    if (typeof formdata.additionalCharges !== "undefined") {
        additionalcharges = formdata.additionalCharges;
        //hash with additionalcharges
        reverseKeyString = additionalcharges + "|" + reverseKeyString;
    }
    //Generate Hash
    var cryp = crypto.createHash("sha512");
    cryp.update(reverseKeyString);
    var calchash = cryp.digest("hex");

    var msg =
        "Payment failed for Hash not verified...<br />Check Console Log for full response...";
    //Comapre status and hash. Hash verification is mandatory.
    if (calchash === resphash) {
        verified = "YES";
        msg =
            "Transaction Successful and Hash Verified...<br />Check Console Log for full response...";
    }

    if (verified === "YES" && status === "success") {
        console.log("VERIFY", req.body, req.query);
        var cart = await cartTbl.findOne({
            tran_id: txnid
        });

        if (cart == null) {
            res.render("error", { status: false, message: "Invalid cartId" });
            return;
        }

        // ingram
        var taxnid = crypto.randomBytes(12).toString("hex");
        taxnid = taxnid.toUpperCase();

        // ingram
        var orderID = new Date().toISOString().split("T")[0] +
            "-" +
            crypto.randomBytes(3).toString("hex");
        orderID = orderID.replace(/-/g, "");
        orderID = orderID.toUpperCase();

        // cart.order_id = orderID;
        cart.tag = "paid";
        cart.gateway = "PAYU";
        cart.payu_payment_id = mihpayid;
        cart.payu_signature = calchash;
        cart.v = "V3";
        cart.status = "ORDER PLACED";
        cart.datecreated = new Date();
        cart.gateway_info = req.body;
        cart.paymentUniqueId = cart.gateway + "/" + cart.payu_payment_id;
        cart.taxnid = taxnid;

        delete cart._id;
        await tranTbl.insertOne(cart); // ingram


        var items = cart.cart_items;
        delete cart.cart_items;


        var orders_ids = [];
        // generate multiple orders  - ingram
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var CartSubtotal = 0;
            var CartQuantity = 0;

            var order = cart;
            order.order_id = orderID + `-${(i + 1)}`;
            order.taxnid = taxnid;
            CartSubtotal = item.liveQuantity * item.payPrice;
            CartQuantity = item.liveQuantity;
            order.CartQuantity = CartQuantity;
            order.CartSubtotal = CartSubtotal;
            order.cart_items = [
                item
            ]
            if (item.vendor === "ingram") {
                order.internal_order_status = "inward"
                // call function for order API ingram
                order.ingram_info = await ingramModule.ingramCreateOrders(order.order_id, item.thirdPartyCodes.ingramPartNumber, CartQuantity)
            } else {
                order.internal_order_status = null
            }
            order.vendor = item.vendor;

            orders_ids.push(order.order_id)
            delete order._id;
            await orderTbl.insertOne(order);
            // integrate Firebase Dyanimic Links

            var shorturldata = JSON.stringify({
                "longDynamicLink": "https://s.happimobiles.com/?link=https://www.happimobiles.com/account/order-detail?id=" + order.order_id,
                "suffix": {
                    "option": "SHORT"
                }
            });

            var shot_url_config = {
                method: 'post',
                url: 'https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=AIzaSyBlVN-EcemRO8HuBcR62wWlaWIeYtYVAFk',
                headers: {
                    'Content-Type': 'application/json',

                },
                data: shorturldata
            };

            let shorturl_response = await axios(shot_url_config);
            let url = shorturl_response.data.shortLink;

            var message = `Thankyou for placing order in Happi Mobiles. Your order is underprocess for more information click ${url}`;
            smsModule.sendSMS(order.userInfo.phone, message);

            //send email template

            var html = fs.readFileSync(__dirname + '/email.html', 'utf8')
            var output = await ejs.render(html, {
                "order_id": order.order_id,
                "data": order.cart_items,
                "paymentGateway": order.paymentGateway,
                "CartSubtotal": order.CartSubtotal,
                "selectedAddress": order.selectedAddress
            })
            //emailSMS.orderEmail(order.selectedAddress.email,output);

            try {
                await freshworks.orderPush(cart.userInfo.name, `+91${order.userInfo.phone}`, "", order.order_id, "order_done", item.name, "paid");
            } catch (e) {
                console.log("freshworks", e.request.data)
            }
        }


        await cartTbl.deleteOne({
            tran_id: txnid
        })


        setTimeout(function () {
            var order_id_string_parse = "";
            if (orders_ids.length > 1) {
                order_id_string_parse = orders_ids.join("|")
            } else {
                order_id_string_parse = orders_ids[0];
            }
            res.redirect(
                `https://www.happimobiles.com/account/payment-success?rid=${order_id_string_parse}&rpid=${taxnid}`
            );
        }, 2500)
    } else {
        var q = `txnid=${formdata.txnid}&status=${formdata.status}`;

        res.redirect(`https://www.happimobiles.com/cart?type=err`);
    }
}


//cod

async function cod(req, res) {
    var formData = req.query;
    let downpayment = 0;

    if (formData.cartId == null) {
        res.send("error", {
            message: "Cart id missing"
        });
        return;
    }
    let db = await mongo.connect();
    let cartTbl = db.collection(TBL_CART);
    let productTbl = db.collection(TBL_PRODUCT);
    let userTbl = db.collection(TBL_USER);
    let tranTbl = db.collection(TBL_TRAN); // ingram
    let orderTbl = db.collection(TBL_ORDER);
    var cart = await cartTbl.findOne({
        cartId: formData.cartId
    });
    if (cart == null) {
        res.send("error", {
            status: false,
            message: "Invalid cartId"
        });
        return;
    }
    var CartSubtotal = 0;
    var CartQuantity = 0;
    if (cart.items === null && cart.items.length === 0) {
        res.send("error", {
            status: false,
            message: "No Items in Cart"
        });
    }
    for (let i = 0; i < cart.items.length; i++) {
        let item = cart.items[i];
        // ingram
        let product = await productTbl.findOne({
            id: item.productId
        }, {
            id: 1,
            payPrice: 1,
            name: 1,
            stock: 1,
            image_url: 1,
            pictures: 1,
            category: 1,
            linker: 1,
            pictures_new: 1,
            thirdPartyCodes: 1,
            vendor: 1
        });
        item.payPrice = product.payPrice;
        item.name = product.name;
        item.stock = product.stock;
        item.image_url = product.image_url; // ingram
        item.thirdPartyCodes = product.thirdPartyCodes;
        item.vendor = product.vendor;
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
    var payment_info = {
        cart: cart,
    };
    await cartTbl.updateOne({
        cartId: formData.cartId
    }, {
        $set: {
            tran_id: tranId,
            cart_items: cart.items, //dinesh
            payment_info: payment_info,
            CartQuantity: CartQuantity,
            CartSubtotal: CartSubtotal,
        }
    });
    cart = await cartTbl.findOne({
        cartId: formData.cartId
    });

    let DEALID;
    if (cart.type == "bajaj") {

        downpayment = (cart.downpayment + cart.processingFee);
        DEALID = cart.ATOS_Deal_Id;

    }

    var taxnid = crypto.randomBytes(12).toString("hex");
    taxnid = taxnid.toUpperCase();
    // ingram
    var orderID = new Date().toISOString().split("T")[0] +
        "-" +
        crypto.randomBytes(3).toString("hex");
    orderID = orderID.replace(/-/g, "");
    orderID = orderID.toUpperCase();
    // cart.order_id = orderID;
    cart.tag = "cod";
    cart.gateway = "COD";
    cart.v = "V3";
    cart.status = "ORDER PLACED";
    cart.datecreated = new Date();
    cart.gateway_info = req.body;
    cart.paymentUniqueId = "COD/" + orderID;
    cart.taxnid = taxnid;
    cart.downpayment_amount = downpayment;
    cart.DEALID = DEALID
    delete cart._id;
    await tranTbl.insertOne(cart); // ingram   dinesh
    var items = cart.cart_items;
    delete cart.cart_items;
    var orders_ids = [];

    // console.log(`cartId---${formData.cartId}----items---${items}`)
    console.log("cartId", formData.cartId, "items", items);

    // generate multiple orders  - ingram
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var CartSubtotal = 0;
        var CartQuantity = 0;
        var order = cart;
        order.order_id = orderID + `-${(i + 1)}`;
        order.taxnid = taxnid;
        CartSubtotal = item.liveQuantity * item.payPrice;
        CartQuantity = item.liveQuantity;
        order.CartQuantity = CartQuantity;
        order.CartSubtotal = CartSubtotal;
        order.cart_items = [
            item
        ]
        if (item.vendor === "ingram") {
            // console.log(`/api/payu/cod-----------cartID:${formData.cartId}---------vendor:${item}`)
            order.internal_order_status = "inward"
            // call function for order API ingram
            order.ingram_info = await ingramModule.ingramCreateOrders(order.order_id, item.thirdPartyCodes.ingramPartNumber, CartQuantity)
        } else {
            order.internal_order_status = null
        }
        order.vendor = item.vendor;
        orders_ids.push(order.order_id)
        delete order._id;
        // console.log("orderdata-------",order);
        await orderTbl.insertOne(order);
        // integrate Firebase Dyanimic Links
        var shorturldata = JSON.stringify({
            "longDynamicLink": "https://s.happimobiles.com/?link=https://www.happimobiles.com/account/order-detail?id=" + order.order_id,
            "suffix": {
                "option": "SHORT"
            }
        });
        var shot_url_config = {
            method: 'post',
            url: 'https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=AIzaSyBlVN-EcemRO8HuBcR62wWlaWIeYtYVAFk',
            headers: {
                'Content-Type': 'application/json',
            },
            data: shorturldata
        };
        let shorturl_response = await axios(shot_url_config);
        let url = shorturl_response.data.shortLink
        var message = `Thankyou for placing order in Happi Mobiles. Your order is underprocess for more information click ${url}`;
        console.log("sms-", order.userInfo.phone);
        smsModule.sendSMS(order.userInfo.phone, message);
        //send email template
        // var html = fs.readFileSync(__dirname + '/email.html', 'utf8')
        // var output = await ejs.render(html, {
        //     "order_id": order.order_id,
        //     "data": order.cart_items,
        //     "paymentGateway": order.paymentGateway,
        //     "CartSubtotal": order.CartSubtotal,
        //     "selectedAddress": order.selectedAddress
        // })
        //emailSMS.orderEmail(order.selectedAddress.email,output);
        try {
            await freshworks.orderPush(cart.userInfo.name, `+91${order.userInfo.phone}`, "", order.order_id, "order_done", item.name, "paid");
        } catch (e) {
            // console.log("freshworks", e.request.data)
        }
    }
    // await cartTbl.deleteOne({
    //     cartId: formData.cartId
    // })
    setTimeout(function () {
        var order_id_string_parse = "";
        if (orders_ids.length > 1) {
            order_id_string_parse = orders_ids.join("|")
        } else {
            order_id_string_parse = orders_ids[0];
        }
        res.redirect(
            `https://www.happimobiles.com/account/payment-success?rid=${order_id_string_parse}&rpid=${taxnid}&type=cod`
        );
    }, 2500)
}



async function createOrder(formData) {
    let db = await mongo.connect();
    let cartTbl = db.collection(TBL_CART);
    let orderTbl = db.collection(TBL_ORDER);
    var cart = await cartTbl.findOne(
        { cartId: formData.cartId }
    );
    var orderID = new Date().toISOString().split("T")[0] +
        "-" +
        crypto.randomBytes(3).toString("hex");
    orderID = orderID.replace(/-/g, "");
    orderID = orderID.toUpperCase();
    var orders_ids = [];
    for (var i = 0; i < cart.items.length; i++) {
        var item = cart.items[i];
        var CartSubtotal = 0;
        var CartQuantity = 0;
        var order = cart;
        order.order_id = orderID + `-${(i + 1)}`;
        CartSubtotal = item.liveQuantity * item.payPrice;
        CartQuantity = item.liveQuantity;
        order.CartQuantity = CartQuantity;
        order.CartSubtotal = CartSubtotal;
        order.cart_items = [
            item
        ]
        if (item.vendor === "ingram") {
            order.internal_order_status = "inward"
            // call function for order API ingram
            order.ingram_info = await ingramModule.ingramCreateOrders(order.order_id, item.thirdPartyCodes.ingramPartNumber, CartQuantity)
        } else {
            order.internal_order_status = null
        }
        order.vendor = item.vendor;

        orders_ids.push(order.order_id)
        delete order._id;

        console.log("order", order);

        await orderTbl.insertOne(order);
        // integrate Firebase Dyanimic Links

        var shorturldata = JSON.stringify({
            "longDynamicLink": "https://s.happimobiles.com/?link=https://www.happimobiles.com/account/order-detail?id=" + order.order_id,
            "suffix": {
                "option": "SHORT"
            }
        });

        var shot_url_config = {
            method: 'post',
            url: 'https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=AIzaSyBlVN-EcemRO8HuBcR62wWlaWIeYtYVAFk',
            headers: {
                'Content-Type': 'application/json',

            },
            data: shorturldata
        };
        let shorturl_response = await axios(shot_url_config);
        let url = shorturl_response.data.shortLink;
        var message = `Thankyou for placing order in Happi Mobiles. Your order is underprocess for more information click ${url}`;
        smsModule.sendSMS(order.userInfo.phone, message);
        try {
            await freshworks.orderPush(cart.userInfo.name, `+91${order.userInfo.phone}`, "", order.order_id, "order_done", item.name, "paid");
        } catch (e) {
            console.log("freshworks", e.request.data)
        }
    }


}

module.exports.payu_init = payu_init;
module.exports.payu_verify = payu_verify;
module.exports.cod = cod;



