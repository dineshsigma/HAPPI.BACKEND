
const serverless = require('serverless-http');
const express = require('express')
const app = express();
const { v4: uuidv4 } = require('uuid');
var cors = require('cors')
app.use(cors())
app.use(express.json());
var format = require('date-format');
var axios = require('axios');
var uuid = require('./modules/generate-uuid');
const {
    Parser
} = require('json2csv');
const {removeRuleConfiguration} = require("serverless/lib/plugins/aws/customResources/resources/eventBridge/lib/eventBridge");
var mongo = require("./db");
const { filter } = require('async');
const res = require('express/lib/response');
const { ApiGatewayManagementApi } = require('aws-sdk');


app.post('/third-party/order/', async (req, res) => {

    console.log("ORDER", JSON.stringify(req.body));
    // var options = {
    //     method: "post",
    //     url:'https://iiplwork.app.n8n.cloud/webhook/c840345f-5fa2-482c-b348-8bd7beb40395',
    //     headers: {
    //         'Content-Type': 'application/json'
    //     },
    //     data :JSON.stringify(req.body)
    // };
    var orderSyncTest = {}
    orderSyncTest.bill_no = req.body.objClass[0].bill_no;
    orderSyncTest.customer_mobile = req.body.objClass[0].customer_mobile;
    orderSyncTest.customer_fname = req.body.objClass[0].customer_fname;
    orderSyncTest.createdOn = new Date();
    var config_es_link_test = {
        method: 'post',
        url: 'https://search-es.happimobiles.com/orderSync/_doc/'+orderSyncTest.bill_no.replace("/","-").replace("/","-"),
        headers: {
            'Content-Type': 'application/json',
            'Authorization':'Basic aGFwcGlhZG1pbjp1Q1N4UEhTRWNVaDB0MFRXc3FVMS0='
        },
        data : JSON.stringify(orderSyncTest)
    };
    await axios(config_es_link_test);

    var order = req.body.objClass[0];
    order.createdOn = new Date();
    var config_es_link = {
        method: 'post',
        url: 'https://search-es.happimobiles.com/order/_doc/'+order.bill_no.replace("/","-").replace("/","-"),
        headers: {
            'Content-Type': 'application/json',
            'Authorization':'Basic aGFwcGlhZG1pbjp1Q1N4UEhTRWNVaDB0MFRXc3FVMS0='
        },
        data : JSON.stringify(order)
    };
    await axios(config_es_link);

    await oneAssist(req.body.objClass[0]);

    /*
    {
     "objClass": [
         {
             "store_code": "SRNR",
             "bill_date": "2021-12-19",
             "bill_no": "SI/SRNR/4626",
             "bill_grand_total": "19965",
             "bill_discount": "0",
             "bill_tax": "3118",
             "bill_transaction_type": "Take Away",
             "bill_gross_amount": "19965",
             "bill_net_amount": "19965",
             "customer_fname": "NAVEEN",
             "customer_mobile": "9676145740",
             "customer_email": "",
             "voucher_code": "",
             "voucher_value": "",
             "voucher_type": "",
             "bill_tender_type": "CRED",
             "customer_dob": "1989-01-01",
             "customer_doa": "1900-01-01",
             "bill_time": "2021-12-19 21:50:28",
             "bill_type": "Take Away",
             "bill_status": "New",
             "bill_transcation_no": "SI/SRNR/4626",
             "bill_discount_per": "",
             "bill_service_tax": "",
             "bill_cancel_date": "",
             "bill_cancel_time": "",
             "bill_cancel_reason": "",
             "bill_cancel_amount": "",
             "bill_cancel_against": "",
             "bill_modify": "",
             "bill_modify_reason": "",
             "bill_modify_datetime": "",
             "bill_remarks1": "0",
             "bill_remarks2": "",
             "bill_remarks3": "",
             "bill_remarks4": "",
             "bill_remarks5": "",
             "customer_code": "9676145740.",
             "customer_lname": "NAVEEN",
             "customer_gender": "Male",
             "customer_city": "Hyderabad",
             "customer_area": " General",
             "customer_address": "",
             "customer_state": "TELANGANA",
             "customer_remarks1": "",
             "customer_remarks2": "",
             "customer_remarks3": "",
             "customer_remarks4": "",
             "customer_remarks5": "",
             "ext_param1": "",
             "ext_param2": "",
             "ext_param3": "",
             "ext_param4": "",
             "ext_param5": "",
             "bill_round_off_amount": "",
             "output": [
                 {
                     "item_serial_no": "1",
                     "item_barcode": "",
                     "item_code": "Y33s 8/128 Dream",
                     "item_name": "Y33s Vivo 8/128 - Middy Dream",
                     "item_rate": "16178",
                     "item_net_amount": "19090",
                     "item_gross_amount": "16178",
                     "item_quantity": "1",
                     "item_discount_per": "",
                     "item_discount": "0",
                     "item_tax": "2912",
                     "item_service_tax": "",
                     "item_brand_code": "",
                     "item_brand_name": "AA VIVO",
                     "item_category_code": "",
                     "item_category_name": "FIFO ITEM MODEL",
                     "item_group": "",
                     "item_group_name": "AA SMARTMOBILES",
                     "item_color_code": "",
                     "item_color_name": "",
                     "item_size_code": "",
                     "item_size_name": "",
                     "item_sub_category_code": "",
                     "item_sub_category_name": "",
                     "item_status": "New",
                     "item_department_code": "",
                     "item_department_name": "",
                     "item_remarks1": "868918054309699",
                     "item_remarks2": "HM1098 - Ch Ashok",
                     "item_remarks3": "",
                     "item_remarks4": "",
                     "item_remarks5": ""
                 },
                 {
                     "item_serial_no": "2",
                     "item_barcode": "",
                     "item_code": "UCB T-SHIRT",
                     "item_name": "UCB T-SHIRT WHITE LYCRA",
                     "item_rate": "0",
                     "item_net_amount": "0",
                     "item_gross_amount": "0",
                     "item_quantity": "0",
                     "item_discount_per": "",
                     "item_discount": "0",
                     "item_tax": "0",
                     "item_service_tax": "",
                     "item_brand_code": "",
                     "item_brand_name": "FREE ISSUES",
                     "item_category_code": "",
                     "item_category_name": " General",
                     "item_group": "",
                     "item_group_name": "FREE ISSUE",
                     "item_color_code": "",
                     "item_color_name": "",
                     "item_size_code": "",
                     "item_size_name": "",
                     "item_sub_category_code": "",
                     "item_sub_category_name": "",
                     "item_status": "New",
                     "item_department_code": "",
                     "item_department_name": "",
                     "item_remarks1": "",
                     "item_remarks2": "HM1098 - Ch Ashok",
                     "item_remarks3": "",
                     "item_remarks4": "",
                     "item_remarks5": ""
                 },
                 {
                     "item_serial_no": "3",
                     "item_barcode": "",
                     "item_code": "LAWMEN BAG",
                     "item_name": "LAWMEN DUFFLE BAG",
                     "item_rate": "0",
                     "item_net_amount": "0",
                     "item_gross_amount": "0",
                     "item_quantity": "0",
                     "item_discount_per": "",
                     "item_discount": "0",
                     "item_tax": "0",
                     "item_service_tax": "",
                     "item_brand_code": "",
                     "item_brand_name": "FREE ISSUES",
                     "item_category_code": "",
                     "item_category_name": " General",
                     "item_group": "",
                     "item_group_name": "FREE ISSUE",
                     "item_color_code": "",
                     "item_color_name": "",
                     "item_size_code": "",
                     "item_size_name": "",
                     "item_sub_category_code": "",
                     "item_sub_category_name": "",
                     "item_status": "New",
                     "item_department_code": "",
                     "item_department_name": "",
                     "item_remarks1": "",
                     "item_remarks2": "HM1098 - Ch Ashok",
                     "item_remarks3": "",
                     "item_remarks4": "",
                     "item_remarks5": ""
                 },
                 {
                     "item_serial_no": "4",
                     "item_barcode": "",
                     "item_code": "HAPPI CARE",
                     "item_name": "HAPPI CARE",
                     "item_rate": "1144",
                     "item_net_amount": "1350",
                     "item_gross_amount": "1144",
                     "item_quantity": "1",
                     "item_discount_per": "",
                     "item_discount": "0",
                     "item_tax": "206",
                     "item_service_tax": "",
                     "item_brand_code": "",
                     "item_brand_name": "VAS",
                     "item_category_code": "",
                     "item_category_name": " General",
                     "item_group": "",
                     "item_group_name": "VAS INSURANCE",
                     "item_color_code": "",
                     "item_color_name": "",
                     "item_size_code": "",
                     "item_size_name": "",
                     "item_sub_category_code": "",
                     "item_sub_category_name": "",
                     "item_status": "New",
                     "item_department_code": "",
                     "item_department_name": "",
                     "item_remarks1": "",
                     "item_remarks2": "HM1098 - Ch Ashok",
                     "item_remarks3": "",
                     "item_remarks4": "",
                     "item_remarks5": ""
                 }
             ]
         }
     ]
 }
     */

    var akashya_obj = {
        customer_name : req.body.objClass[0].customer_fname,
        customer_mobile : req.body.objClass[0].customer_mobile,
        customer_dob : req.body.objClass[0].customer_dob.substring(5)
    };

    var date = new Date().toISOString().split("T")[0].substring(5);
    if(akashya_obj.customer_dob == date){
        var data = JSON.stringify(
            {
                "lead":
                    {
                        "first_name": req.body.objClass[0].customer_fname,
                        "mobile_number": "+91"+req.body.objClass[0].customer_mobile,
                        "address": "",
                        "custom_field": {
                            "cf_url": `https://www.happimobiles.com/`,
                            "cf_request_type": "akshaya_patra",
                            "cf_mobile_model": "",
                            "cf_payment_type": ""
                        }
                    }
            });
            var config = {
                method: 'post',
                url: 'https://happimobiles1.freshsales.io/api/leads',
                headers: {
                    'Authorization': 'Token token=jjDyYzo0QA5jmaAopMB6wQ',
                    'Content-Type': 'application/json'
                },
                data: data
            };
    
            var result = await axios(config);

            var logs = {
                customer_name : req.body.objClass[0].customer_fname || "Happimobiles",
                customer_mobile: "+91"+req.body.objClass[0].customer_mobile,
                created_on: new Date(),
                freshsales_logs : result.data
            };
            var db = await mongo.connect();
            await db.collection("akshaya_patra_logs").insertOne(logs); 
    }
   
    console.log("akashya_obj", akashya_obj)

    var conn = await mongo.connect();
    var akshaya_patra_coll = conn.collection("akshaya_patra");
    await akshaya_patra_coll.insertOne(akashya_obj);



    res.json({
        status: true,
        message: "Order Received"
    });

});

