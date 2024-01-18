var axios = require('axios');
const mongo = require("./db");
var as = require('async');
var AWS = require('aws-sdk');
const res = require('express/lib/response');




var personalizeevents = new AWS.PersonalizeEvents({ apiVersion: '2018-03-22', accessKeyId: 'AKIASTAEMZYQ3D75TOOZ', secretAccessKey: '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', region: 'us-east-1' });
// aws_access_key_id=AKIASTAEMZYQ3D75TOOZ
// aws_secret_access_key=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
//

let productColl

async function productsSync(req, res) {
    try {
        if (req.headers['x-api-key'] != "jnkjnkjkjbkjhitfuyfdyaewxjkhvjhfthrs") {
            return res.json({
                message: "invalid signature"
            })
        }
        console.log("Job Triggered productsSync");
        console.time("productsSync")
        console.time("productsFetch")
        let db = await mongo.connect();
        productColl = db.collection("product");
        var query = { category: "laptops" }

       
        
        var products = await productColl.find({"ispublished":true}).sort({ "elasticSyncdate": 1 }).limit(30).toArray();
        
        /// var delete_ids = [];

        console.timeEnd("productsFetch");

        PushProductsToElastic(products);
        //await new Promise(r => setTimeout(r, 2000));
        return res.json({
            message: "success"
        })
    
    
    }
    catch (error) {
        return res.json({
            status: false,
            message: error
        })
    }
};

