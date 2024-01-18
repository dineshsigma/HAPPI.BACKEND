const serverless = require("serverless-http");
const express = require("express");
const app = express();
var cors = require("cors");
const mongo = require("./db");
var axios = require("axios");
var compression = require("compression");
var cacheService = require("express-api-cache");
const res = require("express/lib/response");
var cache = cacheService.cache;

app.use(compression());
app.options("*", cors()); // include before other routes
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/blogs", blogsList);
app.get("/api/blog", getBlogById);

async function blogsList(req, res) {
  let db = await mongo.connect();
  let blogs = db.collection("blogs");
  try {
    const receivedData = await blogs.find({}).toArray();

    return res.json({
      status: true,
      BlogList: receivedData,
    });
  } catch (e) {
    return res.json({
      status: true,
      BlogList: [],
    });
  }
}

async function getBlogById(req, res) {
  let db = await mongo.connect();
  let blogs = db.collection("blogs");
  try {
    const receivedData = await blogs.findOne({ linker: req.query.linker });

    return res.json({
      status: true,
      BlogObj: receivedData,
    });
  } catch (e) {
    return res.json({
      status: true,
      BlogObj: {},
    });
  }
}

app.get("/api/emi", emiCalculate);
async function emiCalculate(req, res) {
  var self = this;
  var amount = parseInt(req.query.amount);

  // var nosql = new Agent();
  // nosql.select("getEMI", "configuration").make(function (builder) {
  //   builder.where("configurationName", "EMI_Codes_List");
  //   builder.first();
  // });
  // var emiData = await nosql.promise("getEMI");

  let db = await mongo.connect();
  let categories = db.collection("configuration");

  var emiData = await categories.findOne({
    configurationName: "EMI_Codes_List",
  });

  var EMI_CODE = emiData.configurationDetails;
  var data = [];
  var minimumAmount = 100000;

  EMI_CODE.forEach(function (e) {
    //console.log(e.BANK);

    var each = {};
    each.bank_name = e.BANK;
    each.rate = [];
    e.EMI_RATE.forEach(function (r) {
      var month = r;
      month.intrest = parseFloat(amount * (r.val / 100)).toFixed(2);
      month.total = parseFloat(amount + parseFloat(month.intrest)).toFixed(2);
      month.monthly = parseFloat(
        parseFloat(month.total) / parseFloat(r.month)
      ).toFixed(2);
      each.rate.push(month);
      if (minimumAmount > parseFloat(month.monthly)) {
        minimumAmount = month.monthly;
      }
    });

    data.push(each);
  });

  //console.log(JSON.stringify(data));
  res.json({
    status: true,
    data: data,
    minimumAmount: minimumAmount,
  });
}

