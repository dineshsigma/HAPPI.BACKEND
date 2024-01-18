

let axios = require('axios');

var email = require("./email");
const mongo = require("./db");



async function oneAssistSendEmail(req,res) {
    let db = await  mongo.connect();
    try {

      

        let date_ob = new Date();
        let date1 = ("0" + date_ob.getDate()).slice(-2);
        let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
        let year = date_ob.getFullYear();
        const date = year + month + date1-1;
        console.log("date---",date);
        let itemcode = ['HAPPI CARE', 'HC 2', 'HP15'];


       

        let HAPPICARE=0;
        let HC2 =0;
        let HP15=0

        let orderv2Tb= await db.collection('order-v2');
        let response2 = await orderv2Tb.find({"bill_date":parseInt(date)}).toArray();
         for(var j=0;j<response2.length;j++){
            
             for(var k=0;k<response2[j].output.length;k++){
                 if(response2[j].output[k].item_code == 'HAPPI CARE'){
                     
                    HAPPICARE++
                 }
                 else if(response2[j].output[k].item_code == 'HC 2'){
                    HC2++
                 }
                 else if(response2[j].output[k].item_code == 'HP15'){
                    HP15++
                 }

             }
         }

        console.log("HAPPICARE",HAPPICARE,"HC2",HC2,"HP15",HP15);

        await email.send_mail(
            ["sharan@happimobiles.com","shiva.kaushik@iipl.work","it@happimobiles.com","pallavi.m@iipl.work","nagaraju.e@iipl.work","help@happimobiles.com","dinesh@iipl.work"],
            // ["dinesh@iipl.work"],
            
            "One Assist Job Triggred " + new Date().toISOString(),
            `One Assist Job Triggred " + ${new Date().toISOString()}
            Yesterday : ${date}
            Happi Care : ${HAPPICARE}
            Hc2 : ${HC2}
            Hp15:${HP15}
            `,
            []
          );
        return res.json({
              status:"Email send Success"
          })
    } catch (error) {
        console.log("error", error);
        return res.json({
            status: false,
            message: error
        })
    }
}

// oneAssistSendEmail()

module.exports.oneAssistSendEmail = oneAssistSendEmail