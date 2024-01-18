const serverless = require("serverless-http");
const express = require('express')
const app = express();
const { v4: uuidv4 } = require('uuid');
var cors = require('cors')
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
const assert = require('assert');
var crypto = require('crypto');

app.use(cors())
app.use(express.json());


module.exports=app;
