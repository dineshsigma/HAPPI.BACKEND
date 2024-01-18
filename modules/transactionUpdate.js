var request = require('request');
// create uuid module import
var generateUuidModule = require('../modules/generate-uuid');
var config= require("../config.js");

const MONGO_DB_CONNECTION =
    process.env.MONGO_DB_CONNECTION ||
    "mongodb+srv://sowmya:iNNrxOhVfEdvsUaI@happinewsls.cnw2n.mongodb.net/happi-new-sls?replicaSet=atlas-11ilgn-shard-0&readPreference=primary&connectTimeoutMS=10000&authSource=admin&authMechanism=SCRAM-SHA-1";
const mongo = require("../db");


async function saveOrderTransaction(obj) {
    var db = await mongo.connect();
    var tran = db.collection('transaction_details');
    tran.insertOne(obj);
}

module.exports.saveOrderTransaction = saveOrderTransaction;
