const { MongoClient } = require("mongodb");
let database = null;

//local
//const URI = process.env.MONGO_URL || "mongodb://happimain:tUDuD9okePhlyl%2B@happi-main-db.happimobiles.com:27017/?authMechanism=DEFAULT&authSource=happi-new-sls";
//production
const URI = process.env.MONGO_URL || "mongodb://happimain:tUDuD9okePhlyl%2B@127.0.0.1:27017/?authMechanism=DEFAULT&authSource=happi-new-sls";
exports.connect = async function () {
  if (database) {
    return database;
  }
  var client = new MongoClient(URI);

  await client.connect();
  //happi-qa
  database = client.db(process.env.MONGO_DB || "happi-new-sls");
  // const collection = database.collection(collectionName);

  return database;
};
