const serverless = require("serverless-http");
const express = require("express");
var cors = require("cors");
const app = express();
var axios = require("axios");
var shorturl = require('node-url-shortener');

const qs = require("querystring");
var mongo = require("./db");
const { Console } = require("console");
const TBL_ORDER = "orders-v3";

app.options("*", cors()); // include before other routes

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }))


app.get('/api/orders', async (req, res) => {

    var db = await mongo.connect();
    let orderTbl = db.collection(TBL_ORDER);

    if (req.query.phone) {
        var orders = await orderTbl.find({ "userInfo.phone": req.query.phone }).sort({ createdOn: -1 }).toArray();
        for (let i = 0; i < orders.length; i++) {
            if (orders[i].payment_info != null) {
                // orders[i].payment_info = JSON.parse(orders[i].payment_info) || ;
            }
            
            orders[i].ordercreatedOn = orders[i].createdOn.toString().split("GMT")[0];
        }
        res.json(orders);
        return;
    };
    res.json([]);
});

app.get('/api/orders/:orderId', async (req, res) => {

    if (req.params.orderId) {
        var db = await mongo.connect();
        let orderTbl = db.collection(TBL_ORDER);

        var order = await orderTbl.findOne({ "order_id": req.params.orderId });

        return res.json({ state: true, data: order });
    }
    return res.json({ state: false })
})



app.post('/api/orders/notify', async (req, res) => {

    // console.log("------------------------", req.body);



    // let db = await mongo.connect();
    // let orderTbl = db.collection(TBL_ORDER);

    var message = null;

    if (req.body.status === "Cancel") {
        message = `Thankyou for placing order in Happi Mobiles. Your order is canceled for more information click`;
    }

    if (req.body.status === "Sent") {
        message = `Thankyou for placing order in Happi Mobiles. Your order is out for delivery for more information click`;
    }

    if (req.body.status === "Finished") {
        message = `Thankyou for placing order in Happi Mobiles. Your order is Finished for more information click`;
    }

    if (req.body.status === "Hold") {
        message = `Thankyou for placing order in Happi Mobiles. Your order is On hold for more information click`;
    }

    if (req.body.status === "Accepted") {
        message = `Thankyou for placing order in Happi Mobiles. Your order is accepted for more information click`;
    }

    if (message == null) {
        message = `Thankyou for placing order in Happi Mobiles. Your order is underprocess for more information click`;
        //return;
    }


    try {

        var shorturldata = JSON.stringify({
            "longDynamicLink": "https://s.happimobiles.com/?link=https://www.happimobiles.com/account/order-detail?id=" + req.body.order_id,
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

        console.log("shorturl",shorturl_response.data.shortLink);

        
        message = message + " " + shorturl_response.data.shortLink;

        console.log(message);

        var SMS_config = {
            method: 'get',
            url: `http://www.mobiglitz.com/vb/apikey.php?apikey=ehYw60GDMkBW4pqc&senderid=MHAPPI&number=91${req.body.phone}&message=${encodeURI(message)}`,
            headers: { }
          };

       

        var resp = await axios(SMS_config);
        console.log("happimobiles-sms---", resp.data);
        return res.json({
            state: true
        });







        // shorturl.short('https://www.happimobiles.com/account/order-detail/?id=' + req.body.order_id, async function (err, url) {
        //     message = message + " " + url;
        //     console.log("message", message);
        //     var options = {
        //         'method': 'POST',
        //         'url': `http://api.smscountry.com/SMSCwebservice_bulk.aspx?User=happi9&passwd=Happi@12345&mobilenumber=91${req.body.phone}&message=${encodeURI(message)}&sid=MHAPPI&mtype=N&DR=Y`,
        //         'headers': {
        //             'Content-Type': 'application/json'
        //         }
        //     };



        //     var resp = await axios(options);
        //     console.log("happimobiles-sms---", resp)
        //     return res.json({
        //         state: true
        //     });
        // });
    }
    catch (error) {
        console.log(error);
    }


})

//hitting Order SMS LINK



app.get('/api/orders/orderDetailsWithOrderID',async (req,res)=>{
    try{
        console.log("SBhvgvaDcjhsdvgusdvguds")
        var db = await mongo.connect();
        let orderTbl = db.collection(TBL_ORDER);
        let orderDetails = await orderTbl.find({"order_id":req.query.order_id});
        console.log(`${'/api/orders/orderDetailsWithOrderID'}---------query:${req.query.order_id}`)
        return res.json({
            status:true,
            message:"Z;xlkvnbilzshbv ihfdbi",
            data:orderDetails
        })

    }
    catch(error){
        console.log(error);
        return res.json({
            status:false,
            message:'error'
        })

    }
})

module.exports=app;


//     "telegram-bot-api": "^2.0.1",
//     "pageres": "^6.2.3",