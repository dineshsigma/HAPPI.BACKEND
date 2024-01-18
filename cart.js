const serverless = require("serverless-http");
const express = require("express");
const app = express();
let cors = require("cors");
const mongo = require("./db");
var qs = require("qs");
var axios = require("axios");

app.options("*", cors()); // include before other routes
app.use(cors());

// otplib secret key
var JWT_SECRET_KEY =
  process.env.JWT_SECRET_KEY ||
  "happi_jwt_secrethappi_jwt_secrethappi_jwt_secret";

//jsonparser
app.use(express.json());

app.post("/api/cart", async function (req, res) {
  let db = await mongo.connect();
  let collection = db.collection("cart");
  let payload = req.body;
  var isCartExist = true;
  var cartObj = {};

  if (payload.cartId == null) {
    payload.cartId = "xxxxxxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        var r = (Math.random() * 16) | 0,
          v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
    isCartExist = false;
  }

  let cartDB = await collection.findOne({ cartId: payload.cartId });
  if (cartDB == null) {
    cartObj.cartId = payload.cartId;
    cartObj.items = [];
    if (payload.userId !== null) {
      cartObj.phone = payload.userId;
    } else {
      cartObj.phone = 0;
    }
    // payload.userId != null ? (cartObj.phone = payload.userId) : 0;
    let item = {
      productId: payload.id,
      cartPrice: payload.payPrice || payload.price,
      quantity: payload.quantity,
      category: payload.category,
    };
    cartObj.items.push(item);
    cartObj.createdOn = new Date();

    cartObj.products = [payload.productId];
    cartObj.type = payload.type;
    cartObj.schema = payload.schema;
    cartObj.CARD_PINCODE = payload.CARD_PINCODE;
    // console.log('CART OBJ', cartObj);
    await collection.insertOne(cartObj);
  } else {
    let products = [];
    var quantitySync = false;
    cartDB.items.map((item) => {
      if (item.productId === payload.id) {
        quantitySync = true;
        item.quantity++;
      }
      products.push(item.productId);
    });

    if (!quantitySync) {
      let item = {
        productId: payload.id,
        cartPrice: payload.payPrice || payload.price,
        quantity: payload.quantity,
      };
      cartDB.items.push(item);
      products.push(item.id);
    }
    cartDB.products = products;
    cartDB.type = payload.type;
    cartDB.schema = payload.schema;
    cartObj.CARD_PINCODE = payload.CARD_PINCODE;
    cartDB.step = 0;
    cartDB.bajajLoanCreated = false;
    cartDB.amountPending = 0;

    console.log(
      "CART UPDATE",
      { cartId: payload.cartId },
      JSON.stringify(cartDB)
    );
    await collection.updateOne({ cartId: payload.cartId }, { $set: cartDB });
  }
  res.json(cartDB);
});

app.post("/api/cart/coupon", async function (req, res) {
  let db = await mongo.connect();
  let cartCollection = db.collection("cart");
  let cartId = req.body.cartId;
  if (cartId == null) {
    return res.json({ status: false, message: "Missing Cart Id" });
  }
  let cart = await cartCollection.findOne({ cartId: cartId });
  if (cart == null) {
    return res.json({ status: false, message: "Invalid Cart Id" });
  }

  var couponResponse = await validationCoupon(req.body.coupon);

  if (!couponResponse.status) {
    return res.json(couponResponse);
  }

  cart.couponCotext = couponResponse.data;
  cart.coupon = req.body.coupon;
  await cartCollection.updateOne({ cartId: cartId }, { $set: cart });
  return res.json({ status: true });
});

app.post("/api/cart/voucher", async function (req, res) {
  let db = await mongo.connect();
  let cartCollection = db.collection("cart");
  let cartId = req.body.cart_id;
  if (cartId == null) {
    return res.json({ status: false, message: "Missing Cart Id" });
  }
  let cart = await cartCollection.findOne({ cartId: cartId });
  if (cart == null) {
    return res.json({ status: false, message: "Invalid Cart Id" });
  }
  var couponResponse = await validationCoupon(req.body.coupon);
  if (!couponResponse.status) {
    return res.json(couponResponse);
  }

  cart.voucher = req.body.voucher;
  await cartCollection.updateOne({ cartId: cartId }, { $set: cart });
  return res.json({ status: true });
});