var sehemes = [
    {
        "PlanCode": "5377",
        "Plan Name": "Happi  Mobile Damage Protection Plan 1 Year 5k to 8K ",
        "Plan Description": "Happi  Mobile Damage Protection Plan 1 Year 5k to 8K  created on 02 August 2019  Single Claim 5 percent excess on SI",
        "From": 5001,
        "To": 8000,
        "MRP": "649"
    },
    {
        "PlanCode": "5378",
        "Plan Name": "Happi  Mobile Damage Protection Plan 1 Year 8k to 12K ",
        "Plan Description": "Happi  Mobile Damage Protection Plan 1 Year 8k to 12K  created on 02 August 2019 Single Claim 5 percent excess on SI",
        "From": 8001,
        "To": 12000,
        "MRP": "999"
    },
    {
        "PlanCode": "5379",
        "Plan Name": "Happi  Mobile Damage Protection Plan 1 Year 12k to 16K ",
        "Plan Description": "Happi  Mobile Damage Protection Plan 1 Year 12k to 16K  created on 02 August 2019  Single Claim 5 percent excess on SI",
        "From": 12001,
        "To": 16000,
        "MRP": "1399"
    },
    {
        "PlanCode": "5380",
        "Plan Name": "Happi  Mobile Damage Protection Plan 1 Year 16k to 20K ",
        "Plan Description": "Happi  Mobile Damage Protection Plan 1 Year 16k to 20K  created on 02 August 2019  Single Claim 5 percent excess on SI",
        "From": 16001,
        "To": 20000,
        "MRP": "1799"
    },
    {
        "PlanCode": "5381",
        "Plan Name": "Happi  Mobile Damage Protection Plan 1 Year 20k to 25K ",
        "Plan Description": "Happi  Mobile Damage Protection Plan 1 Year 20k to 25K  created on 02 August 2019  Single Claim 5 percent excess on SI",
        "From": 20001,
        "To": 25000,
        "MRP": "2249"
    },
    {
        "PlanCode": "5382",
        "Plan Name": "Happi  Mobile Damage Protection Plan 1 Year 25k to 30K ",
        "Plan Description": "Happi  Mobile Damage Protection Plan 1 Year 25k to 30K  created on 02 August 2019  Single Claim 5 percent excess on SI",
        "From": 25001,
        "To": 30000,
        "MRP": "2749"
    },
    {
        "PlanCode": "5383",
        "Plan Name": "Happi  Mobile Damage Protection Plan 1 Year 30k to 40K ",
        "Plan Description": "Happi  Mobile Damage Protection Plan 1 Year 30k to 40K  created on 02 August 2019  Single Claim 5 percent excess on SI",
        "From": 30001,
        "To": 40000,
        "MRP": "3499"
    },
    {
        "PlanCode": "5384",
        "Plan Name": "Happi  Mobile Damage Protection Plan 1 Year 40k to 50K ",
        "Plan Description": "Happi  Mobile Damage Protection Plan 1 Year 40k to 50K  created on 02 August 2019  Single Claim 5 percent excess on SI",
        "From": 40001,
        "To": 50000,
        "MRP": "4499"
    },
    {
        "PlanCode": "5385",
        "Plan Name": "Happi  Mobile Damage Protection Plan 1 Year 50k to 60K ",
        "Plan Description": "Happi  Mobile Damage Protection Plan 1 Year 50k to 60K  created on 02 August 2019  Single Claim 5 percent excess on SI",
        "From": 50001,
        "To": 60000,
        "MRP": "5449"
    },
    {
        "PlanCode": "5386",
        "Plan Name": "Happi  Mobile Damage Protection Plan 1 Year 60k to 80K ",
        "Plan Description": "Happi  Mobile Damage Protection Plan 1 Year 60k to 80K  created on 02 August 2019  Single Claim 5 percent excess on SI",
        "From": 60001,
        "To": 80000,
        "MRP": "6949"
    },
    {
        "PlanCode": "5387",
        "Plan Name": "Happi  Mobile Damage Protection Plan 1 Year Above 80k",
        "Plan Description": "Happi  Mobile Damage Protection Plan 1 Year Above 80k created on 02 August 2019  Single Claim 5 percent excess on SI",
        "From": 80001,
        "To": 160000,
        "MRP": "9999"
    }
];
var appleSchemes = [
    {
        "PlanCode": 7211,
        "Plan Name": "Happi Mobile Damage Protection Apple 15K to 30K",
        "From": 15001,
        "To": 30000,
        "MRP": 2899
    },
    {
        "PlanCode": 7212,
        "Plan Name": "Happi Mobile Damage Protection Apple 30K to 40K",
        "From": 30001,
        "To": 40000,
        "MRP": 3999
    },
    {
        "PlanCode": 7213,
        "Plan Name": "Happi Mobile Damage Protection Apple 40K to 50K",
        "From": 40001,
        "To": 50000,
        "MRP": 4699
    },
    {
        "PlanCode": 7214,
        "Plan Name": "Happi Mobile Damage Protection Apple 50K to 60K",
        "From": 50001,
        "To": 60000,
        "MRP": 5799
    },
    {
        "PlanCode": 7215,
        "Plan Name": "Happi Mobile Damage Protection Apple 60K to 80K",
        "From": 60001,
        "To": 80000,
        "MRP": 7699
    },
    {
        "PlanCode": 7216,
        "Plan Name": "Happi Mobile Damage Protection Apple 80K to 100K",
        "From": 80001,
        "To": 100000,
        "MRP": 7999
    },
    {
        "PlanCode": 7217,
        "Plan Name": "Happi Mobile Damage Protection Apple 100K to 120K",
        "From": 100001,
        "To": 120000,
        "MRP": 10999
    },
    {
        "PlanCode": 7218,
        "Plan Name": "Happi Mobile Damage Protection Apple 120K to 150K",
        "From": 120001,
        "To": 150000,
        "MRP": 14999
    },
    {
        "PlanCode": 7219,
        "Plan Name": "Happi Mobile Damage Protection Apple 150K to 175K",
        "From": 150001,
        "To": 175000,
        "MRP": 14999
    },
    {
        "PlanCode": 7220,
        "Plan Name": "Happi Mobile Damage Protection Apple 175K to 200K",
        "From": 175000,
        "To": 200000,
        "MRP": 14999
    }
]
var partnerCodes = [
    {
        "OA BU Name": "Happi ADILABAD",
        "partnerBUCode": "25006",
        "BRANCH_CODE": "ADBD"
    },
    {
        "OA BU Name": "Happi AMEERPET",
        "partnerBUCode": "24970",
        "BRANCH_CODE": "AMPT"
    },
    {
        "OA BU Name": "Happi ANANTAPUR",
        "partnerBUCode": "24971",
        "BRANCH_CODE": "ANTP"
    },
    {
        "OA BU Name": "Happi ASRAO NAGAR",
        "partnerBUCode": "24972",
        "BRANCH_CODE": "ASRN"
    },
    {
        "OA BU Name": "Happi ATTAPUR",
        "partnerBUCode": "51394",
        "BRANCH_CODE": "ATPR"
    },
    {
        "OA BU Name": "Happi BANJARA HILLS",
        "partnerBUCode": "51393",
        "BRANCH_CODE": "BJH"
    },
    {
        "OA BU Name": "Happi BHIMAVARAM",
        "partnerBUCode": "25005",
        "BRANCH_CODE": "BVRM"
    },
    {
        "OA BU Name": "Happi BODUPPAL",
        "partnerBUCode": "24973",
        "BRANCH_CODE": "BDPL"
    },
    {
        "OA BU Name": "Happi CHAITANYAPURI",
        "partnerBUCode": "24974",
        "BRANCH_CODE": "CHPR"
    },
    {
        "OA BU Name": "Happi CHANDANAGAR",
        "partnerBUCode": "24975",
        "BRANCH_CODE": "CHND"
    },
    {
        "OA BU Name": "Happi CHINTAL",
        "partnerBUCode": "25007",
        "BRANCH_CODE": "CHNT"
    },
    {
        "OA BU Name": "Happi Dabagardens",
        "partnerBUCode": "25026",
        "BRANCH_CODE": "DBGS"
    },
    {
        "OA BU Name": "Happi DHARMAVARAM",
        "partnerBUCode": "24976",
        "BRANCH_CODE": "DVRM"
    },
    {
        "OA BU Name": "Happi DILUSHUKNAGAR",
        "partnerBUCode": "25018",
        "BRANCH_CODE": "DSNR"
    },
    {
        "OA BU Name": "Happi ECIL",
        "partnerBUCode": "25020",
        "BRANCH_CODE": "ECIL"
    },
    {
        "OA BU Name": "Happi ELLURU",
        "partnerBUCode": "25040",
        "BRANCH_CODE": "ELR"
    },
    {
        "OA BU Name": "Happi Gajuwaka",
        "partnerBUCode": "25025",
        "BRANCH_CODE": "GJWK"
    },
    {
        "OA BU Name": "Happi GODAVARIKHANI",
        "partnerBUCode": "25000",
        "BRANCH_CODE": "GDVK"
    },
    {
        "OA BU Name": "Happi Gopalapatnam",
        "partnerBUCode": "25023",
        "BRANCH_CODE": "GPTM"
    },
    {
        "OA BU Name": "Happi GREENLANDS",
        "partnerBUCode": "24977",
        "BRANCH_CODE": "GRNL"
    },
    {
        "OA BU Name": "Happi GUNTUR-1",
        "partnerBUCode": "25009",
        "BRANCH_CODE": "GNT"
    },
    {
        "OA BU Name": "Happi HANUMAKONDA(NAYEEM NAGAR)",
        "partnerBUCode": "24999",
        "BRANCH_CODE": "HNMK"
    },
    {
        "OA BU Name": "Happi HANUMAKONDA-2",
        "partnerBUCode": "25019",
        "BRANCH_CODE": "HNMK2"
    },
    {
        "OA BU Name": "Happi HIMAYATHNAGAR",
        "partnerBUCode": "24978",
        "BRANCH_CODE": "HMYT"
    },
    {
        "OA BU Name": "Happi HYDERNAGAR",
        "partnerBUCode": "51392",
        "BRANCH_CODE": "HYDR"
    },
    {
        "OA BU Name": "Happi KADIRI",
        "partnerBUCode": "25002",
        "BRANCH_CODE": "KDR"
    },
    {
        "OA BU Name": "Happi KALYANADURGAM",
        "partnerBUCode": "24979",
        "BRANCH_CODE": "KDGM"
    },
    {
        "OA BU Name": "Happi KARIMNAGAR",
        "partnerBUCode": "24980",
        "BRANCH_CODE": "KRMN"
    },
    {
        "OA BU Name": "Happi KARMANGHAT",
        "partnerBUCode": "25033",
        "BRANCH_CODE": "KMGH"
    },
    {
        "OA BU Name": "Happi Khammam",
        "partnerBUCode": "25015",
        "BRANCH_CODE": "KMM"
    },
    {
        "OA BU Name": "Happi KHARKHANA",
        "partnerBUCode": "24981",
        "BRANCH_CODE": "KRKH"
    },
    {
        "OA BU Name": "Happi KUKATPALLY",
        "partnerBUCode": "24982",
        "BRANCH_CODE": "KKP"
    },
    {
        "OA BU Name": "Happi Kuppam ",
        "partnerBUCode": "51396",
        "BRANCH_CODE": "KPM"
    },
    {
        "OA BU Name": "Happi KURNOOL",
        "partnerBUCode": "24983",
        "BRANCH_CODE": "KRNL"
    },
    {
        "OA BU Name": "Happi KURNOOL 2",
        "partnerBUCode": "25001",
        "BRANCH_CODE": "KRNL2"
    },
    {
        "OA BU Name": "Happi LANGARHOUSE",
        "partnerBUCode": "24984",
        "BRANCH_CODE": "LNGH"
    },
    {
        "OA BU Name": "Happi MADANAPALLE",
        "partnerBUCode": "25037",
        "BRANCH_CODE": "MDPL"
    },
    {
        "OA BU Name": "Happi MADHAPUR",
        "partnerBUCode": "24985",
        "BRANCH_CODE": "MDPR"
    },
    {
        "OA BU Name": "Happi MAHABUBNAGAR",
        "partnerBUCode": "24986",
        "BRANCH_CODE": "MHBR"
    },
    {
        "OA BU Name": "Happi MALKAJGIRI",
        "partnerBUCode": "24987",
        "BRANCH_CODE": "MLKJ"
    },
    {
        "OA BU Name": "Happi NALGONDA",
        "partnerBUCode": "24996",
        "BRANCH_CODE": "NLG"
    },
    {
        "OA BU Name": "Happi Narasampet",
        "partnerBUCode": "25014",
        "BRANCH_CODE": "NSMP"
    },
    {
        "OA BU Name": "Happi NERDMET 2",
        "partnerBUCode": "24988",
        "BRANCH_CODE": "NDMT 2"
    },
    {
        "OA BU Name": "Happi NIZAMABAD",
        "partnerBUCode": "25004",
        "BRANCH_CODE": "NZB"
    },
    {
        "OA BU Name": "Happi ongole",
        "partnerBUCode": "25028",
        "BRANCH_CODE": "ONG"
    },
    {
        "OA BU Name": "Happi RAJAMUNDARY",
        "partnerBUCode": "25010",
        "BRANCH_CODE": "RJY"
    },
    {
        "OA BU Name": "Happi RAMANTHAPUR",
        "partnerBUCode": "24989",
        "BRANCH_CODE": "RMTP"
    },
    {
        "OA BU Name": "Happi RTC X ROAD",
        "partnerBUCode": "24990",
        "BRANCH_CODE": "RTCX"
    },
    {
        "OA BU Name": "Happi SANGAREDDY",
        "partnerBUCode": "25003",
        "BRANCH_CODE": "SNGR"
    },
    {
        "OA BU Name": "Happi SANTOSH NAGAR",
        "partnerBUCode": "25012",
        "BRANCH_CODE": "STNR"
    },
    {
        "OA BU Name": "Happi SAROORNAGAR",
        "partnerBUCode": "25032",
        "BRANCH_CODE": "SRNR"
    },
    {
        "OA BU Name": "Happi SD ROAD",
        "partnerBUCode": "25034",
        "BRANCH_CODE": "SDR"
    },
    {
        "OA BU Name": "Happi SHAMSHABAD",
        "partnerBUCode": "24991",
        "BRANCH_CODE": "SMBD"
    },
    {
        "OA BU Name": "Happi SHAPUR",
        "partnerBUCode": "51395",
        "BRANCH_CODE": "SHPR"
    },
    {
        "OA BU Name": "Happi Sharath capital city mall",
        "partnerBUCode": "25013",
        "BRANCH_CODE": "SCCM"
    },
    {
        "OA BU Name": "Happi SIDDIPET",
        "partnerBUCode": "25011",
        "BRANCH_CODE": "SDPT"
    },
    {
        "OA BU Name": "Happi SR NAGAR",
        "partnerBUCode": "25036",
        "BRANCH_CODE": "SRN"
    },
    {
        "OA BU Name": "Happi Srikakulam",
        "partnerBUCode": "25022",
        "BRANCH_CODE": "SKKM"
    },
    {
        "OA BU Name": "Happi Suryapet",
        "partnerBUCode": "25016",
        "BRANCH_CODE": "SRPT"
    },
    {
        "OA BU Name": "Happi tadepalligudem",
        "partnerBUCode": "25027",
        "BRANCH_CODE": "TDPG"
    },
    {
        "OA BU Name": "Happi Tadipatri",
        "partnerBUCode": "25021",
        "BRANCH_CODE": "TDPT"
    },
    {
        "OA BU Name": "Happi Tenali",
        "partnerBUCode": "25017",
        "BRANCH_CODE": "TNL"
    },
    {
        "OA BU Name": "Happi TIRUPATHI",
        "partnerBUCode": "25038",
        "BRANCH_CODE": "TPT"
    },
    {
        "OA BU Name": "Happi UPPAL",
        "partnerBUCode": "24992",
        "BRANCH_CODE": "UPL"
    },
    {
        "OA BU Name": "Happi VANASTALIPURAM",
        "partnerBUCode": "24993",
        "BRANCH_CODE": "VNSP"
    },
    {
        "OA BU Name": "Happi Vijayanagaram",
        "partnerBUCode": "25035",
        "BRANCH_CODE": "VZM"
    },
    {
        "OA BU Name": "Happi Vijayawada-1",
        "partnerBUCode": "25024",
        "BRANCH_CODE": "VIJ-1"
    },
    {
        "OA BU Name": "Happi Vijayawada-2",
        "partnerBUCode": "25029",
        "BRANCH_CODE": "VIJ 2"
    },
    {
        "OA BU Name": "Happi Vijayawada-3",
        "partnerBUCode": "25030",
        "BRANCH_CODE": "VIJ 3"
    },
    {
        "OA BU Name": "Happi Vijayawada-4",
        "partnerBUCode": "25031",
        "BRANCH_CODE": "VIJ 4"
    },
    {
        "OA BU Name": "Happi WARANGAL",
        "partnerBUCode": "24997",
        "BRANCH_CODE": "WGL"
    }
];