//cache
app.get("/api/homepage", cache("6 minutes"), async function (req, res) {
  let db = await mongo.connect();
  let homepage = db.collection("config");
  var homepageContext = await homepage.findOne({ key: "homepage" });

  var config_NewArrivals = {
    method: "post",
    url: "https://happi-mobile.ent.us-central1.gcp.cloud.es.io/api/as/v1/engines/happi-meta/search",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer search-fhf8xsbbzyadbi9vj4ne3avr",
    },
    data: JSON.stringify({
      query: "",
      filters: {
        all: [
          {
            payprice: {
              from: 100,
              to: 100000,
            },
          },
          {
            category: "mobile",
          },
        ],
      },
      page: {
        size: 10,
      },
      sort: [{ stock: "desc" }, { latest_score: "desc" }, { _score: "desc" }],
    }),
  };
  var config_Laptops = {
    method: "post",
    url: "https://happi-mobile.ent.us-central1.gcp.cloud.es.io/api/as/v1/engines/happi-meta/search",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer search-fhf8xsbbzyadbi9vj4ne3avr",
    },
    data: JSON.stringify({
      query: "laptops",
      page: {
        size: 10,
      },
      sort: [{ stock: "desc" }, { _score: "desc" }],
    }),
  };
  var config_BudgetBelow10 = {
    method: "post",
    url: "https://happi-mobile.ent.us-central1.gcp.cloud.es.io/api/as/v1/engines/happi-meta/search",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer search-fhf8xsbbzyadbi9vj4ne3avr",
    },
    data: JSON.stringify({
      query: "",
      filters: {
        all: [
          {
            payprice: {
              from: 100,
              to: 10000,
            },
          },
          {
            category: "mobile",
          },
        ],
      },
      page: {
        size: 10,
      },
      sort: [{ stock: "desc" }, { _score: "desc" }],
    }),
  };
  var config_Budget15To50 = {
    method: "post",
    url: "https://happi-mobile.ent.us-central1.gcp.cloud.es.io/api/as/v1/engines/happi-meta/search",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer search-fhf8xsbbzyadbi9vj4ne3avr",
    },
    data: JSON.stringify({
      query: "",
      filters: {
        all: [
          {
            payprice: {
              from: 15000,
              to: 50000,
            },
          },
          {
            category: "mobile",
          },
        ],
      },
      page: {
        size: 10,
      },
      sort: [{ stock: "desc" }, { _score: "desc" }],
    }),
  };
  var config_PremiumProducts = {
    method: "post",
    url: "https://happi-mobile.ent.us-central1.gcp.cloud.es.io/api/as/v1/engines/happi-meta/search",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer search-fhf8xsbbzyadbi9vj4ne3avr",
    },
    data: JSON.stringify({
      query: "",
      filters: {
        all: [
          {
            payprice: {
              from: 50000,
              to: 300000,
            },
          },
          {
            category: "mobile",
          },
        ],
      },
      page: {
        size: 10,
      },
      sort: [{ stock: "desc" }, { _score: "desc" }],
    }),
  };
  var config_HomeEntertainments = {
    method: "post",
    url: "https://happi-mobile.ent.us-central1.gcp.cloud.es.io/api/as/v1/engines/happi-meta/search",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer search-fhf8xsbbzyadbi9vj4ne3avr",
    },
    data: JSON.stringify({
      query: "tvs",
      page: {
        size: 10,
      },
      sort: [{ stock: "desc" }, { _score: "desc" }],
    }),
  };
  var config_TrendingGadgets = {
    method: "post",
    url: "https://happi-mobile.ent.us-central1.gcp.cloud.es.io/api/as/v1/engines/happi-meta/search",

    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer search-fhf8xsbbzyadbi9vj4ne3avr",
    },
    data: JSON.stringify({
      query: "accessories",
      page: {
        size: 10,
      },
      sort: [{ stock: "desc" }, { _score: "desc" }],
    }),
  };

  // var config_NewArrivals1 = {
  //     method: 'post',
  //     url: 'https://my-deployment-031377.ent.ap-south-1.aws.elastic-cloud.com/api/as/v1/engines/happi-meta/search',
  //     headers: {
  //         'Content-Type': 'application/json',
  //         'Authorization': 'Bearer search-tiaqdm43y6ae16a1isz5uonb'
  //     },
  //     data: JSON.stringify({
  //         "query": "",
  //         "filters": {
  //             "all": [
  //                 {
  //                     "payprice": {
  //                         "from": 100,
  //                         "to": 100000
  //                     }
  //                 },
  //                 {
  //                     "category": "mobile"
  //                 }
  //             ]
  //         },
  //         page:
  //         {
  //             size: 9,
  //         },
  //         "sort": [
  //             { "stock": "desc" },
  //             { "latest_score": "desc" },
  //             { "_score": "desc" }
  //         ]
  //     })
  // };

  var response = await axios(config_NewArrivals);
  homepageContext.NewArrivals = response.data;

  response = await axios(config_Laptops);
  homepageContext.Laptops = response.data;

  response = await axios(config_BudgetBelow10);
  homepageContext.BudgetBelow10 = response.data;

  response = await axios(config_Budget15To50);
  homepageContext.Budget15To50 = response.data;

  response = await axios(config_PremiumProducts);
  homepageContext.PremiumProducts = response.data;

  response = await axios(config_HomeEntertainments);
  homepageContext.HomeEntertainments = response.data;

  response = await axios(config_TrendingGadgets);
  homepageContext.TrendingGadgets = response.data;
  // response = await axios(config_NewArrivals1);
  // homepageContext.NewArrivals1 = response.data;

  var collection = db.collection("slider");

  var banners = await collection
    .find(
      { active: true },
      {
        sort: {
          weight: -1.0,
        },
      }
    )
    .toArray();

  homepageContext.bannerDesktop = banners.filter(
    (e) => e.devicetype === "desktop"
  );
  homepageContext.bannerMobile = banners.filter(
    (e) => e.devicetype === "mobile"
  );

  return res.json(homepageContext);
});
//cache
app.get("/api/cat", cache("6 minutes"), async function (req, res) {
  let db = await mongo.connect();
  let categories = db.collection("categories");
  var categoriesLevel1 = await categories
    .find({ level: 1 }, { sort: { sortkey: -1 } })
    .toArray();
  var menuCategories = [];

  for (var j = 0; j < categoriesLevel1.length; j++) {
    var item = categoriesLevel1[j];
    var categoriesLevel2 = await categories
      .find(
        {
          level: 2,
          parent_id: item.id,
        },
        { sort: { sortkey: -1 } }
      )
      .toArray();
    if (categoriesLevel2.length > 0) {
      var subCategories = [];
      var subCategorie = {};
      subCategorie.heading = item.title;
      subCategorie.megaItems = [];
      for (var i = 0; i < categoriesLevel2.length; i++) {
        subCategorie.megaItems.push({
          text: categoriesLevel2[i].title,
          url: categoriesLevel2[i].url,
          id: categoriesLevel2[i].id,
        });
      }
      subCategories.push(subCategorie);
      menuCategories.push({
        icon: "icon-star",
        text: item.title,
        url: item.url,
        extraClass: "menu-item-has-children has-mega-menu",
        subClass: "sub-menu",
        mega: false,
        subMenu: subCategories,
        id: item.id,
      });
    } else {
      menuCategories.push({
        icon: "icon-star",
        text: item.title,
        url: item.url,
        id: item.id,
      });
    }
  }
  res.json({ data: menuCategories });
});
//cache
app.get("/api/cat-fetch", cache("6 minutes"), async function (req, res) {
  let db = await mongo.connect();
  let categories = db.collection("categories");

  if (req.query.url.trim() === "" || req.query.url == null) {
    return res.json({ message: "Invalid Path", status: false });
  } else {
    var response = await categories.findOne({ url: req.query.url });
    if (response == null) {
      return res.json({ message: "Path Not Found", status: false });
    } else {
      return res.json({ data: response, status: true });
    }
  }
});

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}
//cache
app.get(
  "/api/product/:productId",
  cache("6 minutes"),
  async function (req, res) {
    let db = await mongo.connect();
    let categories = db.collection("categories");
    let products = db.collection("product");
    var finalObj = {};

    var eachProd = await products.findOne({
      ispublished: true,
      linker: req.params.productId,
    });

    if (eachProd == null) {
      return res.json({});
    }

    var breadCrumb = [
      {
        text: "Home",
        url: "/",
      },
    ];

    // console.log(eachProd.category);

    for (var i = 0; i < eachProd.category.length; i++) {
      console.log(eachProd.category[i]);

      var cat = await categories.findOne({ id: eachProd.category[i] });
      if (cat != null) {
        breadCrumb.push({
          text: cat.title,
          url: cat.url,
        });
      }
    }

    breadCrumb.push({
      text: eachProd.name,
    });

    console.log("breadCrumb", breadCrumb);

    eachProd.breadCrumb = breadCrumb;
    // console.log("eachProd",eachProd)

    finalObj.product = eachProd;

    var tallyPrice = 0;
    eachProd.price = eachProd.payPrice;
    if (eachProd.price < 5000) {
      tallyPrice = 1000;
    } else if (eachProd.price < 20000) {
      tallyPrice = 5000;
    } else if (eachProd.price < 50000) {
      tallyPrice = 10000;
    }

    var projection = {
      model_name: 1.0,
      linker: 1.0,
      color_name: 1.0,
      memory_info: 1.0,
      payPrice: 1.0,
      id: 1.0,
      pictures: 1,
      pictures_new: 1,
      image_url: 1,
    };

    var query = {
      $and: [
        { ispublished: true },
        { payPrice: { $gt: eachProd.price - tallyPrice } },
        { payPrice: { $lt: eachProd.price + tallyPrice } },
      ],
    };
    //{stock:-1}
    finalObj.relatedProducts = await products
      .find(query, { projection: projection })
      .sort({ stock: -1 })
      .limit(15)
      .toArray();

    if (
      eachProd.model_name !== null &&
      eachProd.model_name !== undefined &&
      eachProd.model_name.trim() !== ""
    ) {
      if (eachProd.model_name.trim() !== "") {
        var query = {
          $and: [
            {
              model_name: eachProd.model_name,
            },
            {
              ispublished: true,
            },
          ],
        };
      }

      var cursor = await products
        .find(query, { projection: projection })
        .toArray();

      var memory = [];
      var colors = [];

      for (var i = 0; i < cursor.length; i++) {
        cursor[i].memory_info = cursor[i].memory_info.trim();
        cursor[i].color_name = cursor[i].color_name.trim();
        memory.push(cursor[i].memory_info.trim());
        colors.push(cursor[i].color_name.trim());
      }

      colors = colors.filter(onlyUnique);
      memory = memory.filter(onlyUnique);
      var alphabet = /[^a-zA-Z]/g;
      var number = /[^0-9]/g;

      function sortAlphaNum(a, b) {
        var aA = a.replace(alphabet, "");
        var bA = b.replace(alphabet, "");
        if (aA === bA) {
          var aN = parseInt(a.replace(number, ""), 10);
          var bN = parseInt(b.replace(number, ""), 10);
          return aN === bN ? 0 : aN > bN ? 1 : -1;
        } else {
          return aA > bA ? 1 : -1;
        }
      }
      memory.sort(sortAlphaNum);
      finalObj.modelProducts = {
        combi: cursor,
        index: {
          colors: colors.sort(function (a, b) {}),
          memory: memory,
        },
      };
      // finalObj.modelProducts = { combi: cursor, index: { colors: colors.sort(), memory: memory } };
    }
    res.json(finalObj);
  }
);

