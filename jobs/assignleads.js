
let mongo = require('./db');

var LASTACTIVE_TIME_IN_MINUTES =60;
/**
* The following program contains source code for a game called Tic-tac-toe.
* It is a paper-and-pencil game for two players, X and O, who take turns marking the
* spaces in a 3×3 grid. 
* The player who succeeds in placing three of their marks in a horizontal, vertical, or 
* diagonal row is the winner
*/

/**
* Function that assigns leads to Digital team
* @author   Dinesh
*/
async function assignLeads(req,res) {
    if(req.headers['x-api-key']!="jnkjnkjkjbkjhitfuyfdyaewxjkhvjhfthrs"){
        return res.json({
          message:"invalid signature"
        })
    }

    try {
        let currentdate = new Date();
        var dataBase = await mongo.connect();// connecting db
        let usercoll = dataBase.collection('user');
        let laptopcoll = dataBase.collection('laptop-leads');
        currentdate.setMinutes(currentdate.getMinutes() - LASTACTIVE_TIME_IN_MINUTES);//decrease the current date to last active time in minutes
        let fetch_users = {
            "usertype": "Digital",
            last_update_time: { $gte: currentdate }
        }
        let userresponse = await usercoll.find(fetch_users).toArray();//fetching active users from db
        console.log(userresponse);
        let post_lead_generated_date = new Date();//setting post_lead_generated_date to production date
        post_lead_generated_date.setDate(1);
        post_lead_generated_date.setMonth(0);
        post_lead_generated_date.setHours(6, 0, 0, 0);
        // console.log(post_lead_generated_date,"99999999999999")
        var limit = 0;//setting the limit flag to 0 allocate each user
        //Allocating the limit and assigne  count to each user and adding the total to limit 
        for (var i = 0; i < userresponse.length; i++) {
            if (userresponse[i].priority == 5) {
                userresponse[i].limit = 20;
                userresponse[i].assigned = 0;
                limit += 20
            }
            else if (userresponse[i].priority == 4) {
                userresponse[i].limit = 15;
                userresponse[i].assigned = 0;
                limit += 15
            }
            else if (userresponse[i].priority == 3) {
                userresponse[i].limit = 10;
                userresponse[i].assigned = 0;
                limit += 10
            }
            else if (userresponse[i].priority == 2) {
                userresponse[i].limit = 5;
                userresponse[i].assigned = 0;
                limit += 5
            }
            else if (userresponse[i].priority == 1) {
                userresponse[i].limit = 2;
                userresponse[i].assigned = 0;
                limit += 2
            }
        }

        console.log("limit----",limit);

        var query = {
            "assign_to": { $exists: false },
            "date": { $gte: post_lead_generated_date }
        }
        let laptopleadsresponse = await laptopcoll.find(query).limit(limit).toArray();//fetching all the leads

        // console.log("laptopleadsresponse--",laptopleadsresponse,query);
       
        var i = 0;//declareing the user counter flag
        //Allocting each user according to limit
       
        if(userresponse.length > 0){
        for (var j = 0; j < laptopleadsresponse.length; j++) {
            console.log("assign_to", userresponse[i].phone)

             await laptopcoll.findOneAndUpdate({ "_id": laptopleadsresponse[j]._id }, { $set: { "assign_to": userresponse[i].phone,"assign_at":new Date() } });
             
            

            userresponse[i].assigned++;
            if (userresponse[i].assigned == userresponse[i].limit) {
                userresponse.splice(i, 1);

            }
            i++;
            if (i >= (userresponse.length)) {
                i = 0;
            }

        }
        // return data
        return res.json({
            status:"assign success"
        })
    }else{
        console.log("no user login");
        return res.json({
            status:"no user login"
        })
    }
    }
    catch (error) {
        
        //console.log("lead-assign-joberrror", error);
        return res.json({
            status:false,
            message:error
        })
    }
}



//assignLeads();

module.exports.assignLeads=assignLeads;