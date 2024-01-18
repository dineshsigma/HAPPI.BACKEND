var axios = require('axios');
// const Pool = require('pg-pool');
// const pool = require('../config').pool
// const proconfig = require('../config').config;
const mongo = require("./db");
const moment = require('moment');
const app = require('../runner');


//Daily mor 3

async function awaitIMEIlogs(req, res) {
    let db = await mongo.connect();
    let iphone_imei_logsTb = db.collection('iphone_imei_logs');
    let apx_productTb = db.collection('apx_product')
    try {
        let date = new Date();
        var stdate = moment(date).format('YYYYMMDD');
        console.log('stdate............', stdate);
        var config = {
            method: 'get',
            url: 'http://183.82.44.213/api/apxapi/GetExtendedInvoiceDetails?CompanyCode=HM&InvoiceStartDate=' + stdate + '&InvoiceEndDate=' + stdate + '&SalespersonCode=0', headers: {
                'UserId': 'WEBSITE',
                'SecurityCode': '3489-7629-9163-3979'
            }
        };
        var outresponse = await axios(config);
        let outputarray = [];
        //console.log("outputresponse", outresponse.data.length);
        for (var i = 0; i < outresponse.data.length; i++) {
            for (var j = 0; j < outresponse.data[i].invoiceItemData.length; j++) {
                var check_duplicate;
                var data;
                try {
                    if (outresponse.data[i].invoiceItemData[j].invoiceItemSerialNoDatas != null) {
                        //console.log(outresponse.data[i].invoicePrimaryData.InvoiceNo)
                        //console.log("outresponse.data[i].invoiceItemData[j].ItemCode", outresponse.data[i].invoiceItemData[j].ItemCode)
                        check_duplicate = await iphone_imei_logsTb.find({ "imei_no": outresponse.data[i].invoiceItemData[j].invoiceItemSerialNoDatas[0].SerialNo }).toArray()
                        if (check_duplicate.length <= 0) {
                            data = await apx_productTb.find({ "ITEM_CODE": outresponse.data[i].invoiceItemData[j].ItemCode }).toArray();
                            if (data.length > 0) {
                                //console.log("data", data);
                                let PROD_CATG_NAME = data[0].PROD_CATG_NAME
                                if (PROD_CATG_NAME == "IPHONE") {
                                    let logs = {
                                        emp_code: outresponse.data[i].invoicePrimaryData.SalespersonCode,
                                        emp_name: outresponse.data[i].invoicePrimaryData.SalespersonName,
                                        invoice_no: outresponse.data[i].invoicePrimaryData.InvoiceNo,
                                        invoice_date: new Date(),
                                        item_code: outresponse.data[i].invoiceItemData[j].ItemCode,
                                        imei_no: outresponse.data[i].invoiceItemData[j].invoiceItemSerialNoDatas[0].SerialNo,
                                        status: 'AWAIT',
                                        "createdDate": new Date(),
                                        message: "NOT UPLOADED"

                                    }
                                    console.log("logs", logs);
                                   // await iphone_imei_logsTb.insertOne(logs)
                                    return res.json({
                                        status: true,
                                        message: "IMEI logs saved"
                                    })

                                }
                                else {
                                    return res.json({
                                        status: true,
                                        message: "duplicates not allowed"
                                    })
                                }
                            }
                            else {
                                return res.json({
                                    status: true,
                                    message: "duplicates not allowed"
                                })
                            }
                        }
                    }

                } catch (error) {
                    console.log("error,-----------", error);
                    return;

                } finally {

                }
            }
        }
    }
    catch (error) {
        return res.json({
            status: false,
            message: "error"
        })
    }
}


// awaitIMEIlogs()
module.exports.awaitIMEIlogs = awaitIMEIlogs;