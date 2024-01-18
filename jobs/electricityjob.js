var mongo = require("./db.js");
var axios = require("axios");
var email = require("./email");
let qs = require('qs');



async function electricityConsumedUnits(req,res){
    try{
        var dataBase = await mongo.connect();
        let electricityUnitsTbl = dataBase.collection('electricityUnits');
        let store_targetTbl = dataBase.collection('store_target');
        let StoreCodeDuplicates = await electricityUnitsTbl.distinct('storecode');
        var date = new Date();
        var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
       
        let date1 = ("0" + firstDay.getDate()).slice(-2);
        let month = ("0" + (firstDay.getMonth() + 1)).slice(-2);
        let year = firstDay.getFullYear();
        let date2 = ("0" + lastDay.getDate()).slice(-2);
        let month2 = ("0" + (lastDay.getMonth() + 1)).slice(-2);
        let year2 = lastDay.getFullYear();
        firstDay = year+"-"+month+"-"+ date1;
        lastDay = year2 +"-"+ month2+"-"+ date2;

        let currentdatequery={};
        currentdatequery.date={
            "$gte": firstDay,
            "$lte": lastDay
        };
        
        let thisMonthStoreData = await store_targetTbl.find(currentdatequery).toArray();
        
        for(var i=0;i<thisMonthStoreData.length;i++){
            //console.log(thisMonthStoreData[i].store);
            let sumOfTotalUnitsPerStore = await electricityUnitsTbl.find({"storecode":thisMonthStoreData[i].store}).sort({"totalUnitsDiff":-1}).limit(1).toArray();
            let storetargetquery={};
            storetargetquery.store=thisMonthStoreData[i].store;
            storetargetquery.date={
                "$gte": firstDay,
                "$lte": lastDay
            };
            let thisMonthTargetData = await store_targetTbl.find(storetargetquery).toArray();
            

            
            
          
            let targetConsumedUnits = thisMonthTargetData[0].target - sumOfTotalUnitsPerStore[0].totalUnitsDiff;
            //console.log("targetConsumedUnits",targetConsumedUnits,"sumOfTotalUnitsPerStore",sumOfTotalUnitsPerStore[0].totalUnitsDiff);
            await store_targetTbl.findOneAndUpdate({"date":thisMonthTargetData[0].date},{$set:{"sumOfTotalUnitsPerStore":sumOfTotalUnitsPerStore[0].totalUnitsDiff,"targetConsumedUnits":targetConsumedUnits,"targetSyncdate":new Date()}})
        }

        
       
        return res.json({
            status:true,
            message:"target units Assigned success"
        })
    }
    catch(error){
        console.log(error);
        return res.json({
            status:false,
            message:error
        })
    }

}

//electricityConsumedUnits();

module.exports.electricityConsumedUnits = electricityConsumedUnits;