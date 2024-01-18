// https://www.happimobiles.com/sitemap.xml
// var webshot = require('webshot');
const Pageres = require('pageres');


var axios = require('axios');
var app = require("node-server-screenshot");

async function run(){
    console.log("__dirname",__dirname);
    const { data } = await axios.get('https://dev-services.happimobiles.com/sitemap')

    for(var i = 0; i < data.length; i++) {

        await new Pageres({delay: 2})
            .src('https://www.happimobiles.com/'+data[i].linker, ['1920x1080'], {crop: true})
            .dest(__dirname+'/images')
            .run();

        console.log('Finished generating screenshots! '+data[i].linker );
    }
}

run();