app.post("/api/cart/deliveryOption", async function (req, res) {
  let db = await mongo.connect();
  let cartCollection = db.collection("cart");
  let cartId = req.body.cart_id;
  if (cartId == null) {
    return res.json({ status: false, message: "Missing Cart Id" });
  }
  let cart = await cartCollection.findOne({ cartId: cartId });
  if (cart == null) {
    return res.json({ status: false, message: "Invalid Cart Id" });
  }

  if (
    req.body.payload.selectedOffer !== undefined &&
    req.body.payload.selectedOffer !== null
  ) {
    cart.selectedOffer = req.body.payload.selectedOffer;
  } else {
    cart.deliveryType = req.body.payload.deliveryType;
    if (req.body.payload.deliveryType === "delivery") {
      cart.selectedAddress = req.body.payload.address;
      cart.step = 4;
      cart.selectedStore = "";
    } else {
      cart.selectedAddress = "";
      cart.selectedStore = req.body.payload.store;
    }
    cart.userInfo = req.body.userDetails;
  }
  console.log("cart---", cart);

  await cartCollection.updateOne({ cartId: cartId }, { $set: cart });

  return res.json({ status: true });
});

app.post("/api/cart/updateCart", async function (req, res) {
  let db = await mongo.connect();
  let cartCollection = db.collection("cart");
  let cartId = req.body.cartId;
  let payload = req.body.payload;

  if (cartId == null) {
    return;
  }

  let cart = await cartCollection.findOne({ cartId: cartId });
  cart.items.map((item) => {
    if (item.productId === payload.productId) {
      item.quantity = item.quantity + payload.quantity;
    }
  });

  var index = null;
  for (let i = 0; i < cart.items.length; i++) {
    const element = cart.items[i];

    if (element.quantity === 0) {
      index = i;
    }
  }
  if (index != null) {
    cart.items.splice(index, 1);
  }
  cart.step = 0;
  cart.bajajLoanCreated = false;
  cart.amountPending = 0;

  // console.log('AFTER SLICE', cart.items);
  await cartCollection.updateOne({ cartId: cartId }, { $set: cart });

  return res.json({ status: true });
});

