
var AWS = require('aws-sdk');
async function getSignedUrl(folderpath,filename,url_type){
    var credentials = {
      accessKeyId: "AKIASTAEMZYQ3D75TOOZ",
      secretAccessKey: "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",
      region:"ap-south-1"
    };
    var s3 = new AWS.S3(credentials);
    var params = {Bucket:'happimobiles', Key: `test-userresume-v1/${folderpath}/${filename}`, Expires: 100000,ACL:"public-read"};
    var response=  await s3.getSignedUrl(url_type, params)
    return response
  

  }

  module.exports.getSignedUrl = getSignedUrl

