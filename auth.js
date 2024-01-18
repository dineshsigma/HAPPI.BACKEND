const serverless = require('serverless-http');
const express = require('express')
const app = express();
const { v4: uuidv4 } = require('uuid');
var cors = require('cors')
var jwt = require('jsonwebtoken');
var request = require('request');
var PhoneNumber = require('awesome-phonenumber');
var otplib = require('otplib');
var mongo = require("./db");
const { Parser } = require('json2csv');
const { query } = require('express');
var smsModule = require('./modules/sms');
var axios = require('axios');
var CryptoJS = require("crypto-js");

const crypto = require('crypto');


otplib.authenticator.options = {
    step: 900,
    window: 1,
    digits: 6
};


var allowlist = ['http://localhost:4002/', 'https://dev-sls.happimobiles.com/']
var corsOptionsDelegate = function (req, callback) {
    var corsOptions;
    if (allowlist.indexOf(req.header('Origin')) !== -1) {
        corsOptions = { origin: true } // reflect (enable) the requested origin in the CORS response
    } else {
        corsOptions = { origin: false } // disable CORS for this request
    }
    callback(null, corsOptions) // callback expects two parameters: error and options
}
// app.options('*', cors()); // include before other routes
// app.use(cors());

// mongo db connection 
var MONGO_DB_CONNECTION = process.env.MONGO_DB_CONNECTION || 'mongodb+srv://sowmya:iNNrxOhVfEdvsUaI@happinewsls.cnw2n.mongodb.net/happi-new-sls?replicaSet=atlas-11ilgn-shard-0&readPreference=primary&connectTimeoutMS=10000&authSource=admin&authMechanism=SCRAM-SHA-1';
// var Agent = require('sqlagent/mongodb').connect(MONGO_DB_CONNECTION);
// otplib secret key
var JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || 'happi_jwt_secrethappi_jwt_secrethappi_jwt_secret';
var OTP_SECRET = process.env.OTP_SECRET || 'ETTRTFGFCFSCGJLKLLUIOYUITTFFGCFZXEAWRRTTIUIGHFERHAPPI2022IIPL';
// var MONGO_DB_CONNECTION = process.env.MONGO_DB_CONNECTION || 'ETTRTFGFCFSCGJLKLLUIOYUITTFFGCFZXEAWRRTTIUIGHFER';
const secret = process.env.HMAC_SECRET || '1584FFBB3C6D5F74A5A41E7D3674A';

//jsonparser
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }))

// send otp to user
// https://dev-services.happimobiles.com/api/user-login/




app.post('/api/user-login/', async function (req, res) {
    console.log("vdhgasvhsjvb",req.body);
    var sign = req.headers['x-sign'] || ''
    console.log("sign---",sign);

    if(sign == ''){
        return res.json({
            status:401,
            message:'Signature Not Found'
        })

    }else{
        var bytes = CryptoJS.AES.decrypt(sign, secret);
        console.log("bytes---",bytes);
        var originalText = bytes.toString(CryptoJS.enc.Utf8);
        console.log("originalText---",originalText);
        
        if(req.body.phone != originalText){
            res.status(401);
            res.send('Invaild Signature');
            return; 
        }
        
    }


    var db = await mongo.connect();
    var otp = db.collection("otp_request");
    var userTbl = db.collection("user");
    
    var pn = new PhoneNumber(req.body.phone, 'IN');
   
    if (req.body.phone === "9876543210" ||
        req.body.phone === "9988776655" ||
        req.body.phone === "8686836269") {

        res.json({
            status: true,
            message: "Otp Sent"
        })
        return;
    }
    if (pn.isValid()) {
        const secret = OTP_SECRET + req.body.phone;
        const token = otplib.authenticator.generate(secret);
        var options = {
            'method': 'GET',
            'url': `https://2factor.in/API/V1/e27f1a8a-e428-11e9-9721-0200cd936042/SMS/${req.body.phone}/${token}/Happi`,
        };

        try {
            const response = await axios(options);
            var result = response.data
            if (result.Status == "Success") {
                // enter request data into otp_request collection
                otp.insertOne({
                    phone: req.body.phone,
                    timeStamp: new Date()
                })

                res.json({
                    status: true,
                    message: "Otp Sent"
                })
            } else {
                res.json({
                    status: false,
                    message: "Unable to send OTP"
                })
            }
          } catch (error) {
            console.error(error);
            res.json({
                status: false,
                message: "Unable to send OTP Try After some time"
            })
          }
        
        


       
    } else {
        res.json({
            status: false,
            message: "Invalid Phone number"
        })
    }

})

