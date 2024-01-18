let express = require("express");
let cors = require("cors");
var bodyParser = require("body-parser");
let path = require("path");
let app = express();
let port = 3000;
let admin = require("./admin.js");
let auth = require("./auth.js");
let index = require("./index.js");
let categories = require("./categories");
let order = require("./orders.js");
let payment = require("./payment.js");
let utils = require("./utils.js");
let thirdPartyCodes = require("./third-party.js");
let cart = require("./cart.js");
let ingramreport = require("./ingramreport.js");

//today logs api
let todaylogs = require("./todaylogs.js");

//landing pages

let landingPages = require("./landingpages");

//tirupathi leads

let tirupathiLeads = require("./tirupathi_launch.js");

//IPL LEADS

let ipl = require("./ipl.js");

//corn jobs
let akshayapatra = require("./jobs/akshayaPatra");
let assignleads = require("./jobs/assignleads");
let ingramstocksync = require("./jobs/ingramStockSync.js");
let ingramproducts = require("./jobs/ingramproducts");
let oneassist = require("./jobs/assist.js");
let productsync = require("./jobs/product-sync");
let pricesync = require("./jobs/priceSync.js");
let electricityunits = require("./jobs/electricityjob.js");
let productpriceSync = require("./jobs/productPriceSync");
let exportcsv = require("./happiticket.js");
let ingramtoken = require("./jobs/ingramToken.js");
let assistemail = require("./jobs/assistemail");
let awaitIMEIlogs = require("./jobs/awaitIMEIlogs");
let priceSyncAll = require("./jobs/priceSyncAll.js");

//HAPPI_EMPLOYEE
let apx_products = require("./happi_emp/apx_products.js");
app.use("/api/emp", apx_products);

app.use(express.static("public"));
app.set("view engine", "ejs");

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use("/api/akshayapatra", akshayapatra.akshayaPatra); //every day
app.use("/api/assignleads", assignleads.assignLeads); //every on hour
app.use("/api/productpriceSync", productpriceSync.runner);
app.use("/api/ingramstocksync", ingramstocksync.ingramStockSync); //every 2 hrs
app.use("/api/ingramproducts", ingramproducts.ingramStockProducts); //every 6 hrs
app.use("/api/assist", oneassist.assist); //every day
app.use("/api/productsync", productsync.productsSync); //every 2 hrs
app.use("/api/priceSync", pricesync.priceSync); //every 2 hrs
app.use("/api/electricitytarget", electricityunits.electricityConsumedUnits);
app.use("/api/ingramTokenApi", ingramtoken.ingramTokenAPI);
app.use("/api/assistemail", assistemail.oneAssistSendEmail);
app.use("/api/awaitIMEIlogs", awaitIMEIlogs.awaitIMEIlogs);
app.use("/api/priceSyncAll", priceSyncAll.priceSyncAll);
app.options("*", cors()); // include before other routes
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000,
  })
);
app.use("/", admin);
app.use("/", auth);
app.use("/", index);
app.use("/", categories);
app.use("/", order);
app.use("/", payment);
app.use("/", cart);
app.use("/", thirdPartyCodes);
app.use("/", ingramreport);
app.use("/", utils);
app.use("/", exportcsv);
app.use("/todaylogs", todaylogs);
app.use("/happi", landingPages);
app.use("/tptoffers", tirupathiLeads);
app.use("/ipl", ipl);
app.listen(port, function (err) {
  console.log(`server is running on ${port}`);
});