// app.get("/api/emi", emiCalculate)

// async function emiCalculate(req, res) {
//     var self = this;
//     var amount = parseInt(req.query.amount);

//     let db = await mongo.connect();
//     let categories = db.collection("configuration");

//     var emiData = await categories.findOne({configurationName: "EMI_Codes_List"});

//     var EMI_CODE = emiData.configurationDetails;
//     var data = [];
//     var minimumAmount = 100000;

//     EMI_CODE.forEach(function (e) {
//         //console.log(e.BANK);

//         var each = {};
//         each.bank_name = e.BANK;
//         each.rate = [];
//         e.EMI_RATE.forEach(function (r) {
//             var month = r;
//             month.intrest = parseFloat(amount * (r.val / 100)).toFixed(2);
//             month.total = parseFloat(amount + parseFloat(month.intrest)).toFixed(2);
//             month.monthly = parseFloat(
//                 parseFloat(month.total) / parseFloat(r.month)
//             ).toFixed(2);
//             each.rate.push(month);
//             if (minimumAmount > month.monthly) {
//                 minimumAmount = month.monthly;
//             }
//         });

//         data.push(each);
//     });

//     //console.log(JSON.stringify(data));
//     res.json({
//         status: true,
//         data: data,
//         minimumAmount: minimumAmount
//     });
// }

