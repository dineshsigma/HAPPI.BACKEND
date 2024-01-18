var axios = require("axios");
var moment = require("moment");
const log = require("log-to-file");
let email = require("../modules/email.js");
const mongo = require("./db");

var PhoneNumber = require("awesome-phonenumber");

let logsService = require("../happi_emp/logservice.js");

var done = 0;
var trigger = 0;
let assist_count = 0;
let invalid_phone = 0;
let currentDate = new Date();
let lastsevendays = new Date(
  currentDate.getFullYear(),
  currentDate.getMonth(),
  currentDate.getDate() - 7
);

async function assist(req, res) {
  let db = await mongo.connect();
  if (req.headers["x-api-key"] != "jnkjnkjkjbkjhitfuyfdyaewxjkhvjhfthrs") {
    return res.json({
      message: "invalid signature",
    });
  }
  let date_ob = new Date();
  let date1 = ("0" + date_ob.getDate()).slice(-2);
  let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
  let year = date_ob.getFullYear();
  const date = year + month + date1; //############ GET TODAY DATE
  //GET LAST SEVEN DAYS
  let lastsevendays = new Date(
    date_ob.getFullYear(),
    date_ob.getMonth(),
    date_ob.getDate() - 7
  );
  try {
    var config = {
      method: "get",
      url:
        "http://183.82.44.213/api/apxapi/GetExtendedInvoiceDetails?CompanyCode=HM&InvoiceStartDate=" +
        date +
        "&InvoiceEndDate=" +
        date +
        "&BranchCode=0&SalespersonCode=0",
      headers: {
        UserId: "WEBSITE",
        SecurityCode: "3489-7629-9163-3979",
      },
    };
    var outresponse = await axios(config);
    // console.log("TOTALCOUNT----", outresponse.data.length);
    for (var i = 0; i < outresponse?.data?.length; i++) {
      let invoiceno = outresponse.data[i].invoicePrimaryData.InvoiceNo;
      var each_config = {
        method: "get",
        url: `http://183.82.44.213/api/apxapi/GetInvoiceDetails?CompanyCode=HM&Invoice_No=${invoiceno}&Invoice_Date=${date}`,
        headers: {
          UserId: "WEBSITE",
          SecurityCode: "3489-7629-9163-3979",
        },
      };
      try {
        var response = await axios(each_config);
        if (
          response.data != null &&
          response.data.Table != null &&
          response.data.Table.length > 0 &&
          response.data.Table[0] != null
        ) {
          let resp = await db.collection("order-v2").findOne({
            bill_date: response.data.Table[0].INVOICE_DATE,
            bill_no: response.data.Table[0].INVOICE_NO,
          });
          if (resp == null) {
          }
          if (resp != null) {
            //console.log(i, response.data.Table[0].INVOICE_NO, response.data.Table[0].CUSTOMER_NAME, response.data.Table[0].MOBILE_NO, response.data.Table[0].INVOICE_TIME, "done");
            done++;
            //console.log("invoice already exits ",outresponse.data[i].invoicePrimaryData.InvoiceNo)
          } else {
            // console.log("efjbwhjvbr",response.data.Table[0].ITEMDETAILS)
            //console.log(i, response.data.Table[0].INVOICE_NO, response.data.Table[0].CUSTOMER_NAME, response.data.Table[0].MOBILE_NO, response.data.Table[0].INVOICE_TIME, "trigger");
            trigger++;
            //PUSH THE DATA IN AKSHSYA PATRA PARTICIPOATION
            await pushToFreshworks(
              response.data.Table[0].CUSTOMER_NAME,
              response.data.Table[0].MOBILE_NO
            );

            let storeobject = {
              store_code: response.data.Table[0].INVOICE_NO.split("/")[1],
              bill_date: response.data.Table[0].INVOICE_DATE,
              bill_no: response.data.Table[0].INVOICE_NO,
              bill_grand_total: response.data.Table[0].INVOICE_VALUE,
              customer_fname: response.data.Table[0].CUSTOMER_NAME,
              customer_mobile: response.data.Table[0].MOBILE_NO,
              bill_time: response.data.Table[0].INVOICE_TIME,
              bill_status: response.data.Table[0].BRANCH_STATE,
              createdOn: new Date(),
            };

            let outputarray = [];

            for (
              var j = 0;
              j < response.data.Table[0].ITEMDETAILS.Table.length;
              j++
            ) {
              var brandname2 = {
                method: "get",
                url:
                  "http://183.82.44.213/api/apxapi/GetItemModelInfo?CompanyCode=HM&Product=0&Brand=0&ItemCategory=0&CreatedOnStartDate=0&CreatedOnEndDate=0&ModifiedOnStartDate=0&ModifiedOnEndDate=0&ItemNameLike=" +
                  response.data.Table[0].ITEMDETAILS.Table[j].ITEM_NAME +
                  "&Status=All&ItemClassificationType=NONE&ItemClassificationValue=0",
                headers: {
                  UserId: "WEBSITE",
                  SecurityCode: "3489-7629-9163-3979",
                },
              };
              var brandresponse = await axios(brandname2);
              let brandname;
              if (brandresponse.data.Data[0] == undefined) {
                brandname = "Others";
              } else {
                brandname = brandresponse.data.Data[0].BRAND_NAME;
              }
              let output = {
                item_serial_no: j + 1,
                item_code:
                  response.data.Table[0].ITEMDETAILS.Table[j].ITEM_CODE,
                item_name:
                  response.data.Table[0].ITEMDETAILS.Table[j].ITEM_NAME,
                item_rate: "21186",
                item_net_amount:
                  response.data.Table[0].ITEMDETAILS.Table[j].ITEM_GROS_RATE +
                  response.data.Table[0].ITEMDETAILS.Table[j].ITEM_TAX_AMT,
                item_gross_amount:
                  response.data.Table[0].ITEMDETAILS.Table[j].ITEM_GROS_RATE,
                item_quantity:
                  response.data.Table[0].ITEMDETAILS.Table[j].ITEM_QTY,
                // "item_discount_per": "",
                // "item_discount": "0",
                item_tax:
                  response.data.Table[0].ITEMDETAILS.Table[j].ITEM_TAX_AMT,
                // "item_service_tax": "",
                // "item_brand_code": "",
                item_brand_name: brandname,
                // "item_category_code": "",
                // "item_category_name": "NON FIFO ITEM MODEL",
                // "item_group": "",
                item_group_name: "AA SMARTMOBILES",
                item_imei_no:
                  response.data.Table[0].ITEMDETAILS.Table[j].ITEM_SERIAL_NOS,
                item_emp_code:
                  response.data.Table[0].ITEMDETAILS.Table[j].SALESPERSONCODE,
                item_emp_name:
                  response.data.Table[0].ITEMDETAILS.Table[j].SALESPERSONNAME,
              };
              outputarray.push(output);
            }
            storeobject.output = outputarray;
            try {
              await db.collection("order-v2").insertOne(storeobject);
              await db
                .collection("order-v2")
                .deleteMany({ createdOn: { $lte: lastsevendays } });
              //console.log("storeobject",storeobject)
              await oneAssistPull(storeobject);
            } catch (error) {
              // logsService.log("error", req, error + "");
              // console.log("error--------------------------", error);
            }
          }
        } else {
          // logsService.log("error", req, error + "");
        }
      } catch (error) {
        // logsService.log("error", req, error + "");
        // console.log("error----", error);
        // console.log("there is no  response", response.data);
        // log('response:'+outresponse.data[i].invoicePrimaryData.InvoiceNo+'->date:'+date,'oneassist_fail.log', '\r\n');
      }
    }

    //   //console.log("HAPPICARE",happi_care,"HC 2",hc2,"HP15",hp15);
    console.log(
      `YESTAERDAY:${date}--------TOTALCOUNT:${outresponse.data.length}--------TRIGGER_COUNT:${trigger}------------DONE:${done}--------------`
    );
    let response_data_assist = `YESTAERDAY:${date}--------TOTALCOUNT:${outresponse.data.length}--------TRIGGER_COUNT:${trigger}------------DONE:${done}--------------`;
    return res.json({
      data: response_data_assist,
    });
  } catch (error) {
    return res.json({
      status: false,
      message: "ERROR",
    });
  }
}

