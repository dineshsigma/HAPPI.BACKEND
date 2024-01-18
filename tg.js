const TG = require('telegram-bot-api')
const TelegramBot = require('node-telegram-bot-api');

const api = new TG({
    token: '2066478848:AAEhX8I82xriOxPzT0OwDE2bMnughSX7nNQ'
})

const bot = new TelegramBot("2066478848:AAEhX8I82xriOxPzT0OwDE2bMnughSX7nNQ", {polling: true});

bot.onText(/\/echo (.+)/, (msg, match) => {
    // 'msg' is the received Message from Telegram
    // 'match' is the result of executing the regexp above on the text content
    // of the message

    const chatId = msg.chat.id;
    const resp = match[1]; // the captured "whatever"

    // send back the matched "whatever" to the chat
    bot.sendMessage(chatId, resp);
});

// Listen for any kind of message. There are different kinds of
// messages.
bot.on('message', (msg) => {
    const chatId = msg.chat.id;

    // send a message to the chat acknowledging receipt of their message
    console.log("MSG", msg)
//    console.log("chatId", chatId)
    if(msg.text.search('REGISTER') !== -1){
        bot.sendMessage(chatId, 'Number Saved');
    }else{
        bot.sendMessage(chatId, 'Received your message');
    }


});
//bot.sendMessage(2059535133, "Test")
// 421903251  khan
// 2059535133 me
// 297773856 sh
// 290232577 ravi

bot.sendMessage(297773856,`<b>Order Id: </b> 123456789 \n 
<b>Customer Name: </b> Khan \n 
<b>Customer Name: </b> Khan \n 
<b>Customer Address: </b> Plot No 160/1, Rno 21, Vivekannada Nagar Kuatpalli - HYD 500072 \n 
<a href=\"https://happimobiles.com/\">Confirm Order</a> \n 
<b>AWB No: </b> 123456789 \n  
 <b>Products No: </b> Head Set X 2 \n  Galaxy Note Blue X 2 \n`
,{parse_mode : "HTML"});


// nodeHtmlToImage({
//     output: './image.png',
//     html: '<html><body>Hello world!</body></html>'
// })
//     .then(() => console.log('The image was created successfully!'))


// api.getMe()
//         .then(console.log)
//         .catch(console.err)
//
// // Define your message provider
// const mp = new TG.GetUpdateMessageProvider()
// api.sendMessage(2059535133, "hello")
//
// // Set message provider and start API
// api.setMessageProvider(mp)
// api.start()
//     .then(() => {
//         console.log('API is started')
//     })
//     .catch(console.err)
//
// // Receive messages via event callback
// api.on('update', update => {
//
//     // update object is defined at
//     // https://core.telegram.org/bots/api#update
//     console.log(update)
// })
//

var axios = require('axios');

var data = JSON.stringify(
    {
        "lead":
            {
                "first_name": "Shanmukha",
                "mobile_number": "+918686836269",
                "address":`Kukatpally , Hyd - 500072`,
                "custom_field": {
                    "cf_url": `https://www.happimobiles.com/checkout/ID`,
                    "cf_request_type": "order_done",
                    "cf_mobile_model": "TestQA",
                    "cf_payment_type": "PAID"
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

axios(config)
    .then(function (response) {
        console.log(JSON.stringify(response.data));
    })
    .catch(function (error) {
        console.log(error);
    });
