var mongo = require('../db');

async function run(){
    var db = await mongo.connect();
    var productsTbl = await db.collection('product');

    var products = await productsTbl.find({ispublished: true},{projection:{name:1, linker:1, payPrice:1, mrp:1, id:1, stock:1, shippingPrice:1}}).toArray();
    var log = []
    for(var i = 0; i < products.length; i++){

        if(products[i].linker.trim() !== ""){
            await productsTbl.updateOne({linker:products[i].linker}, {
                $set:{
                    payPrice: parseInt(products[i].payPrice),
                    mrp: parseInt(products[i].mrp),
                    stock: parseInt(products[i].stock),
                    shippingPrice: parseInt(products[i].shippingPrice),
                }
            })
            log.push({
                slug: products[i].linker,
                payPrice: products[i].payPrice,
                mrp:    products[i].mrp,
                stock:    products[i].stock
            })
        }
    }

    console.table(log);
    return;
}

run()