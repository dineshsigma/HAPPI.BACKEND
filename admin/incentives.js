const serverless = require('serverless-http');
const express = require('express')
const app = express();
const { v4: uuidv4 } = require('uuid');
var cors = require('cors')
var jwt = require('jsonwebtoken');
var request = require('request');
let axios=require('axios');
const {
    ObjectId
} = require('mongodb');


var mongo = require("../db");
const { Parser } = require('json2csv');



async function citylist(req,res){
    
    try{

        var dataBase = await mongo.connect();
        let storecoll= await dataBase.collection('stores');
        let storeslist= await storecoll.distinct('city');
        
        res.json({
            status:true,
            data:storeslist

        })

    }
    catch(err){
        console.log(err);
        res.json({

            status:false,
            message:error
        })
    }

}

async function storelist(req,res){

  
    try{

        var dataBase = await mongo.connect();
        let storecoll= await dataBase.collection('stores');
        // let storeslist= await storecoll.find({},{projection:{"RetailerLocalityArea":1}}).toArray();
        let storeslist= await storecoll.distinct('RetailerLocalityArea');
        // console.log(storeslist);
        res.json({
            status:true,
            data:storeslist

        })

    }
    catch(err){
        console.log(error);
        res.json({

            status:false,
            message:error
        })
    }

}



async function incentive_categories(req,res){
    try{
        let form=req.body

        var dataBase = await mongo.connect();
        let inccoll= await dataBase.collection('incentive_category');
        let category= await inccoll.insertOne(form);
        res.json({
            status:true,
            message:"insert category successfully"
        })

    }
    catch(error){
        console.log(error);
        res.json({
            status:false,
            message:error

        })
    }

}

async function getcategorylist(req,res){

  
    try{

        var dataBase = await mongo.connect();
        let categorycoll= await dataBase.collection('incentive_category');
        // let storeslist= await storecoll.find({},{projection:{"RetailerLocalityArea":1}}).toArray();
        let categorylist= await categorycoll.distinct('category');
        // console.log(storeslist);
        res.json({
            status:true,
            data:categorylist

        })

    }
    catch(err){
        console.log(error);
        res.json({

            status:false,
            message:error
        })
    }

}

module.exports.storelist = storelist;
module.exports.citylist =citylist;
module.exports.incentive_categories =incentive_categories;
module.exports.getcategorylist = getcategorylist;


// # produuctsSearchSyncHandler:
// #   memorySize: 4096
// #   timeout: 840
// #   handler: test.product-sync.productsSync
// #   events:
// #     - schedule: rate(1 hour)
// # stockSyncHandler:
// #   memorySize: 4096
// #   timeout: 840
// #   handler: priceSync.stockSync
// #   events:
// #     - schedule: cron(0 4-20 * * ? *)
// # stockOnlineSyncHandler:
// #   memorySize: 4096
// #   timeout: 840
// #   handler: priceSync.stockOnlineSync
// #   events:
// #   - schedule: rate(1 hour)
// # akshaya_patraHandler:
// #   memorySize: 2048
// #   timeout: 840
// #   handler: akshayaPatra.handler
// #   events:
// #   - schedule: cron(4 0 * * ? *)
// # assignleadsHandler:
// #   memorySize: 4096
// #   timeout: 840
// #   handler: assignleads.handler
// #   events:
// #     - schedule: rate(1 hour)
// # abandonedcartHandler:
// #   memorySize: 2048
// #   timeout: 840
// #   handler: abandonedcart.handler
// #   events:
// #     - schedule: rate(1 hour)
// # assistHandler:
// #   handler: assist.assist
// #    events:
// #    - schedule: rate(1 hour)