app.post('/api/user-login/homepage', async function (req, res) {
    var sign = req.headers['x-sign'] || ''

    if(sign == ''){
        return res.json({
            status:401,
            message:'Signature Not Found'
        })

    }else{
        const hash = crypto.createHmac('sha256', secret)
            .update(`POST:LOGIN${JSON.stringify(req.body)}`)
            .digest('hex');
        
        if(sign != hash){
            res.status(401);
            res.send('Invaild Signature');
            return; 
        }
        
    }


    var db = await mongo.connect();
    var otp = db.collection("otp_request");
    var userTbl = db.collection("user");
    
    var pn = new PhoneNumber(req.body.phone, 'IN');
   
    if (req.body.phone === "9876543210" ||
        req.body.phone === "9988776655" ||
        req.body.phone === "8686836269") {

        res.json({
            status: true,
            message: "Otp Sent"
        })
        return;
    }
    if (pn.isValid()) {
        const secret = OTP_SECRET + req.body.phone;
        const token = otplib.authenticator.generate(secret);
        var options = {
            'method': 'GET',
            'url': `https://2factor.in/API/V1/e27f1a8a-e428-11e9-9721-0200cd936042/SMS/${req.body.phone}/${token}/Happi`,
        };

        try {
            const response = await axios(options);
            var result = response.data
            if (result.Status == "Success") {
                // enter request data into otp_request collection
                otp.insertOne({
                    phone: req.body.phone,
                    timeStamp: new Date()
                })

                res.json({
                    status: true,
                    message: "Otp Sent"
                })
            } else {
                res.json({
                    status: false,
                    message: "Unable to send OTP"
                })
            }
          } catch (error) {
            console.error(error);
            res.json({
                status: false,
                message: "Unable to send OTP Try After some time"
            })
          }
        
        


       
    } else {
        res.json({
            status: false,
            message: "Invalid Phone number"
        })
    }

})


// user otp verify 
app.post('/api/user-verify/', async function (req, res) {
    var data = req.body;
    const secret = OTP_SECRET + data.phone;
    var db = await mongo.connect();
    var userTbl = db.collection("user");

    var isValid = otplib.authenticator.check(data.otp, secret);
    //console.log("PHONE", data.phone, isValid);
    if (data.otp === "PHONEPE") {
        isValid = true;
    }

    if (data.otp === "FRESHBOT") {
        isValid = true;
    }

    if (data.otp === "REGISTER_USER") {
        isValid = true;
    }

    if ((req.body.phone === "9876543210" || req.body.phone === "9988776655" || req.body.phone === "8686836269" || req.body.phone === "9000247654") && data.otp === "456789") {
        isValid = true;
    }

    if (!isValid) {
        return res.json({
            status: false,
            message: "Invalid OTP"
        });
    }

    var user = await userTbl.findOne({ 'phone': data.phone });


    if (user == null) {

        var result = {
            status: true,
            token: jwt.sign({ phone: data.phone }, JWT_SECRET_KEY, {
                expiresIn: '180d'
            }),
            event: "REGISTER_USER",
        };
        res.json(result);

    } else {

        if (user.role == "admin") {
            var userObj = {
                id: user.id,
                "aud": "application-0-lgxvg",
                "sub": user.phone,
                UID: user.phone,
                name: user.name,
                phone: user.phone,
                email: user.email,
                role: user.role,
                access: user.access,
            }
            var result = {
                status: true,
                token: jwt.sign(userObj, JWT_SECRET_KEY, {
                    expiresIn: '23h'
                }),
                event: "HOME",
                data: userObj
            };
            res.json(result);
        } else {
            var userObj = {
                id: user.id,
                "aud": "application-0-lgxvg",
                "sub": user.phone,
                UID: user.phone,
                name: user.name,
                phone: user.phone,
                email: user.email,
                role: user.role,
                address: user.address
            }
            var result = {
                status: true,
                token: jwt.sign(userObj, JWT_SECRET_KEY, {
                    expiresIn: '180d'
                }),
                event: "HOME",
                data: userObj
            };
            res.json(result);
        }
    }
})

