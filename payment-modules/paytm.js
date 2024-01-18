    
const { v4: uuidv4 } = require('uuid');
var crypto = require("crypto");
var config= require("../config.js");
var transaction = require('../modules/transactionUpdate');
var generateUuidModule = require('../modules/generate-uuid');
const checksum_lib = require('../modules/paytm-checksum');
var leadsModule = require('../modules/leads');
//mongo_db connection
const MONGO_DB_CONNECTION = process.env.MONGO_DB_CONNECTION ||  config.mongo_url;
const Agent = require('sqlagent/mongodb').connect(MONGO_DB_CONNECTION);


const MID = config['PAYTM_MID'];
const WEBSITE = config['PAYTM_WEBSITE'];
const INDUSTRY_TYPE_ID = config['PAYTM_INDUSTRY_TYPE_ID'];
const CHANNEL_ID = config['PAYTM_CHANNEL_ID'];
const CALLBACK_URL = config['PAYTM_CALLBACK_URL'];
const CALLBACK_LINK_URL = config['PAYTM_CALLBACK_LINK_URL'];
const CHECK_SUM_KEY = config['PAYTM_CHECK_SUM_KEY'];
const ORDER_SUBMIT_URL = config['PAYTM_ORDER_SUBMIT_URL'];
const PAYTM_CALLBACK_COD_URL = config['PAYTM_CALLBACK_COD_URL'];





async function paytm_init(req, res) {

    //var self = this;
    //var formData = form;

    var formData = req.query;

    //var JOB_ID = generateUuidModule.createUUID();
    //var redirect = F.global.config.url + self.url;
    const checksum_lib = require('../modules/paytm-checksum');
    const https = require('https');
    /**
     * import checksum generation utility
     * You can get this utility from https://developer.paytm.com/docs/checksum/
     */
    var nosql = new Agent();

    nosql.select('orders', 'orders').make(function (builder) {
        builder.where('id', formData.order_id)
        builder.first()
    })

    nosql.exec(async function (err, response) {

        if (err) {
            console.log("ERROR", err);
            return req.redirect('/checkout/' + formData.order_id + '/#PAYMENT_FAILED');
        }

        var order = response.orders;

        if (order == null) {
            console.log("ORDER NULL IN PAYTM_PROCESS", order);
            return req.redirect('/checkout/' + formData.order_id + '/#PAYMENT_FAILED');
        }

        if (order.ispaid) {
            return req.redirect('/checkout/' + formData.order_id + '/?paid=1');
        }



        // save transaction details
        var transactionObj = {
            "transactionid": order.id + "-" + uuidv4(),
            "orderid": order.id,
            "amount": order.price,
            "transaction_type": "paytm",
            "isSuccess": false,
            "datecreated": new Date()
        }
        await transaction.saveOrderTransaction(transactionObj);

        // get transaction details
        getTrasactionId(order.id, function (trasactionDetails) {
            var trasactionDetails = trasactionDetails;
            console.log("trasactionId", trasactionDetails.transactionid);
            var paytmParams = {

                /* Find your MID in your Paytm Dashboard at https://dashboard.paytm.com/next/apikeys */
                "MID": MID,

                /* Find your WEBSITE in your Paytm Dashboard at https://dashboard.paytm.com/next/apikeys */
                "WEBSITE": WEBSITE,

                /* Find your INDUSTRY_TYPE_ID in your Paytm Dashboard at https://dashboard.paytm.com/next/apikeys */
                "INDUSTRY_TYPE_ID": INDUSTRY_TYPE_ID,

                /* WEB for website and WAP for Mobile-websites or App */
                "CHANNEL_ID": CHANNEL_ID,

                /* Enter your unique order id */
                "ORDER_ID": trasactionDetails.transactionid,

                /* unique id that belongs to your customer */
                "CUST_ID": order.phone + "",

                /* customer's mobile number */
                "MOBILE_NO": order.phone + "",

                /* customer's email */
                "EMAIL": order.email,

                /**
                 * Amount in INR that is payble by customer
                 * this should be numeric with optionally having two decimal points
                 */
                "TXN_AMOUNT": order.price + "",

                /* on completion of transaction, we will send you the response on this URL */
                // "CALLBACK_URL" : "http://localhost:8000/order/paytm-return", //local
                //"CALLBACK_URL" : "http://13.232.26.24:8888/order/paytm-return", //dev

                "CALLBACK_URL": CALLBACK_URL, //prod

            };
            if (req.query.type == "link") {
                paytmParams["CALLBACK_URL"] = CALLBACK_LINK_URL;
            }

            if (req.query.type == "downPayment") {
                paytmParams["TXN_AMOUNT"] = req.query.amount;
                paytmParams["CALLBACK_URL"] = CALLBACK_URL + "?downpayment=1";
            }

            console.log("PAYTM_PARAMS",  new Date().toISOString(), paytmParams);

            checksum_lib.genchecksum(paytmParams, CHECK_SUM_KEY, function (err, checksum) {

                /* for Staging */
                // var url = "https://securegw-stage.paytm.in/order/process";

                /* for Production */
                if (err) {
                    console.log("ERROR ---------------------", err);
                    return req.redirect('/checkout/' + formData.order_id + '/#PAYMENT_FAILED');
                }
                console.log("CHECK_SUM",  new Date().toISOString(), checksum);

                paytmParams.checksum = checksum;
                paytmParams.submit_url = ORDER_SUBMIT_URL;

                console.log("PAYTM_PARAMS",  new Date().toISOString(), paytmParams);

                res.sendFile('paytm-test', paytmParams);
            });

        })




    });
};


