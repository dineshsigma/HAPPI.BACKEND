var axios = require('axios');
// create uuid module import
var generateUuidModule = require('../modules/generate-uuid');

function sendLeadOrderConfirm(order) {
   var JOB_ID = generateUuidModule.createUUID();
    var mobileModel = "";
    for (let i = 0; i < order.items.length; i++) {
        const sigleItem = order.items[i];
        mobileModel += `${sigleItem.name} (${sigleItem.quantity}) , `
        
    }
    // console.log("mobileModel",mobileModel);
   
    var data = JSON.stringify(
        {
            "lead":
            {
                "first_name": order.name,
                "mobile_number":"+91"+order.iduser,
                "address":`${order.billingstreet} , ${order.billingcity} , ${order.billingcountry}, ${order.billingzip}`,
                "custom_field": {
                    "cf_url": `https://www.happimobiles.com/checkout/${order.id}`,
                    "cf_request_type": "order_done",
                    "cf_mobile_model":mobileModel,
                    "cf_payment_type":order.tag
                   
                }

            }
        });
    console.log("INPUT DATA-------------------------------", data);
    var config = {
        method: 'post',
        url: 'https://happimobiles1.freshsales.io/api/leads',
        headers: {
            'Authorization': 'Token token=jjDyYzo0QA5jmaAopMB6wQ',
            'Content-Type': 'application/json'
        },
        data: data
    };
    axios(config)
        .then(function (response) {
            console.log("LEADS ORDER CONFIRM RESPONSE---------------------------", JSON.stringify(response.data));
        })
        .catch(function (error) {
            console.log("LEADS ORDER CONFIRM API ERROR--------------------------", error.message);
        });
}

// when order is changed to sent status
function sendLeadOrderShipped(order) {
    var JOB_ID = generateUuidModule.createUUID();
    var mobileModel = "";
    for (let i = 0; i < order.items.length; i++) {
        const sigleItem = order.items[i];
        mobileModel += `${sigleItem.name} (${sigleItem.quantity}) , `
        
    }
    var data = JSON.stringify(
        {
            "lead":
            {
                "first_name": order.name,
                "mobile_number":  "+91"+order.iduser,
                "address":`${order.billingstreet} , ${order.billingcity} , ${order.billingcountry}, ${order.billingzip}`,
                "custom_field": {
                    "cf_url": `https://www.happimobiles.com/checkout/${order.id}`,
                    "cf_request_type": "order_shipped",
                    "cf_mobile_model":mobileModel,
                    "cf_payment_type":order.tag
                }
            }
        });
    var config = {
        method: 'post',
        url: 'https://happimobiles1.freshsales.io/api/leads',
        headers: {
            'Authorization': 'Token token=jjDyYzo0QA5jmaAopMB6wQ',
            'Content-Type': 'application/json'
        },
        data: data
    };
    axios(config)
        .then(function (response) {
            console.log("LEADS ORDER SHIPPED RESPONSE---------------------------", JSON.stringify(response.data));
        })
        .catch(function (error) {
            console.log("LEADS ORDER SHIPPED API ERROR--------------------------", error.message);
        });
}

module.exports.sendLeadOrderConfirm = sendLeadOrderConfirm;
module.exports.sendLeadOrderShipped = sendLeadOrderShipped;