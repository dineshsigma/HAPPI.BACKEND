const serverless = require('serverless-http');
const express = require('express');
var cors = require('cors')
const app = express();
app.use(cors())
app.use(express.json());
app.use(
    express.urlencoded({
      extended: true,
    })
  );

let schema=require('./bajaj-emi/schemafetch.js'); 
let billing=require('./bajaj-emi/billingotp'); 
let authapi=require('./bajaj-emi/auth.js');

// app.post('/api/schemafetch',schema.customerSearchApi); 
// app.post('/api/billingotp',billing.billingOtp); 
// app.post('/api/authapi',authapi.authApi);

module.exports=app;  