async function productsSync() {
  console.log("productsSync");
  let db = await mongo.connect();
  let productColl = db.collection("product");
  var query = { category: "laptops" };
  var products = await productColl
    .find({}, { projection: { id: 1 } })
    .toArray();
  /// var delete_ids = [];
  for (var i = products.length - 1; (i) => 0; i--) {
    //
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
        // console.log("PRE",data.category);
        data.category = data.category.map((c) => {
          if (c != null) {
            return c.toLowerCase();
          }
        });
        // console.log("POST",data.category);
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
      var config = {
        method: "put",
        url:
          "https://search-es.happimobiles.com/products/_doc/" + products[i].id,
        headers: {
          Authorization: "Basic aGFwcGlhZG1pbjp1Q1N4UEhTRWNVaDB0MFRXc3FVMS0=",
          "Content-Type": "application/json",
        },
        data: data,
      };

      var obj = Object.keys(eachProd.filter);
      var filter = [];
      obj.forEach(function (e) {
        filter.push(eachProd.filter[e]);
      });

      var image_url = null;

      if (eachProd.image_url !== null && eachProd.image_url !== undefined) {
        //console.log("eachProd.image_url.trim()", eachProd.image_url.trim());
        if (eachProd.image_url.trim() !== "") image_url = eachProd.image_url;
      } else if (
        eachProd.pictures_new !== null &&
        eachProd.pictures_new.length !== 0
      ) {
        image_url = eachProd.pictures_new[0];
      } else if (
        eachProd.pictures !== undefined &&
        eachProd.pictures.length !== 0
      ) {
        image_url = `https://happimobiles.s3.ap-south-1.amazonaws.com/happi/${eachProd.pictures[0]}.jpg`;
      } else {
        image_url =
          "https://s3.ap-south-1.amazonaws.com/happimobiles/homepage/2048px-No_image_available.svg.png";
      }
      var algolia_obj = {
        id: eachProd.id,
        category: eachProd.category,
        payprice: eachProd.payPrice,
        linker: eachProd.linker,
        name: eachProd.name,
        filter: filter,
        stock: parseInt(eachProd.stock) || 0,
        seo: eachProd.seo,
        display_price: eachProd.payPrice.toLocaleString("en-IN", {
          style: "currency",
          currency: "INR",
        }),
        is_published: eachProd.ispublished,
        image_url: image_url,
        latest_score: new Date(eachProd.dateCreated).getTime(),
      };

      var config_search = {
        method: "POST",
        url: "https://my-deployment-031377.ent.ap-south-1.aws.elastic-cloud.com/api/as/v1/engines/happi/documents",
        headers: {
          Authorization: "Bearer private-u6gipkoz6kds78cs36q873vn",
          "Content-Type": "application/json",
        },
        data: JSON.stringify(algolia_obj),
      };

      var respSearch = await axios(config_search);

      console.log(
        `${i} --- ${products[i].id} --- ${eachProd.name} -- ${eachProd.category} -- ${image_url}`,
        respSearch.data
      );
      if (algolia_obj.image_url === null || !algolia_obj.is_published) {
        var config_search_delete = {
          method: "DELETE",
          url: "https://my-deployment-031377.ent.ap-south-1.aws.elastic-cloud.com/api/as/v1/engines/happi/documents",
          headers: {
            Authorization: "Bearer private-u6gipkoz6kds78cs36q873vn",
            "Content-Type": "application/json",
          },
          data: JSON.stringify([eachProd.id]),
        };
        try {
          await axios(config_search_delete);
          console.log("respSearch", eachProd.id, "DELETED");
        } catch (e) {
          console.log("respSearch", config_search_delete, e.response.data);
        }
      }
    } catch (e) {
      if (e.response) {
        console.log(
          `${i} --- ${products[i].id} --- ${eachProd.name} -- ${eachProd.category} -- ERR`,
          e.response.data
        );
      } else {
        console.log(
          `${i} --- ${products[i].id} --- ${eachProd.name} -- ${eachProd.category} -- ERR`,
          e
        );
      }
    }
    // if(!algolia_obj.is_published){
    //     //delete_ids.push(eachProd.id);
    //     var config_search_delete = {
    //         method: 'DELETE',
    //         url: 'https://my-deployment-031377.ent.ap-south-1.aws.elastic-cloud.com/api/as/v1/engines/happi/documents',
    //         headers: {
    //             'Authorization': 'Bearer private-u6gipkoz6kds78cs36q873vn',
    //             'Content-Type': 'application/json'
    //         },
    //         data: JSON.stringify([eachProd.id])
    //     };
    //     try {
    //         await axios(config_search_delete);
    //         console.log("respSearch", eachProd.id, "DELETED");
    //     } catch (e) {
    //         console.log("respSearch", config_search_delete, e.response.data);
    //     }
    // }
  }
}