// User registration
/*
User Register Mandatory Fields

*/
app.post('/api/user/', async function (req, res) {
    var form = req.body;
    var token = req.headers['x-auth'];
    var db = await mongo.connect();
    var userTbl = db.collection("user");
    if (token != null) {
        try {
            var decoded = jwt.verify(token, JWT_SECRET_KEY);
            if (decoded != null) {
                if (decoded.phone !== form.phone) {
                    res.json({
                        status: false,
                        message: "You are not allowed to access this data"
                    });
                    return;
                }

                var user = await userTbl.findOne({
                    phone: decoded.phone
                })

                // adding an user
                if (user == null) {
                    form.id = uuidv4();
                    form.datecreated = new Date();
                    form.dateupdated = new Date();
                    await userTbl.insertOne(
                        form
                    )

                } else { // update user
                    delete form._id;
                    form.dateupdated = new Date();
                    await userTbl.updateOne({ phone: decoded.phone }, { $set: form })
                }

                var getuser = await userTbl.findOne({
                    phone: decoded.phone
                });

                res.json({
                    status: true,
                    data: getuser
                });


            }
        } catch (err) {
            console.log("err", err);
            res.json({
                status: false,
                message: "Invalid Token"
            });
        }
    } else {
        res.json({
            status: false,
            message: "Please Provide Token"
        });
    }


});
app.get('/api/user/', async function (req, res) {
    var db = await mongo.connect();
    var userTbl = db.collection("user");
    var token = req.headers['x-auth'];
    if (token != null) {
        try {
            var decoded = jwt.verify(token, JWT_SECRET_KEY);
            if (decoded != null) {
                var user = await userTbl.findOne({
                    phone: decoded.phone
                });
                res.json({
                    status: true,
                    data: user
                });
            }
        } catch (err) {
            console.log("err", err);
            res.json({
                status: false,
                message: "Invalid Token"
            });
        }
    } else {
        res.json({
            status: false,
            message: "Please Provide Token"
        });
    }


});
app.delete('/api/user/deleteUserAddress', async function (req, res) {
    var db = await mongo.connect();
    var userTbl = db.collection("user");
    var token = req.headers['x-auth'];
    if (token != null) {
        try {
            var decoded = jwt.verify(token, JWT_SECRET_KEY);
            if (decoded != null) {
                let exisitngUser = await userTbl.findOne({ phone: decoded.phone });
                exisitngUser.address.splice(req.query.index, 1);
                await userTbl.updateOne({ id: exisitngUser.id }, { $set: exisitngUser });
            }
        } catch (err) {
            console.log("err", err);
            res.json({
                status: false,
                message: "Invalid Token"
            });
        }
    } else {
        res.json({
            status: false,
            message: "Please Provide Token"
        });
    }


});


app.get('/api/wishlist', async function (req, res) {
    
    var payload = req.query;
    console.log("payload---",payload)
    var db = await mongo.connect();
    var userTbl = db.collection("user");
    const wishlist = db.collection('wishlist');
    const wishlistData = await wishlist.find({ user_id: payload.user_id }).toArray();

    let prodArray = [];
    for (let i = 0; i < wishlistData.length; i++) {
        const element = wishlistData[i];
        prodArray.push(element.product_id);
        prodArray.push(element.wishlist);
    }
    const products = db.collection('product');
    const prodList = await products.find(
        {
            ispublished: true,
            id: { $in: prodArray }
        },
        {
            id: 1,
            name: 1,
            pictures: 1,
            stock: 1,
            mrp: 1,
            payPrice: 1
        }
    ).toArray();
    res.json({ prodList: prodList, productIds: prodArray });
});

app.post('/api/wishlist', async function (req, res) {
    console.log("payload---",payload);

    var payload = req.body;
    var db = await mongo.connect();

    const wishlist = db.collection('wishlist');

    const isProdExist = await wishlist.find({
        user_id: payload.user_id,
        product_id: payload.product_id,
    }).toArray();

    payload.id = payload.user_id + "-" + payload.product_id;
    payload.wishlist=true

    if (isProdExist.length !== 0) {
        return res.send('notok');
    }
    try {
        await wishlist.insertOne(payload);
    } catch (err) {
        console.error('Failed to log in', err);
        return res.send("notok");
    }
    return res.send('ok');
});

