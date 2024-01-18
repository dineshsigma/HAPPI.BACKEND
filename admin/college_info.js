const serverless = require('serverless-http');
const express = require('express')
const app = express();
const { v4: uuidv4 } = require('uuid');
var cors = require('cors');
var jwt = require('jsonwebtoken');
var request = require('request');
let axios = require('axios');
const {
    ObjectId
} = require('mongodb');


var mongo = require("../db");
const { Parser } = require('json2csv');
const { query } = require('express');


async function collegeInfoDownload(req,res){
    try {
      var db = await mongo.connect();
      const customer_infoTbl = db.collection("college_info");
      let query = {};
      let fromdate = req.query.fromdate;
      let todate = req.query.todate;
      if (fromdate != 'all' && todate != 'all') {
        fromdate = new Date(fromdate);
        todate = new Date(todate);
        todate.setDate(todate.getDate() + 1);
        // fromdate.setHours(0, 0, 0, 0);
        // todate.setHours(0, 0, 0, 0);
        query.date = {
          "$gte": fromdate.toISOString(),
          "$lte": todate.toISOString()
        };
      }
      console.log("query----", query);
  
      let data = await customer_infoTbl.find(query).toArray();
      if (data.length > 0) {
        const fields = data[0].keys;
        const opts = {
          fields
        };
  
        const parser = new Parser(opts);
        const csv = parser.parse(data);
        res.setHeader('Content-disposition', 'attachment; filename=data.csv');
        res.set('Content-Type', 'text/csv');
        res.status(200).send(csv);
      } else {
        res.send('no data found');
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

  
  module.exports.collegeInfoDownload=collegeInfoDownload;