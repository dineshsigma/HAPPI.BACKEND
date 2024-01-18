const serverless = require('serverless-http');
const express = require('express')
const app = express();
const {
    v4: uuidv4
} = require('uuid');
var cors = require('cors')
var jwt = require('jsonwebtoken');
var request = require('request');
let axios = require('axios');
const {
    ObjectId
} = require('mongodb');


var mongo = require("../db");
const {
    Parser
} = require('json2csv');


var LEADS_ALLOCATION_COUNT = 20;
var LASTACTIVE_TIME_IN_MINUTES = 10;
var CART_ALLOCATION_COUNT = 2;

async function filter_laptop_leads(req, res) {

    try {

        let formdate = req.params.fromdate;
        let todate = req.params.todate;

        let utmsource = req.query.utmsource;
        let utmcampaign = req.query.utmcampaign;
        let utmmedium = req.query.utmmedium;
        let status = req.query.status;
        let type = req.query.type;
        let assign_to = req.query.assign_to;
        let phone = req.query.phone;


        var collectionname = 'laptop-leads';

        var dataBase = await mongo.connect();
        var collectionclient = await dataBase.collection(collectionname);
        var query = {};

        if (formdate != 'all' && todate != 'all') {
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
        if (utmsource != undefined && utmsource != '') {
            query.utm_source = utmsource;
        }

        if (utmmedium != undefined && utmmedium != '') {
            query.utm_medium = utmmedium;
        }
        if (status != undefined && status != '' && status != null) {
            query.status = status;
        }
        if (type != undefined && type != '') {
            query.type = type;
        }
        if (assign_to != undefined && assign_to != '') {
            query.assign_to = assign_to;
        }
        if (phone != undefined && phone != '') {
            query.phone = phone;
        }

console.log("query---",query);
        let skip = req.body.skip || 0;
        let limit = req.body.limit || 100;
        // console.time("DBQUERY");
        let data = await collectionclient.find(query).skip(skip).limit(limit).sort({
            "_id": -1
        }).toArray();
        // console.timeEnd("DBQUERY");
        let totalcount = await collectionclient.count(query)
        console.log(totalcount);

        res.json({
            "count": data.length,
             "totalcount": totalcount,
             data: data
        });


    } catch (error) {
        res.json({
            status: false,
            message: error.message
        });
        return;
    }
}





async function timedateuser(req, res) {
    console.log(req.query);
    try {
        let phone = req.query.phone;
        var dataBase = await mongo.connect();
        let laptopcoll = await dataBase.collection('user');
        let user_logscoll = await dataBase.collection('user_logs');
        let currentdate = new Date();
        let userresponse = await laptopcoll.findOneAndUpdate({
            "phone": phone
        }, {
            $set: {
                "last_update_time": currentdate
            }
        });
        try {

            await user_logscoll.insertOne({"userid":phone,"createdOn":new Date()})


            // var config_es = {
            //     method: 'post',
            //     url: 'https://my-deployment-031377.es.ap-south-1.aws.elastic-cloud.com:9243/user-logs/_doc/' + new Date().getTime(),
            //     headers: {
            //         'Content-Type': 'application/json',
            //         'Authorization': 'Basic ZWxhc3RpYzo2SmVITmhBWFdmWFBDWTVQMzFpcGVNSUo='
            //     },
            //     data: JSON.stringify({
            //         userid: phone,
            //         createdOn: new Date()
            //     })
            // };
            // await axios(config_es);

        } catch (error) {
            console.log(error);
        }
        res.json({
            status: true,
            message: 'updated success'
        })

    } catch (error) {
        console.log(error);
    }
}



async function assignlaptops(req, res) {
    try {

        let currentdate = new Date();
        // let datebetween=currentdate.getHours()+":"+currentdate.getMinutes()+":"+currentdate.getSeconds();

        var dataBase = await mongo.connect();
        let usercoll = await dataBase.collection('user');
        let laptopcoll = await dataBase.collection('laptop-leads');



        console.log("date-----bbb", currentdate);
        //currentdate.setHours(currentdate.getHours() - 1);
        currentdate.setMinutes(currentdate.getMinutes() - LASTACTIVE_TIME_IN_MINUTES);
        console.log("date-----", currentdate);

        let userresponse = await usercoll.find({
            "usertype": "Digital",
            last_update_time: {
                $gte: currentdate
            }
        }).toArray();
        console.log("userresponse", userresponse);

        let date = new Date();
        // date.setHours(0,0,0,0);
        date.setDate(25);
        date.setHours(6, 0, 0, 0);

        console.log("setdata", date);

        for (var i = 0; i < userresponse.length; i++) {

            let laptopleadsresponse = await laptopcoll.find({
                "assign_to": {
                    $exists: false
                },
                "date": {
                    $gte: date
                }
            }).limit(LEADS_ALLOCATION_COUNT).toArray();
            console.log("laptopleadsresponse", laptopleadsresponse.length);

            for (var j = 0; j < laptopleadsresponse.length; j++) {
                let updateleads = await laptopcoll.findOneAndUpdate({
                    "_id": laptopleadsresponse[j]._id
                }, {
                    $set: {
                        "assign_to": userresponse[i].phone
                    }
                });
            }
        }
        res.json({
            message: "assigned successfully"
        })
    } catch (error) {
        console.log(error);
        // res.json({date:currentdate,error:error});
    }

}



async function filtersdownload(req, res) {
    try {
        let formdate = req.query.fromdate;
        let todate = req.query.todate;
        let utmsource = req.query.utmsource;
        let utmcampaign = req.query.utmcampaign;
        let utmmedium = req.query.utmmedium;
        let status = req.query.status;
        let type = req.query.type;
        var collectionname = 'laptop-leads';
        var dataBase = await mongo.connect();
        var collectionclient = await dataBase.collection(collectionname);
        var query = {};
        if (formdate != 'all' && todate != 'all') {
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
        if (utmsource != undefined && utmsource != '') {
            query.utm_source = utmsource;
        }

        if (utmmedium != undefined && utmmedium != '') {
            query.utm_medium = utmmedium;
        }
        if (status != undefined && status != '' && status != null) {
            query.status = status;
        }
        if (type != undefined && type != '') {
            query.type = type
        }

        let data = await collectionclient.find(query).toArray();
       
        if (data.length > 0) {
            const fields = data[0].keys;
            const opts = {
                fields
            };
            try {

                // let dataarr = [];
                // for (var i = 0; i < data.length; i++) {
                //     let dateres = new Date(data[i].date);
                //     data[i].createddate = dateres.toISOString().split('T')[0];
                //     data[i].time = dateres.toISOString().split('T')[1];
                //     delete data[i].date;
                //     dataarr.push(data[i]);
                // }





                const parser = new Parser(opts);
                const csv = parser.parse(data);
                res.setHeader('Content-disposition', 'attachment; filename=data.csv');
                res.set('Content-Type', 'text/csv');
                res.status(200).send(csv);


            } catch (error) {
                console.log(error);
                res.json({
                    status: false,
                    message: error.message
                });
            }
        } else {
            res.send('no data found')
        }

    } catch (error) {
        res.json({
            status: false,
            message: error.message
        });
        return;
    }
}




async function downloadproductdetails(req, res) {
    try {
        var dataBase = await mongo.connect();
        let productcoll = await dataBase.collection('product');
        // let data = await productcoll.find({},
        //     {
        //         "name" : "$name",
        //         "stock" : "$stock",
        //         "thirdPartyCodes.apxItemCode" : "$thirdPartyCodes.apxItemCode",
        //         "totalStock" : "$totalStock",
        //         "_id" : NumberInt(0)
        //     }
        // ).toArray();

        let data = await productcoll.find({}, {
            projection: {
                "id": 1,
                "payPrice": 1,
                "name": 1,
                "stock": 1,
                "thirdPartyCodes.apxItemCode": 1,
                "totalStock": 1
            }
        }).toArray();
        console.log("getproductcount", data.length);
        let count = data.length;

        if (data.length > 0) {

            const fields = data[0].keys;
            const opts = {
                fields
            };
            try {
                const parser = new Parser(opts);
                const csv = parser.parse(data);

                res.setHeader('Content-disposition', 'attachment; filename=data.csv');
                res.set('Content-Type', 'text/csv');
                res.json({
                    status: true,
                    count: count,
                    csv: csv

                })


            } catch (error) {
                console.log(error);
                res.json({
                    status: false,
                    message: error

                })
            }
        } else {
            res.send('no data found')
        }



    } catch (error) {
        console.log(error);
        res.json({
            status: false,
            message: error

        })
    }

}



async function abandonedcart(req, res) {
    console.log("abandoned cart ")
    try {
        var dataBase = await mongo.connect();
        let cartcoll = await dataBase.collection('cart');
        let usercoll = await dataBase.collection('user');
        let currentdate = new Date();
        currentdate.setMinutes(currentdate.getMinutes() - LASTACTIVE_TIME_IN_MINUTES);
        let userresponse = await usercoll.find({
            "usertype": "Digital",
            last_update_time: {
                $gte: currentdate
            }
        }).toArray();
        console.log("userresponse", userresponse);
        for (var i = 0; i < userresponse.length; i++) {

            let laptopleadsresponse = await cartcoll.find({
                "assign_to": {
                    $exists: false
                }
            }).limit(CART_ALLOCATION_COUNT).toArray();
            console.log("laptopleadsres", laptopleadsresponse.length)
            for (var j = 0; j < laptopleadsresponse.length; j++) {
                let updateleads = await cartcoll.findOneAndUpdate({
                    "_id": laptopleadsresponse[j]._id
                }, {
                    $set: {
                        "assign_to": userresponse[i].phone
                    }
                });

            }

        }
        res.json({
            status: true,
            message: ' assisgn abandonedcart successfully '
        })

    } catch (error) {
        console.log(error);
        res.json({
            status: false,
            message: error

        })
    }

}


async function transferleads(req, res) {
    console.log(req.body);
    console.log(req.query);
    try {
        var dataBase = await mongo.connect();
        let leadcoll = await dataBase.collection('laptop-leads');
        let assign_to = req.body.assign_to;
        let ids = req.body.id.updateids;
        let updatedby = req.query.updatedby;



        for (var i = 0; i < ids.length; i++) {
            console.log(ids[i])

            let transferleads = await leadcoll.findOneAndUpdate({
                "_id": ObjectId(ids[i])
            }, {
                $set: {
                    "assign_to": assign_to,
                    "assign_date": new Date(),
                    "updatedby": updatedby
                }
            })


        }
        res.json({
            status: true,
            message: "assigned successfully"
        })

        // let updateleads= await leadcoll.updateMany({_id: {$in: ids}}, 
        //     { $set: { "assign_to": assign_to} }, 
        //     {multi: true} );





    } catch (error) {
        console.log(error);
        res.json({
            status: false,
            message: error
        })

    }
}


async function group_by_status(req, res) {
    try {
        var dataBase = await mongo.connect();
        let leadcoll = await dataBase.collection('cart');

        var options = {
            allowDiskUse: true
        };

        // var pipeline = [
        //     {
        //         "$group": {
        //             "_id": {
        //                 "internal_note": "$internal_note"
        //             },
        //             "COUNT(*)": {
        //                 "$sum": 1
        //             }
        //         }
        //     }, 
        //     {
        //         "$project": {
        //             "COUNT": "$COUNT(*)",
        //             "internal_note": "$_id.internal_note",
        //             "_id": 0
        //         }
        //     }
        // ];

        var pipeline = [{
            "$match": {
                "internal_note": {
                    "$in": [
                        "General Enquiry",
                        "Not Interested",
                        "Needs Follow up - 1",
                        "Needs Follow up - 2",
                        "Needs Follow up - 3",
                        "Testing",
                        "Ringing"
                    ]
                }
            }
        },
        {
            "$group": {
                "_id": {
                    "internal_note": "$internal_note"
                },
                "COUNT(*)": {
                    "$sum": 1
                }
            }
        },
        {
            "$project": {
                "COUNT": "$COUNT(*)",
                "internal_note": "$_id.internal_note",
                "_id": 0
            }
        }
        ];

        let data = {};

        var statuscount = await leadcoll.aggregate(pipeline, options).toArray();



        for (var i = 0; i < statuscount.length; i++) {

            data[statuscount[i]['internal_note']] = statuscount[i]['COUNT']




        }


        // let totalcount= await leadcoll.find({}).toArray();

        res.json({
            sttaus: true,
            // totalcount:totalcount.length,
            statuscount: data
        })







    } catch (error) {
        console.log(error);
        res.json({
            status: false,
            message: error
        })
    }

}






///api/help/download/:fromdate/:todate'
async function downloadAlltabs(req, res) {




    var fromdate = req.query.fromdate;
    var todate = req.query.todate;

    var collectionname = req.query.collectionname;
    var dataBase = await mongo.connect();
    console.log("collectionname-----", collectionname);
    var collectionclient = await dataBase.collection(collectionname);
    var query = {};


    if (fromdate != 'all' && todate != 'all') {

        fromdate = new Date(fromdate);
        todate = new Date(todate);
        todate.setDate(todate.getDate() + 1);
        // fromdate.setHours(0, 0, 0, 0);
        // todate.setHours(0, 0, 0, 0);
        console.log("formdate------", fromdate, "----todate", todate);
        if (collectionname == "cart") {
            query.createdOn = {
                "$gte": fromdate,
                "$lte": todate
            };
        } else if (collectionname == "product") {
            query.date = {
                "$gte": fromdate,
                "$lte": todate
            };
        } else if (collectionname == "laptop-leads") {
            query.date = {
                "$gte": fromdate,
                "$lte": todate
            };
        } else if (collectionname == "wishlist") {
            query.datecreated = {
                "$gte": fromdate,
                "$lte": todate
            };
        } else if (collectionname == 'orders-v3') {

            query.createdOn = {
                "$gte": fromdate,
                "$lte": todate
            };
        }


    }





    console.log("query----------", query);
    var data = await collectionclient.find(query).toArray();

    //    for(var i=0;i<data.length;i++){
    //       let result=data[i].date;

    //       let splitdate=new Date(result);
    //     //  console.log( splitdate.getFullYear()+'-' + (splitdate.getMonth()+1) + '-'+splitdate.getDate());
    //       let cd=splitdate.getFullYear()+'-' + (splitdate.getMonth()+1) + '-'+splitdate.getDate()
    //     data.push(cd);


    //    }

    //    console.log("data--------",data);

    let dataarr = [];
    if (data.length > 0) {
        const fields = data[0].keys;

        const opts = {
            fields
        };


        for (var i = 0; i < data.length; i++) {
            let dateres = new Date(data[i].date);


            data[i].date = dateres.toISOString().split('T')[0];
            data[i].time = dateres.toISOString().split('T')[1];
            delete data[i].date


            dataarr.push(data[i]
                // "date": data[i]
            );
        }



        try {
            const parser = new Parser(opts);
            const csv = parser.parse(dataarr);

            res.setHeader('Content-disposition', 'attachment; filename=data.csv');
            res.set('Content-Type', 'text/csv');
            res.status(200).send(csv);
        } catch (err) {
            console.error(err);
            res.json({
                status: false,
                message: 'error'
            })
        }
    } else {
        res.send('no data found')
    }
}





async function getAlltabsFilters(req, res) {




    var fromdate = req.query.fromdate;
    var todate = req.query.todate;

    var collectionname = req.query.collectionname;
    var dataBase = await mongo.connect();

    var collectionclient = await dataBase.collection(collectionname);
    var query = {};



    if (fromdate != 'all' && todate != 'all') {

        fromdate = new Date(fromdate);
        todate = new Date(todate);
        todate.setDate(todate.getDate() + 1);
        // fromdate.setHours(0, 0, 0, 0);
        // todate.setHours(0, 0, 0, 0);
        console.log("formdate------", fromdate, "----todate", todate);
        if (collectionname == "cart") {
            query.createdOn = {
                "$gte": fromdate,
                "$lte": todate
            };
        } else if (collectionname == "product") {
            query.dateCreated = {
                "$gte": fromdate,
                "$lte": todate
            };
        } else if (collectionname == "laptop-leads") {
            query.date = {
                "$gte": fromdate,
                "$lte": todate
            };
        } else if (collectionname == "wishlist") {
            query.datecreated = {
                "$gte": fromdate,
                "$lte": todate
            };
        } else if (collectionname == 'orders-v3') {

            query.createdOn = {
                "$gte": fromdate,
                "$lte": todate
            };





        } else if (collectionname == "akshaya_patra") {
            // fromdate = new Date(fromdate);
            // todate = new Date(todate);

            // let fdate = ("0" + fromdate.getDate()).slice(-2);
            // let fmonth = ("0" + (fromdate.getMonth() + 1)).slice(-2);
            // let tdate = ("0" + todate.getDate()).slice(-2);
            // let tmonth = ("0" + (todate.getMonth() + 1)).slice(-2);

            // fromdate = fmonth + "-" + fdate;
            // todate = tmonth + "-" + tdate;
            query.customer_dob = {
                "$gte": fromdate,
                "$lte": todate
            };
            // console.log("query----------", query, "collectionname----------------", collectionname);
            // var data = await collectionclient.find(query).toArray();
            // if (data.length > 0) {

            //     return res.send({
            //         status: true,
            //         data: data

            //     })

            // } else {
            //     return res.send('no data found')
            // }



        }


    }

    console.log("query----------", query, "collectionname----------------", collectionname);
    var data = await collectionclient.find(query).toArray();
    let dataarr = [];

    console.log("data-------------", data);






    if (data.length > 0) {
        for (var i = 0; i < data.length; i++) {
            let dateres = new Date(data[i].date);


            data[i].createddate = dateres.toISOString().split('T')[0];
            data[i].time = dateres.toISOString().split('T')[1];
            delete data[i].date;

            dataarr.push(data[i]);
        }
        res.send({
            status: true,
            data: dataarr

        })

    } else {
        res.send('no data found')
    }
}




async function cartdownload(req, res) {
    try {

        var fromdate = req.query.fromdate;
        var todate = req.query.todate;
        var collectionname = 'cart';
        var dataBase = await mongo.connect();
        var collectionclient = await dataBase.collection(collectionname);
        var query = {};
        let dataarr = [];
        if (fromdate != 'all' && todate != 'all') {
            fromdate = new Date(fromdate);
            todate = new Date(todate);
            todate.setDate(todate.getDate() + 1);
            // fromdate.setHours(0, 0, 0, 0);
            // todate.setHours(0, 0, 0, 0);
            console.log("formdate------", fromdate, "----todate", todate);
            query.createdOn = {
                "$gte": fromdate,
                "$lte": todate
            };
        }
        console.log("query----------", query, "collectionanme---------------", collectionname);
        var data = await collectionclient.find(query).toArray();

        if (data.length > 0) {
            const fields = data[0].keys;
            const opts = {
                fields
            };
            for (var i = 0; i < data.length; i++) {
                let dateres = new Date(data[i].createdOn);

                if (data[i].selectedAddress) {

                    let csvdata = {
                        "cartId": data[i].cartId,
                        "createdOn": data[i].createdOn,
                        "deliveryType": data[i].deliveryType,
                        "Phone": data[i].selectedAddress.phone,
                        "tran_id": data[i].tran_id,
                        "custom_message": data[i].custom_message,
                        "internal_note": data[i].internal_note,
                        "date": dateres.toISOString().split('T')[0],
                        "time": dateres.toISOString().split('T')[1]

                    }
                    dataarr.push(csvdata);
                }
            }

            const parser = new Parser(opts);
            const csv = parser.parse(dataarr);
            // AWS.config.update({
            //     region:"ap-south-1", // use appropriate region
            //     accessKeyId: "AKIASTAEMZYQ3D75TOOZ", // use your access key
            //     secretAccessKey: "r8jgRXxFoE/ONyS/fdO1eYu9N8lY5Ws0uniYUglz", // user your secret key
            // })

            var bufferObject = new Buffer.from(csv);
            // var filePath = configurationHolder.config.s3UploadFilePath;

            // var s3 = new AWS.S3(
            //     {
            //         region: "ap-south-1", // use appropriate region
            //         accessKeyId: "AKIASTAEMZYQ3D75TOOZ", // use your access key
            //         secretAccessKey: "r8jgRXxFoE/ONyS/fdO1eYu9N8lY5Ws0uniYUglz"
            //     }
            // )

            // var params = {
            //     Bucket: 'happimobiles',
            //     Key: 'cart/cartdownload'+new Date()+'.csv',// path
            //     Body: bufferObject,
            //     ContentType: 'application/octet-stream',
            //     ACL:"public-read"

            // }

            // s3.upload(params, function (err, data) {
            //     console.log(data);
            //     if (err) {
            //         console.log("Error at uploadCSVFileOnS3Bucket function", err);
            //         return res.json({
            //             message:'Please try after sometime'
            //         })


            //     } else {
            //         console.log("File uploaded Successfully");
            //         res.redirect(data.Location);

            //      }
            // });

            // res.setHeader('Content-disposition', 'attachment; filename=data.csv');
            // res.set('Content-Type', 'text/csv');
            // return res.status(200).send(csv);

            // setTimeout(function () {
            //     return res.status(200).send(csv);
            // }, 2000);
        } else {
            res.send('no data found')
        }
    }
    catch (error) {
        console.log(error);
        res.json({
            status: false,
            message: error
        })
    }
}






async function downloadusercartdetails(req, res) {
    try {

        console.log("--------------------------", req.query)

        var fromdate = req.query.fromdate;
        var todate = req.query.todate;

        var collectionname = 'userCartDetails';
        var dataBase = await mongo.connect();

        var collectionclient = await dataBase.collection(collectionname);
        var query = {};
        let dataarr = [];

        if (fromdate != 'all' && todate != 'all') {

            fromdate = new Date(fromdate);
            todate = new Date(todate);
            todate.setDate(todate.getDate() + 1);
            // fromdate.setHours(0, 0, 0, 0);
            // todate.setHours(0, 0, 0, 0);
            console.log("formdate------", fromdate, "----todate", todate);

            query.createdon = {
                "$gte": fromdate,
                "$lte": todate
            };



        }



        console.log("query----------", query);
        var data = await collectionclient.find(query).toArray();

        if (data.length > 0) {
            const fields = data[0].keys;
            const opts = {
                fields
            };

            for (var i = 0; i < data.length; i++) {
                let dateres = new Date(data[i].createdon);


                data[i].date = dateres.toISOString().split('T')[0];
                data[i].time = dateres.toISOString().split('T')[1];
                delete data[i].createdon;


                dataarr.push(data[i]

                );
            }

            const parser = new Parser(opts);
            const csv = parser.parse(dataarr);
            res.setHeader('Content-disposition', 'attachment; filename=data.csv');
            res.set('Content-Type', 'text/csv');
            res.status(200).send(csv);




        } else {
            res.send('no data found')
        }


    }
    catch (error) {
        console.log(error);
        res.json({
            status: false,
            message: error
        })
    }
}


async function ordersv3download(req, res) {

    try {

        console.log("--------------------------", req.query)

        var fromdate = req.query.fromdate.split('T')[0];
        var todate = req.query.todate.split('T')[0];

        var collectionname = 'orders-v3';
        var dataBase = await mongo.connect();

        var collectionclient = await dataBase.collection(collectionname);
        var query = {};
        let dataarr = [];

        if (fromdate != 'all' && todate != 'all') {

            fromdate = new Date(fromdate);
            todate = new Date(todate);
            todate.setDate(todate.getDate() + 1);
            // fromdate.setHours(0, 0, 0, 0);
            // todate.setHours(0, 0, 0, 0);
            console.log("formdate------", fromdate, "----todate", todate);

            query.createdOn = {
                "$gte": fromdate,
                "$lte": todate
            };



        }

        let projection = {
            "order_id": 1,
            "userInfo": 1,
            "status": 1,
            "deliveryType": 1,
            "CartSubtotal": 1,
            "gateway": 1,
            "paymentUniqueId": 1,
            "taxnid": 1,
            "internal_note": 1,
            "shipRocketContext": 1,
            "internal_order_status": 1,
            "custom_message": 1,
            "datecreated": 1

        }



        console.log("query----------", query);
        var data = await collectionclient.find(query, { projection: projection }).toArray();
        // console.log(data);
        data = data.map(function (e) {

            return {
                order_id: e.order_id,
                phone: e.userInfo.phone || "",
                status: e.status,
                deliveryType: e.deliveryType,
                CartSubtotal: e.CartSubtotal,
                gateway: e.gateway,
                paymentUniqueId: e.paymentUniqueId,
                taxnid: e.taxnid,
                internal_note: e.internal_note,
                shipRocketContext: e.shipRocketContext,
                internal_order_status: e.internal_order_status,
                custom_message: e.custom_message,
                datecreated: e.datecreated

            }
        })

        if (data.length > 0) {
            const fields = data[0].keys;
            const opts = {
                fields
            };

            for (var i = 0; i < data.length; i++) {
                let dateres = new Date(data[i].datecreated);
                data[i].date = dateres.toISOString().split('T')[0];
                data[i].time = dateres.toISOString().split('T')[1];
                delete data[i].datecreated;
                dataarr.push(data[i]);
            }

            const parser = new Parser(opts);
            const csv = parser.parse(dataarr);
            res.setHeader('Content-disposition', 'attachment; filename=data.csv');
            res.set('Content-Type', 'text/csv');
            res.status(200).send(csv);

        } else {
            res.send('no data found')
        }

    }
    catch (error) {
        console.log(error);
        res.json({
            status: false,
            message: error
        })
    }
}


async function leadsstatuscount(req, res) {
    try {

        var collectionname = 'laptop-leads';
        var dataBase = await mongo.connect();


        var options = {
            allowDiskUse: true
        };

        var pipeline = [
            {
                "$match": {
                    "status": {
                        "$in": [
                            "open",
                            "close",
                            "hot lead",
                            "RNR",
                            "Needs Follow Up"
                        ]
                    }
                }
            },
            {
                "$group": {
                    "_id": {
                        "status": "$status"
                    },
                    "COUNT(*)": {
                        "$sum": 1
                    }
                }
            },
            {
                "$project": {
                    "COUNT": "$COUNT(*)",
                    "status": "$_id.status",
                    "_id": 0
                }
            }
        ];

        var collectionclient = await dataBase.collection(collectionname);

        var leadsstatuscount = await collectionclient.aggregate(pipeline, options).toArray();
        let data = {};


        for (var i = 0; i < leadsstatuscount.length; i++) {

            data[leadsstatuscount[i]['status']] = leadsstatuscount[i]['COUNT']


        }

        return res.json({
            status: true,
            statuscount: data
        })



    }
    catch (error) {
        console.log(error);
        res.json({
            status: false,
            message: error
        })
    }
}

// async function filterassign(req,res){
//     try{

//         var dataBase = await mongo.connect();
//         let leadcoll= await dataBase.collection('laptop-leads');
//         let query={};
//         let assign_to=req.query.assign_to;
//         if (assign_to != undefined && assign_to != '') {
//             query.assign_to = assign_to
//         }

//         let skip = req.body.skip ?? 0;
//         let limit = req.body.limit;


//         let data = await leadcoll.find(query).skip(skip).limit(limit || 100).sort({"assign_date":new Date() }).toArray();
//         let totalcount = await collectionclient.count(query);
//         res.json({
//             "count": count,
//             "totalcount": totalcount,
//             data: data
//         });

//     }
//     catch(error){
//         console.log(error);
//         res.json({
//             status:false,
//             message:error
//         })
//     }

// }

module.exports.filter_laptop_leads = filter_laptop_leads;
module.exports.timedateuser = timedateuser;
module.exports.assignlaptops = assignlaptops;
module.exports.filtersdownload = filtersdownload;
module.exports.downloadproductdetails = downloadproductdetails;
module.exports.abandonedcart = abandonedcart;
module.exports.transferleads = transferleads;
module.exports.group_by_status = group_by_status;
module.exports.downloadAlltabs = downloadAlltabs;
module.exports.getAlltabsFilters = getAlltabsFilters;
module.exports.cartdownload = cartdownload;
module.exports.ordersv3download = ordersv3download;
module.exports.downloadusercartdetails = downloadusercartdetails;
module.exports.leadsstatuscount = leadsstatuscount;