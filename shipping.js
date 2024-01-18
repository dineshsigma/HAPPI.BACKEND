var mongo = require('./db');
var axios = require('axios');

module.exports.fetchDeliveryDates = async function(payload, cb){

    const db = mongo.connect();
    const collection = db.collection('config');
    var result = await collection.findOne({ key : "shiprocketauth" });
    var query = qs.stringify(payload);

    var config = {
      method: 'get',
      url: 'https://apiv2.shiprocket.in/v1/external/courier/serviceability/?'+query,
      headers: {
        'Authorization': 'Bearer '+result.token
      }
    };

    axios(auth_config)
      .then(function (response) {
          cb(response.data)
      })
      .catch(function (error) {
        console.log(error);
      });

}
/*
{
        "order_id": "224-4779",
        "order_date": "2019-07-24 11:11",
        "pickup_location": "Jammu",
        "channel_id": "76893",
        "comment": "Reseller: M/s Goku",
        "billing_customer_name": "Naruto",
        "billing_last_name": "Uzumaki",
        "billing_address": "House 221B, Leaf Village",
        "billing_address_2": "Near Hokage House",
        "billing_city": "New Delhi",
        "billing_pincode": "110002",
        "billing_state": "Delhi",
        "billing_country": "India",
        "billing_email": "naruto@uzumaki.com",
        "billing_phone": "9876543210",
        "shipping_is_billing": true,
        "shipping_customer_name": "",
        "shipping_last_name": "",
        "shipping_address": "",
        "shipping_address_2": "",
        "shipping_city": "",
        "shipping_pincode": "",
        "shipping_country": "",
        "shipping_state": "",
        "shipping_email": "",
        "shipping_phone": "",
        "order_items": [
            {
                "name": "Kunai",
                "sku": "chakra123",
                "units": 10,
                "selling_price": "900",
                "discount": "",
                "tax": "",
                "hsn": 441122
            }
        ],
        "payment_method": "Prepaid",
        "shipping_charges": 0,
        "giftwrap_charges": 0,
        "transaction_charges": 0,
        "total_discount": 0,
        "sub_total": 9000,
        "length": 10,
        "breadth": 15,
        "height": 20,
        "weight": 2.5
}
 */

