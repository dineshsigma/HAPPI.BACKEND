var mongo = require('../db');

async function leadsReport(){
    var db = await mongo.connect();

    var leadTbl = db.collection("laptop-leads");

    var from = new Date();
    from.setHours(0,0,0,0);

    var to = new Date();
    to.setHours(23,59,59,999);
    var result = {};
    result.todayLaptopLead = await leadTbl.count({
        $and: [
            {date :{$gt: from, $lte: to}},
            { type: "laptop" }
        ]
    });

    result.todayMobileLead = await leadTbl.count({
        $and: [
            {date :{$gt: from, $lte: to}},
            { type: "mobile" }
        ]
    });

    from.setDate(from.getDate() - 1);
    to.setDate(to.getDate() - 1);


    result.ystdLaptopLead = await leadTbl.count({
        $and: [
            {date :{$gt: from, $lte: to}},
            { type: "laptop" }
        ]
    });

    result.ystdMobileLead = await leadTbl.count({
        $and: [
            {date :{$gt: from, $lte: to}},
            { type: "mobile" }
        ]
    });

    from.setDate(from.getDate() - 7);

    result.last7LaptopLead = await leadTbl.count({
        $and: [
            {date :{$gt: from, $lte: to}},
            { type: "laptop" }
        ]
    });

    result.last7MobileLead = await leadTbl.count({
        $and: [
            {date :{$gt: from, $lte: to}},
            { type: "mobile" }
        ]
    });

    console.log("result", result);
}

leadsReport();