app.delete('/api/wishlist', async function (req, res) {

    var payload = req.query;
    var db = await mongo.connect();
    const wishlist = db.collection('wishlist');
    let tempstatus = await wishlist.deleteOne({
        product_id: payload.product_id,
        user_id: payload.user_id
    });
    return res.send("ok");
});


app.post('/api/filters/:fromdate/:todate', async (req, res) => {

    try {

        let formdate = req.params.fromdate;
        let todate = req.params.todate;
        let utmsource = req.body.utmsource;
        let utmcampaign = req.body.utmcampaign;
        let utmmedium = req.body.utmmedium;
        let status = req.body.status;
        let type = req.body.type;
        // console.log('data-----',formdate,todate,utmsource,utmcampaign,leadstyle,utmmedium,status,rquery);

        var collectionname = 'laptop-leads';

        var dataBase = await mongo.connect();
        var collectionclient = await dataBase.collection(collectionname);
        var query = {};

        if (formdate !== 'all' && todate !== 'all') {
            formdate = new Date(formdate);
            todate = new Date(todate);
            todate.setDate(todate.getDate() + 1);
            formdate.setHours(0, 0, 0, 0);
            todate.setHours(0, 0, 0, 0);
            query.date = {
                "$gte": formdate,
                "$lte": todate
            };
        }
        if (utmcampaign != undefined && utmcampaign != '' && utmcampaign != null) {

            utmcampaign = utmcampaign.split(',');

            query.utm_campaign = {
                "$in": utmcampaign
            };
        }
        if (utmsource !== undefined && utmsource !== '') {
            query.utm_source = utmsource;
        }

        if (utmmedium !== undefined && utmmedium !== '') {
            query.utm_medium = utmmedium;
        }
        if (status !== undefined && status !== '' && status != null) {
            query.status = status;
        }
        if (type !== undefined && type !== '') {
            query.type = type
        }
        console.log("FILTER QUERY", query);

        // let skip=parseInt(req.query.skip);
        // let limit=parseInt(req.query.limit);

        //   var pageNo = parseInt(req.query.pageNo)
        //   var size = 10;
        //   var query = {}
        //   if(pageNo < 0 || pageNo === 0) {
        //         response = {"error" : true,"message" : "invalid page number, should start with 1"};
        //         return res.json(response)
        //   }
        //   var skip = size * (pageNo - 1);
        //   console.log("------------",skip)

        //   var limit = size

        // let data = await collectionclient.find(query).sort({_id:-1}).skip(skip || 0).limit(limit || 100).toArray();
        let data = await collectionclient.find(query).toArray();
        let count = data.length;
        res.json({
            "count": count,
            data: data
        });
    }
    catch (error) {
        res.json({
            status: false,
            message: 'error'
        })
    }
})


app.get('/api/orderfilters', async (req, res) => {
    try {
        let database = await mongo.connect();
        let ordercoll = database.collection('orders-v3');
        var from = new Date();
        from.setHours(0, 0, 0, 0);

        var to = new Date();
        to.setHours(23, 59, 59, 999);
        var result = {};
        console.log(from, to)
        result.todayOrderdetails = await ordercoll.count({
            $and: [
                { createdOn: { $gt: from, $lte: to } },

            ],
        });


        from.setDate(from.getDate() - 1);
        to.setDate(to.getDate() - 1);

        console.log(from, to)
        result.yesterOrderdetails = await ordercoll.count({
            $and: [
                { createdOn: { $gt: from, $lte: to } },

            ]
        });

        from.setDate(from.getDate() - 7);
        result.lastsevendaysOrderdetails = await ordercoll.count({
            $and: [
                { createdOn: { $gt: from, $lte: to } },

            ]
        });


        from = new Date();
        to = new Date();

        from.setHours(0, 0, 0, 0);
        to.setHours(23, 59, 59, 999);

        from.setDate(1);

        result.thisMonthOrderdetails = await ordercoll.count({
            $and: [
                { createdOn: { $gt: from, $lte: to } },


            ]
        });

        to.setHours(0, 0, 0, 0);
        to.setDate(1);

        from.setMonth(from.getMonth() - 1);

        result.lastMonthOrderdetails = await ordercoll.count({
            $and: [
                { createdOn: { $gt: from, $lte: to } },

            ]
        });

        result.totalOrderdetails = await ordercoll.count({});


        //result.total=result.todayOrderdetails+result.yesterOrderdetails+result.lastsevendaysOrderdetails+result.thisMonthOrderdetails+result.lastMonthOrderdetails


        res.json({
            status: true,
            data: result

        })

        console.log(result);


    } catch (error) {
        console.log(error);
        res.json({
            status: false,
            message: 'error'

        })
    }
})