function fetchPinStateFromPinCode(pincode){
    var statesMapping = [
        { code :"11", state:"Delhi"},
        { code :"12", state:"Haryana"},
        { code :"13", state:"Haryana"},
        { code :"14", state:"Punjab"},
        { code :"15", state:"Punjab"},
        { code :"16", state:"Punjab"},
        { code :"17", state:"Himachal Pradesh"},
        { code :"18", state:"Jammu & Kashmir"},
        { code :"19", state:"Jammu & Kashmir"},
        { code :"20", state:"Uttar Pradesh"},
        { code :"21", state:"Uttar Pradesh"},
        { code :"22", state:"Uttar Pradesh"},
        { code :"23", state:"Uttar Pradesh"},
        { code :"24", state:"Uttar Pradesh"},
        { code :"25", state:"Uttar Pradesh"},
        { code :"26", state:"Uttar Pradesh"},
        { code :"27", state:"Uttar Pradesh"},
        { code :"28", state:"Uttar Pradesh"},
        { code :"30", state:"Rajasthan"},
        { code :"31", state:"Rajasthan"},
        { code :"32", state:"Rajasthan"},
        { code :"33", state:"Rajasthan"},
        { code :"34", state:"Rajasthan"},
        { code :"36", state:"Gujarat"},
        { code :"37", state:"Gujarat"},
        { code :"38", state:"Gujarat"},
        { code :"39", state:"Gujarat"},
        { code :"45", state:" Madhya Pradesh"},
        { code :"46", state:" Madhya Pradesh"},
        { code :"47", state:" Madhya Pradesh"},
        { code :"48", state:" Madhya Pradesh"},
        { code :"49", state:"  Chhattisgarh"},
        { code :"50", state:"Andhra Pradesh TELANGANA"},
        { code :"51", state:"Andhra Pradesh TELANGANA"},
        { code :"52", state:"Andhra Pradesh TELANGANA"},
        { code :"53", state:"Andhra Pradesh TELANGANA"},
        { code :"56", state:"Karnataka"},
        { code :"57", state:"Karnataka"},
        { code :"58", state:"Karnataka"},
        { code :"59", state:"Karnataka"},
        { code :"60", state:"Tamil Nadu"},
        { code :"61", state:"Tamil Nadu"},
        { code :"62", state:"Tamil Nadu"},
        { code :"63", state:"Tamil Nadu"},
        { code :"64", state:"Tamil Nadu"},
        { code :"67", state:"Kerala"},
        { code :"68", state:"Kerala"},
        { code :"69", state:"Kerala"},
        { code :"70", state:"West Bengal"},
        { code :"70", state:"West Bengal"},
        { code :"70", state:"West Bengal"},
        { code :"71", state:"West Bengal"},
        { code :"72", state:"West Bengal"},
        { code :"73", state:"West Bengal"},
        { code :"74", state:"West Bengal"},
        { code :"75", state:"Orissa"},
        { code :"76", state:"Orissa"},
        { code :"77", state:"Orissa"},
        { code :"78", state:"Assam"},
        { code :"79", state:" Arunachal Pradesh Manipur Meghalaya Mizoram Nagaland Tripura"},
        { code :"80", state:"Bihar Jharkhand"},
        { code :"81", state:"Bihar"},
        { code :"82", state:"Bihar"},
        { code :"83", state:"Bihar Jharkhand"},
        { code :"84", state:"Bihar"},
        { code :"85", state:"Bihar"},
        { code :"92", state:" Jharkhand"},
        { code :"744", state:" Andaman & Nicobar"},
        { code :"10", state:" Maharashtra"},
        { code :"11", state:" Maharashtra"},
        { code :"12", state:" Maharashtra"},
        { code :"13", state:" Maharashtra"},
        { code :"14", state:" Maharashtra"},
        { code :"15", state:" Maharashtra"},
        { code :"16", state:" Maharashtra"},
        { code :"17", state:" Maharashtra"},
        { code :"18", state:" Maharashtra"},
        { code :"19", state:" Maharashtra"},
        { code :"20", state:" Maharashtra"},
        { code :"21", state:" Maharashtra"},
        { code :"22", state:" Maharashtra"},
        { code :"23", state:" Maharashtra"},
        { code :"24", state:" Maharashtra"},
        { code :"25", state:" Maharashtra"},
        { code :"26", state:" Maharashtra"},
        { code :"27", state:" Maharashtra"},
        { code :"28", state:" Maharashtra"},
        { code :"30", state:" Maharashtra"},
        { code :"31", state:" Maharashtra"},
        { code :"32", state:" Maharashtra"},
        { code :"33", state:" Maharashtra"},
        { code :"34", state:" Maharashtra"},
        { code :"35", state:" Maharashtra"},
        { code :"36", state:" Maharashtra"},
        { code :"37", state:" Maharashtra"},
        { code :"38", state:" Maharashtra"},
        { code :"39", state:" Maharashtra"},
        { code :"40", state:" Maharashtra"},
        { code :"41", state:" Maharashtra"},
        { code :"42", state:" Maharashtra"},
        { code :"43", state:" Maharashtra"},
        { code :"44", state:" Maharashtra"},
        { code :"0", state:" Maharashtra"},
        { code :"1", state:" Maharashtra"},
        { code :"2", state:" Maharashtra"},
        { code :"3", state:" Maharashtra"},
        { code :"4", state:" Maharashtra"},
        { code :"5", state:" Maharashtra"},
        { code :"6", state:" Maharashtra"},
        { code :"7", state:" Maharashtra"},
        { code :"8", state:" Maharashtra"},
        { code :"9", state:" Maharashtra"},
    ]
    //console.log("statesMapping", statesMapping.find(e => pincode.startsWith(e.code) ))
    if(statesMapping.find(e => pincode.startsWith(e.code) ) == null){
        return "NA";
    }else{
        return statesMapping.find(e => pincode.startsWith(e.code) ).state;
    }

}

module.exports.fetchShippingDetailsByOrderId =  async function(payload){
    const db = await mongo.connect();
    const collection = db.collection('config');
    var result = await collection.findOne({ key : "shiprocketauth" });
    var config = {
        method: 'get',
        url: `https://apiv2.shiprocket.in/v1/external/courier/track?order_id=${payload.order_id}&channel_id=1689076`,
        headers: {
            'Authorization': 'Bearer '+result.token,
            'Content-Type': 'application/json'
        },

    };
    try{
        var resultData = await axios(config);
        if(resultData.data[0].tracking_data.track_status === 1){
            return {state: true, data: resultData.data[0].tracking_data, url: resultData.data[0].tracking_data.track_url};
        }else{
            return {state: false, message: "There is no activities found in our DB. Please have some patience it will be updated soon."};
        }

    }catch (e) {
        return {state: false, message: "fetchError"};
    }
}