function PushProductsToElastic(products) {
    //console.log("products", products.length);
    as.eachOfLimit(products, 2, async function (item, i) {

        try {
            var eachProd = await productColl.findOne({ id: products[i].id });
            var data = eachProd;
            data.esSyncedOn = new Date();
            delete data._id;
            data.stock = parseInt(data.stock) || 0;
            data.sortWeight = parseInt(data.sortWeight);
            if (data.specifications === "" || data.specifications === null) {
                data.specifications = [];
            }
            if (data.category != null) {
                data.category = data.category.map(c => {
                    if (c != null) {
                        return c.toLowerCase()
                    }
                });
            }

            if (data.payPrice != null) {
                data.payPrice = parseInt(data.payPrice);
            } else {
                return;
            }
            if (data.mrp != null) {
                data.mrp = parseInt(data.mrp);
            }
            data = JSON.stringify(data);
            var searchdata = JSON.stringify([data]);


            var obj = Object.keys(eachProd.filter);
            var filter = [];
            obj.forEach(function (e) {
                filter.push(eachProd.filter[e]);
            })

            var image_url = null;

            if (eachProd.image_url !== null && eachProd.image_url !== undefined && eachProd.image_url.trim() !== "") {
                image_url = eachProd.image_url;
            } else if (eachProd.pictures_new !== null && eachProd.pictures_new.length !== 0) {
                image_url = eachProd.pictures_new[0];
            } else if (eachProd.pictures !== undefined && eachProd.pictures.length !== 0) {
                image_url = `https://happimobiles.s3.ap-south-1.amazonaws.com/happi/${eachProd.pictures[0]}.jpg`;
            } else {
                image_url = "https://s3.ap-south-1.amazonaws.com/happimobiles/homepage/2048px-No_image_available.svg.png";
            }

           
            let modelname;
            if (eachProd.model_name != null && eachProd.model_name != undefined && eachProd.model_name!="") {
                modelname = eachProd.model_name + " " + eachProd.color_name

            }else {
                modelname = eachProd.name
            }
            var algolia_obj = {
                id: eachProd.id,
                category: eachProd.category,
                payprice: eachProd.payPrice,
                linker: eachProd.linker,
                name: eachProd.name,

                stock: parseInt(eachProd.stock) || 0,
                seo: eachProd.seo,
                display_price: eachProd.payPrice.toLocaleString("en-IN", {
                    style: "currency",
                    currency: "INR",
                }),
                is_published: eachProd.ispublished,
                image_url: image_url,
                latest_score: new Date(eachProd.dateCreated).getTime(),
                brand: eachProd.filter.brand,
                ram: eachProd.filter.ram,
                battery: eachProd.filter.battery,
                cam: eachProd.filter.cam,
                screen: eachProd.filter.screen,
                processor: eachProd.filter.processor,
                network: eachProd.filter.network,
                mrp: eachProd.mrp,
                modelname: modelname,
                wishlist:eachProd.wishlist



            };

            //console.log("data----",algolia_obj);


            if (eachProd.productType == 'Mobiles') {

                algolia_obj.producttype = eachProd.productType

            }
            else if (eachProd.productType == 'SmartWatches') {
                algolia_obj.producttype = eachProd.productType

            }
            else if (eachProd.productType == 'BluetoothSpeaker') {
                algolia_obj.producttype = eachProd.productType

            }
            else if (eachProd.productType == 'BluetoothHeadset') {
                algolia_obj.producttype = eachProd.productType

            }
            else if (eachProd.productType == 'Tablets') {
                algolia_obj.producttype = eachProd.productType

            }
            else if (eachProd.productType == 'Tvs') {
                algolia_obj.producttype = eachProd.productType

            }
            else if (eachProd.productType == 'laptops') {
                algolia_obj.producttype = eachProd.producttype
            }
            else if (eachProd.productType == 'Mobile') {
                algolia_obj.producttype = eachProd.productType

            }
            else if (eachProd.productType == 'Live Care') {
                algolia_obj.producttype = eachProd.productType

            }

            else if (eachProd.productType == 'Headset') {
                algolia_obj.producttype = eachProd.productType

            }
            else if (eachProd.productType == null) {
                algolia_obj.producttype = eachProd.productType;

            }

            algolia_obj.product_type = algolia_obj.producttype;



            var config_search = {
                method: 'POST',
                url: 'https://happi-mobile.ent.us-central1.gcp.cloud.es.io/api/as/v1/engines/happi-meta/documents',
                headers: {
                    'Authorization': 'Bearer private-bnjkyzso42775edmhgse2xt6',
                    'Content-Type': 'application/json'
                },
                data: JSON.stringify(algolia_obj)
            };

            var respSearch = await axios(config_search);
            //console.log(respSearch,respSearch);

            await productColl.updateOne({ id: algolia_obj.id }, { $set: { elasticSyncdate: new Date() } });

            //console.log(respSearch);

            var params = {
                datasetArn: 'arn:aws:personalize:us-east-1:178250370593:dataset/happi-products/ITEMS',
                items: [ /* required */
                    {
                        itemId: algolia_obj.id,
                        properties: {
                            PRICE: eachProd.payPrice,
                            CATEGORY_L1: eachProd.category.toString()
                        }
                    },

                ]
            };


            //personalizeevents.putItems(params, function(err, data) {
            //	if (err) console.log(err, err.stack); // an error occurred
            //	else     console.log("EVENT",data);           // successful response
            //});		

            //console.log(`${i} --- ${products[i].id} --- ${eachProd.name} -- ${eachProd.category} -- ${image_url}`, respSearch.data);
            //console.log(`${i} --- id:${products[i].id} --- name:${eachProd.name} --- stock:${eachProd.stock}------image_url:${eachProd.image_url}--`);
            //console.log(algolia_obj.image_url===null,!algolia_obj.is_published)
            if (algolia_obj.image_url === null || !algolia_obj.is_published) {
                
                var config_search_delete = {
                    method: 'DELETE',
                    url: 'https://happi-mobile.ent.us-central1.gcp.cloud.es.io/api/as/v1/engines/happi-meta/documents',
                    headers: {
                        'Authorization': 'Bearer private-bnjkyzso42775edmhgse2xt6',
                        'Content-Type': 'application/json'
                    },
                    data: JSON.stringify([eachProd.id])
                };
                try {
                    await axios(config_search_delete);
                    await productColl.updateOne({ id: algolia_obj.id }, { $set: { elasticSyncdate: new Date() } });

                    // console.log("respSearch", eachProd.id, "DELETED");
                } catch (e) {
                    // console.log("respSearch", config_search_delete, e.response.data);
                }
            }

        } catch (e) {
            if (e.response) {
                console.log(`${i} --- ${products[i].id} --- ${eachProd.name} -- ${eachProd.category} -- ERR`, e.response.data);
            } else {
                console.log(`${i} --- ${products[i].id} --- ${eachProd.name} -- ${eachProd.category} -- ERR`, e);
            }
        }
        //console.log("RUNNER END", i, item)
        await new Promise(r => setTimeout(r, 1000));
        return true;
    }, async function () {
        console.timeEnd("productsSync")
        console.log(" JOB DONE ");


        var data = JSON.stringify({
            "recipient": "channel:id:28B06m1KdkbA",
            "content": {
                "className": "ChatMessage.Text",
                "text": "Job Success: Happi Product Search Index Synced"
            }
        });

        var config = {
            method: 'post',
            url: 'https://iipl-work.jetbrains.space/api/http/chats/messages/send-message',
            headers: {
                'Authorization': 'Bearer eyJhbGciOiJSUzUxMiJ9.eyJzdWIiOiI1YTAyN2ZkYy1hMGY1LTQ2ZWMtYmRkMS01MTY2NzQ2YTZkNTIiLCJhdWQiOiI1YTAyN2ZkYy1hMGY1LTQ2ZWMtYmRkMS01MTY2NzQ2YTZkNTIiLCJvcmdEb21haW4iOiJpaXBsLXdvcmsiLCJuYW1lIjoiVGVzdGluZyIsImlzcyI6Imh0dHBzOlwvXC9paXBsLXdvcmsuamV0YnJhaW5zLnNwYWNlIiwicGVybV90b2tlbiI6IjFlSXhkbzFRWjFaOCIsInByaW5jaXBhbF90eXBlIjoiU0VSVklDRSIsImlhdCI6MTY1NDQ0NTM5MX0.EJ919NujpziJFeiBDW-WqXnLsrl6ZHWACEKtEVZl_wMLMwhUDaKAAsZrxd2mtkLkkwDQHf3XK9F-AHXJEu4w006H40nEeEioIQWpskGMFN7OCnWH6fE_hrwwzI9Ltr_pZ10e_ZhW-UuK2MrgAxtijfVLUwRiCuAWMT-QKoye8c4',
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            data: data
        };
        await axios(config);


    })





}


//productsSync();

//exports.productsSync = productsSync;

module.exports.productsSync = productsSync;