async function oneAssist(order){


    console.log("ORDER OUTPUT", order.output.find(findHappiCode));
    var orderDate = FormatDate(order.bill_date);

    if(order.output.find(findHappiCode) === null || order.output.find(findHappiCode) === undefined){
        var logs = {
            customer_name: order.customer_fname,
            order_id: order.bill_no,
            applicationDate: orderDate,
            created: new Date(),
            "mobileNumber": order.customer_mobile,
            status: "non-inc"
        };
        var config_es = {
            method: 'post',
            url: 'https://search-es.happimobiles.com/oneassist-sync/_doc/'+order.bill_no.replace("/","-").replace("/","-"),
            headers: {
                'Content-Type': 'application/json',
                'Authorization':'Basic aGFwcGlhZG1pbjp1Q1N4UEhTRWNVaDB0MFRXc3FVMS0='
            },
            data : JSON.stringify(logs)
        };
        await axios(config_es);
        return;
    }

    var mobileInfo = order.output.find(function(item){
        return  item.item_remarks1 != "";
    });

    // console.log("mobileSLNumberIndex", mobileSLNumberIndex)
    // var mobileInfo = order.output[mobileSLNumberIndex];
    // https://api.oneassist.in/apigateway/OASYS/webservice/rest/customer/onboardCustomer
    //


    //console.log("mobileInfo", mobileInfo);


    var requestObj = {
        "initiatingSystem": 100060,
        "customerInfo": [{
            "firstName": order.customer_fname,
            "emailId": order.customer_email,
            "mobileNumber": order.customer_mobile,
            "gender": "",
            "relationship": "self",
            "customerdob": "",
            "assetInfo": [{
                "productCode": "MP01",
                "assetMake": FetchBrand(mobileInfo.item_brand_name),
                "assetModel": mobileInfo.item_name,
                "serialNo1":  mobileInfo.item_remarks1,
                "serialNo2": "",
                "invoiceDate": orderDate,
                "invoiceValue": mobileInfo.item_net_amount
            }]
        }],
        "addressInfo": [{
            "addrType": "PER"
        }],
        "orderInfo": {
            "planCode": FetchPlanCode(mobileInfo.item_net_amount, mobileInfo.item_brand_name).PlanCode,
            "partnerCode": "853",
            "partnerBUCode": findPartnerBUCode(order.store_code).partnerBUCode,
            "applicationNo": order.bill_no,
            "applicationDate": orderDate
        },
        "paymentInfo": {
            "paymentMode": "COD"
        }
    }
    console.log("requestObj", JSON.stringify(requestObj));
    var config = {
        method: 'post',
        url: 'https://api.oneassist.in/apigateway/OASYS/webservice/rest/customer/onboardCustomer',
        headers: {
            'Authorization': 'Basic SGFwcGlNb2JpbGVzOkFzc2lzdEAxMjM=',
            'Content-Type': 'application/json'
        },
        data : JSON.stringify(requestObj)
    };

    var { data } = await axios(config);

    if(data.status === "success"){
        var logs = {
            startDate: data.membershipInfo.startDate,
            endDate: data.membershipInfo.endDate,
            membershipNumber: data.membershipInfo.membershipNumber,
            customer_name: data.primaryCustomerName,
            order_id: order.bill_no,
            applicationDate: orderDate,
            created: new Date(),
            "mobileNumber": order.customer_mobile,
            "planCode": FetchPlanCode(mobileInfo.item_net_amount, mobileInfo.item_brand_name).PlanCode,
            "partnerCode": "853",
            "partnerBUCode": findPartnerBUCode(order.store_code).partnerBUCode,
            "productCode": "MP01",
            "assetMake": FetchBrand(mobileInfo.item_brand_name),
            "assetModel": mobileInfo.item_name,
            "serialNo1":  mobileInfo.item_remarks1,
            "serialNo2": "",
            "invoiceDate": orderDate,
            "invoiceValue": mobileInfo.item_net_amount,
            status: "success"
        }
        var config_es = {
            method: 'post',
            url: 'https://search-es.happimobiles.com/oneassist-sync/_doc/'+order.bill_no.replace("/","-").replace("/","-"),
            headers: {
                'Content-Type': 'application/json',
                'Authorization':'Basic aGFwcGlhZG1pbjp1Q1N4UEhTRWNVaDB0MFRXc3FVMS0='
            },
            data : JSON.stringify(logs)
        };
        await axios(config_es);
    }else{
        var logs = {
            requestObj: requestObj,
            response: data
        }
        var config_es = {
            method: 'post',
            url: 'https://search-es.happimobiles.com/oneassist-sync-fail/_doc/'+order.bill_no.replace("/","-").replace("/","-"),
            headers: {
                'Content-Type': 'application/json',
                'Authorization':'Basic aGFwcGlhZG1pbjp1Q1N4UEhTRWNVaDB0MFRXc3FVMS0='
            },
            data : JSON.stringify(logs)
        };
        await axios(config_es);
    }
    return;
}

