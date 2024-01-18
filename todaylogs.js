const express = require('express')
const app = express();
var cors = require('cors')
let axios = require('axios');
var mongo = require("./db");
const { Parser } = require('json2csv');
app.options("*", cors()); // include before other routes
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }))



app.get('/akshayaPatraStoreManager', akshayaPatraStoreManager)
async function akshayaPatraStoreManager(req, res) {
    console.log("req.query----", req.query);
    try {
        var db = await mongo.connect();
        let akshaya_patra_store_manager = db.collection('akshaya_patra_store_manager');
        let fromdate = req.query.fromdate;
        let todate = req.query.todate;
        let query = {};
        if (fromdate != "all" && todate != "all") {
            fromdate = new Date(fromdate);
            todate = new Date(todate);
            todate.setDate(todate.getDate() + 1);
            fromdate.setHours(0, 0, 0, 0);
            todate.setHours(0, 0, 0, 0);
            //new ISODate("2017-04-14T23:59:59Z"),
            query.created_on = { $gte: fromdate, $lte: todate };
            //query.created_on = { $gte: new ISODate(fromdate), $lte: new ISODate(todate) };
        }
        console.log("query", query);
        let akshsyaPatraStoreManagerResponse = await akshaya_patra_store_manager.find(query).sort({ "created_on": -1 }).toArray();
        return res.json({
            status: true,
            data: akshsyaPatraStoreManagerResponse,
            Totalcount: akshsyaPatraStoreManagerResponse?.length
        })

    }
    catch (error) {
        console.log("error", error);
        return res.json({
            status: false,
            message: error
        })
    }
}

//store managare data count
app.get('/storemanagercount', storemangerCount)
async function storemangerCount(req, res) {
    try {
        var db = await mongo.connect();
        let akshaya_patra_store_manager = db.collection('akshaya_patra_store_manager');
        var from = new Date();
        from.setHours(0, 0, 0, 0);
        var to = new Date();
        to.setHours(23, 59, 59, 999);
        var result = {};
        console.log(from, to)
        result.todaystoremanagerdetails = await akshaya_patra_store_manager.count({
            $and: [
                { created_on: { $gt: from, $lte: to } },

            ],
        });

        from.setDate(from.getDate() - 1);
        to.setDate(to.getDate() - 1);

        console.log(from, to)
        result.yesterstoremanagerdetails = await akshaya_patra_store_manager.count({
            $and: [
                { created_on: { $gt: from, $lte: to } },

            ]
        });

        from.setDate(from.getDate() - 7);
        result.lastsevendaysstoremanagerdetails = await akshaya_patra_store_manager.count({
            $and: [
                { created_on: { $gt: from, $lte: to } },

            ]
        });

        result.totalCount = await akshaya_patra_store_manager.count({})


        return res.json({
            status: true,
            data: result

        })

    }
    catch (error) {
        console.log("error", error);
        return res.json({
            status: false,
            data: error
        })
    }

}

//store manager download

app.get('/akshayaPatraStoreManagerDownload', akshayaPatraStoreManagerDownload);
async function akshayaPatraStoreManagerDownload(req, res) {
    console.log("req.query----", req.query);
    try {
        var db = await mongo.connect();
        let akshaya_patra_store_manager = db.collection('akshaya_patra_store_manager');
        let fromdate = req.query.fromdate;
        let todate = req.query.todate;
        let query = {};
        if (fromdate != "all" && todate != "all") {
            fromdate = new Date(fromdate);
            todate = new Date(todate);
            todate.setDate(todate.getDate() + 1);
            fromdate.setHours(0, 0, 0, 0);
            todate.setHours(0, 0, 0, 0);
            //new ISODate("2017-04-14T23:59:59Z"),
            query.created_on = { $gte: fromdate, $lte: todate };
            //query.created_on = { $gte: new ISODate(fromdate), $lte: new ISODate(todate) };
        }
        console.log("query", query);
        let data = await akshaya_patra_store_manager.find(query).sort({ "created_on": -1 }).toArray();
        if (data.length > 0) {
            const fields = data[0].keys;
            const opts = { fields };
            try {
                const parser = new Parser(opts);
                const csv = parser.parse(data);
                res.setHeader("Content-disposition", "attachment; filename=data.csv");
                res.set("Content-Type", "text/csv");
                res.status(200).send(csv);
            } catch (error) {
                console.log(error);
                res.json({ status: false, message: error.message });
            }
        } else {
            res.send("no data found");
        }


    }
    catch (error) {
        console.log("error", error);
        return res.json({
            status: false,
            message: error
        })
    }
}



