var Razorpay = require("razorpay");
const { v4: uuidv4 } = require("uuid");
var crypto = require("crypto");
var axios = require("axios");
var smsModule = require('../modules/sms');
var shorturl = require('node-url-shortener');
const mongo = require("../db");

const RAZORPAY_KEY_ID =
    process.env.RAZORPAY_KEY_ID || "rzp_live_mEcGSqwJcYtmJu";
const RAZORPAY_KEY_SECRET =
    process.env.RAZORPAY_KEY_SECRET || "uiqf70yKempKo9iOkHoT65eY";

const WEB_DOMIAN = process.env.WEB_DOMIAN || "www.happimobiles.com"

const instance = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
});

const TBL_CART = "cart";
const TBL_PRODUCT = "product";
const TBL_ORDER = "orders-v3";
const TBL_USER = "user";

async function razorypay_init(req, res) {
    var form = req.query;

    let db = await mongo.connect();
    let cartTbl = db.collection(TBL_CART);
    let productTbl = db.collection(TBL_PRODUCT);
    let userTbl = db.collection(TBL_USER);

    if (form.cartId == null) {
        res.render("error", { message: "Cart id missing" });
        return;
    }

    var cart = await cartTbl.findOne(
        { cartId: form.cartId }
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

        let product = await productTbl.findOne({ id: item.productId }, {
            "id": 1, "payPrice": 1, "name": 1, "stock": 1, "pictures": 1
        });

        item.payPrice = product.payPrice;
        item.name = product.name;
        item.stock = product.stock;
        item.pictures = product.pictures;
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

    var tranId = crypto.randomBytes(15).toString("hex"); ///${crypto.randomBytes(3).toString('hex')}
    await instance.orders
        .create({
            amount: CartSubtotal * 100,
            currency: "INR",
            receipt: tranId,
            payment_capture: false,
            notes: {},
        })
        .then(async (result) => {
            //output = result;
            result.happi_cart_id = form.cartId;
            result.happi_tran_id = tranId;
            result.cartPrice = CartSubtotal * 100;
            result.r_key_id = RAZORPAY_KEY_ID;
            //res.json(result);

            var payment_info = {
                cart: cart,
            };
            await cartTbl.updateOne({
                cartId: form.cartId,
            }, {
                $set: {
                    //order_info:cart.items,
                    tran_id: tranId,
                    cart_items: cart.items,
                    CartQuantity: CartQuantity,
                    CartSubtotal: CartSubtotal,
                    rpay_info: JSON.stringify(result)
                }
            })

            res.render("rpay", result);
        });
}

async function razorypay_verify(req, res) {
    let db = await mongo.connect();
    let cartTbl = db.collection(TBL_CART);
    let productTbl = db.collection(TBL_PRODUCT);
    let userTbl = db.collection(TBL_USER);
    let orderTbl = db.collection(TBL_ORDER)

    var body = req.body;
    let payment = await instance.payments.fetch(body.razorpay_payment_id);

    var cart = await cartTbl.findOne({
        cartId: req.query.cart_id
    })

    if (cart == null) {
        res.render("error", { status: false, message: "Invalid cartId" });
        return;
    }

    cart.order_id = new Date().toISOString().split('T')[0] + '-' + crypto.randomBytes(3).toString("hex");
    cart.tag = "paid";
    cart.gateway = "RPAY";
    cart.razorpay_payment_id = body.razorpay_payment_id;
    cart.razorpay_order_id = body.razorpay_order_id;
    cart.razorpay_signature = body.razorpay_signature;
    cart.v = "V3"
    cart.status = "ORDER PLACED";
    cart.datecreated = new Date();
    cart.paymentUniqueId = cart.gateway + "/" + cart.razorpay_payment_id;
    delete cart._id;

    await orderTbl.insertOne(cart)
    await cartTbl.deleteOne({
        cartId: body.happi_cart_id
    });

    shorturl.short(`https://${WEB_DOMIAN}/account/order-detail?id=` + cart.order_id, function (err, url) {
        var message = `Thankyou for placing order in Happi Mobiles. Your order is underprocess for more information click ${url}`;
        smsModule.sendSMS(cart.userInfo.phone, message);
    });

    res.json({ "STATUS": "OK" });
}

module.exports.razorypay_init = razorypay_init;
module.exports.razorypay_verify = razorypay_verify;