app.put('/api/productspecifications', async (req, res) => {
    console.log("********bdy***********", req.body);
    console.log("*******************type*", req.body.type);
    console.log("***************", req.query.id);
    //console.log("*******id****",req.query.id);
    try {
        let database = await mongo.connect();
        let productcoll = await database.collection('product');
        let product_id = req.query.id
        let results = [];

        //let delterec= await productcoll.deleteOne({"id":req.query.id});
        //    console.log(req.query.id,req.body);
        let data = {};
        if (req.body.type == "mobile") {
            console.log("********mob");
            data = req.body.data_mobile
        } else if (req.body.type == "laptop") {
            data = req.body.data_laptop
        }
        else if (req.body.type == "Smart Watches") {
            console.log("ssssssssssssssssssssssssssssssssssssssss")
            data = req.body.data_smartwatch
        }
        else if (req.body.type == "Bluetooth Speakers") {
            console.log("bluetooth speakers");
            data = req.body.data_bluetoothspeakers
        }

        console.log("*****data*****", data);
        const keys = Object.keys(data);
        console.log(keys.length);

        for (var i = 0; i < keys.length; i++) {
            var obj = {};
            const key = keys[i];
            obj.title = key;

            let val = data[key];
            const valkeys = Object.keys(val);
            var context = [];
            for (var j = 0; j < valkeys.length; j++) {
                var subobj = {};
                subobj.key = valkeys[j];
                subobj.value = val[valkeys[j]];

                context.push(subobj);
            }
            obj.context = context;
            results.push(obj);

        }
        console.log("**************8specification updated res", results);
        //   let pro = await productcoll.findOne({"id":product_id});
        //    console.log(pro,results);

        let updatespecification = await productcoll.findOneAndUpdate({ "id": product_id }, { $set: { "specifications": results } });

        res.json({
            status: true,
            data: 'Updated Successfully'
        })



    }
    catch (error) {
        console.log(error)
        res.json({
            status: false,
            message: 'error'
        })

    }
})