//Message to customer get records
app.get('/akshayaPatraMessageToCustomer', akshayaPatraMessageToCustomer);

app.get('/akshayaPatraMessageToCustomer', akshayaPatraMessageToCustomer)
async function akshayaPatraMessageToCustomer(req, res) {
    console.log("req.query----", req.query);
    try {
        var db = await mongo.connect();
        let akshaya_patra_message_to_customer = db.collection('akshaya_patra_logs');
        let fromdate = req.query.fromdate;
        let todate = req.query.todate;
        let query = {};
        if (fromdate != "all" && todate != "all") {
            fromdate = new Date(fromdate);
            todate = new Date(todate);
            todate.setDate(todate.getDate() + 1);
            fromdate.setHours(0, 0, 0, 0);
            todate.setHours(0, 0, 0, 0);
            //new ISODate("2017-04-14T23:59:59Z"),
            query.created_on = { $gte: fromdate, $lte: todate };
            //query.created_on = { $gte: new ISODate(fromdate), $lte: new ISODate(todate) };
        }
        console.log("query", query);
        let akshsyaPatraStoreMessageToCustomerResponse = await akshaya_patra_message_to_customer.find(query).sort({ "created_on": -1 }).toArray();
        return res.json({
            status: true,
            data: akshsyaPatraStoreMessageToCustomerResponse,
            Totalcount: akshsyaPatraStoreMessageToCustomerResponse?.length
        })

    }
    catch (error) {
        console.log("error", error);
        return res.json({
            status: false,
            message: error
        })
    }
}

//message to customer count

app.get('/customermessagecount', customermessagecount)
async function customermessagecount(req, res) {
    try {
        var db = await mongo.connect();
        let akshaya_patra_message_customer = db.collection('akshaya_patra_logs');
        var from = new Date();
        from.setHours(0, 0, 0, 0);
        var to = new Date();
        to.setHours(23, 59, 59, 999);
        var result = {};
        console.log(from, to)
        result.todaycustomermessagedetails = await akshaya_patra_message_customer.count({
            $and: [
                { created_on: { $gt: from, $lte: to } },

            ],
        });

        from.setDate(from.getDate() - 1);
        to.setDate(to.getDate() - 1);

        console.log(from, to)
        result.yestercustomermessagesdetails = await akshaya_patra_message_customer.count({
            $and: [
                { created_on: { $gt: from, $lte: to } },

            ]
        });

        from.setDate(from.getDate() - 7);
        result.lastsevendaycustomermessagesdetails = await akshaya_patra_message_customer.count({
            $and: [
                { created_on: { $gt: from, $lte: to } },

            ]
        });

        result.totalCount = await akshaya_patra_message_customer.count({})


        return res.json({
            status: true,
            data: result

        })

    }
    catch (error) {
        console.log("error", error);
        return res.json({
            status: false,
            data: error
        })
    }

}


//download message to customer

app.get('/akshayaPatracustomerMessageDownload', akshayaPatracustomerMessageDownload);
async function akshayaPatracustomerMessageDownload(req, res) {
    console.log("req.query----", req.query);
    try {
        var db = await mongo.connect();
        let akshaya_patra_store_manager = db.collection('akshaya_patra_logs');
        let fromdate = req.query.fromdate;
        let todate = req.query.todate;
        let query = {};
        if (fromdate != "all" && todate != "all") {
            fromdate = new Date(fromdate);
            todate = new Date(todate);
            todate.setDate(todate.getDate() + 1);
            fromdate.setHours(0, 0, 0, 0);
            todate.setHours(0, 0, 0, 0);
            //new ISODate("2017-04-14T23:59:59Z"),
            query.created_on = { $gte: fromdate, $lte: todate };
            //query.created_on = { $gte: new ISODate(fromdate), $lte: new ISODate(todate) };
        }
        console.log("query", query);
        let data = await akshaya_patra_store_manager.find(query).sort({ "created_on": -1 }).toArray();
        if (data.length > 0) {
            const fields = data[0].keys;
            const opts = { fields };
            try {
                const parser = new Parser(opts);
                const csv = parser.parse(data);
                res.setHeader("Content-disposition", "attachment; filename=data.csv");
                res.set("Content-Type", "text/csv");
                res.status(200).send(csv);
            } catch (error) {
                console.log(error);
                res.json({ status: false, message: error.message });
            }
        } else {
            res.send("no data found");
        }


    }
    catch (error) {
        console.log("error", error);
        return res.json({
            status: false,
            message: error
        })
    }
}


