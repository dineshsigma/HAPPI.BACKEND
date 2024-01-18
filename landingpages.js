
const express = require("express");
const cors = require("cors");
const app = express();
var mongo = require("./db");
const { v4: uuidv4 } = require("uuid");
const res = require("express/lib/response");
app.options("*", cors()); // include before other routes
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.post('/getLandingPageDetails', getLandingPageDetails)
async function getLandingPageDetails(req, res) {
    try {
        let title = req.body.title;
        let database = await mongo.connect();
        let happilandingTb = await database.collection("happi_landing_pages");
        let landingPageDetails = await happilandingTb.findOne({ "title": title });
        return res.json({
            status: true,
            data: landingPageDetails
        })
    }
    catch (error) {
        console.log("error", error);
        return res.json({
            status: false,
            message: "ERROR"
        })
    }
}

app.post('/updateLandingPages', updateLandingPages)
async function updateLandingPages(req, res) {
    try {
        console.log("req.body", req.body);
        let body = req.body
        let database = await mongo.connect();
        let happilandingTb = await database.collection("happi_landing_pages");
        let data = await happilandingTb.findOne({ "id": req.body.id })
        if (req.body.key == "desktop") {
            let filterData = data?.topbanner_desktop?.image_url.filter((item, index) => item.id !== req.body.delete1.id);
            // console.log("filterData", filterData)
            let topbanner_desktop = data.topbanner_desktop;
            topbanner_desktop.image_url = filterData;
            // console.log("topbanner_desktop", topbanner_desktop)
            await happilandingTb.findOneAndUpdate({ "id": req.body.id }, { $set: { "topbanner_desktop": topbanner_desktop } });
        }
        else if (req.body.key == "mobile") {
            let filterData = data?.topbanner_mobile?.image_url.filter((item, index) => item.id !== req.body.delete2.id);
            console.log("filterData", filterData)
            let topbanner_mobile = data.topbanner_mobile;
            topbanner_mobile.image_url = filterData;
            await happilandingTb.findOneAndUpdate({ "id": req.body.id }, { $set: { "topbanner_mobile": topbanner_mobile } });
        }



        return res.json({
            status: true,
            message: "Updated Successfully"
        })

    }
    catch (error) {
        console.log("error", error);
        return res.json({
            status: false,
            message: "error"
        })
    }
}

app.post('/uploadNewData', uploadNewData);
async function uploadNewData(req, res) {
    try {
        let database = await mongo.connect();
        let happilandingTb = await database.collection("happi_landing_pages");
        let inputJson = await happilandingTb.findOne({ "id": req.body.id });
        let newImageObject = req.body.image_url[0]

        if (req.body.key == "desktop") {
            if (typeof inputJson.topbanner_desktop.image_url === 'object') {
                inputJson.topbanner_desktop.image_url = inputJson.topbanner_desktop.image_url;
            }
            inputJson.topbanner_desktop.image_url.push(newImageObject);
            inputJson.topbanner_desktop.image_url = inputJson.topbanner_desktop.image_url.filter(item => !Array.isArray(item) || item.length > 0);
            await happilandingTb.findOneAndUpdate({ "id": req.body.id }, { $set: inputJson });
        }
        else if (req.body.key == "mobile") {
            if (typeof inputJson.topbanner_mobile.image_url === 'object') {
                inputJson.topbanner_mobile.image_url = inputJson.topbanner_mobile.image_url;
            }
            inputJson.topbanner_mobile.image_url.push(newImageObject);
            inputJson.topbanner_mobile.image_url = inputJson.topbanner_mobile.image_url.filter(item => !Array.isArray(item) || item.length > 0);
            await happilandingTb.findOneAndUpdate({ "id": req.body.id }, { $set: inputJson });
        }
        return res.json({
            status: true,
            message: "Add new Image Upload successfully"
        })
    }
    catch (error) {
        console.log("error", error);
        return res.json({
            status: false,
            message: "ERROR"
        })
    }

}

module.exports = app