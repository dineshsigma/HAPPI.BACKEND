
let axios = require('axios');



async function DeleteElasticData(){
  let date= new Date();
 
  date.setDate(date.getDate() - 15);
  console.log("data---",date);

 //order-v2 -- createdOn
 //akshaya-patra-store-manager =====  created_on
 //akshaya-patra-participation   ========  lead.created_on
 //akshaya-patra  =========  created_on
 //ingram-stock-sync ========   createdOn
//online-price-sync   ==========  createdOn
//oneassist-sync   =========   created
//invalid_akshaya-patra-participation  =========  created_on
//user-logs ========== createdOn

let elasticdate=[
    {
        "index":"order-v2",
        "key":"createdOn"
    },
    // {
    //     "index":"akshaya-patra-store-manager",
    //     "key":"created_on"
    // },
    // {
    //     "index":"akshaya-patra-participation",
    //     "key":"lead.created_on"
    // },
    // {
    //     "index":"akshaya-patra",
    //     "key":"created_on"
    // },
    // {
    //     "index":"ingram-stock-sync",
    //     "key":"createdOn"
    // },
    // {
    //     "index":"online-price-sync",
    //     "key":"createdOn"
    // },
    {
        "index":"oneassist-sync",
        "key":"created"
    },
    {
        "index":"invalid_akshaya-patra-participation",
        "key":"created_on"
    },
    // {
    //     "index":"user-logs",
    //     "key":"createdOn"
    // }
]


for(var i=0;i<elasticdate.length;i++){
    let key = `${elasticdate[i].key}`
    let body={
    
        "query": {
          "bool": {
              "filter": {
                "range": {
                    [`${elasticdate[i].key}`]:{
                    "lte": date
                  }
                }
              }
          }    
        }
  
     }
      try{
  
        var config_es_link_get = {
          method: 'POST',
          url: `https://my-deployment-031377.es.ap-south-1.aws.elastic-cloud.com:9243/${elasticdate[i].index}/_delete_by_query/`,
          headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Basic ZWxhc3RpYzo2SmVITmhBWFdmWFBDWTVQMzFpcGVNSUo='
          },
           data:JSON.stringify(body)
      };
       
          //   console.log("config---",config_es_link_get);
  
            let response = await axios(config_es_link_get);
           console.log("response---",response.data);
  
      }
      catch(error){
          console.log("error---",error);
         
      }

}
 

}

DeleteElasticData()