function FetchBrand(brand){
    var make_names = [
        "REALME",
        "Yu",
        "Zen",
        "ZTE",
        "Google",
        "Reliance",
        "Sony Ericsson",
        "Spice",
        "Videocon",
        "Vivo",
        "InFocus",
        "Intex",
        "Letv",
        "Meizu",
        "Microsoft",
        "OPPO",
        "Panasonic",
        "Coolpad",
        "Dell",
        "Honor",
        "HP",
        "Huawei",
        "Apple",
        "Motorola",
        "Xiaomi",
        "OnePlusOne",
        "LeEco",
        "Samsung",
        "Nokia",
        "Gionee",
        "Lenovo",
        "LG",
        "Sony",
        "HTC",
        "MicroMax",
        "Lava",
        "Karbon",
        "BlackBerry",
        "I-Ball",
        "Acer",
        "Asus",
        "Celkon",
        "LYF",
        "MI",
        "OnePlus",
        "Xolo",
        "Yureka",
        "Amazon",
        "Smartron",
        "Techno",
        "Tecno",
        "COMIO",
        "ITEL Mobiles",
        "YUTOPIA",
        "AQUA",
        "iBERRY",
        "Energy Sistem",
        "Eurostar",
        "ALCATEL",
        "Infinix",
        "Mstar",
        "Phicomm",
        "Wickledleak Wammy",
        "Wham",
        "Others",
        "Tenor",
        "INFINIX MOBILITY LIMITED",
        "REALME",
        "MSI",
        "MOBIISTAR",
        "TCL",
        "LEPHONE",
        "YUHO",
        "Maxx",
        "GOME",
        "IQOO",
        "ITEL",
        "Apple",
        "Lenovo",
        "Asus",
        "LG",
        "Xiaomi",
        "HTC",
        "Nokia",
        "Samsung",
        "MI",
        "OnePlus",
        "Google",
        "OPPO",
        "Vivo",
        "Motorola",
        "Smartron",
        "Amazon",
        "Tecno",
        "Dell",
        "Honor",
        "Coolpad",
        "Gionee",
        "Microsoft",
        "MOBIISTAR",
        "MSI",
        "Maxx",
        "REALME",
        "GOME",
        "IQOO",
        "ITEL"
    ];
    brand = brand.toUpperCase();

    return make_names.find(function(b){
        return brand.indexOf(b.toUpperCase()) !== -1;
    });

}