//askshayaPatraParticipation graph query
app.get('/akshayaPatraParticipationgraphquery', akshayaPatraParticipationgraph)
async function akshayaPatraParticipationgraph(req, res) {
    console.log("req.query----", req.query);
    try {
        var db = await mongo.connect();
        let akshaya_patra_participation = db.collection('akshaya-patra-participation');
        let fromdate = req.query.fromdate;
        let todate = req.query.todate;
        let query = {};
        if (fromdate != "all" && todate != "all") {
            fromdate = new Date(fromdate);
            todate = new Date(todate);
            todate.setDate(todate.getDate() + 1);
            fromdate.setHours(0, 0, 0, 0);
            todate.setHours(0, 0, 0, 0);
            //new ISODate("2017-04-14T23:59:59Z"),
            query.created_on = { $gte: fromdate, $lte: todate };
            //query.created_on = { $gte: new ISODate(fromdate), $lte: new ISODate(todate) };
        }
        var options = {
            allowDiskUse: true
        };

        var pipeline = [
            {
                "$match": query
            },
            {
                "$project": {
                    "h": {
                        "$hour": "$created_on"
                    }
                }
            },
            {
                "$group": {
                    "_id": "$h",

                    "total": {
                        $sum: 1
                    }
                }
            }
        ]
        var data = await akshaya_patra_participation.aggregate(pipeline, options).toArray();
        // let data = await akshaya_patra_participation.find(query).toArray();
        data.sort((a, b) => { return a._id - b._id })



        return res.send(data)





    }
    catch (error) {
        console.log("error", error);
        return res.json({
            status: false,
            message: error
        })
    }
}


app.get('/getakshayaPatraParticipation', akshayaPatraParticipation)
async function akshayaPatraParticipation(req, res) {
    console.log("req.query----", req.query);
    try {
        var db = await mongo.connect();
        let akshaya_patra_participation = db.collection('akshaya-patra-participation');
        let fromdate = req.query.fromdate;
        let todate = req.query.todate;
        let query = {};
        if (fromdate != "all" && todate != "all") {
            fromdate = new Date(fromdate);
            todate = new Date(todate);
            todate.setDate(todate.getDate() + 1);
            fromdate.setHours(0, 0, 0, 0);
            todate.setHours(0, 0, 0, 0);
            //new ISODate("2017-04-14T23:59:59Z"),
            query.created_on = { $gte: fromdate, $lte: todate };
            //query.created_on = { $gte: new ISODate(fromdate), $lte: new ISODate(todate) };
        }

        let data = await akshaya_patra_participation.find(query).toArray();
        //    console.log("cursors",cursor);
        return res.json({
            status: true,
            data: data,
            Totalcount: data.length

        })





    }
    catch (error) {
        console.log("error", error);
        return res.json({
            status: false,
            message: error
        })
    }
}

//download akshayaPatraParticipation 
app.get('/akshayaPatricipationDownload', akshayaPatraParticipationDownload);
async function akshayaPatraParticipationDownload(req, res) {
    console.log("req.query----", req.query);
    try {
        var db = await mongo.connect();
        let akshaya_patra = db.collection('akshaya-patra-participation');
        let fromdate = req.query.fromdate;
        let todate = req.query.todate;
        let query = {};
        if (fromdate != "all" && todate != "all") {
            fromdate = new Date(fromdate);
            todate = new Date(todate);
            todate.setDate(todate.getDate() + 1);
            fromdate.setHours(0, 0, 0, 0);
            todate.setHours(0, 0, 0, 0);
            //new ISODate("2017-04-14T23:59:59Z"),
            query.created_on = { $gte: fromdate, $lte: todate };
            //query.created_on = { $gte: new ISODate(fromdate), $lte: new ISODate(todate) };
        }
        console.log("query", query);
        let data = await akshaya_patra.find(query).sort({ "created_on": -1 }).toArray();
        if (data.length > 0) {
            const fields = data[0].keys;
            const opts = { fields };
            try {
                const parser = new Parser(opts);
                const csv = parser.parse(data);
                res.setHeader("Content-disposition", "attachment; filename=data.csv");
                res.set("Content-Type", "text/csv");
                res.status(200).send(csv);
            } catch (error) {
                console.log(error);
                res.json({ status: false, message: error.message });
            }
        } else {
            res.send("no data found");
        }


    }
    catch (error) {
        console.log("error", error);
        return res.json({
            status: false,
            message: error
        })
    }
}

