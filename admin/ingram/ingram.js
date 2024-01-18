
const serverless = require('serverless-http');
const express = require('express')
const app = express();

var cors = require('cors')


let axios = require('axios');

var mongo = require("../../db.js");
const { query } = require('express');



async function ingramStockData(req,res){
    try{

        var dataBase = await mongo.connect();
        let ingramOrders_coll = await dataBase.collection('ingramOrders');
        let  ingram_stock_data=await ingramOrders_coll.find({}).toArray();
        return res.json({
            status:true,
            data:ingram_stock_data
        })

    }
    catch(error){
        console.log(error);
        return res.json({
            status:false,
            message:error
        })
    }
}


async function searchIngramName(req,res){
    try{
        let name=req.query.name;
        console.log("ingramname---------------",req.query.name);

        var dataBase = await mongo.connect();
        let ingramOrders_coll = await dataBase.collection('ingramOrders');
        let ingramName = await ingramOrders_coll.find({ "name": { $regex: name, $options: "i" } }).toArray();
       
        return res.json({
            status:true,
            data:ingramName
        })

    }
    catch(error){
        console.log(error);
        return res.json({
            status:false,
            message:error
        })
    }
}

async function searchIngramData(req,res){
    try{
        let fromdate=req.query.fromdate;
        let todate=req.query.todate;

        var dataBase = await mongo.connect();
        let ingramOrders_coll = await dataBase.collection('ingramOrders');
        let query={};

        if (fromdate != 'all' && todate != 'all') {
            fromdate = new Date(fromdate);
            todate = new Date(todate);
            todate.setDate(todate.getDate() + 1);
            fromdate.setHours(0, 0, 0, 0);
            todate.setHours(0, 0, 0, 0);

            query.ingramStockSync = {
                "$gte": fromdate,
                "$lte": todate
            };
        }

        let data= await ingramOrders_coll.find(query).toArray();
        return res.json({
            status:true,
            data:data
        })

    }
    catch(error){
        return res.json({
            status:false,
            message:error
        })
    }

}

async function getIngramProduct(req,res){

  var dataBase = await mongo.connect();
  let ingramproduct_coll = await dataBase.collection('product');
  let ingram_response;
  let query={}

    
    try{
        console.log(req.query.name!=undefined);
       
        if(req.query.name!=undefined){
            let name=req.query.name
            query.name={ $regex: name, $options: "i" }
            query.vendor="ingram"
            ingram_response = await ingramproduct_coll.find(query,{projection:{"ingramStockSync":1,"name":1,"thirdPartyCodes.ingramPartNumber":1,"stock":1,"thirdPartyCodes.pinelabsProductCode":1,"ingramStatus":1}}).sort({ stock: -1 }).toArray();

        }else{
          ingram_response= await ingramproduct_coll.find({"vendor":"ingram"},{projection:{"ingramStockSync":1,"name":1,"thirdPartyCodes.ingramPartNumber":1,"stock":1,"thirdPartyCodes.pinelabsProductCode":1,"ispublished":1,"ingramStatus":1}}).sort({ stock: -1 }).toArray();
        }

      

        ingram_response = ingram_response.map(function (e) {

            return {
                id: e.id,
                name: e.name,
                stock: e.stock,
                ingramPartNumber: e.thirdPartyCodes.ingramPartNumber || "",
                pinelabsProductCode: e.thirdPartyCodes.pinelabsProductCode,
                ingramStockSync: new Date(e.ingramStockSync),
                ingramStatus:e.ingramStatus
                
            }
        })
      
       
        return res.json({
            status:true,
            message:ingram_response
        })

    }
    catch(error){
        console.log(error);
        return res.json({
            status:false,
            message:error
        })
    }
}

async function updateIngramPartnumber(req,res){
    try{
        console.log(req.body);
        var dataBase = await mongo.connect();
        let ingramproduct_coll = await dataBase.collection('product');
        let name=req.body.name;

        let ingramResponse = await ingramproduct_coll.findOneAndUpdate({
            "name":name
        }, {
            $set: {
                "thirdPartyCodes.ingramPartNumber": req.body.ingramPartNumber
            }
        });

        return res.json({
            status:true,
            message:'ingramPartNumber updated successfully'
        })

    }
    catch(error){
        console.log(error);
        return res.josn({
            status:false,
            message:error
        })
    }
}


module.exports.ingramStockData = ingramStockData;
module.exports.searchIngramName = searchIngramName;
module.exports.getIngramProduct = getIngramProduct;
module.exports.updateIngramPartnumber =updateIngramPartnumber;
