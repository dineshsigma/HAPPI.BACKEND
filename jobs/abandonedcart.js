

let mongo=require('./db.js');


var LASTACTIVE_TIME_IN_MINUTES = 10;


var CART_ALLOCATION_COUNT= 2;

// cron.schedule('*/2 * * * * ', () => {
//     console.log('running ONE ASSIST TASK FOR  every  ONE');
//     abandonedcart();


// });




async function abandonedcart(){

    // await email.send_mail(
    //     [ "pm@iipl.work"],
    //     "Cart Leads Job Triggred " + new Date().toISOString(),
    //     "Cart Leads Job Triggred " + new Date().toISOString(),
    //     []
    //   );
    try{
        var dataBase = await mongo.connect();
        let cartcoll= await dataBase.collection('cart');
        let usercoll = await dataBase.collection('user');
        let currentdate=new Date();
        currentdate.setMinutes(currentdate.getMinutes() - LASTACTIVE_TIME_IN_MINUTES);
        let userresponse = await usercoll.find({ "usertype": "Digital", last_update_time: { $gte: currentdate } }).toArray();
        console.log("userresponse", userresponse);
        let date=new Date();

        date.setDate(24);
        date.setMonth(4);
        date.setHours(6,0,0,0);

        console.log("setdata",date);

        for(var i=0;i<userresponse.length;i++){

            let laptopleadsresponse = await cartcoll.find({ "assign_to": { $exists: false },"createdOn":{ $gte: date } }).limit(CART_ALLOCATION_COUNT).toArray();
            console.log("laptopleadsres",laptopleadsresponse.length)
            for(var j=0;j<laptopleadsresponse.length;j++){
                console.log("phone",userresponse[i].phone);
                let updateleads = await cartcoll.findOneAndUpdate({ "_id": laptopleadsresponse[j]._id }, { $set: { "assign_to": userresponse[i].phone } });
            }
        }
    }
    catch(error){
        console.log(error);

    }

}





 abandonedcart();
