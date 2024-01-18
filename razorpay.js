const serverless = require('serverless-http');
const express = require('express')
const app = express();
const { v4: uuidv4 } = require('uuid');
var cors = require('cors')


app.use(cors())
//jsonparser
app.use(express.json());


//mongo_db connection
var MONGO_DB_CONNECTION = process.env.MONGO_DB_CONNECTION || 'mongodb+srv://sowmya:iNNrxOhVfEdvsUaI@happinewsls.cnw2n.mongodb.net/happi-new-sls?replicaSet=atlas-11ilgn-shard-0&readPreference=primary&connectTimeoutMS=10000&authSource=admin&authMechanism=SCRAM-SHA-1';

// short url import
var shorturl = require('node-url-shortener');

var Razorpay = require('razorpay');

var RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_M6ghlzmrr7dlmE';
var RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'nLARH31qtNCPMVkgL7usJWTe';

var instance = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
});


app.post('/order/razorpay/', async (req, res) => {

    var form = req.body;

    var nosql = new Agent();

    nosql.select('orders', 'orders').make(function (builder) {
        builder.where('id', form.order_id)
        builder.first()
    })

    var order = await nosql.promise('orders');

    if (order == null) {
        res.json({ status: false, message: "Invalid order_id" });
    }

    await instance.orders.create({
        amount: order.price * 100,
        currency: "INR",
        receipt: order.id,
        payment_capture: false,
        notes: {}
    }).then(async (result) => {
        //output = result;
        res.json(result);
    })

});

app.post('/order/razorpay-return', async (req, res) => {

   var data = req.body;
    console.log("data",data);

    let payment = await instance.payments.fetch(data.razorpay_payment_id);
    console.log("payment", payment)

    var obj = {
        ispaid: true,
        datepaid: F.datetime,
        datecod: F.datetime,
        taxid: "RPAY-" + data.razorpay_payment_id,
        tag: "paid",
        internal_type: "Order Placed",
        action_type: "rpay_done"
    }

    var nosql = new Agent();
    nosql.select('getOrder', 'orders').make(function (builder) {
        builder.where('id', data.order_id);
        builder.first();
    });

    var order = await nosql.promise('getOrder');

    nosql.update('order_update', 'orders').make(function (builder) {
        builder.set(obj);
        builder.where('id', data.order_id);
    });

    await nosql.promise('order_update');
    shorturl.short('https://www.happimobiles.com/checkout/' + data.order_id, function (err, url) {
        // var message = `Thankyou for placing order in Happi Mobiles. Your order is underprocess for more information click ${url}`;
        // smsModule.sendSMS(order.phone, message);
    });
    res.json({ status: true });

  
});


module.exports=app;