function findPartnerBUCode(store_code){
    return partnerCodes.find(function(code){
        return store_code === code.BRANCH_CODE;
    });
}

function FetchPlanCode(deviceAmount, brand){
    deviceAmount = parseInt(deviceAmount);
    if(brand === "AA IPHONE"){
        var planIndex = appleSchemes.find(function(plan){
            //console.log(`${parseInt(plan['From'])} < ${deviceAmount} && ${parseInt(plan['To'])} > ${deviceAmount}`)
            if(parseInt(plan['From']) < deviceAmount && parseInt(plan['To']) > deviceAmount) return true;
            else return false;
        });
        console.log("planIndex", planIndex);
        return planIndex;
    }else{
        var planIndex = sehemes.find(function(plan){
            //console.log(`${parseInt(plan['From'])} < ${deviceAmount} && ${parseInt(plan['To'])} > ${deviceAmount}`)
            if(parseInt(plan['From']) < deviceAmount && parseInt(plan['To']) > deviceAmount) return true;
            else return false;
        });
        console.log("planIndex", planIndex);
        return planIndex;
    }


}

function FormatDate(d){
    var months = ["JAN", "FEB", "MAR", "APR", "MAY","JUN","JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    d = d.split('-');
    return `${d[2]}-${months[parseInt(d[1])-1]}-${d[0]}`;
}

function findHappiCode(item){
    if(item.item_code === "HAPPI CARE"){
        return true;
    }
    if(item.item_code === "HAPPI CARE-2"){
        return true;
    }
    if(item.item_code === "HP-15"){
        return true;
    }
    return false;
}

app.post('/third-party/flipkart-stock-push', async (req, res) => {

    const now = new Date();
    try {
        for(var i = 0; i < req.body.data.length; i++){
            var e = req.body.data[i];
            var id = uuid.createUUID();
            var data = '{"inventories": [{"ean": "'+e['EAN']+'","fcId": "WHTG","quantity": '+parseInt(e.q)+',"movementType": "RTW","transactionType": "overwrite"}],"createdDateTime": "'+format.asString('yyyy-MM-dd hh:mm:ss', new Date())+'"}';
            var config = {
                method: 'post',
                url: 'https://api-velocity.ailiens.com/velocity/api/delta/inventory/v2',
                headers: {
                    'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJlbWFpbF9pZCI6ImhhcHBpbW9iaWxlc0BvbXVuaS5jb20iLCJhdWQiOiJvZGluIiwiZmlyc3ROYW1lIjoidml2ZWtzIiwidXNlcl9pZCI6IjJkYmYwODViLWE0MzAtNDZhOS05Nzg0LTY3ODk0YTFmOWUzZCIsInNlc3Npb24iOiJiNDhmM2Q0NC1hZGMwLTQ4ZGUtYjZjZS1kYzZkMGNlNTYzYTIiLCJyb2xlcyI6WyJST0xFX0JVU0lORVNTX1VTRVIiXSwiaXNzIjoiYmxhY2tib2x0IiwidGVuYW50SWQiOiIwYzNmY2JmMy03ZTQ1LTQxYmEtOWU2OS04MDY4ZTRmZmQ1ZTIiLCJ0eXAiOiJCZWFyZXIiLCJpYXQiOjE2MzMwODI3MjMsImp0aSI6IjMzYjFkMTI1LTFmMWUtNGEzZC1iZmU4LWY2MDk1MjE5NTU5ZiJ9.iiJ9Jw__0MSEpa0IZR-ZbBR2du9_p6qj1PFTn8_AIrj6G-mdU2E6IIKpNa_3R0xtxEsElz2YDAIima8KvZLkXZ-sdQzkKlSqanOcsSyMPBkLLogdZP4qvcp2cL_MzqbaxeA07wBMeDNGZNDaATvPQpQa-ASc6FT33jjEgGRu_ukWC4ZnZYHd8BVO68qM8Hdgf6ZgOSNzD4K4gFlOQKK_oxZx7kQTLCdbohoAv42ZUZA__o4F0PDhiOG0eQ0Ql3f4bK3L232xXUVGJvQb-CUMQO4rJy0MFXZdczA-8wHQG-Rdh5BYexMyHuGUGYnrLTfVelfDBe4YW9ENa3PmyEv2Pg',
                    'Content-Type': 'application/json',
                    'Cookie': 'JSESSIONID=node0klu9e4d7x3nylavss6fqnwne231.node0'
                },
                data : data
            };

            var response = await axios(config);

            var data_es = {
                id: id,
                request_data : JSON.parse(data),
                response_data: response.data,
                created_on : new Date()
            };

            var config_es = {
                method: 'post',
                url: 'https://search-es.happimobiles.com/flipkart-sync/_doc/'+id,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization':'Basic aGFwcGlhZG1pbjp1Q1N4UEhTRWNVaDB0MFRXc3FVMS0='
                },
                data : JSON.stringify(data_es)
            };
            await axios(config_es);

        }
    } catch (e) {
        console.log("flipkart-stock-push",e);
        res.json(e)
    }



    res.json({
        status: true,
        message: "Order Received"
    })
});

