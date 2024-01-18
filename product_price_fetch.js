var fetchUrl = require("fetch").fetchUrl;
var html = require('node-html-parser');

// fetchUrl("https://www.91mobiles.com/poco-m3-pro-5g-price-in-india?utm_source=91m&utm_medium=top10&utm_campaign=budgetprod", function(error, meta, body){
//     const root = html.parse(body.toString());
//     //console.log(root.querySelector('.ord_11 .table tbody').toString());
//     var tbody = root.querySelector('.ord_11 .table tbody').toString();
//     tbody = tbody.split("</tr>");
//
//     for(var i = 0; i < tbody.length ; i++ ){
//         tbody[i] = tbody[i].substring(tbody[i].indexOf('<tr>')+6);
//         var temp = tbody[i].split("\n");
//         for(var j = 0; j < temp.length ; j++ ){
//             if(temp[j].trim() != ''){
//                 var data = temp[j].trim().replace('<td>','').replace('</td>','');
//
//                 if(data.indexOf('prc_txt') != -1){
//                     data = data.trim().replace('<td class="prc_txt">','')
//                     console.log("Price",data )
//                 }else if(j == 0){
//                     console.log("Store",data )
//                 }
//             }
//         }
//     }
//
// });



