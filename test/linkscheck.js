
const cheerio = require('cheerio');
var fetch = require('node-fetch');
var links = [
    "https://www.happimobiles.com/samsung-m02-red-2gb-32gb",
    "https://www.happimobiles.com/samsung-galaxy-m02s-blue-3gb-32gb",
    "https://www.happimobiles.com/samsung-galaxy-m12-white-6gb-128gb",
    "https://www.happimobiles.com/samsung-galaxy-m32-5g-black-6gb-128gb",
    "https://www.happimobiles.com/samsung-galaxy-m32-5g-black-8gb-128gb",
    "https://www.happimobiles.com/samsung-galaxy-a03s-blue-3gb-32gb",
    "https://www.happimobiles.com/samsung-galaxy-a03s-blue-4gb-64gb",
    "https://www.happimobiles.com/samsung-galaxy-a12-black-4gb-64gb",
    "https://www.happimobiles.com/samsung-galaxy-a12-white-4gb-128gb",
    "https://www.happimobiles.com/samsung-galaxy-a12-blue-6gb-128gb",
    "https://www.happimobiles.com/samsung-galaxy-a22-black-6gb-128gb",
    "https://www.happimobiles.com/samsung-galaxy-a22-5g-green-6gb-ram-128gb",
    "https://www.happimobiles.com/samsung-galaxy-a22-5g-green-8gb-ram-128gb",
    "https://www.happimobiles.com/samsung-galaxy-a52s-5g-white-6gb-128gb",
    "https://www.happimobiles.com/samsung-galaxy-a52s-5g-white-8gb-128gb",
    "https://www.happimobiles.com/samsung-galaxy-s20-fe-5g-cloud-lavender-128gb-8gb-ram",
    "https://www.happimobiles.com/samsung-galaxy-s21-phantom-white-8gb-ram-128gb",
    "https://www.happimobiles.com/samsung-galaxy-z-fold-3-5g-phantom-black-12-gb-256gb",
    "https://www.happimobiles.com/samsung-galaxy-tab-a7-lite-lte-silver-3gb-32gb",
    "https://www.happimobiles.com/redmi-note-9-arctic-white-6gb128gb",
    "https://www.happimobiles.com/redmi-10-prime-phantom-black-4gb-64gb",
    "https://www.happimobiles.com/redmi-note-10s-shadow-white-6gb-64gb",
    "https://www.happimobiles.com/oppo-a54-starry-blue-6gb-128gb",
    "https://www.happimobiles.com/oppo-f19s-glowing-black-6gb-128gb",
    "https://www.happimobiles.com/oppo-f19-pro-plus-space-silver-8gb-128gb",
    "https://www.happimobiles.com/vivo-y1s-aurora-blue-2gb-32gb",
    "https://www.happimobiles.com/vivo-y72-5g-prism-magic-8gb-128gb",
    "https://www.happimobiles.com/vivo-v21-5g-arctic-white-8gb-128-gb",
    "https://www.happimobiles.com/vivo-v21-5g-sunset-dazzle-8gb-256-gb",
    "https://www.happimobiles.com/realme-c11-2021-cool-grey-4gb-64gb",
    "https://www.happimobiles.com/realme-c25s-watery-grey-4gb-64gb",
    "https://www.happimobiles.com/realme-c25s-watery-grey-4gb-128gb",
    "https://www.happimobiles.com/realme-c25y-glacier-blue-4gb-128gb",
    "https://www.happimobiles.com/realme-8i-space-purple-4gb-64gb",
    "https://www.happimobiles.com/realme-8-5g-supersonic-black-4gb-64gb",
    "https://www.happimobiles.com/realme-8-5g-supersonic-black-8gb-128gb",
    "https://www.happimobiles.com/oneplus-nord-ce-5g-silver-ray-12gb-256gb",
    "https://www.happimobiles.com/oneplus-nord2-5g-grey-sierra-8gb-128gb",
    "https://www.happimobiles.com/oneplus-nord2-5g-green-wood-12gb-256gb",
    "https://www.happimobiles.com/oneplus-9r-5g-lake-blue-8-gb-ram-128-gb",
    "https://www.happimobiles.com/oneplus-9r-5g-black-12-gb-ram-256-gb",
    "https://www.happimobiles.com/oneplus-9-pro-5g-pine-green-8-gb-ram-128-gb"
]
var result = [];
for(var i = 0; i < links.length; i++){
    fetch(links[i])
        .then(result => result.text())
        .then(html => {
            //console.log(html);
            const $ = cheerio.load(html);

            result.push({
                title: $('meta[property="og:title"]').attr('content') || $('title').text() || $('meta[name="title"]').attr('content'),
                description: $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content'),
                url: $('meta[property="og:url"]').attr('content'),
                image: $('meta[property="og:image"]').attr('content') || $('meta[property="og:image:url"]').attr('content'),
                keywords: $('meta[property="og:keywords"]').attr('content') || $('meta[name="keywords"]').attr('content')
            })

        }).catch(error => {
            console.log(error);
        })
}

setTimeout(() => {
    console.log(result);
}, 60000);