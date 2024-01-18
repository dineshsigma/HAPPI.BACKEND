const serverless = require('serverless-http');
const express = require('express')
const app = express();
const { v4: uuidv4 } = require('uuid');
var cors = require('cors')
var jwt = require('jsonwebtoken');
var request = require('request');
let axios = require('axios');
let email = require('../modules/email');


const {
    ObjectId
} = require('mongodb');


var mongo = require("../db");
const { Parser } = require('json2csv');
const res = require('express/lib/response');
const { LexModelBuildingService } = require('aws-sdk');
const { from } = require('form-data');
const { status } = require('express/lib/response');
app.options("*", cors()); // include before other routes
app.use(cors())
app.use(express.json());
app.use(
    express.urlencoded({
      extended: true,
    })
  );


async function getStoresDropdown(req, res) {
    try {
        let storeslist = []

        var config = {
            method: 'get',
            url: 'http://183.82.44.213/api/apxapi/GetBranchInfo?CompanyCode=HM&BranchCity=0&BranchPinCode=0&BranchState=0&StoreOpenStartDate=0&StoreOpenEndDate=0&ModifiedOnStartDate=0&ModifiedOnEndDate=0&Status=All',
            headers: {
                'UserId': 'WEBSITE',
                'SecurityCode': '3489-7629-9163-3979'
            }
        };

        let storeresponse = await axios(config);

        console.log(storeresponse.data.Data.length);
        for (var i = 0; i < storeresponse.data.Data.length > 0; i++) {
            storeslist.push(storeresponse.data.Data[i].BRANCH_NAME)

        }
        return res.json({
            status: true,
            storeslist: storeslist
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

async function individulastores(req, res) {
    try {
        let database = await mongo.connect();
        let storecollection = await database.collection('stores');
        let storeres = await storecollection.distinct('State');
        console.log(storeres);
        let response;
        let storearray = [];
        for (var i = 0; i < storeres.length; i++) {

            response = await storecollection.find({ "State": storeres[i] }).toArray();
            storearray.push({ state: response });


        }


        return res.json({
            status: true,
            data: storearray
        })



    }
    catch (error) {
        return res.json({
            status: false,
            message: error
        })

    }

}

async function getStoreManager(req, res) {
    try {
        let phone = req.query.phone;
        let database = await mongo.connect();
        let storecollection = await database.collection('stores');
        let getStoredetails = await storecollection.findOne({ "MobileNumber": phone });
        if (getStoredetails == null) {
            return res.json({
                status: false,
                message: "Store Manager not found"


            })

        }
        else {
            return res.json({
                status: true,
                data: getStoredetails
            })
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


async function electricityUnits(req, res) {
    try {
        let form = req.body;

        let database = await mongo.connect();
        var date = new Date();
        //date.setDate(date.getDate() + 2);
        form.date = date;
        let electicitycollection = await database.collection('electricityUnits');
        let date1 = ("0" + date.getDate()).slice(-2);
        let month = ("0" + (date.getMonth() + 1)).slice(-2);
        let year = date.getFullYear();
        let onlydate = year + month + date1




        let letestRecordWithMobile = await electicitycollection.find({ "mobile": req.body.mobile }).limit(1).sort({ "_id": -1 }).toArray();
        if (letestRecordWithMobile.length != 0) {
            
           
            if (letestRecordWithMobile[0].uniqueId != `${form.storecode}/${'Closed Readings'}` ) {
                if(req.body.status == "Open Readings"){
                    return res.json({
                        status:false,
                        message:"Change Status Type"
                    })
                }
                
                    if (letestRecordWithMobile[0].openUnits < req.body.units) {
                        
    
                        
                       
    
                        let query = {}
                        
                        query.openStatus='Open Readings';
                        query.closedStatus='Closed Readings'
                        query.mobile = req.body.mobile;
                        query.onlydate=onlydate;
                        console.log(query);
                        
                        let access = await electicitycollection.find(query).toArray();
                        if(access.length ==1){
                            return res.json({
                                status:false,
                                message:"Permission Denied"
                            })
                        }
                        else{
    
                        form.unitsDiff = req.body.units - letestRecordWithMobile[0].openUnits;
                        form.uniqueId = `${form.storecode}/${form.status}`;
                        form.onlydate = onlydate;
                        let letestRecordWithMobile2 = await electicitycollection.find({ "mobile": req.body.mobile }).sort({ "_id": -1 }).toArray();
                        let totalUnitsDiff
                        if(letestRecordWithMobile2.length ==2){
                            console.log("ifff")

                        totalUnitsDiff=letestRecordWithMobile2[1].unitsDiff+form.unitsDiff;
                        }
                        else{
                            console.log("else",letestRecordWithMobile2[0])
                            totalUnitsDiff=letestRecordWithMobile2[0].totalUnitsDiff+form.unitsDiff
                        }

                     
    
                        let updatedata= await electicitycollection.findOneAndUpdate({
                            "_id":letestRecordWithMobile[0]._id},
                            {$set:{"closedStatus":req.body.status,
                            "closedUnits":req.body.units,
                            "enddate":date,
                            "unitsDiff":form.unitsDiff,"uniqueId":form.uniqueId,"onlydate":onlydate,"totalUnitsDiff":totalUnitsDiff}})
                       
    
                        return res.json({
                            status: true,
                            message: "Units Updated Success"
                        })
                    }
    
                    }
                    else {
                        return res.json({
                            status: false,
                            message: "increase Your units"
                        })
                    }
                   
                
                
               


            }
            else {

                let query = {}
                        
                query.openStatus='Open Readings';
                query.closedStatus='Closed Readings'
                query.mobile = req.body.mobile;
                query.onlydate=onlydate;
                console.log(query);
                
                let access = await electicitycollection.find(query).toArray();
                if(access.length ==1){
                    return res.json({
                        status:false,
                        message:"Permission Denied"
                    })
                }
                if(req.body.status != "Open Readings"){
                    return res.json({
                        status:false,
                        message:"Change status type"
                    })
                }
                if(letestRecordWithMobile[0].closedUnits < req.body.units){
                    
                
                form.uniqueId = `${form.storecode}/${form.status}`
                form.unitsDiff = req.body.units - letestRecordWithMobile[0].closedUnits

                let inputJson={
                   
                    "mobile":form.mobile,
                    "storecode":form.storecode,
                    "startDate":form.date,
                    "openStatus":form.status,
                    "openUnits":form.units,
                    "unitsDiff":form.unitsDiff,
                    "onlydate":onlydate,
                    "uniqueId":form.uniqueId,
                    "totalUnitsDiff":letestRecordWithMobile[0].totalUnitsDiff+form.unitsDiff
                }
                let insertEle = await electicitycollection.insertOne(inputJson);
                return res.json({
                    status: true,
                    message: "insert Units success"
                })
            }
            else{
                return res.json({
                    status:false,
                    message:"Increase Your Units"
                })
            }
               
                
              

            }
        }
        else {
            
            console.log(req.body.status == "Closed Readings");
            if (req.body.status == "Open Readings") {
                form.unitsDiff = 0;
                form.uniqueId = `${form.storecode}/${form.status}`;
                form.onlydate = onlydate;
                
                let inputJson={
                   
                    "mobile":form.mobile,
                    "storecode":form.storecode,
                    "startDate":form.date,
                    "openStatus":form.status,
                    "openUnits":form.units,
                    "unitsDiff":0,
                    "onlydate":form.onlydate,
                    "uniqueId":form.uniqueId,
                    "totalUnitsDiff":0
                }
                let insertEleunits = await electicitycollection.insertOne(inputJson);
                return res.json({
                    status: true,
                    message: "Units submitted Successfully"
                })

            }
            else {
                return res.json({
                    status: false,
                    message: "Change Your status Type "
                })
            }


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


async function filterWithElectricityStoreCode(req, res) {
    try {
        let database = await mongo.connect();
        let electicitycollection = await database.collection('electricityUnits');

        let electricityStoreCode_response;
        var fromdate = req.query.fromdate;
        var todate = req.query.todate;

        console.log(req.query.storecode);
        let query = {};
        //filter with storecode to get the electricityunits data

        if (req.query.storecode != undefined && req.query.storecode != 'null' && req.query.storecode != "''") {
            query.storecode = req.query.storecode;
            //electricityStoreCode_response = await electicitycollection.find({ "storecode": req.query.storecode }).toArray();
        }

        if (fromdate != 'all' && todate != 'all') {

            fromdate = new Date(fromdate);
            todate = new Date(todate);
            todate.setDate(todate.getDate() + 1);
            // fromdate.setHours(0, 0, 0, 0);
            // todate.setHours(0, 0, 0, 0);
            console.log("formdate------", fromdate, "----todate", todate);

            query.startDate = {
                "$gte": fromdate,
                "$lte": todate
            };
             electricityStoreCode_response = await electicitycollection.find(query).toArray();





        }


        var options = {
            allowDiskUse: true
        };

        var pipeline = [

            {
                $match: query
            },
            {
                "$group": {
                    "_id": {  "mobile": "$mobile","onlydate":"$onlydate" },
                    "records": { "$push": "$$ROOT" },
                    "count": { "$sum": 1 }
                }
            }, {$sort:{"date":-1}}

        ];
        //var cursor = await electicityTable.aggregate(pipeline, options).toArray();


        electricityStoreCode_response = await electicitycollection.find(query).sort({"unitsDiff":-1}).toArray();


        // let consumedres = [];


        // for (var i = 0; i < electricityStoreCode_response.length; i++) {
        //     const result = electricityStoreCode_response[i].records.reduce(function (r, e) {
        //         return Object.keys(e).forEach(function (k) {
        //             if (!r[k]) r[k] = [].concat(e[k])
        //             else r[k] = r[k].concat(e[k])
        //         }), r
        //     }, {})
        //     consumedres.push(result)


        // }


        return res.json({
            status: true,
            electricityStoreCode_response: electricityStoreCode_response
        })


    }
    catch (error) {
        return res.json({
            status: false,
            message: error

        })
    }
}


async function downloadElectricityDate(req, res) {
    try {
        let database = await mongo.connect();
        let electicitycollection = await database.collection('electricityUnits');
        let fromdate = req.query.fromdate.split('T')[0];
        let todate = req.query.todate.split('T')[0];
        let query = {};
        if (fromdate != 'all' && todate != 'all') {
            fromdate = new Date(fromdate);
            todate = new Date(todate);
            todate.setDate(todate.getDate() + 1);
            fromdate.setHours(0, 0, 0, 0);
            todate.setHours(0, 0, 0, 0);

            query.date = {
                "$gte": fromdate,
                "$lte": todate
            };
        }

        let electrictyunitsResponse = await electicitycollection.find(query).toArray();
        if (electrictyunitsResponse.length > 0) {
            const fields = electrictyunitsResponse[0].keys;
            const opts = {
                fields
            };
            const parser = new Parser(opts);
            const csv = parser.parse(electrictyunitsResponse);
            res.setHeader('Content-disposition', 'attachment; filename=data.csv');
            res.set('Content-Type', 'text/csv');
            res.status(200).send(csv);

        }
        else {
            return res.json({
                status: false,
                message: "No Data Found"
            })
        }




    }
    catch (error) {
        console.log(error);
        return res.json({
            status: false,
            message: 'error'
        })
    }
}


async function filtersElectricityDate(req, res) {
    try {
        let database = await mongo.connect();
        let electicitycollection = await database.collection('electricityUnits');
        let fromdate = req.query.fromdate.split('T')[0];
        let todate = req.query.todate.split('T')[0];
        let query = {};
        if (fromdate != 'all' && todate != 'all') {
            fromdate = new Date(fromdate);
            todate = new Date(todate);
            todate.setDate(todate.getDate() + 1);
            fromdate.setHours(0, 0, 0, 0);
            todate.setHours(0, 0, 0, 0);

            query.date = {
                "$gte": fromdate,
                "$lte": todate
            };
        }

        console.log("--------------------", req.query);




        var options = {
            allowDiskUse: true
        };

        var pipeline = [

            {
                $match: query
            },
            {
                "$group": {
                    "_id": "$onlydate",
                    "records": { "$push": "$$ROOT" },
                    "count": { "$sum": 1 }
                }
            }

        ];
        //var cursor = await electicityTable.aggregate(pipeline, options).toArray();

        let electrictyunitsResponse = await electicitycollection.aggregate(pipeline, options).toArray();
        if (electrictyunitsResponse.length > 0) {
            return res.json({
                status: true,
                data: electrictyunitsResponse
            })

        }
        else {
            return res.json({
                status: false,
                message: "No Data Found"
            })
        }




    }
    catch (error) {
        console.log(error);
        return res.json({
            status: false,
            message: 'error'
        })
    }
}


async function storesDropDown(req, res) {
    try {

        let database = await mongo.connect();
        let storecollection = await database.collection('stores');
        let storeRetailerLocalityArea = await storecollection.find({}, { "projection": { "RetailerLocalityArea": 1 } }).toArray();
        let RetailerLocalityAreaArray = [];
        for (var i = 0; i < storeRetailerLocalityArea.length; i++) {
            RetailerLocalityAreaArray.push(storeRetailerLocalityArea[i].RetailerLocalityArea);

        }
        return res.json({
            status: true,
            response: RetailerLocalityAreaArray
        })


    }
    catch (error) {
        return res.json({
            status: true,
            message: error
        })
    }

}

async function electricityHistory(req, res) {
    try {

        console.log(req.query);


        let database = await mongo.connect();
        let electicityTable = await database.collection('electricityUnits');
       

        var electricityHistory = await electicityTable.find({"mobile":req.query.mobile}).toArray();

        return res.json({
            status: true,
            response: electricityHistory

        })







        // let historyResponse = await electicityTable.aggregate()
        // for await (const doc of historyResponse) {
        //     console.log(doc);
        // }


        // return res.json({
        //     status: true,
        //     message: historyResponse
        // })


    }
    catch (error) {
        return res.json({
            status: false,
            message: error
        })
    }

}

async function storeTarget(req,res){
    console.log(req.body);
    let form=req.body;
    try{
        let database = await mongo.connect();
        let storeTargetTable = await database.collection('store_target');
        var date = new Date();
        var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
       
        let date1 = ("0" + firstDay.getDate()).slice(-2);
        let month = ("0" + (firstDay.getMonth() + 1)).slice(-2);
        let year = firstDay.getFullYear();
        let date2 = ("0" + lastDay.getDate()).slice(-2);
        let month2 = ("0" + (lastDay.getMonth() + 1)).slice(-2);
        let year2 = lastDay.getFullYear();
        firstDay = year+"-"+month+"-"+ date1;
        lastDay = year2 +"-"+ month2+"-"+ date2;

        let currentdatequery={};
        currentdatequery.date={
            "$gte": firstDay,
            "$lte": lastDay
        };
        currentdatequery.store=req.body.store;

        console.log(currentdatequery);
        

        let findStorename= await storeTargetTable.findOne(currentdatequery);
        
        if(findStorename!=null){
            return res.json({
                status:false,
                "message":"storeTarget Units  for this month is already addedd"
            })

        }else{
            let storeTargetResponse = await storeTargetTable.insertOne(form);
            return res.json({
                status:true,
                message:"Store Target Date is added"
            })
        }


    }
    catch(error){
        console.log(error);
        return res.json({
            status:false,
            message:"error"
        })
    }
}


module.exports.getStoresDropdown = getStoresDropdown;
module.exports.individulastores = individulastores;
module.exports.getStoreManager = getStoreManager;
module.exports.electricityUnits = electricityUnits;
module.exports.filterWithElectricityStoreCode = filterWithElectricityStoreCode;
module.exports.downloadElectricityDate = downloadElectricityDate;
module.exports.filtersElectricityDate = filtersElectricityDate;
module.exports.storesDropDown = storesDropDown;
module.exports.electricityHistory = electricityHistory;
module.exports.storeTarget = storeTarget;