async function paytm_verify() {

    var form = req.body;

    console.log("paytmcallback", form);
    


    var paytmChecksum = "";


    var paytmParams = {};
    for (var key in form) {
        if (key == "CHECKSUMHASH") {
            paytmChecksum = form[key];
        }
        else {
            paytmParams[key] = form[key];
        }
    }
    var txn_id = paytmParams["ORDERID"];

    var orderDetails = txn_id.split("-");
    // var trasactionOrderDetails = await getTrasactionOrderId(txn_id);
    console.log("orderId", orderDetails);
    var order_id = orderDetails[0];

    var isValidChecksum = checksum_lib.verifychecksum(paytmParams, CHECK_SUM_KEY, paytmChecksum);
    if (isValidChecksum) {
        console.log("Checksum Matched");
        if (paytmParams["STATUS"] == "TXN_SUCCESS") {
            var downpayment = false;
            if (req.query.downpayment == "1") {
                downpayment = true;
            }
            var nosql = new Agent();
            //NOSQL('orders').one().where('id', $.options.id || $.id).callback($.callback, 'error-orders-404');
            //console.log("id", $.options.id, $.id)
            var obj;
            if (downpayment) {
                var paytm_downpayment = paytmParams["TXNAMOUNT"];
                obj = {
                    ispaid: true,
                    datepaid: F.datetime,
                    datecod: F.datetime,
                    taxid: "PAYTM-" + paytmParams["TXNID"],
                    tag: "paid",
                    internal_type: "Order Placed",
                    paytm_downpayment: paytm_downpayment,
                    action_type: "bajaj_success_paytm_downpayment_done"
                }
            } else {
                obj = {
                    ispaid: true,
                    datepaid: F.datetime,
                    datecod: F.datetime,
                    taxid: "PAYTM-" + paytmParams["TXNID"],
                    tag: "paid",
                    internal_type: "Order Placed",
                    action_type: "paytm_done"
                }
            }
            nosql.update('order_update', 'orders').make(function (builder) {
                builder.set(obj);
                builder.where('id', order_id);
            });

            nosql.select('orders', 'orders').make(function (builder) {
                builder.where('id', order_id);
                builder.first();
            });

            nosql.exec(async function (err, response) {
                if (err) {
                    await saveOrderTransactionUpdate(order[1], "PAYTM-" + paytmParams["TXNID"], false);
                    return req.redirect('/checkout/' + order_id + '/#PAYMENT_FAILED');
                }
                await saveOrderTransactionUpdate(txn_id, "PAYTM-" + paytmParams["TXNID"], true);

                if (response.orders != null) {

                    var model = response.orders;
                    leadsModule.sendLeadOrderConfirm(model);

                    //self.redirect('/checkout/' + order_id + '/?paid=1');
                    req.redirect('/order/verification/' + order_id);
                    stockModule.OrderConfirm(order_id);


                    var order = response.orders;
                    shorturl.short('https://www.happimobiles.com/checkout/' + order_id, function (err, url) {
                        var message = `Thankyou for placing order in Happi Mobiles. Your order is underprocess for more information click ${url}`;
                        smsModule.sendSMS(order.phone, message);
                    });

                    var subject = '@(Order #) ' + order.id;


                    // self.layout('layout-new');
                    // self.view('order-payment-confirmation', order);

                    if (order.istwohrs) {
                        subject = subject + " - 2HRS";
                    }

                    if (order.ispickup) {
                        subject = subject + " - PICK_UP";
                    }

                    subject = subject + " - PAID ";
                    subject = subject + order_id;

                    //MAIL("happionlineorders@gmail.com", subject, '=?/mails/order-admin', model, model.language);
                    MAIL(model.email, '@(Order #) ' + model.id, '=?/mails/order', model, model.language);

                } else {
                    await saveOrderTransactionUpdate(txn_id, "", false);
                    return req.redirect('/checkout/' + order_id + '/#PAYMENT_FAILED');
                }
            })

        }
        else {
            await saveOrderTransactionUpdate(txn_id, "", false);
            console.log("PAYMENT FAILEDDDDDDDDDDDDDDDDDDDDD");
            req.redirect('/checkout/' + order_id + '/#PAYMENT_FAILED');
        }
    }
    else {
        await saveOrderTransactionUpdate(txn_id, "", false);
        console.log("PAYMENT FAILEDDDDDDDDDDDDDDDDDDDDD ===================");
        req.redirect('/checkout/' + order_id + '/#PAYMENT_FAILED');
    }
}



