const serverless = require('serverless-http');
const express = require('express')
const app = express();
let cors = require('cors')
const mongo = require("./db");

app.options('*', cors()) // include before other routes
app.use(cors());

// otplib secret key
var JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || 'happi_jwt_secrethappi_jwt_secrethappi_jwt_secret';

//jsonparser
app.use(express.json());

app.post('/api/cart', async function (req, res) {
    let db = await mongo.connect();
    let collection = db.collection("cart");
    let payload = req.body;
    var isCartExist = true;
    var cartObj = {};

    if (payload.cartId == null) {
        payload.cartId = 'xxxxxxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
            /[xy]/g,
            function (c) {
                var r = (Math.random() * 16) | 0,
                    v = c == 'x' ? r : (r & 0x3) | 0x8;
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
            category: payload.category
        };
        cartObj.items.push(item);
        cartObj.createdOn = new Date();

        cartObj.products = [payload.productId];
        // console.log('CART OBJ', cartObj);
        await collection.insertOne(cartObj);
    } else {
        let products = [];
        var quantitySync = false;
        cartDB.items.map(item => {
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
                quantity: payload.quantity
            };
            cartDB.items.push(item);
            products.push(item.id);
        }
        cartDB.products = products;
        console.log("CART UPDATE", { cartId: payload.cartId }, JSON.stringify(cartDB))
        await collection.updateOne({ cartId: payload.cartId }, { $set: cartDB });
    }
    res.json(
        cartDB
    );

});

app.post('/api/cart/deliveryOption', async function (req, res) {


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
        if (req.body.payload.deliveryType === 'delivery') {
            cart.selectedAddress = req.body.payload.address;
            cart.selectedStore = '';
        } else {
            cart.selectedAddress = '';
            cart.selectedStore = req.body.payload.store;
        }
        cart.userInfo = req.body.userDetails;
    }

    await cartCollection.updateOne({ cartId: cartId }, { $set: cart });

    return res.json({ status: true });
});


app.post('/api/cart/updateCart', async function (req, res) {


    let db = await mongo.connect();
    let cartCollection = db.collection("cart");
    let cartId = req.body.cartId;
    let payload = req.body.payload;

    if (cartId == null) {
        return;
    }

    let cart = await cartCollection.findOne({ cartId: cartId });
    cart.items.map(item => {
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

    // console.log('AFTER SLICE', cart.items);
    await cartCollection.updateOne({ cartId: cartId }, { $set: cart });

    return res.json({ status: true });

});
/*
 */

app.post('/api/cart/fetch', async function (req, res) {

    let cartId = req.body.cartId;
    if (cartId == null) {
        return;
    }
    let db = await mongo.connect();
    let collection = db.collection("cart");
    let cart = await collection.findOne({ cartId: cartId });
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

    for (let i = 0; i < cart.items.length; i++) {
        let item = cart.items[i];

        let product = await productCollection.findOne(
            { id: item.productId },
            { id: 1, payPrice: 1, name: 1, stock: 1, pictures: 1, category: 1, linker: 1, pictures_new: 1 }
        );
        if (product == null) {
            return;
        }

        item.payPrice = product.payPrice;
        item.name = product.name;
        item.stock = product.stock;
        item.pictures = product.pictures;
        item.pictures_new = product.pictures_new;

        //item.category = product.category[1] != null ? product.category[1] : product.category[0];
        item.linker = product.linker;
        // console.log(item.cartPrice,":::::::::::::::",item.payPrice);
        if (item.cartPrice !== item.payPrice) {
            item.priceMsg = 'Price is updated for some of the items in your cart, please check the latest price before placing your orders';
        }

        if (item.quantity > item.stock) {
            item.stockMsg = 'Product is currently out of stock, please try again later';
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

    let obj = {
        cartItems: cart.items,
        amount: CartSubtotal,
        total: CartQuantity,
        cartInfo: cart
    };
    res.json(obj);
});

module.exports = app;