/*
GET /flipkart-sync/_search
{
  "sort" : [
        { "created_on" : "desc" }
  ],
  "size": 20
}
*/

app.get('/third-party/flipkart-stock-log', async (req, res) => {
    var data_es = {
        "sort" : [
            { "created_on" : "desc" }
        ],
        "size": 200
    };
    var config_es = {
        method: 'post',
        url: 'https://search-es.happimobiles.com/flipkart-sync/_search/',
        headers: {
            'Content-Type': 'application/json',
            'Authorization':'Basic aGFwcGlhZG1pbjp1Q1N4UEhTRWNVaDB0MFRXc3FVMS0='
        },
        data : JSON.stringify(data_es)
    };
    var response = await axios(config_es);
    res.json(response.data.hits.hits);
})

//total products----2954
//ispublished---2306
//category--mobile --ispublished---1507
//not apxcode--215
//1507-215==1292
app.get('/api/getAllAPXcodes',getAllAPXcodes);
async function getAllAPXcodes(req,res){
    try{
        let database= await mongo.connect();
        let productcoll= await database.collection('product');
        let data= await productcoll.find({"ispublished":true,"category":"mobile"},{projection:{"thirdPartyCodes.apxItemCode":1}}).toArray();
        data = data.map(function (e) {

            return {
                id: e.id,
                
                apx: e.thirdPartyCodes.apxItemCode ,
                
            }
        })
        let apxArray=[]
        for(var i=0;i<data.length;i++){
            apxArray.push(data[i].apx);

            
        }

        const result =  apxArray.filter(e =>  e);
        console.log(result.length);
        
        res.json({
            data:result.toString()
        })

    }
    catch(error){
        console.log(error);

    }
}