async function getTrasactionId(id, cb) {
    var nosql = new Agent();
    //console.log("id", id)
    nosql.select('getOrderTransaction', 'transaction_details').make(function (builder) {
        builder.where('orderid', id);
        builder.fields('transactionid');
        builder.sort('datecreated', 'desc')
        builder.first();
    });

    var orderTranscation = await nosql.promise('getOrderTransaction');
    console.log("orderTranscation", orderTranscation);
    cb(orderTranscation);
}

async function saveOrderTransactionUpdate(txnid, refid, status, statusCode = null) {
   // var JOB_ID = generateUuidModule.createUUID();
    var nosql = new Agent();
    console.log("txnid", txnid, "refid", refid, "status", status);
    var orderId = txnid.split("-");
    if (status == true) {
        console.log("PAYTM SUCCESS------------------------------");
        nosql.update('updateTransaction', 'transaction_details').make(function (builder) {
            builder.set("transaction_type", "paytm");
            builder.set("reference_id", refid);
            builder.set("isSuccess", true);
            builder.set('dateupdated', new Date());
            builder.where("transactionid", txnid);
        });
        // action_type:bajaj_emi_pass_downpay_pending  in order

    } else {
        console.log("PAYTM FAILLLLLLL--------------------------------");
        nosql.update('updateTransaction', 'transaction_details').make(function (builder) {
            builder.set("isSuccess", false);
            builder.set("transaction_type", "paytm");
            builder.set("reference_id", "");
            builder.set('dateupdated', new Date());
            builder.where("transactionid", txnid);
        });
        // add action_type in order 
        await updateOrderPaymentDetails(orderId[0], false)
    }


    var updateTransaction = await nosql.promise('updateTransaction');
    console.log("UPDATE PAYTM TRANSACTION DETAILS TRIGGERED ",  updateTransaction);
}

async function updateOrderPaymentDetails(orderId, status) {
    var nosql = new Agent();
    //var JOB_ID = generateUuidModule.createUUID();
    if (status == true) {
        nosql.update('updateTransaction', 'orders').make(function (builder) {
            builder.set("action_type", "null");
            builder.where("id", orderId);
        });
        // action_type:paytm_fail  in order
    } else {
        nosql.update('updateTransaction', 'orders').make(function (builder) {
            builder.set("action_type", "paytm_fail");
            builder.where("id", orderId);
        });
        // add action_type in order 
    }
    var updateTransaction = await nosql.promise('updateTransaction');
    console.log("UPDATE  PAYTM  ORDER DETAILS TRIGGERED ",  updateTransaction);
}


module.exports.paytm_init = paytm_init;
module.exports.paytm_verify = paytm_verify;