//send logs to Akshaya patra Participation

async function pushToFreshworks(name, phone) {
  let db = await mongo.connect();
  var pn = new PhoneNumber(phone, "IN");
  if (pn.isValid()) {
    var data = JSON.stringify({
      lead: {
        first_name: name,
        mobile_number: "+91" + phone,
        custom_field: {
          cf_request_type: "Akshaya_Patra_Participation",
        },
        created_on: new Date(),
      },
    });
    var config = {
      method: "post",
      url: "https://happimobiles1.freshsales.io/api/leads",
      headers: {
        Authorization: "Token token=OeAE29Hsg428NHe1MjjmTA",
        "Content-Type": "application/json",
      },
      data: data,
    };
    var result = JSON.stringify(config);
    var req = await axios(config);
    let freshSaleData = JSON.stringify(req.data.lead);
    await db.collection("akshaya-patra-participation").insertOne({
      first_name: name,
      mobile_number: phone,
      custom_field: "Akshaya_Patra_Participation",
      created_on: new Date(),
    });
    try {
      await db
        .collection("akshaya-patra-participation")
        .deleteMany({ created_on: { $lte: lastsevendays } });
    } catch (error) {
      console.log("error", error);
    }

    return;
  } else {
    let invalid_data = {
      name: name,
      phone: phone,
      created_on: new Date(),
      custom_field: "Invalid_Akshaya_Patra_Participation",
    };
    await db
      .collection("invalid_akshaya-patra-participation")
      .insertOne(invalid_data);
    await db
      .collection("invalid_akshaya-patra-participation")
      .deleteMany({ created_on: { $lte: lastsevendays } });
    invalid_phone++;
    return;
  }
}