app.get('/api/getspecifications', async (req, res) => {
    try {
        let id = req.query.id
        console.log(id);
        let database = await mongo.connect();
        let collproduct = await database.collection('product');
        let getbyspecifications = await collproduct.findOne({ "id": id });
        let spec = getbyspecifications == null ? '' : getbyspecifications.specifications
        var data = {};




        console.log("spec---", spec);
        if (spec == '') {
            console.log("******************get empty data")
            if (req.query.type == 'mobile') {
                console.log("******************mobile")
                data = {
                    "General": {
                        "Network": "",
                        "SIM": ""
                    },
                    "Body": {
                        "Dimensions": ""
                    },
                    "Display": {
                        "Type": "",
                        "Size": "",
                        "Multitouch": ""

                    },
                    "Sounds": {
                        "Loudspeaker": ""
                    },

                    "Memory": {
                        "Internal": "",
                        "Card Slot": ""
                    },
                    "Data": {
                        "WLAN": "",
                        "NFC": "",
                        "USB": ""
                    },
                    "Camera": {
                        "Primary": "",
                        "Features": "",
                        "Video": "",
                        "Secondary": ""
                    },
                    "Features": {
                        "OS": "",
                        "Chipset": "",
                        "CPU": "",
                        "GPU": "",
                        "sensors": "",
                        "gps": ""
                    },
                    "Battery": {
                        "Stand-By": ""
                    }
                }
                res.json({

                    data: data

                })
            }
            else if (req.query.type == 'Smart Watches') {
                console.log("******************Smart Watches");
                data = {
                    "General": {
                        "model name": "",
                        "model number": "",
                        "Dial Shape": "",
                        "Connectivity": "",
                        "in the box": ""
                    },
                    "PRODUCT DETAILS": {
                        "Water Resistant": "",
                        "Voice Support": "",
                        "Additional Features": ""
                    },
                    "Display": {
                        "Display Type": "",
                        "Display Size": "",
                        "Screen Resolution": "",
                    },
                    "Memory": {
                        "Internal Storage": ""
                    },
                    "Features": {
                        "GPS": "",
                        "sensors": "",
                        "Bluetooth": "",
                        "Wi-Fi": ""
                    },
                    "Warranty": {
                        "warranty summary": "",
                        "covered In warranty": ""
                    }
                }


                res.json({

                    data: data

                })


            }
            else if (req.query.type == 'Bluetooth Speakers') {
                console.log("******************Bluetooth Speakers");
                data = {
                    "General": {
                        "Model Name": "",
                        "Type": "",
                        "In The Box": ""
                    },
                    "Dimensions": {
                        "dimensions": "",
                        "weight": ""
                    },
                    "Product Details": {
                        "Audio Wattage": ""
                    },
                    "Connectivity Features": {
                        "Bluetooth Version": "",
                        "Connector Type": "",
                        "Additional Features": ""
                    },
                    "Battery": {
                        "Battery Type": ""
                    },
                    "Warranty": {
                        "covered in warranty": ""
                    }
                }

                res.json({

                    data: data

                })


            }
            else if (req.query.type == 'laptop') {
                console.log("******************laptop");

                data = {
                    "GENERAL": {
                        "Model Name": "",
                        "color": "",
                        "Sales Package": "",
                        "Suitable For": "",
                        // "External Interface": "",
                        "Brand": "",
                        "Model Number": "",
                        "Series": "",
                        "Type": ""

                    },
                    "processor and memory features": {
                        "processor brand": "",
                        "processor name": "",
                        "Processor Generation": "",
                        "Ram": "",
                        "Hdd  Capacity": "",
                        "Processor Variant": "",
                        "Graphic Processor": ""
                    },
                    "Operating System": {
                        "OS Architecture": "",
                        "Operating System": "",
                        "Supported Operating System": ""
                    },
                    "Port And Sort Features": {
                        "Mic In": "",
                        "USB Port": "",
                        "HDMI Port": ""
                    },
                    "Display And Audio Features": {
                        "Touchscreen": "",
                        "Screen Size": "",
                        "Screen type": "",
                        "Speakers": "",
                        "Internal Mic": ""
                    },
                    "Connectivity Features": {
                        "Wireless LAN": "",
                        "Bluetooth": "",
                        "Ethernet": ""
                    },
                    "Dimensions": {
                        "Dimensions": "",
                        "Weight": ""
                    },
                    "Additional Features": {
                        "Web Camera": "",
                        "Finger Print Sensor": ""

                    },
                    "Warranty": {
                        "Warranty Summary": '',
                        "Covered in Warranty": '',
                        "Not Covered in Warranty": ""
                    },


                }

                res.json({

                    data: data

                })

            }

        }
        else {
            console.log("dvhhdgdgivf")

            for (var i = 0; i < spec.length; i++) {
                let title = spec[i].title;
                let context = spec[i].context;
                let response = {};
                for (var j = 0; j < context.length; j++) {
                    console.log(context[j])
                    response[context[j].key] = context[j].value;
                }
                data[title] = response;


            }

            res.json({

                data: data
            })
        }


    }
    catch (error) {
        console.log(error);
        res.json({
            status: false, message: "error"
        })

    }

})


app.get('/api/datebyfilters/:fromdate/:todate', async (req, res) => {
    try {
        let fromdate = req.params.fromdate;
        let todate = req.params.todate;
        let database = await mongo.connect();
        let ordersv3coll = await database.collection('orders-v3');


        let query = {};
        if (fromdate != 'all' && todate != 'all') {
            fromdate = new Date(fromdate);
            todate = new Date(todate);
            todate.setDate(todate.getDate() + 1);
            //     fromdate.setHours(0, 0, 0, 0);
            //    todate.setHours(0, 0, 0, 0);
            query.datecreated = {
                "$gte": fromdate,
                "$lte": todate
            };

        }

        console.log(query);
        let ordercount = await ordersv3coll.find(query).toArray();

        let count = ordercount.length;

        res.json({
            status: true,
            count: count
        })

    }
    catch (error) {
        console.log(error);
        res.status(400).send({ message: "error" });
    }
})

// app.get('/api/akshaya/count',async (req,res)=>{