//


app.get('/api/emptyapxcodes',emptyAPXcodes);
async function emptyAPXcodes(req,res){
    try{
        let database= await mongo.connect();
        let productcoll= await database.collection('product');
        let data= await productcoll.find({"ispublished":true,"thirdPartyCodes.apxItemCode":"","category":"mobile"},{projection:{"name":1,"thirdPartyCodes.apxItemCode":1,"category":1}}).toArray();
        data = data.map(function (e) {

            return {
                id: e.id,
                name:e.name,
                apx: e.thirdPartyCodes.apxItemCode,
                category1:e.category[0],
                category2:e.category[1]
               
                
            }
        })
        console.log(data.length)
        if (data.length > 0) {
            const fields = data[0].keys;
            const opts = {
                fields
            };

          

            const parser = new Parser(opts);
            const csv = parser.parse(data);
            res.setHeader('Content-disposition', 'attachment; filename=data.csv');
            res.set('Content-Type', 'text/csv');
            res.status(200).send(csv);

        } else {
            res.send('no data found')
        }

      

    }
    catch(error){
        console.log(error);
    }
}


app.get('/api/productlist',productslist);
async function productslist(req,res){
    try{
        let database= await mongo.connect();
        let productcoll= await database.collection('product');
        let data= await productcoll.find({"ispublished":true},{projection:{"name":1,"_id":1,"seo":1,"id":1}}).toArray();
        data = data.map(function (e) {

        

            return {
                "_id":e._id,
                "name":e.name,
                "id":e.id,
                "desc":e.seo.desc,
                "title":e.seo.title,
                "h1":e.seo.h1,
                "h2":e.seo.h2,
                "canonicalUrl":e.seo.canonicalUrl,
                "schemaBrand":e.seo.schemaBrand,
                "schemaDescription":e.seo.schemaDescription,
                "aggregateRating":e.seo.aggregateRating,
                "reviewCount":e.seo.reviewCount,
                "review":e.seo.review
               

            }
        })
        if (data.length > 0) {
            const fields = data[0].keys;
            const opts = {
                fields
            };

          

            const parser = new Parser(opts);
            const csv = parser.parse(data);
            res.setHeader('Content-disposition', 'attachment; filename=data.csv');
            res.set('Content-Type', 'text/csv');
            res.status(200).send(csv);

        } else {
            res.send('no data found')
        }


    }
    catch(error){
        console.log(error);

    }
}

