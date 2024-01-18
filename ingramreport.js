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

let ingramreport= require('./admin/ingram/ingram.js')

app.get('/api/ingram/report',ingramreport.ingramStockData);
app.get('/api/ingram/searchingram',ingramreport.searchIngramName);
app.get('/api/ingram/ingramproduct',ingramreport.getIngramProduct);
app.put('/api/ingram/update_ingrampartnumber',ingramreport.updateIngramPartnumber);


module.exports=app; 