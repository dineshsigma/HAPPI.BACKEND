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




async function  cart_datefilter(req,res){
    console.log("req--------",req.query);
    try{
        var dataBase = await mongo.connect();
        let usercartcoll= await dataBase.collection('userCartDetails');
        let formdate = req.query.fromdate;
        let todate = req.query.todate;
        let phone=req.query.phone;
        let skip=parseInt(req.query.skip) || 0;
        let limit=parseInt(req.query.limit) || 0;
        var query = {};

        if (formdate != 'all' && todate != 'all') {
            formdate = new Date(formdate);
            todate = new Date(todate);
            todate.setDate(todate.getDate() + 1);
            // formdate.setHours(0, 0, 0, 0);
            // todate.setHours(0, 0, 0, 0);

            query.createdon = {
                "$gte": formdate,
                "$lte": todate
            };
        }
        if(phone != undefined && phone != ''){
           query.phone={ $regex: phone, $options: "i" };
        }

        console.log("query--------------",query);
       let data = await usercartcoll.find(query).sort({"createdon":-1}).toArray();
    
        let dataarr=[];
        for(var i=0;i<data.length;i++){
            
            if(data[i].phone==null || data[i].phone==''){

               delete data[i];

            }
            else{
                
              dataarr.push(data[i])
            }
        }

        // console.log("data array",dataarr.length);

        dataarr = dataarr.filter((li, idx, self) => self.map(itm => itm.phone).indexOf(li.phone) === idx);


        // let totalcount= await usercartcoll.count(query);
        // console.log("data length with limit",data.length);
        // console.log("total",totalcount);
        // let count=data.length;
        res.json({
            status:true,
            // "totalcount":totalcount,
            // "count":count,
            // "phonecount":dataarr.length,
            data:dataarr

            
            


        })
      
        

    }
    catch(error){
        console.log(error);
        res.json({
            status:true,
            message:error
        })
        
    }
}




async function search_phone(req,res){
    try{
        let phone=req.query.phone;

        console.log("phone",phone);

        var dataBase = await mongo.connect();
        let usercartcoll= await dataBase.collection('userCartDetails');

        // let searchcoll= await usercartcoll.find({"phone":phone}).toArray();
        var searchcoll=await usercartcoll.find({"phone":{ $regex: phone, $options: "i" }}).toArray();

        res.json({
            status:true,
            data:searchcoll
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





async function datestatusfilter(req,res){
    try{

        var dataBase = await mongo.connect();
        let usercartcoll= await dataBase.collection('userCartDetails');
        let formdate = req.query.fromdate;
        let todate = req.query.todate;

        
        if (formdate != 'all' && todate != 'all') {
            formdate = new Date(formdate);
            todate = new Date(todate);
            todate.setDate(todate.getDate() + 1);
            // formdate.setHours(0, 0, 0, 0);
            // todate.setHours(0, 0, 0, 0);

            query.createdon = {
                "$gte": formdate,
                "$lte": todate
            };
        }

    }
    catch(error){
        console.log(error);
        res.json({
            status:false,
            message:error
        })
    }

}

// db.userCartDetails .find({
//     "phone " :  '%56%'
//    });



async function cart(req,res){
    try{
        let db = await mongo.connect();
        let cartres=await db.collection('userCartDetails');
        let response= await cartres.find({"phone":1},{unique:true,dropDups:true}).toArray();
        return res.json({
            status:true,
            response:response
        })

    }
    catch(error){
        console.log(error);
    }
}

module.exports.cart_datefilter = cart_datefilter;
module.exports.search_phone = search_phone;
module.exports.cart = cart;