module.exports.createOrder = async function(payload){
    // await client.connect();
    let db = await mongo.connect();
    const collection = db.collection('config');
    const orders = db.collection('orders-v3');
    var result = await collection.findOne({ key : "shiprocketauth" });
    var order = await orders.findOne({ order_id : payload.order_id });

    //console.log("order",order);

    // order.cart = JSON.stringify(order.cart);
    var order_items = [];
    order.cart_items.forEach(function (e){
        order_items.push({
            name: e.name,
            units: e.quantity,
            sku: e.name,
            discount:"",
            tax:"",
            selling_price: e.payPrice +"",
        })
    })

    var shiprocketContext = {
        "order_id": order.order_id,
        "order_date": order.createdOn.toISOString().substring(0, 10).replace("T", " "),
        "pickup_location": "WAREHOUSE-TG",
        "channel_id": "1689076",
        "comment": "Reseller: M/s Goku",
        "billing_customer_name": order.selectedAddress.name,
        "billing_last_name": "",
        "billing_address": order.selectedAddress.street,
        "billing_address_2": order.selectedAddress.area,
        "billing_city": order.selectedAddress.city,
        "billing_pincode": order.selectedAddress.pincode,
        "billing_state": fetchPinStateFromPinCode(order.selectedAddress.pincode) || "N/A"  ,
        "billing_country": "India",
        "billing_email": order.userInfo.email,
        "billing_phone": order.userInfo.phone,
        "shipping_is_billing": true,
        "shipping_customer_name": order.selectedAddress.name,
        "shipping_last_name": "",
        "shipping_address": "",
        "shipping_address_2": "",
        "shipping_city": order.selectedAddress.city,
        "shipping_pincode": order.selectedAddress.pincode,
        "shipping_country": "India",
        "shipping_state": fetchPinStateFromPinCode(order.selectedAddress.pincode) || "N/A",
        "shipping_email": order.userInfo.email,
        "shipping_phone": order.userInfo.phone,
        "order_items": order_items,
        "payment_method": "Prepaid",
        "shipping_charges": 0,
        "giftwrap_charges": 0,
        "transaction_charges": 0,
        "total_discount": 0,
        "sub_total": order.CartSubtotal,
        "length": 220,
        "breadth": 105,
        "height": 105,
        "weight": 0.6
    };

    var config = {
        method: 'post',
        url: 'https://apiv2.shiprocket.in/v1/external/orders/create/adhoc',
        headers: {
            'Authorization': 'Bearer '+result.token,
            'Content-Type': 'application/json'
        },
        data: JSON.stringify(shiprocketContext)
    };
    try{
        var resultData = await axios(config);
        console.log("shiprocketContext", shiprocketContext, resultData.data);
        await orders.updateOne({ order_id : payload.order_id }, {$set:{
            shipRocketContext : resultData.data
        }});

        return {state: true, data: resultData.data};
    }catch (e) {
        console.log("resqest", config);
        console.log("shipRocketContext", shiprocketContext);
        console.log("shipRocketContext-ERR", e.response.data);
        return {state: false, data: e.response.data};
    }
}




module.exports.run = async function(){
    var data = JSON.stringify({
        "email": "shanmukh@redmattertech.com",
        "password": "Happi@123"
    });

    var auth_config = {
        method: 'post',
        url: 'https://apiv2.shiprocket.in/v1/external/auth/login',
        headers: {
            'Content-Type': 'application/json'
        },
        data : data
    };

    var response =  await axios(auth_config);
    //console.log(response.data);
    let db = await mongo.connect();
    const collection = db.collection('config');
    if(response.data != null && response.data.token !== null){
        await collection.updateOne({
            key : "shiprocketauth"
        }, {
            $set: {
                token:  response.data.token,
                updated_on: new Date()
            }
        }, { upsert: true });
    }else{
        setTimeout(() => {
            this.run()
        }, 1000)

    }
    //console.log("RESULT", result)
    return {status:"OK" };

}

//this.run();

//this.createOrder({order_id: "202201117C71E6"})
//this.fetchShippingData({order_id:"202201117C71E6"})
