/*

{ 
    "_id" : ObjectId("61a9a6688bf4425e2e8a3494"), 
    "id" : "123123122", 
    "title" : "Amazon Pay Offer - Get Cashback up to ₹1600", 
    "rule" : "mobile", 
    "categoy_id" : [

    ], 
    "mobileIds" : [
        "770999001ua61b", 
        "768599001sk61b"
    ], 
    "amount" : {
        "min" : 40001.0, 
        "max" : 70000.0, 
        "maxCashBack" : 1600.0, 
        "percentage" : 3.0
    }, 
    "paymentGateway" : "AmazonPay", 
    "offerKey" : null, 
    "description" : "Mobile Price Between (Rs 40,000 - Rs 70,000). Get cashback OR No Cost EMI! Get Cashback up to ₹1600 Get 3,6 months No Cost EMI on all products on Credit Card Transactions. Get 3,6,9,12 months No Cost EMI on all products on Amazon Pay Later Transactions.", 
    "startDatetime" : "2021-12-01T12:46:51.344Z", 
    "endDatetime" : "2021-12-31T12:46:51.344Z", 
    "status" : true, 
    "ShowTimer" : "yes", 
    "terms" : "", 
    "display_weight" : NumberInt(1)
}

{ 
    "_id" : ObjectId("61f39e23195aa30010b3d2ba"), 
    "id" : "dd3d4d1c-7a79-4b30-bb85-bc34daf8b397", 
    "title" : "Kotak Bank Offer-Get up to Rs6000 cashback with Kotak Bank EMI transactions.", 
    "rule" : "mobile", 
    "categoy_id" : [

    ], 
    "mobileIds" : [
        "Apple iPhone", 
        "13Pro 128 Graphite", 
        "13Pro 128 Sierra Blu", 
        "13Pro 128 Silver", 
        "13Pro 256 Gold", 
        "13Pro 256 Graphite", 
        "13Pro 512 Gold", 
        "13Pro 256 Sierra Blu", 
        "13Pro 512 Graphite", 
        "13Pro 256 Silver", 
        "13Pro 512 Sierra Blu", 
        "13Pro 512 Silver", 
        "13Pro 1TB Gold", 
        "13Pro 1TB Graphite", 
        "13Pro 1TB Sierra Blu", 
        "13Pro 1TB Silver", 
        "13ProMax 128 Gold", 
        "13ProMax 128 Graphit", 
        "13ProMax 128 Sierra", 
        "13ProMax 128 Silver", 
        "13ProMax 256 Gold", 
        "13ProMax 256 Graphit", 
        "13ProMax 256 Sierra", 
        "13ProMax 256 Silver", 
        "13ProMax 512 Gold", 
        "13ProMax 512 Graphit", 
        "13ProMax 512 Sierra", 
        "13ProMax 512 Silver", 
        "13ProMax 1TB Gold", 
        "13ProMax 1TB Graphit", 
        "13ProMax 1TB Sierra", 
        "13ProMax 1TB Silver", 
        "12 64GB Black", 
        "12 128GB Black", 
        "12 256gb Black", 
        "12Mini 64gb Black", 
        "12Mini 128gb Purple", 
        "12 64GB Blue", 
        "12 64GB Green", 
        "12 64 Purple", 
        "12 64GB RED", 
        "12 64GB White", 
        "12 128GB Black", 
        "12 128gb Blue", 
        "12 128GB Green", 
        "12 128GB Purple", 
        "12 128GB Red", 
        "12 256gb Black", 
        "12 256GB Blue", 
        "12 256gb Green", 
        "12 256gb Purple", 
        "12 256GB white", 
        "12Mini 64gb Black", 
        "12Mini 64gb Red", 
        "12Mini 64gb White", 
        "12Mini 128gb Purple", 
        "12Mini 128gb Black", 
        "12Mini 128gb Blue", 
        "12Mini 128GB Green", 
        "12Mini 128GB White"
    ], 
    "amount" : {
        "min" : NumberInt(49900), 
        "max" : NumberInt(159900), 
        "maxCashBack" : NumberInt(6000), 
        "percentage" : NumberInt(0)
    }, 
    "paymentGateway" : "Pinelabs", 
    "offerKey" : "", 
    "description" : " Low cost EMI & Low cost EMI schemes of 3m,6m,9m & 12m tenures available On  KotakBank and Select Leading Credit & Debit Cards ", 
    "startDatetime" : "2022-01-01T07:40:24.361Z", 
    "endDatetime" : "2022-03-31T07:40:24.361Z", 
    "status" : true, 
    "ShowTimer" : "No", 
    "display_weight" : NumberInt(500), 
    "terms" : "text"
}
*/

var mongo = require('../db');
var devices = ["12 128gb Blue", "12Mini 128GB White"];
// var amount =
async function run(){
    // var db = await mongo.connect();
    // var offersTbl = db.collection('offer');
    // var offers = await offersTbl.find({status: true});
    // for(var i = 0 ; i < offers.length ; i++){
    //
    // }
    var body = {category: ["mobile", "mobile-samsung"], apx_code: ["M326BH 8/128 Blue"], price: 22999};
    var db = await mongo.connect();
    var offersTbl = db.collection("offers");

    var offers = await offersTbl.find({
        $and: [
            { status: true },
            { startDatetime: { $lte: new Date() } },
            { endDatetime: { $gte: new Date() } },
        ]
    },{}).toArray();

    var selected_offers = [];

    for(var i = 0; i < offers.length ; i++ )
    {
        var offer = offers[i];
        if(offer.rule === "mobile"){
            if(body.apx_code.length !== 0){
                let result = body.apx_code.filter(o1 => offer.mobileIds.some(o2 => o1 === o2));
                console.log("OK-1", result);
                if(result.length !== 0) {
                    selected_offers.push(offer)
                }
            }
        } else if (offer.rule === 'cart-value' || offer.rule === "device-amount"){
            if(offer.amount.min <= body.price &&
                offer.amount.max >= body.price){
                console.log("OK-2")
                selected_offers.push(offer);
            }
        }

    }
    console.log(selected_offers);
}

run()

