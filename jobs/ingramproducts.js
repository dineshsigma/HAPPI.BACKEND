const mongo = require("./db");
var axios = require('axios');
var qs = require('qs');
const res = require("express/lib/response");
const ING_TBL_PRODUCT = 'ingramproducts';
let productTbl = null;

let db;


async function ingramStockProducts(req,res){
  try{
  if(req.headers['x-api-key']!="jnkjnkjkjbkjhitfuyfdyaewxjkhvjhfthrs"){
    return res.json({
      message:"invalid signature"
    })
 
  }

    db = await mongo.connect();
     ingram_productTbl = db.collection(ING_TBL_PRODUCT);

   
     let product = await ingram_productTbl.find({}, {
        projection:{ "name": 1, "ingramPartNumber": 1}
    }).sort(
      { 
          "ingramStockSync" : 1.0
      }
  ).limit(5).
  toArray();
    console.timeEnd("LOG-product-query");
    await run(product);
    return res.json({
      status:true,
      message:'success'
    })
  }
  catch(error){
    return res.json({
      sttaus:false,
      message:error
    })
  }

}


function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
async function run(data) {
    console.log("INSIDE RUN");
    for (let i = 0; i <= data.length-1; i++) {
       
        await iteratee(data[i], i);
        await sleep(500);
    }
    return;
    
}




async function iteratee(item, i) {
    
    const element = item;

    
  
    if (element == null  || element.ingramPartNumber == undefined || element.ingramPartNumber == '' ) {
        //console.log(`${i} - ${element.id} - ${element.name} - No ingramPartNumber `);
        return;
    }

  let configcoll= db.collection('config');
  let ingramauth= await configcoll.findOne({"key":"ingramauth"});
  

  var ingramdata = JSON.stringify({
    "products": [
      {
        "ingramPartNumber": element.ingramPartNumber
        //"ingramPartNumber": 'GD103CM48B2C00'
      }
    ]
  });

  var priceAndAbility_config = {
    method: 'post',
    url: 'https://api.ingrammicro.com:443/resellers/v6/catalog/priceandavailability?includeAvailability=true&includePricing=true&includeProductAttributes=true',
    headers: { 
      'IM-CustomerNumber': '21-HEMOPR', 
      'IM-CountryCode': 'IA', 
      'IM-CorrelationID': 'fbac82ba-cf0a-4bcf-fc03-0c50841', 
      'IM-SenderID': '21-HEMOPR-happi', 
      'Content-Type': 'application/json', 
      'Accept': 'application/json', 
      'Authorization': `Bearer ${ingramauth.token}`
    },
    data : ingramdata
  };


    try {

      
            let stock_response = await axios(priceAndAbility_config);  
            let  stock;
            
            
            if (stock_response.data.length > 0) {

            if(stock_response.data[0].availability.available){
                stock=stock_response.data[0].availability.totalAvailability
            } else{
                stock=0
            }


        // console.log(`${i}----------"ingramauth.token:"${ingramauth.token} ------------ "ingramdata:"${ingramdata} ------"stock:" ${stock} ----`);
            
            
         ingram_productTbl.updateOne({ingramPartNumber:element.ingramPartNumber},{$set:{stock: stock, ingramStockSync: new Date(),ingramStatus:'Success' }} );
            
            let ingram_data={name:element.name, ingramPartNumber:element.ingramPartNumber,stock: stock, status:"Stock Sync Done", createdOn:new Date()}

            // var config_es_link_test = {
            //     method: 'post',
            //     url: 'https://my-deployment-031377.es.ap-south-1.aws.elastic-cloud.com:9243/ingram-stock-sync/_doc/'+new Date().getTime(),
            //     headers: {
            //         'Content-Type': 'application/json',
            //         'Authorization':'Basic ZWxhc3RpYzo2SmVITmhBWFdmWFBDWTVQMzFpcGVNSUo='
            //     },
            //     data :JSON.stringify(ingram_data)
            // };

           
            // await axios(config_es_link_test);
            

          
            
           

           

        }
        
        else {

           let  nodata_stock={name:element.name, ingramPartNumber:element.thirdPartyCodes.ingramPartNumber, status:"Stock not found", createdOn:new Date()}

            // var config_es_link_test = {
            //     method: 'post',
            //     url: 'https://my-deployment-031377.es.ap-south-1.aws.elastic-cloud.com:9243/ingram-stock-sync/_doc/'+new Date().getTime(),
            //     headers: {
            //         'Content-Type': 'application/json',
            //         'Authorization':'Basic ZWxhc3RpYzo2SmVITmhBWFdmWFBDWTVQMzFpcGVNSUo='
            //     },
            //     data : JSON.stringify(nodata_stock)
            // };
            // await axios(config_es_link_test);
            
            

           
        }
    }
    catch (err) {
      //return 
      console.log(err.response);
      
      let ingramerror='Failed'
      
     
      
      ingram_productTbl.updateOne({id:element.id},{$set:{ingramStatus: ingramerror, ingramStockSync: new Date() }} );
    }
}

 //ingramStockProducts();

module.exports.ingramStockProducts = ingramStockProducts;