app.post("/api/cart/fetch", async function (req, res) {
  console.log(req.body.cartId);

  let cartId = req.body.cartId;
  if (cartId == null) {
    return res.json({
      status: false,
      message: "no cartId",
    });
  }
  let db = await mongo.connect();
  let collection = db.collection("cart");
  let cart = await collection.findOne({ cartId: cartId });
  // console.log("=========cart", cart);
  if (cart == null) {
    return res.json({
      status: false,
      message: "no cart found",
    });
  }

  const productCollection = db.collection("product");
  let CartSubtotal = 0;
  let CartQuantity = 0;

  var index = null;
  for (let i = 0; i < cart.items.length; i++) {
    const element = cart.items[i];
    if (element.quantity === 0) {
      index = i;
    }
  }
  if (index != null) {
    cart.items.splice(index, 1);
  }
  var offer_context = {
    category: [],
    apx_code: [],
    price: 0,
  };
  for (let i = 0; i < cart.items.length; i++) {
    let item = cart.items[i];
    console.log("=========item", item);
    let product = await productCollection.findOne(
      { id: item.productId },
      {
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
        vendor: 1,
      }
    );
    // console.log("=========product", product);
    if (product == null) {
      return;
    }
    item.payPrice = product.payPrice;
    item.name = product.name;
    item.stock = product.stock;
    item.pictures = product.pictures;
    item.pictures_new = product.pictures_new;
    offer_context.category.push(...product.category);
    if (
      product.thirdPartyCodes.apxItemCode !== null &&
      product.thirdPartyCodes.apxItemCode !== ""
    )
      offer_context.apx_code.push(product.thirdPartyCodes.apxItemCode);
    //item.category = product.category[1] != null ? product.category[1] : product.category[0];
    item.linker = product.linker;
    // console.log(item.cartPrice,":::::::::::::::",item.payPrice);
    if (item.cartPrice !== item.payPrice) {
      item.priceMsg =
        "Price is updated for some of the items in your cart, please check the latest price before placing your orders";
    }

    if (item.quantity > item.stock) {
      item.stockMsg =
        "Product is currently out of stock, please try again later";
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
  offer_context.category = offer_context.category.filter(
    (item, i, ar) => ar.indexOf(item) === i
  );
  offer_context.price = CartSubtotal;
  cart.couponErrMessage = "";
  cart.couponSuccessMessage = "";
  cart.couponDiscount = 0;
  cart.offerErrMessage = "";
  cart.offerSuccessMessage = "";
  cart.cashback = 0;

  if (cart.couponCotext != null) {
    if (parseInt(cart.couponCotext.min_order_amount) <= CartSubtotal) {
      if (new Date(cart.couponCotext.vaild_from) > new Date()) {
        cart.couponErrMessage = "Coupon is still not valid";
      } else if (new Date(cart.couponCotext.vaild_to) < new Date()) {
        cart.couponErrMessage = "Sorry, Coupon is Expired";
      } else {
        cart.couponDiscount = cart.couponCotext.max_offer_amount;
        CartSubtotal = CartSubtotal - cart.couponDiscount;
      }
    } else {
      cart.couponErrMessage =
        "Minimum Order amount is " + cart.couponCotext.min_order_amount;
    }
  }
  if (cart.selectedOffer != null) {
    if (
      cart.selectedOffer.min < CartSubtotal &&
      cart.selectedOffer.max > CartSubtotal
    ) {
      cart.cashback = cart.selectedOffer.maxCashBack;
    } else {
      cart.offerErrMessage = "Order Amount is not vaild for the offer";
    }
    if (parseInt(cart.selectedOffer.amount.min) <= CartSubtotal) {
      if (new Date(cart.selectedOffer.startDatetime) > new Date()) {
        cart.couponErrMessage = "Coupon is still not valid";
      } else if (new Date(cart.selectedOffer.endDatetime) < new Date()) {
        cart.couponErrMessage = "Sorry, Coupon is Expired";
      } else {
        cart.cashback = cart.selectedOffer.amount.maxCashBack;
        /// CartSubtotal =  CartSubtotal - cart.couponDiscount;
        cart.offerSuccessMessage =
          "You will receive upto cashback of INR " + cart.cashback;
      }
    } else {
      cart.couponErrMessage =
        "Minimum Order amount is " + cart.selectedOffer.amount.min;
    }
  }
  let obj = {
    cartItems: cart.items,
    amount: CartSubtotal,
    total: CartQuantity,
    cartInfo: cart,
    offer_context: offer_context,
  };

  //couponCalculation(obj)

  res.json(obj);
});

async function validationCoupon(code) {
  let db = await mongo.connect();
  let codesTbl = db.collection("one_time_codes");
  let codeRecord = await codesTbl.findOne({
    code: code,
  });
  if (codeRecord == null) {
    return { status: false, message: "Coupon code not found" };
  }
  if (codeRecord.order_id != null) {
    return { status: false, message: "Coupon code Already used" };
  }
  return { status: true, data: codeRecord };
}
app.post("/api/cart/userdetails", getUserCartDetails);
async function getUserCartDetails(req, res) {
  try {
    let form = req.body;
    let userCartDetails = {};
    userCartDetails.phone = form.phone;
    userCartDetails.name = form.name;
    userCartDetails.email = form.email;
    userCartDetails.createdon = new Date();

    //  console.log(userCartDetails);

    var db = await mongo.connect();
    var userDetailsDb = await db.collection("userCartDetails");

    let result = await userDetailsDb.insertOne(userCartDetails);
    res.json({
      status: true,
      message: "user cart details successfully",
      data: result,
    });
  } catch (error) {
    console.log(error);
  }
}

app.post("/api/cart/bajajcart", bajajproductcart);
async function bajajproductcart(req, res) {
  console.log("response.................", req.body.cartId);
  try {
    let db = await mongo.connect();
    let cartCollection = db.collection("cart");
    let cartId = req.body.cartId;
    if (cartId == null) {
      return;
    }
    let cartresponse = await cartCollection.findOne({ cartId: cartId });
    if (cartresponse == null) {
      return;
    }
    console.log(cartresponse);
    let cart_items = [];
    await cartCollection.updateOne(
      { cartId: cartId },
      { $set: { items: cart_items } }
    );
    return res.json({
      message: "product removed success please check the products",
    });
  } catch (error) {
    console.log(error);
    return res.json({
      status: false,
      message: error,
    });
  }
}

//###############################PRICE UPDATE ###########################
app.get("/api/priceupdateFromApx", priceupdateFromApx);
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
     console.log("error", error);
    return res.json({
      status: false,
      message: "Error",
    });
  }
}

module.exports = app;