// app.post('/api/verify',verifytoken);
// var jwt = require('jsonwebtoken');
// var JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || 'happi_jwt_secrethappi_jwt_secrethappi_jwt_secret';
// async function verifytoken(req,res){
//     try{
//         let token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjFjODQwNTA2LTJlNTItNDdjNS1hNThjLWZjNjNkOWMyYmY0MyIsImF1ZCI6ImFwcGxpY2F0aW9uLTAtbGd4dmciLCJzdWIiOiI4Njg2ODM2MjY5IiwiVUlEIjoiODY4NjgzNjI2OSIsIm5hbWUiOiJzaGFubXVraGEiLCJwaG9uZSI6Ijg2ODY4MzYyNjkiLCJlbWFpbCI6InNya0BpaXBsLndvcmsiLCJyb2xlIjoiYWRtaW4iLCJhY2Nlc3MiOlsiZGFzaGJvYXJkIiwiQ01TIiwiT3JkZXJzICYgU3RvY2siLCJVc2VyIE1hbmFnZW1lbnQiLCJPZmZlcnMgJiBWb3VjaGVycyIsIkxlYWRzIiwiRm9sbG93aW5nIiwiR2xvYmFsIFNldHRpbmdzIiwiUmVwb3J0cyJdLCJpYXQiOjE2NjQ3ODg1NzcsImV4cCI6MTY2NDc4OTE3N30.Bg-6dQbvT7ro7PyVxyCGUDs6KgkS1Lg6vBruELGzL1Y"
//       jwt.verify(token, JWT_SECRET_KEY, function(err, decoded) {
//           let date=new Date()
           
//             console.log("decodedd--------------",decoded,"date-----",date.getTime()/1000);
//           });

//     }
//     catch(error){
//         console.log(error);
//     }

// }



app.get('/api/downloadsubOrderNumber',downloadsubOrderNumber);


async function downloadsubOrderNumber(req,res){
    try{
        var db = await mongo.connect();
        let productTable = await db.collection('orders-v3');
        let response= await productTable.find({"vendor":"ingram"},{projection:{"ingram_info.orders":1}}).toArray();
        let sheet=[];
        
        for(var i=0;i<response.length;i++){
           if(response[i].ingram_info!=undefined && response[i].ingram_info.orders!=undefined){
               //console.log(response[i].ingram_info.orders[0].lines[0].subOrderNumber)
               sheet.push(
                   {"subOrderNumber":response[i].ingram_info.orders[0].lines[0].subOrderNumber,
                   "shipFromWarehouseId":response[i].ingram_info.orders[0].lines[0].shipmentDetails.shipFromWarehouseId,
                   "ingramPartNumber":response[i].ingram_info.orders[0].lines[0].ingramPartNumber
                })

           }
    }
    
        if(sheet.length > 0){
            const fields = sheet[0].keys;
            const opts = {
                fields
            };
                const parser = new Parser(opts);
                const csv = parser.parse(sheet);
                res.setHeader('Content-disposition', 'attachment; filename=data.csv');
                res.set('Content-Type', 'text/csv');
                res.status(200).send(csv);

        }
        else{
            return 'nodata found'
        }
       
       

    }
    catch(error){
        console.log(error);
    }
}


//{"category":"iwatches","ispublished":true}

app.get('/api/filter/uploadproducts',filters);
async function filters(req,res){
   console.log("category-----",req.query);
    let category=req.query.category;
    try{
        var db = await mongo.connect();
        let productTable = await db.collection('product');
        let data= await productTable.find( {"category":category},{projection:{"id":1,"name":1,"category":1,"filter":1}}).toArray();
        data = data.map(function (e) {

            return {
                id: e.id,
                name: e.name,
                category:e.category[1],
                brand:e.filter.brand,
                ram:e.filter.ram,
                cam:e.filter.cam,
                features:e.filter.features,
                network:e.filter.network,
                screen:e.filter.screen,
                battery:e.filter.battery,
                processor:e.filter.processor,
                memory:e.filter.memory





            }
        })
       


       

        if (data.length > 0) {
            const fields = data[0].keys;
            const opts = {
                fields
            };

           

            const parser = new Parser(opts);
            const csv = parser.parse(data);
            res.setHeader('Content-disposition', 'attachment; filename=data.csv');
            res.set('Content-Type', 'text/csv');
            res.status(200).send(csv);

        } else {
            res.send('no data found')
        }
       
      
       

    }
    catch(error){
        console.log(error);
    }
}



app.get('/api/filterupdate/dinesh',filtersUpdate) ; 
async function filtersUpdate(req,res){
    try{
        var db = await mongo.connect();
        let productTable = await db.collection('product');
        for(var i=0;i<data4.length;i++){
           
        let productcoll= await productTable.findOneAndUpdate({"id":data4[i].id},{$set:{"filter.network":"4G"}})
        console.log("success",data4[i].name);
        }

    }
    catch(error){
        console.log(error);
    }
}





app.get('/api/ispublishedfalse',isPublishedFalse);
async function isPublishedFalse(req,res){
    console.log("sd'vndbhfvbajfdb")
    try{
    var db = await mongo.connect();
    let productTable = await db.collection('product');
    for(var i=0;i<data5.length;i++){
        if(data5[i].Remarks == "Closed"){
            let deleteproduct= await productTable.deleteOne({"id": data5[i].id});
            console.log(data5[i].name)
            //let product= await productTable.findOne({"id":data[i].id});
            

        }

    }

    }
    catch(error){
        console.log(error);
        return res.json({status:false,message:error})
    }

}




///add coupons----

app.get('/api/addcoupons',addcoupons);

async function addcoupons(req,res){
  try{
    var db = await mongo.connect();
   let one_time_coupon = db.collection('one_time_codes');
   for(var i=0;i<coupouns.length;i++){
     let form={
      "code": coupouns[i].code,
      "category": [
        "mobile-samsung",
        "mobiles-nokia",
        "mobiles-oppo",
        "mobiles-realme",
        "mobiles-vivo",
        "mobiles-xiaomi",
        "mobiles-oneplus"
      ],
      "coupon_key": "kurnool_500",
      "coupountype": "Category",
      "min_order_amount": 10000,
      "vaild_from": "2022-11-22T00:00:00.000Z",
      "vaild_to": "2023-01-31T00:00:00.000Z",
      "created_on":new Date()
    }
     let insertcoupons= await one_time_coupon.insertOne(form);
     console.log("inserteddd---",i);
   }
   

  }
  catch(error){
    console.log(error);
    return res.json({
      status:false,
      message:error
    })
  }
}




//bulk upload products




// app.get('/api/bulkUploadNewproducts',bulkUploadNewproducts)
// async function bulkUploadNewproducts(req,res){
//   try{

//     var db = await mongo.connect();
//     let productTable = await db.collection('product');
//     for(var i=0;i<data6.length;i++){
//       await productTable.findOneAndUpdate({"id":data6[i].id},{$set:{"name":data6[i].name,"linker":data6[i].slug,"slug":data6[i].slug}})
//       console.log(i,data6[i].name);
//     }

//   }
//   catch(error){
//     console.log(error);

//   }
// }


module.exports=app;

