var email = require('./modules/email');
const {send_mail} = require("./modules/email");

var emailcontect  = `
Redmi Note 10 Pro max Vintage Bronze 8GB | 128GB X 1  = INR 21999
=======================================
ORDER DETAILS 

deliveryType delivery
tran_id 2a9b1a4609367f953e07e5d8ce897b
order_id 20211215A6467D
payment_status paid
gateway PAYU
payu_payment_id 14399807069
Status ORDER PLACED
Date Dec 15, 2021 10:31 AM
Quantity 1
Total INR 21999

DELIVERY DETAILS 
=======================================
name Ashok bairwa
phone 7014700210
street Gulab sadan Mohalla jinsi ward no 03
area Behind saint soldier school
city Tonk
pincode 304001

REPLY FOR 
=======================================
Name : ashok bairwa
Email : bittukabittu2013@gmail.com
Phone Number : 7014700210
Comment : i make an order for Redmi Note 10 Pro max Vintage Bronze 8GB | 128GB on 15 Dec. 2021  at 10.31 am
my payment deduct successfully but not shown order status in my account section.
    plz upate and email me about my payment detail /transation  detail.

Email = bittukabittu2015@gmail.com
Contact = +91-7014700210`;


send_mail(["bittukabittu2013@gmail.com", "orders@happimobiles.com"], "ORDERID:20211215A6467D", emailcontect, [], function(err, data){

})
