var mongo = require("./db");

async function leadsReport( req, res){
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


    from = new Date();
    to = new Date();

    from.setHours(0,0,0,0); // date =1
    to.setHours(23,59,59,999);

    from.setDate(1);




    result.thisMonthLaptopLead = await leadTbl.count({
        $and: [
            {date :{$gt: from, $lte: to}},
            { type: "laptop" }
        ]
    });

    result.thisMonthMobileLead = await leadTbl.count({
        $and: [
            {date :{$gt: from, $lte: to}},
            { type: "mobile" }
        ]
    });


    to.setHours(0,0,0,0); // date =1
    to.setDate(1);

    from.setMonth(from.getMonth()-1);




    result.lastMonthLaptopLead = await leadTbl.count({
        $and: [
            {date :{$gt: from, $lte: to}},
            { type: "laptop" }
        ]
    });

    result.lastMonthMobileLead = await leadTbl.count({
        $and: [
            {date :{$gt: from, $lte: to}},
            { type: "mobile" }
        ]
    });

    result.totalMobile = await leadTbl.count({
        $and: [
            { type: "mobile" },
        ]

    })
    result.totalLaptop = await leadTbl.count({
        $and: [
            { type: "laptop" },
        ]
    })

    return res.json(result);
}

async function getFilters(req,res){
    let databse=await mongo.connect();

    let coll=await databse.collection('laptop-leads');

    let status= await coll.distinct('status');
    let utm_medium= await coll.distinct('utm_medium');
    let utm_campaign= await coll.distinct('utm_campaign');
    let utm_source= await coll.distinct('utm_source');

    console.log("status list",status);
    console.log("utm_medium list",utm_medium);
    console.log("utm_campaign list",utm_campaign);
    console.log("utm_source",utm_source);
   return res.json({"status":status,"utm_medium":utm_medium,"utm_campaign":utm_campaign,"utm_source":utm_source});
}
module.exports.leadReports = leadsReport;
module.exports.filters = getFilters;