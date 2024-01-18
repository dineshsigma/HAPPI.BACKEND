var ESMongoSync = require('node-elasticsearch-sync');

// initialize package as below
let finalCallBack = function () {
    console.log("===============================DONE===============================")
}

let transformFunction = function (watcher, document, callBack) {
    //document.name = document.firstName + ' ' + document.lastName;
    delete document._id;
    console.log("document : ", JSON.stringify(document) );
    callBack(document);
}

let sampleWatcher = {
    collectionName: 'product',
    index: 'product',
    type: '_doc',
    transformFunction: transformFunction,
    fetchExistingDocuments: true,
    priority: 0
};

let watcherArray = [];
watcherArray.push(sampleWatcher);

let batchCount = 1500;

var MONGO_DB = 'mongodb://sowmya:iNNrxOhVfEdvsUaI@happinewsls-shard-00-00.cnw2n.mongodb.net:27017,happinewsls-shard-00-01.cnw2n.mongodb.net:27017,happinewsls-shard-00-02.cnw2n.mongodb.net:27017/admin?ssl=true&replicaSet=atlas-11ilgn-shard-0&readPreference=primary&connectTimeoutMS=10000&authSource=admin&authMechanism=SCRAM-SHA-1&3t.uriVersion=3&3t.connection.name=SLS&3t.databases=admin,test&3t.alwaysShowAuthDB=true&3t.alwaysShowDBFromUserRole=true&3t.sslTlsVersion=TLS';
var ELASTIC_SEARCH_URL = 'https://happiadmin:uCSxPHSEcUh0t0TWsqU1-@search-es.happimobiles.com/'


ESMongoSync.init(MONGO_DB, ELASTIC_SEARCH_URL, finalCallBack, watcherArray, batchCount);