app.get("/api/categoryCSV", categoryCSV);
async function categoryCSV(req, res) {
  try {
    let db = await mongo.connect();
    let productcoll = db.collection("product");
    let level_2category = await productcoll
      .find({}, { projection: { category: 1 } })
      .toArray();
    level_2category = level_2category.map(function (e) {
      return {
        category: e.category[1],
      };
    });
    let categoryArray = [];
    for (var i = 0; i < level_2category.length; i++) {
      categoryArray.push(level_2category[i].category);
    }
    return res.json({
      status: true,
      data: categoryArray,
    });
  } catch (error) {
    console.log(error);
    return res.json({
      status: false,
      message: error,
    });
  }
}

app.get("/api/relatedProducts", relatedProducts);
//Get Related Products
async function relatedProducts(req, res) {
  try {
    let linker = req.query.linker;
    let db = await mongo.connect();
    let productsTable = db.collection("product");
    let priceQuery = {};
    let getRelatedProducts = await productsTable.findOne({ linker: linker });

    if (
      getRelatedProducts.category[0] != null &&
      getRelatedProducts.payPrice != null
    ) {
      let payPrice = getRelatedProducts.payPrice;
      priceQuery.payPrice = {
        $gte: payPrice - 1000,
        $lte: payPrice + 3000,
      };
      priceQuery.category = getRelatedProducts.category[0];
      console.log(priceQuery);
      let productCategoryData = await productsTable.find(priceQuery).toArray();
      return res.json({ status: true, relatedProducts: productCategoryData });
    } else {
      return res.json({ status: false, message: "LINKER NOT FOUND" });
    }
  } catch (error) {
    console.log(error);
    return res.json({
      status: false,
      message: error,
    });
  }
}