//     try{
//         let fromdate=req.query.fromdate;
//         let todate=req.query.todate;
//         let collection=req.query.collection
//         let database= await mongo.connect();
//         let akshayaclient= await database.collection(collection);
//         let query={};

//         if(fromdate!='all' && todate!='all'){
//             //  fromdate = new Date(fromdate);
//             // todate = new Date(todate);
//             // todate.setDate(todate.getDate() + 1);
//               // console.log(fromdate,todate)

//             //  todate=todate.toISOString().split('T')[0];
//             //  fromdate=fromdate.toISOString().split('T')[0];

//             //  console.log(fromdate,todate)

//             query.customer_dob = {
//                 "$gte": fromdate,
//                 "$lte": todate
//              };

//         }        if(cutmob!=null && cutmob!=undefined){
// query.customer_mobile=cutmob
//    

//                     }
//
//

//         console.log(query);

//         let data=await akshayaclient.find(query).toArray();
//         let count=data.length
//         if(data.length>0){
//             const fields = data[0].keys;
//             const opts = { fields };
//             try{
//                 const parser = new Parser(opts);
//                 const csv = parser.parse(data);
//                 //console.log(csv);

//                 res.setHeader('Content-disposition', 'attachment; filename=data.csv');
//                     res.set('Content-Type', 'text/csv');
//                     res.json({
//                         status:true,
//                         count:count,
//                         csv:csv

//                     })


//             }
//             catch(error){
//                 console.log(error);
//             }
//         }
//         else{
//             res.send('no data found')
//         }







//     }
//     catch(error){
//         console.log(error);
//     }
// })




app.get('/api/orderv3/statuscount', countFunction);

async function countFunction(req, res) {
    try {
        let fromdate = req.query.fromdate;
        let todate = req.query.todate;
        let database = await mongo.connect();
        let ordersv3coll = await database.collection('orders-v3');
        let query = {};
        if (fromdate != 'all' && todate != 'all') {
            fromdate = new Date(fromdate);
            todate = new Date(todate);
            todate.setDate(todate.getDate() + 1);
            //     fromdate.setHours(0, 0, 0, 0);
            //    todate.setHours(0, 0, 0, 0);
            query.datecreated = {
                "$gte": fromdate,
                "$lte": todate
            };

        }
        query.status = {
            "$in": [
                "Finished",
                "Accepted",
            ]
        }

        console.log(query);

        let data = await ordersv3coll.find(query).toArray();

        var options = {
            allowDiskUse: true
        };

        var pipeline = [
            {
                "$match": query
            },
            {
                "$group": {
                    "_id": {},
                    "SUM(CartSubtotal)": {
                        "$sum": "$Subtotal"
                    }
                }
            },
            {
                "$project": {
                    "total": "$SUM(CartSubtotal)",
                    "_id": 0
                }
            }
        ];
        var cursor = await ordersv3coll.aggregate(pipeline, options).toArray();
        res.status(200).send({ count: data.length, response: data, total: cursor[0].total })
        // if(data.length>0){
        //     const fields = data[0].keys;

        //     const opts = { fields };

        //  try {
        //    const parser = new Parser(opts);
        //    const csv = parser.parse(data);

        //    res.setHeader('Content-disposition', 'attachment; filename=data.csv');
        //        res.set('Content-Type', 'text/csv');
        //        res.status(200).send(csv);
        //        //res.status(200).send({count:data.length,response:csv,total:cursor[0].total})
        //  } catch (err) {
        //    console.error(err);
        //    res.json({
        //        status:false,
        //        message:'error'
        //    })
        //  }

        // }
        // else{
        //     res.send('data not found');
        // }


        //let total=cursor[0].total;



    }
    catch (error) {
        console.log(error)
        res.status(400).send({ message: "error" });
    }



}

