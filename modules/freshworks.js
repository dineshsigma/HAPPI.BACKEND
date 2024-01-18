var axios = require('axios');

module.exports.orderPush = async function(name, phone, address, id, status,mobile_model, payment_type){
    var data = JSON.stringify(
        {
            "lead":
                {
                    "first_name": name,
                    "mobile_number": phone,
                    "address": address,
                    "custom_field": {
                        "cf_url": `https://www.happimobiles.com/account/order-detail/?id=${id}`,
                        "cf_request_type": status,
                        "cf_mobile_model": mobile_model,
                        "cf_payment_type": payment_type
                    }
                }
        });

    var config = {
        method: 'post',
        url: 'https://happimobiles1.freshsales.io/api/leads',
        headers: {
            'Authorization': 'Token token=jjDyYzo0QA5jmaAopMB6wQ',
            'Content-Type': 'application/json'
        },
        data: data
    };
    return await axios(config);
}
// Test Script
// this.orderPush("Shanmukha", '+918686836269',"Hyd-500072", '1234567890',"order_done","Oneplus", "paid" );

//run();
