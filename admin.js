const serverless = require('serverless-http');
const express = require('express');
var cors = require('cors')
const app = express();
app.use(cors())
app.use(express.json());
app.use(
    express.urlencoded({
      extended: true,
    })
  );

let laptop_leads = require('./admin/laptop_leads');

let product=require('./admin/product');

let usercartdetails=require('./admin/usercartdetails');

let incentives=require('./admin/incentives');

let cart=require('./admin/cart');
let stores=require('./admin/stores');
let college_info=require('./admin/college_info');


app.get('/api/admin/filters/:fromdate/:todate', laptop_leads.filter_laptop_leads);
app.put('/api/admin/usertimestamp/',laptop_leads.timedateuser);
app.post('/api/admin/assign',laptop_leads.assignlaptops);
app.get('/api/admin/filtersdownload',laptop_leads.filtersdownload);
app.get('/api/admin/getallproductsdownload',laptop_leads.downloadproductdetails);
app.post('/api/admin/abandonedcart',laptop_leads.abandonedcart);
app.put('/api/admin/transferleads',laptop_leads.transferleads);
app.get('/api/admin/statuscount',laptop_leads.group_by_status);
app.get('/api/admin/downloadalltabs',laptop_leads.downloadAlltabs);
app.get('/api/admin/getalltabs',laptop_leads.getAlltabsFilters);
app.get('/api/admin/cartdownload',laptop_leads.cartdownload);
app.get('/api/admin/ordersv3download',laptop_leads.ordersv3download);
app.get('/api/admin/downloadusercartdetails',laptop_leads.downloadusercartdetails);
app.get('/api/admin/leadsstatuscount',laptop_leads.leadsstatuscount);


app.get('/api/admin/productstock',product.download_product);
app.get('/api/admin/brandlist',product.getBrandList);
app.post('/api/admin/getingramprice',product.getIngramPrice);
app.post('/api/admin/productFilters',product.productFilters);
app.get('/api/admin/getThirdPartycodes',product.getThirdPartycodes);
app.post('/api/admin/updateThirdpartyCodes',product.updateThirdpartyCodes);
app.post('/api/admin/offersverified',product.offersverified);
app.get('/api/admin/offers',product.offers);
app.post('/api/admin/productValidations',product.productValidations);


app.get('/api/admin/storelist',incentives.storelist);
app.get('/api/admin/citylist',incentives.citylist);
app.post('/api/admin/createcategory',incentives.incentive_categories);
app.get('/api/admin/categorylist',incentives.getcategorylist);

app.get('/api/admin/cart',usercartdetails.cart);
app.get('/api/admin/usercart/datecount',usercartdetails.cart_datefilter);
app.get('/api/admin/searchphone',usercartdetails.search_phone);


app.get('/api/admin/getproductname',cart.getproductname);
app.post('/api/admin/addAdminCartDetails',cart.addAdminCartDetails);
app.post('/api/admin/CustomerSMSNotification',cart.CustomerSMSNotification);

app.get('/api/admin/storeslist',stores.getStoresDropdown);
app.get('/api/admin/collegeinfo/download',college_info.collegeInfoDownload);


app.get('/api/admin/individulastores',stores.individulastores);
app.get('/api/admin/getStoreManager',stores.getStoreManager);
app.post('/api/admin/electricityUnits',stores.electricityUnits);
app.get('/api/admin/filterWithElectricityStoreCode',stores.filterWithElectricityStoreCode);
app.get('/api/admin/downloadElectricityDate',stores.downloadElectricityDate);
app.get('/api/admin/filtersElectricityDate',stores.filtersElectricityDate);
app.get('/api/admin/storesDropDown',stores.storesDropDown);
app.get('/api/admin/electricityHistory',stores.electricityHistory);
app.post('/api/admin/storeTarget',stores.storeTarget);








module.exports=app;