async function oneAssistPull(order) {
  let db = await mongo.connect();

  try {
    let billdate = order.bill_date.toString();
    var orderdate = moment(billdate).format().split("T")[0];

    var orderDate = FormatDate(orderdate);

    if (
      order.output.find(findHappiCode) === null ||
      order.output.find(findHappiCode) === undefined
    ) {
      var logs = {
        customer_name: order.customer_fname,
        order_id: order.bill_no,
        applicationDate: orderDate,
        created: new Date(),
        mobileNumber: order.customer_mobile,
        status: "non-inc",
      };
      await db.collection("oneassist-sync").insertOne(logs);
      await db
        .collection("oneassist-sync")
        .deleteMany({ created: { $lte: lastsevendays } });
      assist_count++;
      return;
    }

    var mobileInfo = order.output.find(function (item) {
      return item.item_imei_no.trim() != "";
    });
    var requestObj = {
      initiatingSystem: 100060,
      customerInfo: [
        {
          firstName: order.customer_fname,
          emailId: order.customer_email || "",
          mobileNumber: order.customer_mobile,
          gender: "",
          relationship: "self",
          customerdob: "",
          assetInfo: [
            {
              productCode: "MP01",
              assetMake: FetchBrand(mobileInfo.item_brand_name),
              assetModel: mobileInfo?.item_name,
              serialNo1: mobileInfo?.item_imei_no,
              serialNo2: "",
              invoiceDate: orderDate,
              invoiceValue: mobileInfo?.item_net_amount,
            },
          ],
        },
      ],
      addressInfo: [
        {
          addrType: "PER",
        },
      ],
      orderInfo: {
        planCode: FetchPlanCode(
          mobileInfo.item_net_amount,
          mobileInfo.item_brand_name
        ).PlanCode,
        partnerCode: "853",
        partnerBUCode: findPartnerBUCode(order.store_code).partnerBUCode,
        applicationNo: order.bill_no,
        applicationDate: orderDate,
      },
      paymentInfo: {
        paymentMode: "COD",
      },
    };
    // console.log("requestObj", requestObj);

    var config = {
      method: "post",
      url: "https://api.oneassist.in/apigateway/OASYS/webservice/rest/customer/onboardCustomer",
      headers: {
        Authorization: "Basic SGFwcGlNb2JpbGVzOkFzc2lzdEAxMjM=",
        "Content-Type": "application/json",
      },
      data: JSON.stringify(requestObj),
    };

    var { data } = await axios(config);

    // console.log("success", data);

    if (data.status === "success") {
      var logs = {
        startDate: data.membershipInfo.startDate,
        endDate: data.membershipInfo.endDate,
        membershipNumber: data.membershipInfo.membershipNumber,
        customer_name: data.primaryCustomerName,
        order_id: order.bill_no,
        applicationDate: orderDate,
        created: new Date(),
        mobileNumber: order.customer_mobile,
        planCode: FetchPlanCode(
          mobileInfo.item_net_amount,
          mobileInfo.item_brand_name
        ).PlanCode,
        partnerCode: "853",
        partnerBUCode: findPartnerBUCode(order.store_code).partnerBUCode,
        productCode: "MP01",
        assetMake: FetchBrand(mobileInfo.item_brand_name),
        assetModel: mobileInfo.item_name,
        serialNo1: mobileInfo.item_remarks1,
        serialNo2: "",
        invoiceDate: orderDate,
        invoiceValue: mobileInfo.item_net_amount,
        status: "success",
      };

      await db.collection("oneassist-sync").insertOne(logs);
      await db
        .collection("oneassist-sync")
        .deleteMany({ created: { $lte: lastsevendays } });
    } else {
      var logs = {
        requestObj: requestObj,
        response: data,
      };
      await db.collection("oneassist-sync-fail").insertOne(logs);
      await db
        .collection("oneassist-sync-fail")
        .deleteMany({ created: { $lte: lastsevendays } });
    }
    return;
  } catch (error) {
    //console.log("this bill no has no paterncode:", order.bill_no);
    console.log(`this billNumber  has no paterncode:${order.bill_no} `);
  }
}