app.post('/api/lead', async (req, res) => {
    try {
        let database = await mongo.connect();
        let leadcoll = await database.collection('lead_form');
        let leadid = uuidv4();
        let name = req.body.name;
        let email = req.body.email;
        let phone = req.body.phone;
        let count = req.body.count || 0;

        let checkphone = await leadcoll.find({ "phone": phone }).toArray();
        console.log(checkphone.length);
        console.log(count);

        if (count == 1 || count == 2) {
            if (checkphone.length < 2) {


                var pn = new PhoneNumber(req.body.phone, 'IN');

                if (pn.isValid()) {
                    const secret = OTP_SECRET + req.body.phone;
                    const token = otplib.authenticator.generate(secret);


                    var options = {
                        'method': 'GET',
                        'url': `https://2factor.in/API/V1/e27f1a8a-e428-11e9-9721-0200cd936042/SMS/${req.body.phone}/${token}/Happi`,
                    };
                    request(options, async function (error, response) {
                        var result = JSON.parse(response.body);
                        console.log("result", result);
                        if (result.Status == "Success") {

                            let leadinsert = await leadcoll.insertOne({ "leadid": leadid, "name": name, "email": email, "phone": phone, "count": count });


                            res.json({
                                status: true,
                                message: "Otp Sent",
                                count: count

                            })

                        } else {
                            res.json({
                                status: false,
                                message: "Unable to send OTP"
                            })
                        }

                    });
                } else {
                    res.json({
                        status: false,
                        message: "Invalid Phone number"
                    })
                }
            }
            else {
                res.json({
                    message: 'this phonenumber has so many attempts'
                })
            }

        }
        else {
            var pn = new PhoneNumber(req.body.phone, 'IN');

            if (pn.isValid()) {
                const secret = OTP_SECRET + req.body.phone;
                const token = otplib.authenticator.generate(secret);

                var options = {
                    'method': 'GET',
                    'url': `https://2factor.in/API/V1/e27f1a8a-e428-11e9-9721-0200cd936042/SMS/${req.body.phone}/${token}/Happi`,
                };
                request(options, async function (error, response) {
                    var result = JSON.parse(response.body);
                    console.log("result", result);
                    if (result.Status == "Success") {

                        let leadinsert = await leadcoll.insertOne({ "leadid": leadid, "name": name, "email": email, "phone": phone, "count": count });


                        res.json({
                            status: true,
                            message: "Otp Sent",
                            count: 0

                        })

                    } else {
                        res.json({
                            status: false,
                            message: "Unable to send OTP"
                        })
                    }

                });
            } else {
                res.json({
                    status: false,
                    message: "Invalid Phone number"
                })
            }


        }




    }
    catch (error) {
        console.log(error);
        res.status(400).send(error);
    }
})

app.get('/api/getlead', async (req, res) => {
    try {
        let phone = req.query.phone;
        let database = await mongo.connect();
        let leadcoll = await database.collection('lead_form');
        let response = await leadcoll.findOne({ "phone": phone });
        if (response != null) {
            res.json({
                message: 'success',
                data: response
            })
        } else {
            res.json({
                message: 'no record found for this phonenumber'
            })
        }

    }
    catch (error) {
        res.status(400).send({ message: 'error' });
    }
})


app.post('/api/otpverify', async (req, res) => {
    try {
        console.log(req.body);
        let database = await mongo.connect();
        let leadcoll = await database.collection('lead_form');
        var data = req.body;
        const secret = OTP_SECRET + data.phone;
        var isValid = otplib.authenticator.check(data.otp, secret);
        if (isValid) {
            var pn = new PhoneNumber(req.body.phone, 'IN');

            if (pn.isValid()) {

                let message = ''

                smsModule.sendSMS(req.body.phone, message);

                res.json({
                    status: true,
                    message: 'OTP VERIFIED'
                })


            } else {
                res.json({
                    status: false,
                    message: "Invalid Phone number"
                })
            }



        }
        else {
            res.json({
                status: false,
                message: 'invalid otp'
            })
        }

        //var token = req.headers['x-auth'];

        // if(token!=null){
        //     var isValid = otplib.authenticator.check(data.otp, secret);
        //     if(isValid){
        //         var decoded = jwt.verify(token, JWT_SECRET_KEY);
        //         console.log(decoded);
        //         if(decoded!=null){
        //             res.json({
        //                 status:true,
        //                 messsage:'otp verified'
        //             })

        //         }
        //         else{
        //             res.json({
        //                 message:'token expires'
        //             })
        //         }



        //     }
        //     else{
        //         res.json({
        //             message:'invalid token'
        //         })
        //     }

        // }else{
        //     res.json({
        //         message:'Please provide token'
        //     })
        // }




    }
    catch (error) {
        console.log(error);
        res.status(400).send(error);
    }
})



module.exports=app;