app.get(
  "/api/homepage/listofproducts",
  cache("6 minutes"),
  async function (req, res) {
    let db = await mongo.connect();
    let homepage = db.collection("config");
    var homepageContext = await homepage.findOne({ key: "homepage" });

    var config_NewArrivals = {
      method: "post",
      url: "https://my-deployment-031377.ent.ap-south-1.aws.elastic-cloud.com/api/as/v1/engines/happi-meta/search",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer search-tiaqdm43y6ae16a1isz5uonb",
      },
      data: JSON.stringify({
        query: "",
        filters: {
          all: [
            {
              payprice: {
                from: 100,
                to: 100000,
              },
            },
            {
              category: "mobile",
            },
          ],
        },
        page: {
          size: 16,
        },
        sort: [{ stock: "desc" }, { latest_score: "desc" }, { _score: "desc" }],
      }),
    };
    var config_Laptops = {
      method: "post",
      url: "https://my-deployment-031377.ent.ap-south-1.aws.elastic-cloud.com/api/as/v1/engines/happi-meta/search",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer search-tiaqdm43y6ae16a1isz5uonb",
      },
      data: JSON.stringify({
        query: "laptops",
        page: {
          size: 16,
        },
        sort: [{ stock: "desc" }, { _score: "desc" }],
      }),
    };
    var config_BudgetBelow10 = {
      method: "post",
      url: "https://my-deployment-031377.ent.ap-south-1.aws.elastic-cloud.com/api/as/v1/engines/happi-meta/search",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer search-tiaqdm43y6ae16a1isz5uonb",
      },
      data: JSON.stringify({
        query: "",
        filters: {
          all: [
            {
              payprice: {
                from: 100,
                to: 10000,
              },
            },
            {
              category: "mobile",
            },
          ],
        },
        page: {
          size: 16,
        },
        sort: [{ stock: "desc" }, { _score: "desc" }],
      }),
    };
    var config_Budget15To50 = {
      method: "post",
      url: "https://my-deployment-031377.ent.ap-south-1.aws.elastic-cloud.com/api/as/v1/engines/happi-meta/search",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer search-tiaqdm43y6ae16a1isz5uonb",
      },
      data: JSON.stringify({
        query: "",
        filters: {
          all: [
            {
              payprice: {
                from: 15000,
                to: 50000,
              },
            },
            {
              category: "mobile",
            },
          ],
        },
        page: {
          size: 16,
        },
        sort: [{ stock: "desc" }, { _score: "desc" }],
      }),
    };
    var config_PremiumProducts = {
      method: "post",
      url: "https://my-deployment-031377.ent.ap-south-1.aws.elastic-cloud.com/api/as/v1/engines/happi-meta/search",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer search-tiaqdm43y6ae16a1isz5uonb",
      },
      data: JSON.stringify({
        query: "",
        filters: {
          all: [
            {
              payprice: {
                from: 50000,
                to: 300000,
              },
            },
            {
              category: "mobile",
            },
          ],
        },
        page: {
          size: 10,
        },
        sort: [{ stock: "desc" }, { _score: "desc" }],
      }),
    };
    var config_HomeEntertainments = {
      method: "post",
      url: "https://my-deployment-031377.ent.ap-south-1.aws.elastic-cloud.com/api/as/v1/engines/happi-meta/search",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer search-tiaqdm43y6ae16a1isz5uonb",
      },
      data: JSON.stringify({
        query: "tvs",
        page: {
          size: 16,
        },
        sort: [{ stock: "desc" }, { _score: "desc" }],
      }),
    };
    var config_TrendingGadgets = {
      method: "post",
      url: "https://my-deployment-031377.ent.ap-south-1.aws.elastic-cloud.com/api/as/v1/engines/happi-meta/search",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer search-tiaqdm43y6ae16a1isz5uonb",
      },
      data: JSON.stringify({
        query: "accessories",
        page: {
          size: 16,
        },
        sort: [{ stock: "desc" }, { _score: "desc" }],
      }),
    };

    try {
      var response = await axios(config_NewArrivals);
      homepageContext.NewArrivals = response.data;
      response = await axios(config_Laptops);
      homepageContext.Laptops = response.data;
      response = await axios(config_BudgetBelow10);
      homepageContext.BudgetBelow10 = response.data;
      response = await axios(config_Budget15To50);
      homepageContext.Budget15To50 = response.data;

      response = await axios(config_PremiumProducts);
      homepageContext.PremiumProducts = response.data;
      response = await axios(config_HomeEntertainments);
      homepageContext.HomeEntertainments = response.data;
      response = await axios(config_TrendingGadgets);
      homepageContext.TrendingGadgets = response.data;

      var collection = db.collection("slider");

      var banners = await collection
        .find(
          { active: true },
          {
            sort: {
              weight: -1.0,
            },
          }
        )
        .toArray();

      homepageContext.bannerDesktop = banners.filter(
        (e) => e.devicetype === "desktop"
      );
      homepageContext.bannerMobile = banners.filter(
        (e) => e.devicetype === "mobile"
      );

      return res.json(homepageContext);
    } catch (error) {
      return res.json({
        status: false,
        message: "ERROR",
      });
    }
  }
);

module.exports = app;

//this.productsSync();