function FormatDate(d) {
  //    console.log(typeof(d))
  var months = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ];

  d = d.split("-");

  return `${d[2]}-${months[parseInt(d[1]) - 1]}-${d[0]}`;
}

function findHappiCode(item) {
  if (item.item_code === "HAPPI CARE") {
    return true;
  }
  if (item.item_code === "HC 2") {
    return true;
  }
  if (item.item_code === "HP15") {
    return true;
  }
  return false;
}

function FetchPlanCode(deviceAmount, brand) {
  deviceAmount = parseInt(deviceAmount);

  if (brand === "AA IPHONE") {
    var planIndex = appleSchemes.find(function (plan) {
      if (
        parseInt(plan["From"]) < deviceAmount &&
        parseInt(plan["To"]) > deviceAmount
      )
        return true;
      else return false;
    });

    return planIndex;
  } else {
    var planIndex = sehemes.find(function (plan) {
      if (
        parseInt(plan["From"]) < deviceAmount &&
        parseInt(plan["To"]) > deviceAmount
      )
        return true;
      else return false;
    });

    return planIndex;
  }
}

function FetchBrand(brand) {
  var make_names = [
    "INTEX",
    "LG",
    "MICROMAX",
    "MOTOROLA",
    "NOKIA",
    "ONIDA",
    "SANSUI",
    "TCL",
    "VIDEOCON",
    "SONY",
    "PANASONIC",
    "SAMSUNG",
    "XIAOMI",
    "MI",
    "Amazon",
    "Apple",
    "Google",
    "Other",
    "Dizo",
    "Karbonn",
    "Lava",
    "XOLO",
    "I-BALL",
    "Dell",
    "HCL",
    "HONOR",
    "HP",
    "IB",
    "Lenovo",
    "Microsoft",
    "MMax",
    "MSI",
    "REALME",
    "ALCATEL",
    "AQUA",
    "BB",
    "BlackBerry",
    "Blackzone",
    "COMIO",
    "Coolpad",
    "Energy Sistem",
    "GaganTest",
    "Gionee",
    "GOME",
    "Google Pixel",
    "HTC",
    "I KALL",
    "I-Smart",
    "iBERRY",
    "Infinix",
    "INFINIX MOBILITY LIMITED",
    "IQOO",
    "ITEL",
    "ITEL Mobiles",
    "IX",
    "JIO Phone",
    "KAR",
    "Karbon",
    "LEPHONE",
    "Letv",
    "LGe",
    "LV",
    "LYF",
    "Maplin",
    "Maxx",
    "Meizu",
    "MOBIISTAR",
    "Mstar",
    "Narzo",
    "NK",
    "OnePlusOne",
    "OPPO",
    "Others",
    "Phicomm",
    "POCO",
    "Smartron",
    "SMSG",
    "Snexian",
    "Sony Ericsson",
    "Spice",
    "Swipe",
    "Techno",
    "TECNO",
    "Tenor",
    "Vivo",
    "Vodafone",
    "Wham",
    "Wickledleak Wammy",
    "Yu",
    "YUHO",
    "YUTOPIA",
    "Zen",
    "ZTE",
    "ACER",
    "CELKON",
    "EUROSTAR",
    "HUAWEI",
    "YUREKA",
    "INFOCUS",
    "LEECO",
    "ONEPLUS",
    "REDMI",
    "SALORA",
    "RELIANCE",
    "ASUS",
    "NOTHING",
  ];
  brand = brand.toUpperCase();

  return make_names.find(function (b) {
    return brand.indexOf(b.toUpperCase()) !== -1;
  });
}
var sehemes = [
  {
    PlanCode: "5377",
    "Plan Name": "Happi  Mobile Damage Protection Plan 1 Year 5k to 8K ",
    "Plan Description":
      "Happi  Mobile Damage Protection Plan 1 Year 5k to 8K  created on 02 August 2019  Single Claim 5 percent excess on SI",
    From: 5001,
    To: 8000,
    MRP: "649",
  },
  {
    PlanCode: "5378",
    "Plan Name": "Happi  Mobile Damage Protection Plan 1 Year 8k to 12K ",
    "Plan Description":
      "Happi  Mobile Damage Protection Plan 1 Year 8k to 12K  created on 02 August 2019 Single Claim 5 percent excess on SI",
    From: 8001,
    To: 12000,
    MRP: "999",
  },
  {
    PlanCode: "5379",
    "Plan Name": "Happi  Mobile Damage Protection Plan 1 Year 12k to 16K ",
    "Plan Description":
      "Happi  Mobile Damage Protection Plan 1 Year 12k to 16K  created on 02 August 2019  Single Claim 5 percent excess on SI",
    From: 12001,
    To: 16000,
    MRP: "1399",
  },
  {
    PlanCode: "5380",
    "Plan Name": "Happi  Mobile Damage Protection Plan 1 Year 16k to 20K ",
    "Plan Description":
      "Happi  Mobile Damage Protection Plan 1 Year 16k to 20K  created on 02 August 2019  Single Claim 5 percent excess on SI",
    From: 16001,
    To: 20000,
    MRP: "1799",
  },
  {
    PlanCode: "5381",
    "Plan Name": "Happi  Mobile Damage Protection Plan 1 Year 20k to 25K ",
    "Plan Description":
      "Happi  Mobile Damage Protection Plan 1 Year 20k to 25K  created on 02 August 2019  Single Claim 5 percent excess on SI",
    From: 20001,
    To: 25000,
    MRP: "2249",
  },
  {
    PlanCode: "5382",
    "Plan Name": "Happi  Mobile Damage Protection Plan 1 Year 25k to 30K ",
    "Plan Description":
      "Happi  Mobile Damage Protection Plan 1 Year 25k to 30K  created on 02 August 2019  Single Claim 5 percent excess on SI",
    From: 25001,
    To: 30000,
    MRP: "2749",
  },
  {
    PlanCode: "5383",
    "Plan Name": "Happi  Mobile Damage Protection Plan 1 Year 30k to 40K ",
    "Plan Description":
      "Happi  Mobile Damage Protection Plan 1 Year 30k to 40K  created on 02 August 2019  Single Claim 5 percent excess on SI",
    From: 30001,
    To: 40000,
    MRP: "3499",
  },
  {
    PlanCode: "5384",
    "Plan Name": "Happi  Mobile Damage Protection Plan 1 Year 40k to 50K ",
    "Plan Description":
      "Happi  Mobile Damage Protection Plan 1 Year 40k to 50K  created on 02 August 2019  Single Claim 5 percent excess on SI",
    From: 40001,
    To: 50000,
    MRP: "4499",
  },
  {
    PlanCode: "5385",
    "Plan Name": "Happi  Mobile Damage Protection Plan 1 Year 50k to 60K ",
    "Plan Description":
      "Happi  Mobile Damage Protection Plan 1 Year 50k to 60K  created on 02 August 2019  Single Claim 5 percent excess on SI",
    From: 50001,
    To: 60000,
    MRP: "5449",
  },
  {
    PlanCode: "5386",
    "Plan Name": "Happi  Mobile Damage Protection Plan 1 Year 60k to 80K ",
    "Plan Description":
      "Happi  Mobile Damage Protection Plan 1 Year 60k to 80K  created on 02 August 2019  Single Claim 5 percent excess on SI",
    From: 60001,
    To: 80000,
    MRP: "6949",
  },
  {
    PlanCode: "5387",
    "Plan Name": "Happi  Mobile Damage Protection Plan 1 Year Above 80k",
    "Plan Description":
      "Happi  Mobile Damage Protection Plan 1 Year Above 80k created on 02 August 2019  Single Claim 5 percent excess on SI",
    From: 80001,
    To: 160000,
    MRP: "9999",
  },
];
var appleSchemes = [
  {
    PlanCode: 7211,
    "Plan Name": "Happi Mobile Damage Protection Apple 15K to 30K",
    From: 15001,
    To: 30000,
    MRP: 2899,
  },
  {
    PlanCode: 7212,
    "Plan Name": "Happi Mobile Damage Protection Apple 30K to 40K",
    From: 30001,
    To: 40000,
    MRP: 3999,
  },
  {
    PlanCode: 7213,
    "Plan Name": "Happi Mobile Damage Protection Apple 40K to 50K",
    From: 40001,
    To: 50000,
    MRP: 4699,
  },
  {
    PlanCode: 7214,
    "Plan Name": "Happi Mobile Damage Protection Apple 50K to 60K",
    From: 50001,
    To: 60000,
    MRP: 5799,
  },
  {
    PlanCode: 7215,
    "Plan Name": "Happi Mobile Damage Protection Apple 60K to 80K",
    From: 60001,
    To: 80000,
    MRP: 7699,
  },
  {
    PlanCode: 7216,
    "Plan Name": "Happi Mobile Damage Protection Apple 80K to 100K",
    From: 80001,
    To: 100000,
    MRP: 7999,
  },
  {
    PlanCode: 7217,
    "Plan Name": "Happi Mobile Damage Protection Apple 100K to 120K",
    From: 100001,
    To: 120000,
    MRP: 10999,
  },
  {
    PlanCode: 7218,
    "Plan Name": "Happi Mobile Damage Protection Apple 120K to 150K",
    From: 120001,
    To: 150000,
    MRP: 14999,
  },
  {
    PlanCode: 7219,
    "Plan Name": "Happi Mobile Damage Protection Apple 150K to 175K",
    From: 150001,
    To: 175000,
    MRP: 14999,
  },
  {
    PlanCode: 7220,
    "Plan Name": "Happi Mobile Damage Protection Apple 175K to 200K",
    From: 175000,
    To: 200000,
    MRP: 14999,
  },
];
var partnerCodes = [
  {
    "OA BU Name": "Happi ADILABAD",
    partnerBUCode: "25006",
    BRANCH_CODE: "ADBD",
  },
  {
    "OA BU Name": "Happi AMEERPET",
    partnerBUCode: "24970",
    BRANCH_CODE: "AMPT",
  },
  {
    "OA BU Name": "Happi ANANTAPUR",
    partnerBUCode: "24971",
    BRANCH_CODE: "ANTP",
  },
  {
    "OA BU Name": "Happi ASRAO NAGAR",
    partnerBUCode: "24972",
    BRANCH_CODE: "ASRN",
  },
  {
    "OA BU Name": "Happi ATTAPUR",
    partnerBUCode: "51394",
    BRANCH_CODE: "ATPR",
  },
  {
    "OA BU Name": "Happi BANJARA HILLS",
    partnerBUCode: "51393",
    BRANCH_CODE: "BJH",
  },
  {
    "OA BU Name": "Happi BHIMAVARAM",
    partnerBUCode: "25005",
    BRANCH_CODE: "BVRM",
  },
  {
    "OA BU Name": "Happi BODUPPAL",
    partnerBUCode: "24973",
    BRANCH_CODE: "BDPL",
  },
  {
    "OA BU Name": "Happi CHAITANYAPURI",
    partnerBUCode: "24974",
    BRANCH_CODE: "CHPR",
  },
  {
    "OA BU Name": "Happi CHANDANAGAR",
    partnerBUCode: "24975",
    BRANCH_CODE: "CHND",
  },
  {
    "OA BU Name": "Happi CHINTAL",
    partnerBUCode: "25007",
    BRANCH_CODE: "CHNT",
  },
  {
    "OA BU Name": "Happi Dabagardens",
    partnerBUCode: "25026",
    BRANCH_CODE: "DBGS",
  },
  {
    "OA BU Name": "Happi DHARMAVARAM",
    partnerBUCode: "24976",
    BRANCH_CODE: "DVRM",
  },
  {
    "OA BU Name": "Happi DILUSHUKNAGAR",
    partnerBUCode: "25018",
    BRANCH_CODE: "DSNR",
  },
  {
    "OA BU Name": "Happi ECIL",
    partnerBUCode: "25020",
    BRANCH_CODE: "ECIL",
  },
  {
    "OA BU Name": "Happi ELLURU",
    partnerBUCode: "25040",
    BRANCH_CODE: "ELR",
  },
  {
    "OA BU Name": "Happi Gajuwaka",
    partnerBUCode: "25025",
    BRANCH_CODE: "GJWK",
  },
  {
    "OA BU Name": "Happi GODAVARIKHANI",
    partnerBUCode: "25000",
    BRANCH_CODE: "GDVK",
  },
  {
    "OA BU Name": "Happi Gopalapatnam",
    partnerBUCode: "25023",
    BRANCH_CODE: "GPTM",
  },
  {
    "OA BU Name": "Happi GREENLANDS",
    partnerBUCode: "24977",
    BRANCH_CODE: "GRNL",
  },
  {
    "OA BU Name": "Happi GUNTUR-1",
    partnerBUCode: "25009",
    BRANCH_CODE: "GNT",
  },
  {
    "OA BU Name": "Happi HANUMAKONDA(NAYEEM NAGAR)",
    partnerBUCode: "24999",
    BRANCH_CODE: "HNMK",
  },
  {
    "OA BU Name": "Happi HANUMAKONDA-2",
    partnerBUCode: "25019",
    BRANCH_CODE: "HNMK2",
  },
  {
    "OA BU Name": "Happi HIMAYATHNAGAR",
    partnerBUCode: "24978",
    BRANCH_CODE: "HMYT",
  },
  {
    "OA BU Name": "Happi HYDERNAGAR",
    partnerBUCode: "51392",
    BRANCH_CODE: "HYDR",
  },
  {
    "OA BU Name": "Happi KADIRI",
    partnerBUCode: "25002",
    BRANCH_CODE: "KDR",
  },
  {
    "OA BU Name": "Happi KALYANADURGAM",
    partnerBUCode: "24979",
    BRANCH_CODE: "KDGM",
  },
  {
    "OA BU Name": "Happi KARIMNAGAR",
    partnerBUCode: "24980",
    BRANCH_CODE: "KRMN",
  },
  {
    "OA BU Name": "Happi KARMANGHAT",
    partnerBUCode: "25033",
    BRANCH_CODE: "KMGH",
  },
  {
    "OA BU Name": "Happi Khammam",
    partnerBUCode: "25015",
    BRANCH_CODE: "KMM",
  },
  {
    "OA BU Name": "Happi KHARKHANA",
    partnerBUCode: "24981",
    BRANCH_CODE: "KRKH",
  },
  {
    "OA BU Name": "Happi KUKATPALLY",
    partnerBUCode: "24982",
    BRANCH_CODE: "KKP",
  },
  {
    "OA BU Name": "Happi Kuppam ",
    partnerBUCode: "51396",
    BRANCH_CODE: "KPM",
  },
  {
    "OA BU Name": "Happi KURNOOL",
    partnerBUCode: "24983",
    BRANCH_CODE: "KRNL",
  },
  {
    "OA BU Name": "Happi KURNOOL 2",
    partnerBUCode: "25001",
    BRANCH_CODE: "KRNL2",
  },
  {
    "OA BU Name": "Happi LANGARHOUSE",
    partnerBUCode: "24984",
    BRANCH_CODE: "LNGH",
  },
  {
    "OA BU Name": "Happi MADANAPALLE",
    partnerBUCode: "25037",
    BRANCH_CODE: "MDPL",
  },
  {
    "OA BU Name": "Happi MADHAPUR",
    partnerBUCode: "24985",
    BRANCH_CODE: "MDPR",
  },
  {
    "OA BU Name": "Happi MAHABUBNAGAR",
    partnerBUCode: "24986",
    BRANCH_CODE: "MHBR",
  },
  {
    "OA BU Name": "Happi MALKAJGIRI",
    partnerBUCode: "24987",
    BRANCH_CODE: "MLKJ",
  },
  {
    "OA BU Name": "Happi NALGONDA",
    partnerBUCode: "24996",
    BRANCH_CODE: "NLG",
  },
  {
    "OA BU Name": "Happi Narasampet",
    partnerBUCode: "25014",
    BRANCH_CODE: "NSMP",
  },
  {
    "OA BU Name": "Happi NERDMET 2",
    partnerBUCode: "24988",
    BRANCH_CODE: "NDMT 2",
  },
  {
    "OA BU Name": "Happi NIZAMABAD",
    partnerBUCode: "25004",
    BRANCH_CODE: "NZB",
  },
  {
    "OA BU Name": "Happi ongole",
    partnerBUCode: "25028",
    BRANCH_CODE: "ONG",
  },
  {
    "OA BU Name": "Happi RAJAMUNDARY",
    partnerBUCode: "25010",
    BRANCH_CODE: "RJY",
  },
  {
    "OA BU Name": "Happi RAMANTHAPUR",
    partnerBUCode: "24989",
    BRANCH_CODE: "RMTP",
  },
  {
    "OA BU Name": "Happi RTC X ROAD",
    partnerBUCode: "24990",
    BRANCH_CODE: "RTCX",
  },
  {
    "OA BU Name": "Happi SANGAREDDY",
    partnerBUCode: "25003",
    BRANCH_CODE: "SNGR",
  },
  {
    "OA BU Name": "Happi SANTOSH NAGAR",
    partnerBUCode: "25012",
    BRANCH_CODE: "STNR",
  },
  {
    "OA BU Name": "Happi SAROORNAGAR",
    partnerBUCode: "25032",
    BRANCH_CODE: "SRNR",
  },
  {
    "OA BU Name": "Happi SD ROAD",
    partnerBUCode: "25034",
    BRANCH_CODE: "SDR",
  },
  {
    "OA BU Name": "Happi SHAMSHABAD",
    partnerBUCode: "24991",
    BRANCH_CODE: "SMBD",
  },
  {
    "OA BU Name": "Happi SHAPUR",
    partnerBUCode: "51395",
    BRANCH_CODE: "SHPR",
  },
  {
    "OA BU Name": "Happi Sharath capital city mall",
    partnerBUCode: "25013",
    BRANCH_CODE: "SCCM",
  },
  {
    "OA BU Name": "Happi SIDDIPET",
    partnerBUCode: "25011",
    BRANCH_CODE: "SDPT",
  },
  {
    "OA BU Name": "Happi SR NAGAR",
    partnerBUCode: "25036",
    BRANCH_CODE: "SRN",
  },
  {
    "OA BU Name": "Happi Srikakulam",
    partnerBUCode: "25022",
    BRANCH_CODE: "SKKM",
  },
  {
    "OA BU Name": "Happi Suryapet",
    partnerBUCode: "25016",
    BRANCH_CODE: "SRPT",
  },
  {
    "OA BU Name": "Happi tadepalligudem",
    partnerBUCode: "25027",
    BRANCH_CODE: "TDPG",
  },
  {
    "OA BU Name": "Happi Tadipatri",
    partnerBUCode: "25021",
    BRANCH_CODE: "TDPT",
  },
  {
    "OA BU Name": "Happi Tenali",
    partnerBUCode: "25017",
    BRANCH_CODE: "TNL",
  },
  {
    "OA BU Name": "Happi TIRUPATHI",
    partnerBUCode: "25038",
    BRANCH_CODE: "TPT",
  },
  {
    "OA BU Name": "Happi UPPAL",
    partnerBUCode: "24992",
    BRANCH_CODE: "UPL",
  },
  {
    "OA BU Name": "Happi VANASTALIPURAM",
    partnerBUCode: "24993",
    BRANCH_CODE: "VNSP",
  },
  {
    "OA BU Name": "Happi Vijayanagaram",
    partnerBUCode: "25035",
    BRANCH_CODE: "VZM",
  },
  {
    "OA BU Name": "Happi Vijayawada-1",
    partnerBUCode: "25024",
    BRANCH_CODE: "VIJ-1",
  },
  {
    "OA BU Name": "Happi Vijayawada-2",
    partnerBUCode: "25029",
    BRANCH_CODE: "VIJ 2",
  },
  {
    "OA BU Name": "Happi Vijayawada-3",
    partnerBUCode: "25030",
    BRANCH_CODE: "VIJ 3",
  },
  {
    "OA BU Name": "Happi Vijayawada-4",
    partnerBUCode: "25031",
    BRANCH_CODE: "VIJ 4",
  },
  {
    "OA BU Name": "Happi WARANGAL",
    partnerBUCode: "24997",
    BRANCH_CODE: "WGL",
  },
];

function findPartnerBUCode(store_code) {
  return partnerCodes.find(function (code) {
    return store_code === code.BRANCH_CODE;
  });
}

function FormatDate(d) {
  var months = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ];

  d = d.split("-");

  return `${d[2]}-${months[parseInt(d[1]) - 1]}-${d[0]}`;
}

//assist();

module.exports.assist = assist;
