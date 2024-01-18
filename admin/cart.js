const serverless = require('serverless-http');
const express = require('express')
const app = express();
const { v4: uuidv4 } = require('uuid');
var cors = require('cors')
var jwt = require('jsonwebtoken');
var request = require('request');
let axios = require('axios');
let email = require('../modules/email');
let fs=require('fs');
const nodemailer = require("nodemailer");
let ejs=require('ejs');



const {
    ObjectId
} = require('mongodb');


var mongo = require("../db");
const { Parser } = require('json2csv');




async function getproductname(req, res) {
    try {

        var dataBase = await mongo.connect();
        let productcoll = await dataBase.collection('product');
        let productname_response = await productcoll.find({}, { projection: { name: 1, id: 1, payPrice: 1, "thirdPartyCodes.apxItemCode": 1 } }).toArray();
        let productnamearr = [];
        for (var i = 0; i < productname_response.length; i++) {
   
            productnamearr.push({ "id": productname_response[i].id, "name": productname_response[i].name, "payPrice": productname_response[i].payPrice, "apx_code": productname_response[i].thirdPartyCodes.apxItemCode });
            
        }

        return res.json({

            data: productnamearr
        })


    }
    catch (error) {
        console.log(error);
        return res.json({
            status: false,
            message: error
        })
    }

}



async function addAdminCartDetails(req, res) {
    try {

        var dataBase = await mongo.connect();
        let usercoll = await dataBase.collection('user');
        let cartcollection = dataBase.collection("cart");
        let userdetails = await usercoll.findOne({ "phone": req.body.phone });
        let userInfo;
        if (userdetails == null) {
            userInfo = {

                "id": uuidv4(),
                "sub": req.body.phone,
                "UID": req.body.phone,
                "name": req.body.name,
                "phone": req.body.phone,
                "email": req.body.email,
                "role": "user"

            }
            await usercoll.insertOne(userInfo);

        }
        else {
            userInfo = {
                "id": userdetails.id,
                "sub": userdetails.phone,
                "UID": userdetails.phone,
                "name": userdetails.name,
                "phone": userdetails.phone,
                "email": userdetails.email,
                "role": "user"
            }
        }
        var cartObj = {};
        let payload = req.body;

        let cartId = 'xxxxxxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
            /[xy]/g,
            function (c) {
                var r = (Math.random() * 16) | 0,
                    v = c == 'x' ? r : (r & 0x3) | 0x8;
                return v.toString(16);
            }
        );

        cartObj.cartId = cartId;
        let selectedAddress = {
            "country": payload.country,
            "name": payload.name,
            "email": payload.email,
            "phone": payload.phone,
            "street": payload.street,
            "area": payload.area,
            "city": payload.city,
            "state": payload.state,
            "pincode": payload.pincode

        }
        cartObj.createdOn = new Date();
        cartObj.selectedOffer = req.body.selectedOffer;
        cartObj.selectedAddress = selectedAddress;
        cartObj.products = payload.products;
        cartObj.type = payload.type;
        cartObj.deliveryType = "delivery",
        cartObj.selectedStore = ""
        cartObj.userInfo = userInfo;

        console.log("cartObj--------->", cartObj, "userInfo------------>", userInfo, "created success");

        var shorturldata = JSON.stringify({
            "longDynamicLink": "https://s.happimobiles.com/?link=https://www.happimobiles.com/cart-preview?id=" + cartId,
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

        cartObj.carturl = shorturl_response.data.shortLink;


        await cartcollection.insertOne(cartObj);

        return res.json({
            status: true,
            cartId: cartId
        })

    }
    catch (error) {
        console.log(error);
        return res.json({
            status: false,
            message: error
        })
    }
}

async function CustomerEmailNotification(req, res) {
    try {


        
    var html = fs.readFileSync(__dirname + '/email.html', 'utf8')
    console.log(html);
    //     var output = await ejs.render(html, {
    //    "order_id": order.order_id,
    //    "data": cart_items,
    //    "paymentGateway":order.paymentGateway,
    //    "CartSubtotal":order.CartSubtotal,
    //    "selectedAddress":order.selectedAddress
    // })
    // emailSMS.orderEmail(order.selectedAddress.email,output);

    // return res.json({
    //     status:true,
    //     message:'email send success'
    // })
     

        



    }
    catch (error) {
        return res.json({
            status: false,
            message: error
        })
    }
}

async function CustomerSMSNotification(req, res) {
    try {

        var dataBase = await mongo.connect();
        let cartcollection = await dataBase.collection('cart');
        let cart_short_url = await cartcollection.findOne({ "cartId": req.body.cartId });
        let url;
        let message;

        console.log(cart_short_url.carturl)

        if (cart_short_url.carturl == null) {
            var shorturldata = JSON.stringify({
                "longDynamicLink": "https://s.happimobiles.com/?link=https://www.happimobiles.com/cart-preview?id=" + req.body.cartId,
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

            // await cartcollection.findOneAndUpdate({ "cartId": req.body.cartId }, { $set: { "carturl": shorturl_response.data.shortLink } })

            url = shorturl_response.data.shortLink;
            console.log(url);

            message = 'Hi dinesh, welcome to Happimobiles. There are items waiting in your cart for checkout, please follow the link below to complete your order.'

            message = message + " " + url;

            //send sms to phone

            var SMS_config = {
                method: 'get',
                url: `http://www.mobiglitz.com/vb/apikey.php?apikey=ehYw60GDMkBW4pqc&senderid=MHAPPI&number=91${req.body.phone}&message=${encodeURI(message)}`,
                headers: {}
            };


            var resp = await axios(SMS_config);
            console.log("happimobiles-sms---", resp.data);
            return res.json({
                state: true
            });
        }
        else {

            //get shorturl from cart table
            url=cart_short_url.carturl;

            message = 'Hi dinesh, welcome to Happimobiles. There are items waiting in your cart for checkout, please follow the link below to complete your order.'

            message = message + " " + url;

            console.log(url);

            var SMS_config = {
                method: 'get',
                url: `http://www.mobiglitz.com/vb/apikey.php?apikey=ehYw60GDMkBW4pqc&senderid=MHAPPI&number=91${req.body.phone}&message=${encodeURI(message)}`,
                headers: {}
            };

            var resp = await axios(SMS_config);
            console.log("happimobiles-sms---", resp.data);
            return res.json({
                state: true
            });

        }

    }
    catch (error) {
        console.log(error);
        return res.json({
            status: false,
            message: error
        })
    }
}

async function customerWhatapp(req, res) {
    try {

        //add shorturl for cart

    }
    catch (error) {
        console.log(error);
        return res.json({
            status: false,
            message: error

        })
    }
}


module.exports.getproductname = getproductname;
module.exports.addAdminCartDetails = addAdminCartDetails;
module.exports.CustomerEmailNotification = CustomerEmailNotification;
module.exports.CustomerSMSNotification = CustomerSMSNotification;
module.exports.customerWhatapp = customerWhatapp;