//One Assist Sync 


app.get('/oneAssistgraphquery', oneAssistgraph)
async function oneAssistgraph(req, res) {
    console.log("req.query----", req.query);
    try {
        var db = await mongo.connect();
        let oneassist_sync = db.collection('oneassist-sync');
        let fromdate = req.query.fromdate;
        let todate = req.query.todate;
        let query = {};
        if (fromdate != "all" && todate != "all") {
            fromdate = new Date(fromdate);
            todate = new Date(todate);
            todate.setDate(todate.getDate() + 1);
            fromdate.setHours(0, 0, 0, 0);
            todate.setHours(0, 0, 0, 0);
            //new ISODate("2017-04-14T23:59:59Z"),
            query.created = { $gte: fromdate, $lte: todate };
            //query.created_on = { $gte: new ISODate(fromdate), $lte: new ISODate(todate) };
        }
        var options = {
            allowDiskUse: true
        };

        var pipeline = [
            {
                "$match": query
            },
            {
                "$project": {
                    "h": {
                        "$hour": "$created"
                    }
                }
            },
            {
                "$group": {
                    "_id": "$h",
                    "total": {
                        $sum: 1
                    }

                }
            }
        ]
        var data = await oneassist_sync.aggregate(pipeline, options).toArray();
        // let data = await akshaya_patra_participation.find(query).toArray();



        return res.send(data)





    }
    catch (error) {
        console.log("error", error);
        return res.json({
            status: false,
            message: error
        })
    }
}


//get one Assist Async data

app.get('/getoneassist_sync', oneassist_sync)
async function oneassist_sync(req, res) {
    console.log("req.query----", req.query);
    try {
        var db = await mongo.connect();
        let oneassist_sync = db.collection('oneassist-sync');
        let fromdate = req.query.fromdate;
        let todate = req.query.todate;
        let query = {};
        if (fromdate != "all" && todate != "all") {
            fromdate = new Date(fromdate);
            todate = new Date(todate);
            todate.setDate(todate.getDate() + 1);
            fromdate.setHours(0, 0, 0, 0);
            todate.setHours(0, 0, 0, 0);
            //new ISODate("2017-04-14T23:59:59Z"),
            query.created = { $gte: fromdate, $lte: todate };
            //query.created_on = { $gte: new ISODate(fromdate), $lte: new ISODate(todate) };
        }

        let data = await oneassist_sync.find(query).toArray();
        //    console.log("cursors",cursor);
        return res.json({
            status: true,
            data: data,
            TotalCount: data.length

        })





    }
    catch (error) {
        console.log("error", error);
        return res.json({
            status: false,
            message: error
        })
    }
}


//download OneAssist Sync

app.get('/oneassist-syncDownload', oneassistsyncDownload);
async function oneassistsyncDownload(req, res) {
    console.log("req.query----", req.query);
    try {
        var db = await mongo.connect();
        let oneassist_sync = db.collection('oneassist-sync');
        let fromdate = req.query.fromdate;
        let todate = req.query.todate;
        let query = {};
        if (fromdate != "all" && todate != "all") {
            fromdate = new Date(fromdate);
            todate = new Date(todate);
            todate.setDate(todate.getDate() + 1);
            fromdate.setHours(0, 0, 0, 0);
            todate.setHours(0, 0, 0, 0);
            //new ISODate("2017-04-14T23:59:59Z"),
            query.created = { $gte: fromdate, $lte: todate };
            //query.created_on = { $gte: new ISODate(fromdate), $lte: new ISODate(todate) };
        }
        console.log("query", query);
        let data = await oneassist_sync.find(query).sort({ "created": -1 }).toArray();
        if (data.length > 0) {
            const fields = data[0].keys;
            const opts = { fields };
            try {
                const parser = new Parser(opts);
                const csv = parser.parse(data);
                res.setHeader("Content-disposition", "attachment; filename=data.csv");
                res.set("Content-Type", "text/csv");
                res.status(200).send(csv);
            } catch (error) {
                console.log(error);
                res.json({ status: false, message: error.message });
            }
        } else {
            res.send("no data found");
        }


    }
    catch (error) {
        console.log("error", error);
        return res.json({
            status: false,
            message: error
        })
    }
}


module.exports = app;
