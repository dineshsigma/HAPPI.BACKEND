const serverless = require("serverless-http");
const express = require("express");
const app = express();
const { v4: uuidv4 } = require("uuid");
var cors = require("cors");
var shorturl = require("node-url-shortener");

var rpay = require("./payment-modules/razorypay");
// var paytmpay = require("./payment-modules/paytm");
var payupay = require("./payment-modules/payu");
var pinelabpay = require("./payment-modules/pinelabs");
var amazonpay = require("./payment-modules/amazonpay");
var mongo = require("./db");

app.use(cors());
//jsonparser
app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.set("view engine", "ejs");

const TBL_CART = "cart";
const TBL_PRODUCT = "product";
const TBL_ORDER = "orders-v3";

app.get("/payment/init", async function (req, res) {
  var form = req.query;
  var db = await mongo.connect();
  var cartTbl = db.collection(TBL_CART);


  if (form.cartId === null) {
    res.render("error", { message: "Cart id missing" });
    return;
  }

  var cart = await cartTbl.findOne(
      { cartId:  form.cartId}
  )

  if (cart == null) {
    res.render("error", { status: false, message: "Invalid cartId" });
    return;
  }
  // if offer selected
  if (cart.selectedOffer != null) {
    if (cart.selectedOffer.paymentGateway === "PayU") {
      res.redirect("/payment/payu-init?cartId=" + form.cartId);
    }
    if (cart.selectedOffer.paymentGateway === "PineLabs" || cart.selectedOffer.paymentGateway === "Pinelabs") {
      console.log("PineLabs")
      res.redirect("/payment/pinelabs-init?cartId=" + form.cartId);
    }

    if (cart.selectedOffer.paymentGateway === "RPAY") {
      res.redirect("/payment/rpay-init?cartId=" + form.cartId);
    }

    if (cart.selectedOffer.paymentGateway === "AmazonPay") {
      res.redirect("/payment/amazon-init?cartId=" + form.cartId);
    }

    // Default payment - Razorpay
  } else {
    res.redirect("/payment/rpay-init?cartId=" + form.cartId);
  }
});

//Razor pay
app.get("/payment/rpay-init", rpay.razorypay_init);
app.post("/payment/rpay/verify", rpay.razorypay_verify);

// //Paytm
// app.get("/payment/paytm-init", paytmpay.paytm_init);
// app.post("/payment/paytm/verify", paytmpay.paytm_verify);

//payu
app.get("/payment/payu-init", payupay.payu_init);
app.post("/payment/payu/verify", payupay.payu_verify);
app.post('/payment/payu/cod',payupay.cod);

//pinelabs
app.get("/payment/pinelabs-init", pinelabpay.pinelabs_init);
app.post("/payment/pinelabpay/verify", pinelabpay.pinelabs_verify);

app.get("/payment/amazon-init", amazonpay.amazonpay_init);
app.post("/payment/amazon/verify", amazonpay.amazonPayFetchTransaction);

//bajaj-emi
// app.get("/api/bajaj/emiOptions");
// app.post("/api/bajaj");
//ROUTE('#bajaj', test, [10000]);
// app.post("/api/bajaj-emi-return");

module.exports=app;
