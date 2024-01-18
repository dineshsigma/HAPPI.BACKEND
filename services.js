
var axios = require('axios');
var mongo = require("./db");
var qs = require('qs');
const log = require('log-to-file');
var as = require('async');

function createUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
// var SKUs = [
//   {
//     "APEXModelCode": "RM 8 8/128 Silver",
//     "APEX-MODEL NAME": "REALME 8 8/128 - Silver",
//     "sku": "realme8128GBStorageCyberSilver8GBRAM",
//     "MODEL ID": 229270,
//     "MRP": 17999,
//     "Bajaj-MOP": 17999,
//     "HappiMOP": 17999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "OP 9 12/256 Sky",
//     "APEX-MODEL NAME": "Oneplus 9 12/256  - Arctic Sky",
//     "sku": "OnePlus9256GBArcticSky12GBRAM",
//     "MODEL ID": 225917,
//     "MRP": 54999,
//     "Bajaj-MOP": 54999,
//     "HappiMOP": 49999,
//     "Difference": -5000
//   },
//   {
//     "APEXModelCode": "X60 12/256 Blue",
//     "APEX-MODEL NAME": "X60 Vivo 12/256 - Blue",
//     "sku": "VivoX60256GBShimmerBlue12GBRAM",
//     "MODEL ID": 222586,
//     "MRP": 39990,
//     "Bajaj-MOP": 39990,
//     "HappiMOP": 36600,
//     "Difference": -3390
//   },
//   {
//     "APEXModelCode": "X60 8/128 Black",
//     "APEX-MODEL NAME": "X60 Vivo 8/128 - Black",
//     "sku": "VivoX60128GBMidnightBlack8GBRAM",
//     "MODEL ID": 222585,
//     "MRP": 34990,
//     "Bajaj-MOP": 34990,
//     "HappiMOP": 31600,
//     "Difference": -3390
//   },
//   {
//     "APEXModelCode": "X60 8/128 Blue",
//     "APEX-MODEL NAME": "X60 Vivo 8/128 - Blue",
//     "sku": "VivoX60128GBShimmerBlue8GBRAM",
//     "MODEL ID": 222585,
//     "MRP": 34990,
//     "Bajaj-MOP": 34990,
//     "HappiMOP": 31600,
//     "Difference": -3390
//   },
//   {
//     "APEXModelCode": "11X 8/128 Black",
//     "APEX-MODEL NAME": "Mi 11X (8G+128G) - Black",
//     "sku": "MI11X128GBCosmicBlack8GBRAM",
//     "MODEL ID": 225825,
//     "MRP": 32499,
//     "Bajaj-MOP": 31999,
//     "HappiMOP": 30099,
//     "Difference": -1900
//   },
//   {
//     "APEXModelCode": "11X 8/128 White",
//     "APEX-MODEL NAME": "Mi 11X (8G+128G) - White",
//     "sku": "MI11X128GBLunarWhite8GBRAM",
//     "MODEL ID": 225827,
//     "MRP": 32499,
//     "Bajaj-MOP": 31999,
//     "HappiMOP": 30099,
//     "Difference": -1900
//   },
//   {
//     "APEXModelCode": "9Pro 8/128 M Mist",
//     "APEX-MODEL NAME": "OnePlus 9 Pro 8/128 - Morning Mist",
//     "sku": "ONEPLUS9PRO128GBSTORAGEMORNINGMIST8GBRAM",
//     "MODEL ID": 245009,
//     "MRP": 64999,
//     "Bajaj-MOP": 64999,
//     "HappiMOP": 59999,
//     "Difference": -5000
//   },
//   {
//     "APEXModelCode": "OP 9Pro 12/256 MM",
//     "APEX-MODEL NAME": "Oneplus 9Pro 12/256 -Morning Mist",
//     "sku": "ONEPLUS9PRO256GBSTORAGEMORNINGMIST12GBRAM",
//     "MODEL ID": 245010,
//     "MRP": 69999,
//     "Bajaj-MOP": 69999,
//     "HappiMOP": 64999,
//     "Difference": -5000
//   },
//   {
//     "APEXModelCode": "9Pro 8/128 Black",
//     "APEX-MODEL NAME": "OnePlus 9 Pro 8/128 - Stellar Black",
//     "sku": "ONEPLUS9PRO128GBSTORAGESTELLARBLACK8GBRAM",
//     "MODEL ID": 245011,
//     "MRP": 64999,
//     "Bajaj-MOP": 64999,
//     "HappiMOP": 59999,
//     "Difference": -5000
//   },
//   {
//     "APEXModelCode": "OP 9Pro 12/256 SB",
//     "APEX-MODEL NAME": "Oneplus 9Pro 12/256 - Stellar Black",
//     "sku": "ONEPLUS9PRO256GBSTORAGESTELLARBLACK12GBRAM",
//     "MODEL ID": 245012,
//     "MRP": 69999,
//     "Bajaj-MOP": 69999,
//     "HappiMOP": 64999,
//     "Difference": -5000
//   },
//   {
//     "APEXModelCode": "9Pro 8/128 Green",
//     "APEX-MODEL NAME": "OnePlus 9 Pro 8/128 - Green",
//     "sku": "ONEPLUS9PRO128GBSTORAGEPINEGREEN8GBRAM",
//     "MODEL ID": 245013,
//     "MRP": 64999,
//     "Bajaj-MOP": 64999,
//     "HappiMOP": 59999,
//     "Difference": -5000
//   },
//   {
//     "APEXModelCode": "OP 9Pro 12/256 PG",
//     "APEX-MODEL NAME": "Oneplus 9Pro 12/256 - Pine Green",
//     "sku": "ONEPLUS9PRO256GBSTORAGEPINEGREEN12GBRAM",
//     "MODEL ID": 245014,
//     "MRP": 69999,
//     "Bajaj-MOP": 69999,
//     "HappiMOP": 64999,
//     "Difference": -5000
//   },
//   {
//     "APEXModelCode": "OP 9R 8/128 Black",
//     "APEX-MODEL NAME": "Oneplus 9R 8/128 -Carbon Black",
//     "sku": "ONEPLUS9R128GBSTORAGECARBONBLACK8GBRAM",
//     "MODEL ID": 245015,
//     "MRP": 39999,
//     "Bajaj-MOP": 39999,
//     "HappiMOP": 36999,
//     "Difference": -3000
//   },
//   {
//     "APEXModelCode": "OP 9R 12/256 Black",
//     "APEX-MODEL NAME": "Oneplus 9R 12/256 -Carbon Black",
//     "sku": "ONEPLUS9R256GBSTORAGECARBONBLACK12GBRAM",
//     "MODEL ID": 245016,
//     "MRP": 43999,
//     "Bajaj-MOP": 43999,
//     "HappiMOP": 40999,
//     "Difference": -3000
//   },
//   {
//     "APEXModelCode": "OP 9R 8/128 Blue",
//     "APEX-MODEL NAME": "Oneplus 9R 8/128 - Lake Blue",
//     "sku": "ONEPLUS9R128GBSTORAGELAKEBLUE8GBRAM",
//     "MODEL ID": 245017,
//     "MRP": 39999,
//     "Bajaj-MOP": 39999,
//     "HappiMOP": 36999,
//     "Difference": -3000
//   },
//   {
//     "APEXModelCode": "OP 9R 12/256 Blue",
//     "APEX-MODEL NAME": "Oneplus 9R 12/256 -Lake Blue",
//     "sku": "ONEPLUS9R256GBSTORAGELAKEBLUE12GBRAM",
//     "MODEL ID": 245018,
//     "MRP": 43999,
//     "Bajaj-MOP": 43999,
//     "HappiMOP": 40999,
//     "Difference": -3000
//   },
//   {
//     "APEXModelCode": "11X 8/128 Silver",
//     "APEX-MODEL NAME": "Mi 11X (8G+128G) - Silver",
//     "sku": "MI11X128GBCelestialSilver8GBRAM",
//     "MODEL ID": 225826,
//     "MRP": 32499,
//     "Bajaj-MOP": 31999,
//     "HappiMOP": 30099,
//     "Difference": -1900
//   },
//   {
//     "APEXModelCode": "G10 4/64 Blue",
//     "APEX-MODEL NAME": "Nokia G10 4/64 - Blue",
//     "sku": "NOKIAG1064GBNIGHTDARKBLUE4GBRAM",
//     "MODEL ID": 243359,
//     "MRP": 12149,
//     "Bajaj-MOP": 12149,
//     "HappiMOP": 12149,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "GT Neo2 8/128 Blue",
//     "APEX-MODEL NAME": "Realme GT Neo2 8+128 - Blue",
//     "sku": "REALMEGTNEO2128GBSTORAGENEOBLUE8GBRAM",
//     "MODEL ID": 246429,
//     "MRP": 32099,
//     "Bajaj-MOP": 31999,
//     "HappiMOP": 31999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "11Lite NE 8/128 Blac",
//     "APEX-MODEL NAME": "Mi 11 Lite NE 5G (8G+128G) - Black",
//     "sku": "MI11LITENE5G128GBSTORAGEVINYLBLACK6GBRAM",
//     "MODEL ID": 244739,
//     "MRP": 29099,
//     "Bajaj-MOP": 28999,
//     "HappiMOP": 28999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "A15 3/32 Black",
//     "APEX-MODEL NAME": "A15 Oppo 3/32 - Black",
//     "sku": "OppoA1532GBDynamicBlack3GBRAM",
//     "MODEL ID": 206911,
//     "MRP": 10990,
//     "Bajaj-MOP": 10990,
//     "HappiMOP": 10990,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "A15 3/32 Blue",
//     "APEX-MODEL NAME": "A15 Oppo 3/32 - Blue",
//     "sku": "OppoA1532GBMysteryBlue3GBRAM",
//     "MODEL ID": 206911,
//     "MRP": 10990,
//     "Bajaj-MOP": 10990,
//     "HappiMOP": 10990,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "A15s 4/64 Black",
//     "APEX-MODEL NAME": "A15s Oppo 4/64 - Black",
//     "sku": "OppoA15s64GBDynamicBlack4GBRAM",
//     "MODEL ID": 211750,
//     "MRP": 12490,
//     "Bajaj-MOP": 12490,
//     "HappiMOP": 12490,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "A15s 4/64 Silver",
//     "APEX-MODEL NAME": "A15s Oppo 4/64 - Silver",
//     "sku": "OppoA15s64GBRainbowSilver4GBRAM",
//     "MODEL ID": 211750,
//     "MRP": 12490,
//     "Bajaj-MOP": 12490,
//     "HappiMOP": 12490,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "A15s 4/64 White",
//     "APEX-MODEL NAME": "A15s Oppo 4/64 - White",
//     "sku": "OppoA15s64GBFancyWhite4GBRAM",
//     "MODEL ID": 211750,
//     "MRP": 12490,
//     "Bajaj-MOP": 12490,
//     "HappiMOP": 12490,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "A54 6/128 Black",
//     "APEX-MODEL NAME": "A54 Oppo 6/128 - Black",
//     "sku": "OppoA54128GBCrystalBlack6GBRAM",
//     "MODEL ID": 223902,
//     "MRP": 16990,
//     "Bajaj-MOP": 16990,
//     "HappiMOP": 16990,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "A54 6/128 Blue",
//     "APEX-MODEL NAME": "A54 Oppo 6/128 - Blue",
//     "sku": "OppoA54128GBStarryBlue6GBRAM",
//     "MODEL ID": 223902,
//     "MRP": 16990,
//     "Bajaj-MOP": 16990,
//     "HappiMOP": 16990,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "F19 6/128 Blue",
//     "APEX-MODEL NAME": "F19 Oppo 6/128 - Blue",
//     "sku": "OPPOF19128GBMidnightBlue6GBRAM",
//     "MODEL ID": 222786,
//     "MRP": 19990,
//     "Bajaj-MOP": 19990,
//     "HappiMOP": 19990,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "F19 6/128 Silver",
//     "APEX-MODEL NAME": "F19 Oppo 6/128 - Silver",
//     "sku": "OPPOF19128GBPrismBlack6GBRAM",
//     "MODEL ID": 222786,
//     "MRP": 19990,
//     "Bajaj-MOP": 19990,
//     "HappiMOP": 19990,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "F19pro 8/128 Black",
//     "APEX-MODEL NAME": "F19Pro Oppo 8/128 - Black",
//     "sku": "OPPOF19Pro128GBFluidBlack8GBRAM",
//     "MODEL ID": 221517,
//     "MRP": 21990,
//     "Bajaj-MOP": 21990,
//     "HappiMOP": 21990,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "F19pro 8/128 Silver",
//     "APEX-MODEL NAME": "F19Pro Oppo 8/128 - Silver",
//     "sku": "OPPOF19Pro128GBCrystalSilver8GBRAM",
//     "MODEL ID": 221517,
//     "MRP": 21990,
//     "Bajaj-MOP": 21990,
//     "HappiMOP": 21990,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "F19Pro+ 8/128 Black",
//     "APEX-MODEL NAME": "F19Pro Plus Oppo 8/128 - Black",
//     "sku": "OPPOF19ProPlus5G128GBFluidBlack8GBRAM",
//     "MODEL ID": 221516,
//     "MRP": 25990,
//     "Bajaj-MOP": 25990,
//     "HappiMOP": 25990,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "F19Pro+ 8/128 Silver",
//     "APEX-MODEL NAME": "F19Pro Plus Oppo 8/128 - Silver",
//     "sku": "OPPOF19ProPlus5G128GBSpaceSilver8GBRAM",
//     "MODEL ID": 221516,
//     "MRP": 25990,
//     "Bajaj-MOP": 25990,
//     "HappiMOP": 25990,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "Reno6 8/128 Aurora",
//     "APEX-MODEL NAME": "Reno6 Oppo 8/128 - Aurora",
//     "sku": "OPPORENO65G128GBSTORAGEAURORA8GBRAM",
//     "MODEL ID": 235298,
//     "MRP": 29990,
//     "Bajaj-MOP": 29990,
//     "HappiMOP": 29990,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "Reno6 8/128 Black",
//     "APEX-MODEL NAME": "Reno6 Oppo 8/128 - Black",
//     "sku": "OPPORENO65G128GBSTORAGESTELLARBLACK8GBRAM",
//     "MODEL ID": 235298,
//     "MRP": 29990,
//     "Bajaj-MOP": 29990,
//     "HappiMOP": 29990,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "6Pro 12/256 Aurora",
//     "APEX-MODEL NAME": "Reno6 Pro 5G Oppo 12/256- Aurora",
//     "sku": "OPPORENO6PRO5G256GBSTORAGEAURORA12GBRAM",
//     "MODEL ID": 235297,
//     "MRP": 39990,
//     "Bajaj-MOP": 39990,
//     "HappiMOP": 39990,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "6Pro 12+256 Black",
//     "APEX-MODEL NAME": "Reno6 Pro 5G Oppo 12/256- Black",
//     "sku": "OPPORENO6PRO5G256GBSTORAGESTELLARBLACK12GBRAM",
//     "MODEL ID": 235297,
//     "MRP": 39990,
//     "Bajaj-MOP": 39990,
//     "HappiMOP": 39990,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "GT Neo2 8/128 Black",
//     "APEX-MODEL NAME": "Realme GT Neo2 8+128 - Black",
//     "sku": "REALMEGTNEO2128GBSTORAGENEOBLACK8GBRAM",
//     "MODEL ID": 246430,
//     "MRP": 32999,
//     "Bajaj-MOP": 31999,
//     "HappiMOP": 31999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "GT Neo2 8/128 Green",
//     "APEX-MODEL NAME": "Realme GT Neo2 8+128 - Green",
//     "sku": "REALMEGTNEO2128GBSTORAGENEOGREEN8GBRAM",
//     "MODEL ID": 246431,
//     "MRP": 32999,
//     "Bajaj-MOP": 31999,
//     "HappiMOP": 31999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "8 5G 8/128 Black",
//     "APEX-MODEL NAME": "Realme 8 5G 8/128 - Black",
//     "sku": "Realme8128GBSupersonicBlack8GBRAM",
//     "MODEL ID": 225386,
//     "MRP": 19499,
//     "Bajaj-MOP": 18499,
//     "HappiMOP": 18499,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "8 5G 8/128 Blue",
//     "APEX-MODEL NAME": "Realme 8 5G 8/128 - Blue",
//     "sku": "Realme8128GBSupersonicBlue8GBRAM",
//     "MODEL ID": 225385,
//     "MRP": 19499,
//     "Bajaj-MOP": 18499,
//     "HappiMOP": 18499,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "RM 8 6/128 Black",
//     "APEX-MODEL NAME": "REALME 8 6/128 - Black",
//     "sku": "realme8128GBStorageCyberBlack6GBRAM",
//     "MODEL ID": 229269,
//     "MRP": 17999,
//     "Bajaj-MOP": 16999,
//     "HappiMOP": 16999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "V21 5G 8/128 Blue",
//     "APEX-MODEL NAME": "V21 5G Vivo 8/128 - Dusk Blue",
//     "sku": "VivoV215G128GBDuskBlue8GBRAM",
//     "MODEL ID": 225920,
//     "MRP": 29990,
//     "Bajaj-MOP": 29990,
//     "HappiMOP": 29990,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "V21 5G 8/128 Dazzle",
//     "APEX-MODEL NAME": "V21 5G Vivo 8/128 - Sunset Dazzle",
//     "sku": "VivoV215G128GBSunsetDazzle8GBRAM",
//     "MODEL ID": 225920,
//     "MRP": 29990,
//     "Bajaj-MOP": 29990,
//     "HappiMOP": 29990,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "V21 8/128 White",
//     "APEX-MODEL NAME": "V21 5G Vivo 8/128 - White",
//     "sku": "VivoV215G128GBArcticWhite8GBRAMSmartphone",
//     "MODEL ID": 225920,
//     "MRP": 29990,
//     "Bajaj-MOP": 29990,
//     "HappiMOP": 29990,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "V21e 5G 8/128 Pearl",
//     "APEX-MODEL NAME": "V21e 5G Vivo 8/128 - Dark Pearl",
//     "sku": "VivoV21e128GBStorageDarkPearl8GBRAM",
//     "MODEL ID": 233496,
//     "MRP": 24990,
//     "Bajaj-MOP": 24990,
//     "HappiMOP": 24990,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "V21e 5G 8/128 Jazz",
//     "APEX-MODEL NAME": "V21e 5G Vivo 8/128 - Sunset Jazz",
//     "sku": "VivoV21e128GBStorageSunsetJazz8GBRAM",
//     "MODEL ID": 233496,
//     "MRP": 24990,
//     "Bajaj-MOP": 24990,
//     "HappiMOP": 24990,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "Y72 8/128 Magic",
//     "APEX-MODEL NAME": "Y72 Vivo 8/128 - Prism Magic",
//     "sku": "VIVOY725G128GBSTORAGEPRISMMAGIC8GBRAM",
//     "MODEL ID": 235152,
//     "MRP": 20990,
//     "Bajaj-MOP": 20990,
//     "HappiMOP": 20990,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "Y72 8/128 Grey",
//     "APEX-MODEL NAME": "Y72 Vivo 8/128 - Salt Grey",
//     "sku": "VIVOY725G128GBSTORAGESLATEGRAY8GBRAM",
//     "MODEL ID": 235152,
//     "MRP": 20990,
//     "Bajaj-MOP": 20990,
//     "HappiMOP": 20990,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "Y73 8/128 Flare",
//     "APEX-MODEL NAME": "Y73 Vivo 8/128 - Diamond Flare",
//     "sku": "VivoY73128GBStorageDiamondFlare8GBRAM",
//     "MODEL ID": 229278,
//     "MRP": 20990,
//     "Bajaj-MOP": 20990,
//     "HappiMOP": 20990,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "Y73 8/128 Black",
//     "APEX-MODEL NAME": "Y73 Vivo 8/128 - Roman Black",
//     "sku": "VivoY73128GBStorageRomanBlack8GBRAM",
//     "MODEL ID": 229278,
//     "MRP": 20990,
//     "Bajaj-MOP": 20990,
//     "HappiMOP": 20990,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "10 ProMax 6/128 Bron",
//     "APEX-MODEL NAME": "Redmi Note 10 Pro Max (6+128) - Bronze",
//     "sku": "RedmiNote10ProMax128GBStorageVintageBronze6GBRAM",
//     "MODEL ID": 226303,
//     "MRP": 20499,
//     "Bajaj-MOP": 19999,
//     "HappiMOP": 19999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "Note 10s 6/128 Black",
//     "APEX-MODEL NAME": "Redmi Note 10s (6+128) - Black",
//     "sku": "RedmiNote10S128GBStorageShadowBlack6GBRAM",
//     "MODEL ID": 234037,
//     "MRP": 16999,
//     "Bajaj-MOP": 16499,
//     "HappiMOP": 16499,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "Note 10s 6/128 White",
//     "APEX-MODEL NAME": "Redmi Note 10s (6+128) - White",
//     "sku": "RedmiNote10S128GBStorageFrostWhite6GBRAM",
//     "MODEL ID": 234036,
//     "MRP": 16999,
//     "Bajaj-MOP": 16499,
//     "HappiMOP": 16499,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "Note 10s 6/64 Black",
//     "APEX-MODEL NAME": "Redmi Note 10s (6+64) - Black",
//     "sku": "RedmiNote10S64GBStorageShadowBlack6GBRAM",
//     "MODEL ID": 234035,
//     "MRP": 15499,
//     "Bajaj-MOP": 14999,
//     "HappiMOP": 14999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "RM GT ME 6/128 Blue",
//     "APEX-MODEL NAME": "Realme GT ME 6+128 - Blue",
//     "sku": "REALMEGTMASTEREDITION128GBSTORAGEDAYBREAKBLUE6GBRAM",
//     "MODEL ID": 250584,
//     "MRP": 26999,
//     "Bajaj-MOP": 25999,
//     "HappiMOP": 25999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "RM GT ME 6/128 Grey",
//     "APEX-MODEL NAME": "Realme GT ME 6+128 - Grey",
//     "sku": "REALMEGTMASTEREDITION128GBSTORAGEVOYAGERGREY6GBRAM",
//     "MODEL ID": 241343,
//     "MRP": 26999,
//     "Bajaj-MOP": 25999,
//     "HappiMOP": 25999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "RM GT ME 8/256 White",
//     "APEX-MODEL NAME": "Realme GT ME 8+256 - White",
//     "sku": "REALMEGTMASTEREDITION256GBSTORAGELUNAWHITE8GBRAM",
//     "MODEL ID": 241338,
//     "MRP": 30999,
//     "Bajaj-MOP": 29999,
//     "HappiMOP": 29999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "RM GT ME 8/128 White",
//     "APEX-MODEL NAME": "Realme GT ME 8+128 - White",
//     "sku": "REALMEGTMASTEREDITION128GBSTORAGELUNAWHITE8GBRAM",
//     "MODEL ID": 241339,
//     "MRP": 28999,
//     "Bajaj-MOP": 27999,
//     "HappiMOP": 27999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "RM GT ME 8/128 Black",
//     "APEX-MODEL NAME": "Realme GT ME 8+128 - Black",
//     "sku": "REALMEGTMASTEREDITION128GBSTORAGECOSMOSBLACK8GBRAM",
//     "MODEL ID": 241342,
//     "MRP": 28999,
//     "Bajaj-MOP": 27999,
//     "HappiMOP": 27999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "RM GT ME 8/128 Grey",
//     "APEX-MODEL NAME": "Realme GT ME 8+128 - Grey",
//     "sku": "REALMEGTMASTEREDITION128GBSTORAGEVOYAGERGREY8GBRAM",
//     "MODEL ID": 241340,
//     "MRP": 28999,
//     "Bajaj-MOP": 27999,
//     "HappiMOP": 27999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "RM GT ME 8/256 Grey",
//     "APEX-MODEL NAME": "Realme GT ME 8+256 - Grey",
//     "sku": "REALMEGTMASTEREDITION256GBSTORAGEVOYAGERGREY8GBRAM",
//     "MODEL ID": 241344,
//     "MRP": 30999,
//     "Bajaj-MOP": 29999,
//     "HappiMOP": 29999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "F19s 6/128 Black",
//     "APEX-MODEL NAME": "F19s Oppo 6/128 - Black",
//     "sku": "OPPOF19S128GBSTORAGEGLOWINGBLACK6GBRAM",
//     "MODEL ID": 244353,
//     "MRP": 19990,
//     "Bajaj-MOP": 19990,
//     "HappiMOP": 19990,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "F19s 6/128 Gold",
//     "APEX-MODEL NAME": "F19s Oppo 6/128 - Gold",
//     "sku": "OPPOF19S128GBSTORAGEGLOWINGGOLD6GBRAM",
//     "MODEL ID": 244353,
//     "MRP": 19990,
//     "Bajaj-MOP": 19990,
//     "HappiMOP": 19990,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "A16 4/64 Black",
//     "APEX-MODEL NAME": "A16 Oppo 4/64 - Black",
//     "sku": "OPPOA1664GBSTORAGECRYSTALBLACK64GBRAM",
//     "MODEL ID": 243403,
//     "MRP": 13490,
//     "Bajaj-MOP": 13490,
//     "HappiMOP": 13490,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "A16 4/64 Blue",
//     "APEX-MODEL NAME": "A16 Oppo 4/64 - Blue",
//     "sku": "OPPOA1664GBSTORAGEPEARLBLUE64GBRAM",
//     "MODEL ID": 243403,
//     "MRP": 13490,
//     "Bajaj-MOP": 13490,
//     "HappiMOP": 13490,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "X70Pro 8/128 Aura Dw",
//     "APEX-MODEL NAME": "X70 Pro Vivo 8/128  - Aura Dwan",
//     "sku": "VIVOX70PRO128GBSTORAGEAURORADAWN8GBRAM",
//     "MODEL ID": 244945,
//     "MRP": 46990,
//     "Bajaj-MOP": 46990,
//     "HappiMOP": 46990,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "A55 6/128 Blue",
//     "APEX-MODEL NAME": "A55 Oppo 6/128 - Blue",
//     "sku": "OPPOA55128GBSTORAGERAINBOWBLUE6GBRAM",
//     "MODEL ID": 244941,
//     "MRP": 17490,
//     "Bajaj-MOP": 17490,
//     "HappiMOP": 17490,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "A55 6/128 Black",
//     "APEX-MODEL NAME": "A55 Oppo 6/128 - Black",
//     "sku": "OPPOA55128GBSTORAGESTARRYBLACK6GBRAM",
//     "MODEL ID": 244941,
//     "MRP": 17490,
//     "Bajaj-MOP": 17490,
//     "HappiMOP": 17490,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "A55 4/64 Blue",
//     "APEX-MODEL NAME": "A55 Oppo 4/64 - Blue",
//     "sku": "OPPOA5564GBSTORAGERAINBOWBLUE4GBRAM",
//     "MODEL ID": 244878,
//     "MRP": 15490,
//     "Bajaj-MOP": 15490,
//     "HappiMOP": 15490,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "A55 4/64 Black",
//     "APEX-MODEL NAME": "A55 Oppo 4/64 - Black",
//     "sku": "OPPOA5564GBSTORAGESTARRYBLACK4GBRAM",
//     "MODEL ID": 244878,
//     "MRP": 15490,
//     "Bajaj-MOP": 15490,
//     "HappiMOP": 15490,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "8s 5G 8/128 Blue",
//     "APEX-MODEL NAME": "Realme 8s 5G 8/128 - Blue",
//     "sku": "REALME8S5G128GBSTORAGEUNIVERSEBLUE8GBRAM",
//     "MODEL ID": 243260,
//     "MRP": 20999,
//     "Bajaj-MOP": 19999,
//     "HappiMOP": 19999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "RM 8 8/128 Black",
//     "APEX-MODEL NAME": "REALME 8 8/128 - Black",
//     "sku": "realme8128GBStorageCyberBlack8GBRAM",
//     "MODEL ID": 229271,
//     "MRP": 18999,
//     "Bajaj-MOP": 17999,
//     "HappiMOP": 17999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "RM 8 8/128 Silver",
//     "APEX-MODEL NAME": "REALME 8 8/128 - Silver",
//     "sku": "realme8128GBStorageCyberSilver8GBRAM",
//     "MODEL ID": 229270,
//     "MRP": 18999,
//     "Bajaj-MOP": 17999,
//     "HappiMOP": 17999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "Y33s 8/128 Dream",
//     "APEX-MODEL NAME": "Y33s Vivo 8/128 - Middy Dream",
//     "sku": "VIVOY33S128GBSTORAGEMIDDAYDREAM8GBRAM",
//     "MODEL ID": 240760,
//     "MRP": 18990,
//     "Bajaj-MOP": 18990,
//     "HappiMOP": 18990,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "Y33s 8/128 Black",
//     "APEX-MODEL NAME": "Y33s Vivo 8/128 - Mirror Black",
//     "sku": "VIVOY33S128GBSTORAGEMIRRORBLACK8GBRAM",
//     "MODEL ID": 240760,
//     "MRP": 18990,
//     "Bajaj-MOP": 18990,
//     "HappiMOP": 18990,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "Y53s 8/128 Blue",
//     "APEX-MODEL NAME": "Y53s Vivo 8/128  - Blue",
//     "sku": "VIVOY53S128GBSTORAGEDEAPSEABLUE8GBRAM",
//     "MODEL ID": 238527,
//     "MRP": 19490,
//     "Bajaj-MOP": 19490,
//     "HappiMOP": 19490,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "Y53s 8/128 Rainbow",
//     "APEX-MODEL NAME": "Y53s Vivo 8/128  - Rainbouw",
//     "sku": "VIVOY53S128GBSTORAGEFANTASTICRAINBOW8GBRAM",
//     "MODEL ID": 238527,
//     "MRP": 19490,
//     "Bajaj-MOP": 19490,
//     "HappiMOP": 19490,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "Y21 4/128 Glow",
//     "APEX-MODEL NAME": "Y21 Vivo 4/128 - Diamond Glow",
//     "sku": "VIVOY21128GBSTORAGEDIAMONDGLOW4GBRAM",
//     "MODEL ID": 240761,
//     "MRP": 15490,
//     "Bajaj-MOP": 15490,
//     "HappiMOP": 15490,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "Y21 4/128 Blue",
//     "APEX-MODEL NAME": "Y21 Vivo 4/128 - Midnight Blue",
//     "sku": "VIVOY21128GBSTORAGEMIDNIGHTBLUE4GBRAM",
//     "MODEL ID": 240761,
//     "MRP": 15490,
//     "Bajaj-MOP": 15490,
//     "HappiMOP": 15490,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "Y21 4/64 Glow",
//     "APEX-MODEL NAME": "Y21 Vivo 4/64 - Diamond Glow",
//     "sku": "VIVOY2164GBSTORAGEDIAMONDGLOW4GBRAM",
//     "MODEL ID": 240759,
//     "MRP": 13990,
//     "Bajaj-MOP": 13990,
//     "HappiMOP": 13990,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "Y21 4/64 Blue",
//     "APEX-MODEL NAME": "Y21 Vivo 4/64 - Midnight Blue",
//     "sku": "VIVOY2164GBSTORAGEMIDNIGHTBLUE4GBRAM",
//     "MODEL ID": 240759,
//     "MRP": 13990,
//     "Bajaj-MOP": 13990,
//     "HappiMOP": 13990,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "Y20T 6/64 Black",
//     "APEX-MODEL NAME": "Y20T Vivo 6/64 - Purist Black",
//     "sku": "VIVOY20T64GBSTORAGEOBSIDIANBLACK6GBRAM",
//     "MODEL ID": 245907,
//     "MRP": 15490,
//     "Bajaj-MOP": 15490,
//     "HappiMOP": 15490,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "Y20T 6/64 Blue",
//     "APEX-MODEL NAME": "Y20T Vivo 6/64 - Purist Blue",
//     "sku": "VIVOY20T64GBSTORAGEPURISTBLUE6GBRAM",
//     "MODEL ID": 245907,
//     "MRP": 15490,
//     "Bajaj-MOP": 15490,
//     "HappiMOP": 15490,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "11Lite NE 8/128 Dazz",
//     "APEX-MODEL NAME": "Mi 11 Lite NE 5G (8G+128G) - Dazzle",
//     "sku": "MI11LITENE5G128GBSTORAGEDIAMONDDAZZLE8GBRAM",
//     "MODEL ID": 244742,
//     "MRP": 29499,
//     "Bajaj-MOP": 28999,
//     "HappiMOP": 28999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "11Lite NE 8/128 Blue",
//     "APEX-MODEL NAME": "Mi 11 Lite NE 5G (8G+128G) - Blue",
//     "sku": "MI11LITENE5G128GBSTORAGEJAZZBLUE8GBRAM",
//     "MODEL ID": 244741,
//     "MRP": 29499,
//     "Bajaj-MOP": 28999,
//     "HappiMOP": 28999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "G10 4/64 Purple",
//     "APEX-MODEL NAME": "Nokia G10 4/64 - Purple",
//     "sku": "NOKIAG1064GBSDUSKPURPLE4GBRAM",
//     "MODEL ID": 243359,
//     "MRP": 12149,
//     "Bajaj-MOP": 12149,
//     "HappiMOP": 12149,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "XR20 6/128 Blue",
//     "APEX-MODEL NAME": "Nokia XR20 DS (6/128) - Blue",
//     "sku": "NOKIAXR20128GBSTORAGEULTRABLUE6GBRAM",
//     "MODEL ID": 248667,
//     "MRP": 46999,
//     "Bajaj-MOP": 46999,
//     "HappiMOP": 46999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "V21 8/128 Neon Spark",
//     "APEX-MODEL NAME": "V21 5G Vivo 8/128 - Neon Spark",
//     "sku": "VIVOV215G128GBARCTICNEONSPARK8GBRAM",
//     "MODEL ID": 225920,
//     "MRP": 29990,
//     "Bajaj-MOP": 29990,
//     "HappiMOP": 29990,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "11Lite NE 6/128 Cora",
//     "APEX-MODEL NAME": "Mi 11 Lite NE 5G (6G+128G) - Coral",
//     "sku": "MI11LITENE5G128GBSTORAGETUSCANYCORAL6GBRAM",
//     "MODEL ID": 244736,
//     "MRP": 27499,
//     "Bajaj-MOP": 26999,
//     "HappiMOP": 26999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "V23 8/128 Black",
//     "APEX-MODEL NAME": "V23 5G Vivo 8/128 - Stardust Black",
//     "sku": "VIVOV235G128GBSTORAGESTARDUSTBLACK8GBRAM",
//     "MODEL ID": 256755,
//     "MRP": 29990,
//     "Bajaj-MOP": 29990,
//     "HappiMOP": 29990,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "V23 8/128 Gold",
//     "APEX-MODEL NAME": "V23 5G Vivo 8/128 - Sunshine Gold",
//     "sku": "VIVOV235G128GBSTORAGESUNSHINEGOLD8GBRAM",
//     "MODEL ID": 256755,
//     "MRP": 29990,
//     "Bajaj-MOP": 29990,
//     "HappiMOP": 29990,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "V23 12/256 Black",
//     "APEX-MODEL NAME": "V23 5G Vivo 12/256 - Stardust Black",
//     "sku": "VIVOV235G256GBSTORAGESTARDUSTBLACK12GBRAM",
//     "MODEL ID": 256756,
//     "MRP": 34990,
//     "Bajaj-MOP": 34990,
//     "HappiMOP": 34990,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "V23 12/256 Gold",
//     "APEX-MODEL NAME": "V23 5G Vivo 12/256 - Sunshine Gold",
//     "sku": "VIVOV235G256GBSTORAGESUNSHINEGOLD12GBRAM",
//     "MODEL ID": 256756,
//     "MRP": 34990,
//     "Bajaj-MOP": 34990,
//     "HappiMOP": 34990,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "V23Pro 8/128 Black",
//     "APEX-MODEL NAME": "V23Pro 5G Vivo 8/128 - Stardust Black",
//     "sku": "VIVOV23PRO5G128GBSTORAGESTARDUSTBLACK8GBRAM",
//     "MODEL ID": 256757,
//     "MRP": 38990,
//     "Bajaj-MOP": 38990,
//     "HappiMOP": 38990,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "V23Pro 8/128 Gold",
//     "APEX-MODEL NAME": "V23Pro 5G Vivo 8/128 - Sunshine Gold",
//     "sku": "VIVOV23PRO5G128GBSTORAGESUNSHINEGOLD8GBRAM",
//     "MODEL ID": 256757,
//     "MRP": 38990,
//     "Bajaj-MOP": 38990,
//     "HappiMOP": 38990,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "V23Pro 12/256 Black",
//     "APEX-MODEL NAME": "V23Pro 5G Vivo 12/256 - Stardust Black",
//     "sku": "VIVOV23PRO5G256GBSTORAGESTARDUSTBLACK12GBRAM",
//     "MODEL ID": 256758,
//     "MRP": 43990,
//     "Bajaj-MOP": 43990,
//     "HappiMOP": 43990,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "V23Pro 12/256 Gold",
//     "APEX-MODEL NAME": "V23Pro 5G Vivo 12/256 - Sunshine Gold",
//     "sku": "VIVOV23PRO5G256GBSTORAGESUNSHINEGOLD12GBRAM",
//     "MODEL ID": 256758,
//     "MRP": 43990,
//     "Bajaj-MOP": 43990,
//     "HappiMOP": 43990,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "S1PRO 8/128 BLACK",
//     "APEX-MODEL NAME": "S1PRO Vivo 8/128 - BLACK",
//     "sku": "VivoS1Pro128GBStorageMysticBlack8GBRAM",
//     "MODEL ID": 153446,
//     "MRP": 18990,
//     "Bajaj-MOP": 18990,
//     "HappiMOP": 18990,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "G781BG 8/128 Mint",
//     "APEX-MODEL NAME": "G781BG Galaxy S20FE 5G (8/128) - Mint",
//     "sku": "SamsungGalaxyS20FE5G128GBStorageCloudMint8GBRAM",
//     "MODEL ID": 222285,
//     "MRP": 52499,
//     "Bajaj-MOP": 45999,
//     "HappiMOP": 45999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "OP 8T 12/256 Silver",
//     "APEX-MODEL NAME": "Oneplus 8T 12/256 - Lunar Silver",
//     "sku": "OnePlus8T5G256GBStorageSilver12GBRAM",
//     "MODEL ID": 211689,
//     "MRP": 41999,
//     "Bajaj-MOP": 41999,
//     "HappiMOP": 41999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "RM 7Pro 8/128 Blue",
//     "APEX-MODEL NAME": "REALME 7 Pro 8/128 - Blue",
//     "sku": "Realme7Pro128GBStorageMirrorBlue8GBRAM",
//     "MODEL ID": 191405,
//     "MRP": 21999,
//     "Bajaj-MOP": 21999,
//     "HappiMOP": 18099,
//     "Difference": -3900
//   },
//   {
//     "APEXModelCode": "RM 7Pro 8/128 White",
//     "APEX-MODEL NAME": "REALME 7 Pro 8/128 - Silver",
//     "sku": "Realme7Pro128GBStorageMirrorSilver8GBRAM",
//     "MODEL ID": 191404,
//     "MRP": 21999,
//     "Bajaj-MOP": 21999,
//     "HappiMOP": 18099,
//     "Difference": -3900
//   },
//   {
//     "APEXModelCode": "N980FG 8/256 Bronze",
//     "APEX-MODEL NAME": "N980FG Note 20 8/256 - Mystic Bronze",
//     "sku": "SamsungGalaxyNote20256GBMysticBronze8GBRAM",
//     "MODEL ID": 190742,
//     "MRP": 62999,
//     "Bajaj-MOP": 52499,
//     "HappiMOP": 49999,
//     "Difference": -2500
//   },
//   {
//     "APEXModelCode": "Note10 Pro 8/128 Blu",
//     "APEX-MODEL NAME": "Redmi Note 10 Pro (8+128) - Blue",
//     "sku": "REDMINOTE10PRO128GBSTORAGEDARKNEBULA8GBRAM",
//     "MODEL ID": 244750,
//     "MRP": 18999,
//     "Bajaj-MOP": 18999,
//     "HappiMOP": 18999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "M515FE 8/128 Black",
//     "APEX-MODEL NAME": "M515FE Samsung M51 (8/128) - Black",
//     "sku": "SamsungGalaxyM51128GBStorageCelestialBlack8GBRAM",
//     "MODEL ID": 210364,
//     "MRP": 28349,
//     "Bajaj-MOP": 24999,
//     "HappiMOP": 24999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "X60pro 12/256 Black",
//     "APEX-MODEL NAME": "X60Pro Vivo 12/256 -Black",
//     "sku": "VivoX60Pro256GBStorageMidnightBlack12GBRAM",
//     "MODEL ID": 222587,
//     "MRP": 49990,
//     "Bajaj-MOP": 49990,
//     "HappiMOP": 45100,
//     "Difference": -4890
//   },
//   {
//     "APEXModelCode": "11X 6/128 Black",
//     "APEX-MODEL NAME": "Mi 11X (6G+128G) - Black",
//     "sku": "MI11X128GBStorageCosmicBlack6GBRAM",
//     "MODEL ID": 225822,
//     "MRP": 30499,
//     "Bajaj-MOP": 29999,
//     "HappiMOP": 28099,
//     "Difference": -1900
//   },
//   {
//     "APEXModelCode": "10i 6/128 Sunrise",
//     "APEX-MODEL NAME": "Mi10i (6G+128G) - Sunrise",
//     "sku": "Mi10i128GBStoragePacificSunrise6GBRAM",
//     "MODEL ID": 214374,
//     "MRP": 22499,
//     "Bajaj-MOP": 21999,
//     "HappiMOP": 21999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "10i 8/128 Black",
//     "APEX-MODEL NAME": "Mi10i (8G+128G) - Black",
//     "sku": "Mi10i128GBStorageMidnightBlack8GBRAM",
//     "MODEL ID": 214372,
//     "MRP": 24499,
//     "Bajaj-MOP": 23999,
//     "HappiMOP": 23999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "Note10 Pro 8/128 Bro",
//     "APEX-MODEL NAME": "Redmi Note 10 Pro (8+128) - Bronze",
//     "sku": "REDMINOTE10PRO128GBSTORAGEBRONZE8GBRAM",
//     "MODEL ID": 244749,
//     "MRP": 19499,
//     "Bajaj-MOP": 19099,
//     "HappiMOP": 19099,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "10 ProMAx 6/128 Blue",
//     "APEX-MODEL NAME": "Redmi Note 10 Pro Max (6+128) - Blue",
//     "sku": "REDMINOTE10PROMAX128GBSTORAGEDARKNEBULA6GBRAM",
//     "MODEL ID": 242431,
//     "MRP": 20499,
//     "Bajaj-MOP": 20999,
//     "HappiMOP": 20099,
//     "Difference": -900
//   },
//   {
//     "APEXModelCode": "Note10 Pro 6/128 Bro",
//     "APEX-MODEL NAME": "Redmi Note 10 Pro (6+128) - Bronze",
//     "sku": "MIRedmiNote10Pro128GBStorageVintageBronze6GBRAM",
//     "MODEL ID": 234821,
//     "MRP": 18499,
//     "Bajaj-MOP": 18099,
//     "HappiMOP": 18099,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "A307FW BLACK",
//     "APEX-MODEL NAME": "A307FW SAMSUNG MOBILE GALAXY A30s (4/128) - BLACK",
//     "sku": "SamsungGalaxyA30s128GBPrismCrushBlack4GBRAM",
//     "MODEL ID": 166475,
//     "MRP": 17699,
//     "Bajaj-MOP": 16856,
//     "HappiMOP": 15699,
//     "Difference": -1157
//   },
//   {
//     "APEXModelCode": "M115FD 3/32 VIOLET",
//     "APEX-MODEL NAME": "M115FD Samsung M11 (3/32) - Violet",
//     "sku": "SamsungGalaxyM1132GBVoilet3GBRAM",
//     "MODEL ID": 184047,
//     "MRP": 11600,
//     "Bajaj-MOP": 11600,
//     "HappiMOP": 10099,
//     "Difference": -1501
//   },
//   {
//     "APEXModelCode": "A217FL 6/128 Black",
//     "APEX-MODEL NAME": "A217FL Samsung A21s 6/128 - Black",
//     "sku": "SamsungGalaxyA21S128GBBlack6GBRAM",
//     "MODEL ID": 192573,
//     "MRP": 18374,
//     "Bajaj-MOP": 17499,
//     "HappiMOP": 17499,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "A217FL 6/128 Blue",
//     "APEX-MODEL NAME": "A217FL Samsung A21s 6/128 - Blue",
//     "sku": "SamsungGalaxyA21S128GBBlue6GBRAM",
//     "MODEL ID": 192572,
//     "MRP": 18374,
//     "Bajaj-MOP": 17499,
//     "HappiMOP": 17499,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "G781BG 8/128 Blue",
//     "APEX-MODEL NAME": "G781BG Galaxy S20FE 5G (8/128) - Blue",
//     "sku": "SamsungGalaxyS20FE5G128GBStorageCloudNavy8GBRAM",
//     "MODEL ID": 222284,
//     "MRP": 52499,
//     "Bajaj-MOP": 45999,
//     "HappiMOP": 45999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "G781BG 8/128 Lavnder",
//     "APEX-MODEL NAME": "G781BG Galaxy S20FE 5G (8/128) - Lavender",
//     "sku": "SamsungGalaxyS20FE5G128GBCloudLavender8GBRAM",
//     "MODEL ID": 222283,
//     "MRP": 52499,
//     "Bajaj-MOP": 45999,
//     "HappiMOP": 45999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "M115FD 3/32 BLACK",
//     "APEX-MODEL NAME": "M115FD Samsung M11 (3/32) - Black",
//     "sku": "SamsungGalaxyM1132GBBlack3GBRAM",
//     "MODEL ID": 184046,
//     "MRP": 11600,
//     "Bajaj-MOP": 11600,
//     "HappiMOP": 10099,
//     "Difference": -1501
//   },
//   {
//     "APEXModelCode": "9Power 6/128 Black",
//     "APEX-MODEL NAME": "Redmi 9 Power (6G+128G ) - Black",
//     "sku": "Redmi9Power128GBMightyBlack6GBRAM",
//     "MODEL ID": 220389,
//     "MRP": 13499,
//     "Bajaj-MOP": 13499,
//     "HappiMOP": 13599,
//     "Difference": 100
//   },
//   {
//     "APEXModelCode": "G780FN 8/128 Blue",
//     "APEX-MODEL NAME": "G780FN Galaxy S20FE (8/128GB) - Navy Blue",
//     "sku": "SamsungGalaxyS20FE128GBCloudNavy8GBRAM",
//     "MODEL ID": 192575,
//     "MRP": 52499,
//     "Bajaj-MOP": 37999,
//     "HappiMOP": 37999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "M115FD 3/32 Blue",
//     "APEX-MODEL NAME": "M115FD Samsung M11 (3/32) - Blue",
//     "sku": "SamsungGalaxyM1132GBMetalicBlue3GBRAM",
//     "MODEL ID": 184045,
//     "MRP": 11600,
//     "Bajaj-MOP": 11600,
//     "HappiMOP": 10099,
//     "Difference": -1501
//   },
//   {
//     "APEXModelCode": "9Power 6/128 Blue",
//     "APEX-MODEL NAME": "Redmi 9 Power (6G+128G ) - Blue",
//     "sku": "Redmi9Power128GBBlazingBlue6GBRAM",
//     "MODEL ID": 220386,
//     "MRP": 13499,
//     "Bajaj-MOP": 13499,
//     "HappiMOP": 13599,
//     "Difference": 100
//   },
//   {
//     "APEXModelCode": "A307FW VIOLET",
//     "APEX-MODEL NAME": "A307FW SAMSUNG MOBILE GALAXY A30s (4/128) - VIOLET",
//     "sku": "SamsungGalaxyA30s128GBPrismCrushWhite4GBRAM",
//     "MODEL ID": 166477,
//     "MRP": 17699,
//     "Bajaj-MOP": 16856,
//     "HappiMOP": 15699,
//     "Difference": -1157
//   },
//   {
//     "APEXModelCode": "A207FG BLUE",
//     "APEX-MODEL NAME": "A207FG SAMSUNG MOBILE GALAXY A20s (4/64) - BLUE",
//     "sku": "SamsungGalaxyA20S64GBBlue4GBRAM",
//     "MODEL ID": 166497,
//     "MRP": 14380,
//     "Bajaj-MOP": 13695,
//     "HappiMOP": 12499,
//     "Difference": -1196
//   },
//   {
//     "APEXModelCode": "9Power 6/128 Green",
//     "APEX-MODEL NAME": "Redmi 9 Power (6G+128G ) - Green",
//     "sku": "Redmi9Power128GBElectricGreen6GBRAM",
//     "MODEL ID": 220387,
//     "MRP": 13499,
//     "Bajaj-MOP": 13499,
//     "HappiMOP": 13599,
//     "Difference": 100
//   },
//   {
//     "APEXModelCode": "9Power 6/128 Red",
//     "APEX-MODEL NAME": "Redmi 9 Power (6G+128G ) - Red",
//     "sku": "Redmi9Power128GBFieryRed6GBRAM",
//     "MODEL ID": 220388,
//     "MRP": 13499,
//     "Bajaj-MOP": 13499,
//     "HappiMOP": 13599,
//     "Difference": 100
//   },
//   {
//     "APEXModelCode": "A12 4/64 BLACK",
//     "APEX-MODEL NAME": "A12 OPPO MOBILE 4/64 - BLACK",
//     "sku": "OppoA1264GBBlack4GBRAM",
//     "MODEL ID": 174913,
//     "MRP": 10990,
//     "Bajaj-MOP": 10990,
//     "HappiMOP": 11490,
//     "Difference": 500
//   },
//   {
//     "APEXModelCode": "V17 8/128 WHITE",
//     "APEX-MODEL NAME": "V17 (8/128) VIVO MOBILE - WHITE",
//     "sku": "VivoV17128GBGlacierIceWhite8GBram",
//     "MODEL ID": 151370,
//     "MRP": 24990,
//     "Bajaj-MOP": 17990,
//     "HappiMOP": 17990,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "A12 4/64 BLUE",
//     "APEX-MODEL NAME": "A12 OPPO MOBILE 4/64- BLUE",
//     "sku": "OppoA1264GBBlue4GBRAM",
//     "MODEL ID": 174913,
//     "MRP": 10990,
//     "Bajaj-MOP": 10990,
//     "HappiMOP": 11490,
//     "Difference": 500
//   },
//   {
//     "APEXModelCode": "V19 8/256 SILVER",
//     "APEX-MODEL NAME": "V19 VIVO MOBILE 8/256 - SILVER",
//     "sku": "VivoV19256GBMysticSilver8GBRAM",
//     "MODEL ID": 173419,
//     "MRP": 25990,
//     "Bajaj-MOP": 25990,
//     "HappiMOP": 24399,
//     "Difference": -1591
//   },
//   {
//     "APEXModelCode": "V19 8/256 BLACK",
//     "APEX-MODEL NAME": "V19 VIVO MOBILE 8/256 - BLACK",
//     "sku": "VivoV19256GBPianoBlack8GBRAM",
//     "MODEL ID": 173419,
//     "MRP": 25990,
//     "Bajaj-MOP": 25990,
//     "HappiMOP": 24399,
//     "Difference": -1591
//   },
//   {
//     "APEXModelCode": "X50 8/128 Black",
//     "APEX-MODEL NAME": "X50 Vivo 8/128 - Black",
//     "sku": "VivoX50128GBGlazeBlack8GBRAM",
//     "MODEL ID": 181319,
//     "MRP": 34990,
//     "Bajaj-MOP": 34990,
//     "HappiMOP": 33990,
//     "Difference": -1000
//   },
//   {
//     "APEXModelCode": "X50 8/128 Blue",
//     "APEX-MODEL NAME": "X50 Vivo 8/128 - Blue",
//     "sku": "VivoX50128GBFrostBlue8GBRAM",
//     "MODEL ID": 181319,
//     "MRP": 34990,
//     "Bajaj-MOP": 34990,
//     "HappiMOP": 33990,
//     "Difference": -1000
//   },
//   {
//     "APEXModelCode": "X50 8/256 Blue",
//     "APEX-MODEL NAME": "X50 Vivo 8/256 - Blue",
//     "sku": "VivoX50256GBFrostBlue8GBRAM",
//     "MODEL ID": 181320,
//     "MRP": 37990,
//     "Bajaj-MOP": 37990,
//     "HappiMOP": 36990,
//     "Difference": -1000
//   },
//   {
//     "APEXModelCode": "Y20i 3/64 White",
//     "APEX-MODEL NAME": "Y20i Vivo 3/64 -White",
//     "sku": "VivoY20A202164GBNebulaBlue3GBRam1",
//     "MODEL ID": 220381,
//     "MRP": 11990,
//     "Bajaj-MOP": 11990,
//     "HappiMOP": 11590,
//     "Difference": -400
//   },
//   {
//     "APEXModelCode": "Mi 10 8/256 GREEN",
//     "APEX-MODEL NAME": "Mi 10 (8G+256G) GREEN",
//     "sku": "Mi10256GBCoralGreen8GBRAM",
//     "MODEL ID": 169631,
//     "MRP": 55999,
//     "Bajaj-MOP": 55999,
//     "HappiMOP": 49999,
//     "Difference": -6000
//   },
//   {
//     "APEXModelCode": "K20 6/64 BLACK",
//     "APEX-MODEL NAME": "REDMI K20 6/64 BLACK",
//     "sku": "RedmiK2064GBCarbonBlack6GBRAM",
//     "MODEL ID": 154868,
//     "MRP": 22999,
//     "Bajaj-MOP": 22999,
//     "HappiMOP": 19999,
//     "Difference": -3000
//   },
//   {
//     "APEXModelCode": "K20PRO 6/128 RED",
//     "APEX-MODEL NAME": "REDMI K20PRO 6/128 RED",
//     "sku": "RedmiK20Pro128GBFlameRed6GBRAM",
//     "MODEL ID": 154869,
//     "MRP": 27999,
//     "Bajaj-MOP": 27999,
//     "HappiMOP": 24999,
//     "Difference": -3000
//   },
//   {
//     "APEXModelCode": "9 Pro Max 6/64 Black",
//     "APEX-MODEL NAME": "Redmi Note 9 Pro Max (6+64) - Black",
//     "sku": "RedmiNote9ProMax64GBInterstellarBlack6GBRAM",
//     "MODEL ID": 184184,
//     "MRP": 17499,
//     "Bajaj-MOP": 17499,
//     "HappiMOP": 17499,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "Note9 Pro 6/128 Gold",
//     "APEX-MODEL NAME": "Redmi Note 9 Pro (6+128)-  Gold",
//     "sku": "RedmiNote9Pro128GBChampagneGold6GBRAM",
//     "MODEL ID": 191105,
//     "MRP": 17499,
//     "Bajaj-MOP": 17499,
//     "HappiMOP": 17499,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "OP 8T 8/128 Silver",
//     "APEX-MODEL NAME": "Oneplus 8T 8/128 - Lunar Silver",
//     "sku": "OnePlus8T5G128GBLunarSilver8GBRAM",
//     "MODEL ID": 211688,
//     "MRP": 38999,
//     "Bajaj-MOP": 38999,
//     "HappiMOP": 38999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "OP 9 8/128 Sky",
//     "APEX-MODEL NAME": "Oneplus 9 8/128 - Arctic Sky",
//     "sku": "OnePlus9128GBArcticSky8GBRAM",
//     "MODEL ID": 225916,
//     "MRP": 49999,
//     "Bajaj-MOP": 49999,
//     "HappiMOP": 44999,
//     "Difference": -5000
//   },
//   {
//     "APEXModelCode": "RM X7 8/128 Nebula",
//     "APEX-MODEL NAME": "Realme X7 8/128 - Nebula",
//     "sku": "RealmeX7128GBSpaceNebula8GBRAM",
//     "MODEL ID": 218128,
//     "MRP": 22999,
//     "Bajaj-MOP": 21999,
//     "HappiMOP": 21999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "RM X7 8/128 Silver",
//     "APEX-MODEL NAME": "Realme X7 8/128 - Silver",
//     "sku": "RealmeX7128GBSpaceSilver8GBRAM",
//     "MODEL ID": 218129,
//     "MRP": 22999,
//     "Bajaj-MOP": 21999,
//     "HappiMOP": 21999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "G991BD S21 128GB GR",
//     "APEX-MODEL NAME": "G991BD S21 128GB - GRAY",
//     "sku": "SamsungGalaxyS21128GBPhantomGrey8GBRAM",
//     "MODEL ID": 215394,
//     "MRP": 73499,
//     "Bajaj-MOP": 69999,
//     "HappiMOP": 59999,
//     "Difference": -10000
//   },
//   {
//     "APEXModelCode": "G991BD S21 128GB VIO",
//     "APEX-MODEL NAME": "G991BD S21 128GB - VIOLET",
//     "sku": "SamsungGalaxyS21128GBPhantomViolet8GBRAM",
//     "MODEL ID": 215395,
//     "MRP": 73499,
//     "Bajaj-MOP": 69999,
//     "HappiMOP": 59999,
//     "Difference": -10000
//   },
//   {
//     "APEXModelCode": "G991BD S21 128GB WH",
//     "APEX-MODEL NAME": "G991BD S21 128GB - WHITE",
//     "sku": "SamsungGalaxyS21128GBPhantomWhite8GBRAM",
//     "MODEL ID": 215396,
//     "MRP": 73499,
//     "Bajaj-MOP": 69999,
//     "HappiMOP": 59999,
//     "Difference": -10000
//   },
//   {
//     "APEXModelCode": "G991BG S21 25GB GR",
//     "APEX-MODEL NAME": "G991BG S21 256GB GRAY",
//     "sku": "SamsungGalaxyS21256GBPhantomGrey8GBRAM",
//     "MODEL ID": 215398,
//     "MRP": 77699,
//     "Bajaj-MOP": 73999,
//     "HappiMOP": 63999,
//     "Difference": -10000
//   },
//   {
//     "APEXModelCode": "G991BG S21 256GB VIO",
//     "APEX-MODEL NAME": "G991BG S21 256GB VIOLET",
//     "sku": "SamsungGalaxyS21256GBPhantomViolet8GBRAM",
//     "MODEL ID": 215399,
//     "MRP": 77699,
//     "Bajaj-MOP": 73999,
//     "HappiMOP": 63999,
//     "Difference": -10000
//   },
//   {
//     "APEXModelCode": "G991BG S21 256GB WH",
//     "APEX-MODEL NAME": "G991BG S21 256GB WHITE",
//     "sku": "SamsungGalaxyS21256GBPhantomWhite8GBRAM",
//     "MODEL ID": 215400,
//     "MRP": 77699,
//     "Bajaj-MOP": 73999,
//     "HappiMOP": 63999,
//     "Difference": -10000
//   },
//   {
//     "APEXModelCode": "G996BG S21+ 256GB BK",
//     "APEX-MODEL NAME": "G996BG S21+ 256GB BLACK",
//     "sku": "SamsungGalaxyS21Plus256GBPhantomBlack8GBRAM",
//     "MODEL ID": 215404,
//     "MRP": 100999,
//     "Bajaj-MOP": 85999,
//     "HappiMOP": 80999,
//     "Difference": -5000
//   },
//   {
//     "APEXModelCode": "G998BG S21UL 256G BK",
//     "APEX-MODEL NAME": "G998BG S21 Ultra 256GB BLACK",
//     "sku": "SamsungGalaxyS21Ultra256GBPhantomBlack12GBRAM",
//     "MODEL ID": 215407,
//     "MRP": 120999,
//     "Bajaj-MOP": 105999,
//     "HappiMOP": 105999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "G998BG S21UL 256G SL",
//     "APEX-MODEL NAME": "G998BG S21 Ultra 256GB SILVER",
//     "sku": "SamsungGalaxyS21Ultra256GBPhantomSilver12GBRAM",
//     "MODEL ID": 215408,
//     "MRP": 120999,
//     "Bajaj-MOP": 105999,
//     "HappiMOP": 105999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "M515FE 8/128 Blue",
//     "APEX-MODEL NAME": "M515FE Samsung M51 (8/128) - Blue",
//     "sku": "SamsungGalaxyM51128GBElectricBlue8GBRAM",
//     "MODEL ID": 210363,
//     "MRP": 28349,
//     "Bajaj-MOP": 24999,
//     "HappiMOP": 24999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "10T 8/128 Silver",
//     "APEX-MODEL NAME": "Mi 10T (8+128) - Silver",
//     "sku": "Mi10T128GBLunarSilver8GBRAM",
//     "MODEL ID": 210014,
//     "MRP": 35499,
//     "Bajaj-MOP": 34999,
//     "HappiMOP": 32999,
//     "Difference": -2000
//   },
//   {
//     "APEXModelCode": "10TPro 8/128 Black",
//     "APEX-MODEL NAME": "Mi 10T Pro (8+128) - Black",
//     "sku": "Mi10TPro128GBCosmicBlack8GBRAMmfr2",
//     "MODEL ID": 210018,
//     "MRP": 37499,
//     "Bajaj-MOP": 36999,
//     "HappiMOP": 36999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "10TPro 8/128 Silver",
//     "APEX-MODEL NAME": "Mi 10T Pro (8+128) - Silver",
//     "sku": "Mi10TPro128GBLunarSilver8GBRAMmfr2",
//     "MODEL ID": 210017,
//     "MRP": 37499,
//     "Bajaj-MOP": 36999,
//     "HappiMOP": 36999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "11Ultra 12/256 Blac",
//     "APEX-MODEL NAME": "Mi 11 Ultra (12G+256G) - Black",
//     "sku": "XiaomiMi11Ultra256GBStorageCeramicBlack12GBRAM",
//     "MODEL ID": 234245,
//     "MRP": 70999,
//     "Bajaj-MOP": 69999,
//     "HappiMOP": 69999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "10i 8/128  Sunrise",
//     "APEX-MODEL NAME": "Mi10i (8G+128G) - Sunrise",
//     "sku": "Mi10i128GBPacificSunrise8GBRAM",
//     "MODEL ID": 214377,
//     "MRP": 24499,
//     "Bajaj-MOP": 23999,
//     "HappiMOP": 23999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "9 4/128 Black",
//     "APEX-MODEL NAME": "Redmi 9 (4G+128G) - Black",
//     "sku": "Redmi9Power128GBMightyBlack4GBRAM",
//     "MODEL ID": 215995,
//     "MRP": 12499,
//     "Bajaj-MOP": 11999,
//     "HappiMOP": 10099,
//     "Difference": -1900
//   },
//   {
//     "APEXModelCode": "OP 9 12/256 Mist",
//     "APEX-MODEL NAME": "Oneplus 9 12/256  - Winter Mist",
//     "sku": "OnePlus9256GBWinterMist12GBRAM",
//     "MODEL ID": 225913,
//     "MRP": 54999,
//     "Bajaj-MOP": 54999,
//     "HappiMOP": 49999,
//     "Difference": -5000
//   },
//   {
//     "APEXModelCode": "OP 9 12/256 Black",
//     "APEX-MODEL NAME": "Oneplus 9 12/256 - Astral Black",
//     "sku": "OnePlus9256GBAstralBlack12GBRAM",
//     "MODEL ID": 225915,
//     "MRP": 54999,
//     "Bajaj-MOP": 54999,
//     "HappiMOP": 49999,
//     "Difference": -5000
//   },
//   {
//     "APEXModelCode": "OP 9 8/128 Black",
//     "APEX-MODEL NAME": "Oneplus 9 8/128 - Astral Black",
//     "sku": "OnePlus9128GBAstralBlack8GBRAM",
//     "MODEL ID": 225914,
//     "MRP": 49999,
//     "Bajaj-MOP": 49999,
//     "HappiMOP": 44999,
//     "Difference": -5000
//   },
//   {
//     "APEXModelCode": "OP 9 8/128 Mist",
//     "APEX-MODEL NAME": "Oneplus 9 8/128 - Winter Mist",
//     "sku": "OnePlus9128GBWinterMist8GBRAM",
//     "MODEL ID": 225912,
//     "MRP": 49999,
//     "Bajaj-MOP": 49999,
//     "HappiMOP": 44999,
//     "Difference": -5000
//   },
//   {
//     "APEXModelCode": "A33 3/32 MINT",
//     "APEX-MODEL NAME": "A33 Oppo 3/32 - Mint",
//     "sku": "OppoA3332GBMintCream3GBRAM",
//     "MODEL ID": 206912,
//     "MRP": 10990,
//     "Bajaj-MOP": 10990,
//     "HappiMOP": 9090,
//     "Difference": -1900
//   },
//   {
//     "APEXModelCode": "A54 4/128 Blue",
//     "APEX-MODEL NAME": "A54 Oppo 4/128 - Blue",
//     "sku": "OppoA54128GBStorageStarryBlue4GBRAM",
//     "MODEL ID": 224973,
//     "MRP": 15990,
//     "Bajaj-MOP": 15990,
//     "HappiMOP": 15990,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "A54 4/128 Gold",
//     "APEX-MODEL NAME": "A54 Oppo 4/128 - Gold",
//     "sku": "OppoA54128GBCrystalBlack4GBRAM",
//     "MODEL ID": 224973,
//     "MRP": 15990,
//     "Bajaj-MOP": 15990,
//     "HappiMOP": 15990,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "A54 4/64 Blue",
//     "APEX-MODEL NAME": "A54 Oppo 4/64 - Blue",
//     "sku": "OppoA5464GBStorageStarryBlue4GBRAM",
//     "MODEL ID": 223903,
//     "MRP": 14990,
//     "Bajaj-MOP": 14990,
//     "HappiMOP": 14990,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "A54 4/64 Gold",
//     "APEX-MODEL NAME": "A54 Oppo 4/64 - Gold",
//     "sku": "OppoA5464GBStorageMoonlightGold4GBRAM",
//     "MODEL ID": 223903,
//     "MRP": 14990,
//     "Bajaj-MOP": 14990,
//     "HappiMOP": 14990,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "A54 4/64 Black",
//     "APEX-MODEL NAME": "A54 Oppo 4/64 -Black",
//     "sku": "OppoA5464GBCrystalBlack4GBRAM",
//     "MODEL ID": 223903,
//     "MRP": 14990,
//     "Bajaj-MOP": 14990,
//     "HappiMOP": 14990,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "RM X7max 12/256 MW",
//     "APEX-MODEL NAME": "Realme X7 Max 5G 12/256 - Milky Way",
//     "sku": "realmeX7Max256GBMilkyWay12GBRAM",
//     "MODEL ID": 229272,
//     "MRP": 30999,
//     "Bajaj-MOP": 29999,
//     "HappiMOP": 25199,
//     "Difference": -4800
//   },
//   {
//     "APEXModelCode": "RM X7max 12/256 Blac",
//     "APEX-MODEL NAME": "Realme X7 Max 5G 12/256 -Black",
//     "sku": "realmeX7Max256GBAsteroidBlack12GBRAM",
//     "MODEL ID": 229273,
//     "MRP": 30999,
//     "Bajaj-MOP": 29999,
//     "HappiMOP": 25199,
//     "Difference": -4800
//   },
//   {
//     "APEXModelCode": "RM X7max 12/256 Silv",
//     "APEX-MODEL NAME": "Realme X7 Max 5G 12/256 -Silver",
//     "sku": "realmeX7Max256GBMercurySilver12GBRAM",
//     "MODEL ID": 229274,
//     "MRP": 30999,
//     "Bajaj-MOP": 29999,
//     "HappiMOP": 25199,
//     "Difference": -4800
//   },
//   {
//     "APEXModelCode": "RM X7max 8/128 Black",
//     "APEX-MODEL NAME": "Realme X7 Max 5G 8/128 - Black",
//     "sku": "realmeX7Max128GBAsteroidBlack8GBRAM",
//     "MODEL ID": 229276,
//     "MRP": 27999,
//     "Bajaj-MOP": 26999,
//     "HappiMOP": 22199,
//     "Difference": -4800
//   },
//   {
//     "APEXModelCode": "RM X7max 8/128 Mway",
//     "APEX-MODEL NAME": "Realme X7 Max 5G 8/128 - Milky Way",
//     "sku": "realmeX7Max128GBMilkyWay8GBRAM",
//     "MODEL ID": 229275,
//     "MRP": 27999,
//     "Bajaj-MOP": 26999,
//     "HappiMOP": 22199,
//     "Difference": -4800
//   },
//   {
//     "APEXModelCode": "RM X7max 8/128 Silve",
//     "APEX-MODEL NAME": "Realme X7 Max 5G 8/128 - Silver",
//     "sku": "realmeX7Max128GBMercurySilver8GBRAM",
//     "MODEL ID": 229277,
//     "MRP": 27999,
//     "Bajaj-MOP": 26999,
//     "HappiMOP": 22199,
//     "Difference": -4800
//   },
//   {
//     "APEXModelCode": "X7Pro 8/128 Black",
//     "APEX-MODEL NAME": "Realme X7 Pro 8/128  Black",
//     "sku": "RealmeX7Pro128GBMysticBlack8GBRAM",
//     "MODEL ID": 218126,
//     "MRP": 29999,
//     "Bajaj-MOP": 29999,
//     "HappiMOP": 25199,
//     "Difference": -4800
//   },
//   {
//     "APEXModelCode": "X7Pro 8/128 Fantasy",
//     "APEX-MODEL NAME": "Realme X7 Pro 8/128  Fantasy",
//     "sku": "RealmeX7Pro128GBFantasy8GBRAM",
//     "MODEL ID": 218127,
//     "MRP": 29999,
//     "Bajaj-MOP": 29999,
//     "HappiMOP": 25199,
//     "Difference": -4800
//   },
//   {
//     "APEXModelCode": "A217FF 6/64 Black",
//     "APEX-MODEL NAME": "A217FF Samsung A21s 6/64 - Black",
//     "sku": "SamsungGalaxyA21s64GBBlack6GBRAM",
//     "MODEL ID": 169514,
//     "MRP": 17324,
//     "Bajaj-MOP": 14999,
//     "HappiMOP": 14099,
//     "Difference": -900
//   },
//   {
//     "APEXModelCode": "A217FF 6/64 blue",
//     "APEX-MODEL NAME": "A217FF Samsung A21s 6/64 - BLue",
//     "sku": "SamsungGalaxyA21s64GBBlue6GBRAM",
//     "MODEL ID": 169513,
//     "MRP": 17324,
//     "Bajaj-MOP": 14999,
//     "HappiMOP": 14099,
//     "Difference": -900
//   },
//   {
//     "APEXModelCode": "A217FF 6/64 White",
//     "APEX-MODEL NAME": "A217FF Sasmung A21s 6/64 White",
//     "sku": "SamsungGalaxyA21s64GBWhite6GBRAM",
//     "MODEL ID": 169515,
//     "MRP": 17324,
//     "Bajaj-MOP": 14999,
//     "HappiMOP": 14099,
//     "Difference": -900
//   },
//   {
//     "APEXModelCode": "A515FW 6/128 Silver",
//     "APEX-MODEL NAME": "A515FW Samsung A51 (6/128) - SILVER",
//     "sku": "SamsungGalaxyA51128GBHazeCrushSilver8GBRAM",
//     "MODEL ID": 183232,
//     "MRP": 23624,
//     "Bajaj-MOP": 22499,
//     "HappiMOP": 21099,
//     "Difference": -1400
//   },
//   {
//     "APEXModelCode": "G780FN 8/128 Mint",
//     "APEX-MODEL NAME": "G780FN Galaxy S20FE (8/128GB) -  Cloud Mint",
//     "sku": "SamsungGalaxyS20FE128GBCloudWhite8GBRAM",
//     "MODEL ID": 192579,
//     "MRP": 52499,
//     "Bajaj-MOP": 37999,
//     "HappiMOP": 37999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "G780FN 8/128 Lavnder",
//     "APEX-MODEL NAME": "G780FN Galaxy S20FE (8/128GB) - Lavender",
//     "sku": "SamsungGalaxyS20FE128GBCloudLavender8GBRAM",
//     "MODEL ID": 192577,
//     "MRP": 52499,
//     "Bajaj-MOP": 37999,
//     "HappiMOP": 37999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "G996BD S21+ 128GB BK",
//     "APEX-MODEL NAME": "G996BD S21+ 128GB BLACK",
//     "sku": "SamsungGalaxyS21Plus128GBPhantomBlack8GBRAM",
//     "MODEL ID": 215401,
//     "MRP": 96999,
//     "Bajaj-MOP": 81999,
//     "HappiMOP": 71999,
//     "Difference": -10000
//   },
//   {
//     "APEXModelCode": "G996BD S21+ 128GB SL",
//     "APEX-MODEL NAME": "G996BD S21+ 128GB SILVER",
//     "sku": "SamsungGalaxyS21Plus128GBPhantomSilver8GBRAM",
//     "MODEL ID": 215402,
//     "MRP": 96999,
//     "Bajaj-MOP": 81999,
//     "HappiMOP": 71999,
//     "Difference": -10000
//   },
//   {
//     "APEXModelCode": "G996BD S21+ 128GB VI",
//     "APEX-MODEL NAME": "G996BD S21+ 128GB VIOLET",
//     "sku": "SamsungGalaxyS21Plus128GBPhantomViolet8GBRAM",
//     "MODEL ID": 215403,
//     "MRP": 96999,
//     "Bajaj-MOP": 81999,
//     "HappiMOP": 71999,
//     "Difference": -10000
//   },
//   {
//     "APEXModelCode": "G996BG S21+ 256GB SL",
//     "APEX-MODEL NAME": "G996BG S21+ 256GB SILVER",
//     "sku": "SamsungGalaxyS21Plus256GBPhantomSilver8GBRAM",
//     "MODEL ID": 215405,
//     "MRP": 100999,
//     "Bajaj-MOP": 85999,
//     "HappiMOP": 80999,
//     "Difference": -5000
//   },
//   {
//     "APEXModelCode": "G996BG S21+ 256GB VI",
//     "APEX-MODEL NAME": "G996BG S21+ 256GB VIOLET",
//     "sku": "SamsungGalaxyS21Plus256GBPhantomViolet8GBRAM",
//     "MODEL ID": 215406,
//     "MRP": 100999,
//     "Bajaj-MOP": 85999,
//     "HappiMOP": 80999,
//     "Difference": -5000
//   },
//   {
//     "APEXModelCode": "M325FC 6/128 Black",
//     "APEX-MODEL NAME": "M325FC Samsung M32 6/128 - Black",
//     "sku": "SamsungGalaxyA32128GBBlack6GBRAM",
//     "MODEL ID": 220046,
//     "MRP": 25000,
//     "Bajaj-MOP": 21999,
//     "HappiMOP": 17199,
//     "Difference": -4800
//   },
//   {
//     "APEXModelCode": "M325FC 6/128 Blue",
//     "APEX-MODEL NAME": "M325FC Samsung M32 6/128 - Blue",
//     "sku": "SamsungGalaxyA32128GBBlue6GBRAM",
//     "MODEL ID": 220045,
//     "MRP": 25000,
//     "Bajaj-MOP": 21999,
//     "HappiMOP": 17199,
//     "Difference": -4800
//   },
//   {
//     "APEXModelCode": "M515FD  6/128GB Blk",
//     "APEX-MODEL NAME": "M515FD  Samsung M51 (6/128) - BLACK",
//     "sku": "SamsungGalaxyM51128GBCelestialBlack6GBRAM",
//     "MODEL ID": 210362,
//     "MRP": 26249,
//     "Bajaj-MOP": 22999,
//     "HappiMOP": 22999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "M515FD  6/128GB Blue",
//     "APEX-MODEL NAME": "M515FD  Samsung M51 (6/128) - BLUE",
//     "sku": "SamsungGalaxyM51128GBElectricBlue6GBRAM",
//     "MODEL ID": 210361,
//     "MRP": 26249,
//     "Bajaj-MOP": 22999,
//     "HappiMOP": 22999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "X60pro 12/256 Blue",
//     "APEX-MODEL NAME": "X60Pro Vivo 12/256 -Blue",
//     "sku": "VivoX60Pro256GBShimmerBlue12GBRAM",
//     "MODEL ID": 222587,
//     "MRP": 49990,
//     "Bajaj-MOP": 49990,
//     "HappiMOP": 45100,
//     "Difference": -4890
//   },
//   {
//     "APEXModelCode": "X60Pro+ 12/256 Blue",
//     "APEX-MODEL NAME": "X60Pro+ Vivo 12/256 -Blue",
//     "sku": "VivoX60ProPlus256GBEmperorBlue12GBRAM",
//     "MODEL ID": 222588,
//     "MRP": 69990,
//     "Bajaj-MOP": 69990,
//     "HappiMOP": 65100,
//     "Difference": -4890
//   },
//   {
//     "APEXModelCode": "10T 6/128 Black",
//     "APEX-MODEL NAME": "Mi 10T (6+128) - Black",
//     "sku": "Mi10T128GBCosmicBlack6GBRAMmfr2",
//     "MODEL ID": 210015,
//     "MRP": 33499,
//     "Bajaj-MOP": 32999,
//     "HappiMOP": 30999,
//     "Difference": -2000
//   },
//   {
//     "APEXModelCode": "10T 6/128 Silver",
//     "APEX-MODEL NAME": "Mi 10T (6+128) - Silver",
//     "sku": "Mi10T128GBLunarSilver6GBRAM",
//     "MODEL ID": 210012,
//     "MRP": 33499,
//     "Bajaj-MOP": 32999,
//     "HappiMOP": 30999,
//     "Difference": -2000
//   },
//   {
//     "APEXModelCode": "10T 8/128 Black",
//     "APEX-MODEL NAME": "Mi 10T (8+128) - Black",
//     "sku": "Mi10T128GBCosmicBlack8GBRAM",
//     "MODEL ID": 210013,
//     "MRP": 35499,
//     "Bajaj-MOP": 34999,
//     "HappiMOP": 32999,
//     "Difference": -2000
//   },
//   {
//     "APEXModelCode": "Mi 11Lite 6/128 Blac",
//     "APEX-MODEL NAME": "Mi 11 Lite (6G+128G) - Black",
//     "sku": "Mi11Lite128GBStorageVinylBlack6GBRAM",
//     "MODEL ID": 233574,
//     "MRP": 22499,
//     "Bajaj-MOP": 21999,
//     "HappiMOP": 21999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "Mi 11Lite 6/128 Blue",
//     "APEX-MODEL NAME": "Mi 11 Lite (6G+128G) - Blue",
//     "sku": "Mi11Lite128GBStorageJazzBlue6GBRAM",
//     "MODEL ID": 233575,
//     "MRP": 22499,
//     "Bajaj-MOP": 21999,
//     "HappiMOP": 21999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "Mi 11Lite 8/128 Blac",
//     "APEX-MODEL NAME": "Mi 11 Lite (8G+128G) - Black",
//     "sku": "Mi11Lite128GBStorageVinylBlack8GBRAM",
//     "MODEL ID": 233577,
//     "MRP": 24499,
//     "Bajaj-MOP": 23999,
//     "HappiMOP": 23999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "Mi 11Lite 8/128 Cora",
//     "APEX-MODEL NAME": "Mi 11 Lite (8G+128G) - Coral",
//     "sku": "Mi11Lite128GBStorageTuscanyCoral8GBRAM",
//     "MODEL ID": 233579,
//     "MRP": 24499,
//     "Bajaj-MOP": 23999,
//     "HappiMOP": 23999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "11X 6/128 Silver",
//     "APEX-MODEL NAME": "Mi 11X (6G+128G) - Silver",
//     "sku": "MI11X128GBCelestialSilver6GBRAM",
//     "MODEL ID": 225823,
//     "MRP": 30499,
//     "Bajaj-MOP": 29999,
//     "HappiMOP": 28099,
//     "Difference": -1900
//   },
//   {
//     "APEXModelCode": "11X 6/128 White",
//     "APEX-MODEL NAME": "Mi 11X (6G+128G) - White",
//     "sku": "MI11X128GBLunarWhite6GBRAM",
//     "MODEL ID": 225824,
//     "MRP": 30499,
//     "Bajaj-MOP": 29999,
//     "HappiMOP": 28099,
//     "Difference": -1900
//   },
//   {
//     "APEXModelCode": "11XPro 8/128 Black",
//     "APEX-MODEL NAME": "Mi 11X Pro (8G+128G) - Black",
//     "sku": "MI11XPro128GBCosmicBlack8GBRAM",
//     "MODEL ID": 225828,
//     "MRP": 40499,
//     "Bajaj-MOP": 39999,
//     "HappiMOP": 37099,
//     "Difference": -2900
//   },
//   {
//     "APEXModelCode": "10i 6/128 Black",
//     "APEX-MODEL NAME": "Mi10i (6G+128G) - Black",
//     "sku": "Mi10i128GBMidnightBlack6GBRAM",
//     "MODEL ID": 214375,
//     "MRP": 22499,
//     "Bajaj-MOP": 21999,
//     "HappiMOP": 21999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "10i 6/128 -Blue",
//     "APEX-MODEL NAME": "Mi10i (6G+128G) - Blue",
//     "sku": "Mi10i128GBAtlanticBlue6GBRAM",
//     "MODEL ID": 214373,
//     "MRP": 22499,
//     "Bajaj-MOP": 21999,
//     "HappiMOP": 21999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "10i 8/128 - Blue",
//     "APEX-MODEL NAME": "Mi10i (8G+128G) - Blue",
//     "sku": "Mi10i128GBAtlanticBlue8GBRAM",
//     "MODEL ID": 214376,
//     "MRP": 24499,
//     "Bajaj-MOP": 23999,
//     "HappiMOP": 23999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "F711BA Cream",
//     "APEX-MODEL NAME": "F711BA Galaxy Z Flip 3 8/128 - Cream",
//     "sku": "SAMSUNGZFLIP3128GBSTORAGECREAM8GBRAM",
//     "MODEL ID": 241306,
//     "MRP": 100000,
//     "Bajaj-MOP": 84999,
//     "HappiMOP": 84999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "F711BE Cream",
//     "APEX-MODEL NAME": "F711BE Galaxy Z Flip 3 8/256 - Cream",
//     "sku": "SAMSUNGZFLIP3256GBSTORAGECREAM8GBRAM",
//     "MODEL ID": 241307,
//     "MRP": 100000,
//     "Bajaj-MOP": 88999,
//     "HappiMOP": 88999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "F711BA Black",
//     "APEX-MODEL NAME": "F711BA Galaxy Z Flip 3 8/128 - Black",
//     "sku": "SAMSUNGZFLIP3128GBSTORAGEPHANTOMBLACK8GBRAM",
//     "MODEL ID": 241308,
//     "MRP": 100000,
//     "Bajaj-MOP": 84999,
//     "HappiMOP": 84999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "F711BE Black",
//     "APEX-MODEL NAME": "F711BE Galaxy Z Flip 3 8/256 - Black",
//     "sku": "SAMSUNGZFLIP3256GBSTORAGEPHANTOMBLACK8GBRAM",
//     "MODEL ID": 241309,
//     "MRP": 100000,
//     "Bajaj-MOP": 88999,
//     "HappiMOP": 88999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "F926BD Green",
//     "APEX-MODEL NAME": "F926BD Galaxy Z Fold 3 12/256 - Green",
//     "sku": "SAMSUNGZFOLD3256GBSTORAGEPHANTOMGREEN12GBRAM",
//     "MODEL ID": 241310,
//     "MRP": 170000,
//     "Bajaj-MOP": 149999,
//     "HappiMOP": 149999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "F926BD Black",
//     "APEX-MODEL NAME": "F926BD Galaxy Z Fold 3 12/256 - Black",
//     "sku": "SAMSUNGZFOLD3256GBSTORAGEPHANTOMBLACK12GBRAM",
//     "MODEL ID": 241311,
//     "MRP": 170000,
//     "Bajaj-MOP": 149999,
//     "HappiMOP": 149999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "F926BE Black",
//     "APEX-MODEL NAME": "F926BE Galaxy Z Fold 3 12/512 - Black",
//     "sku": "SAMSUNGZFOLD3512GBSTORAGEPHANTOMBLACK12GBRAM",
//     "MODEL ID": 241312,
//     "MRP": 170000,
//     "Bajaj-MOP": 157999,
//     "HappiMOP": 157999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "X70Pro 8/128 Cosmic",
//     "APEX-MODEL NAME": "X70 Pro Vivo 8/128 - Cosmic Black",
//     "sku": "VIVOX70PRO128GBSTORAGECOSMICBLACK8GBRAM",
//     "MODEL ID": 244946,
//     "MRP": 49990,
//     "Bajaj-MOP": 49990,
//     "HappiMOP": 47090,
//     "Difference": -2900
//   },
//   {
//     "APEXModelCode": "X70Pro+ 12/256 Black",
//     "APEX-MODEL NAME": "X70 Pro+ Vivo 12/256 - Black",
//     "sku": "VIVOX70PROPLUS256GBSTORAGEENIGMABLACK12GBRAM",
//     "MODEL ID": 244948,
//     "MRP": 79990,
//     "Bajaj-MOP": 79990,
//     "HappiMOP": 79990,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "A31 4/64 BLACK",
//     "APEX-MODEL NAME": "A31 OPPO MOBILE 4/64  - BLACK",
//     "sku": "OppoA3164GBMysteryBlack4GBRAM",
//     "MODEL ID": 165974,
//     "MRP": 12490,
//     "Bajaj-MOP": 12490,
//     "HappiMOP": 9490,
//     "Difference": -3000
//   },
//   {
//     "APEXModelCode": "A31 4/64 Green",
//     "APEX-MODEL NAME": "A31 OPPO MOBILE 4/64 - Green",
//     "sku": "OppoA3164GBLakeGreen4GBRAM",
//     "MODEL ID": 165974,
//     "MRP": 12490,
//     "Bajaj-MOP": 12490,
//     "HappiMOP": 9490,
//     "Difference": -3000
//   },
//   {
//     "APEXModelCode": "A31 4/64 WHITE",
//     "APEX-MODEL NAME": "A31 OPPO MOBILE 4/64  - WHITE",
//     "sku": "OppoA3164GBFantasyWhite4GBRAM",
//     "MODEL ID": 165974,
//     "MRP": 12490,
//     "Bajaj-MOP": 12490,
//     "HappiMOP": 9490,
//     "Difference": -3000
//   },
//   {
//     "APEXModelCode": "X7 6/128 Nebula",
//     "APEX-MODEL NAME": "Realme X7 6/128 Nebula",
//     "sku": "RealmeX7128GBSpaceNebula6GBRAM",
//     "MODEL ID": 218124,
//     "MRP": 20999,
//     "Bajaj-MOP": 19999,
//     "HappiMOP": 19999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "X7 6/128 Silver",
//     "APEX-MODEL NAME": "Realme X7 6/128 Silver",
//     "sku": "RealmeX7128GBSpaceSilver6GBRAM",
//     "MODEL ID": 218125,
//     "MRP": 20999,
//     "Bajaj-MOP": 19999,
//     "HappiMOP": 19999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "A207FD BLACK",
//     "APEX-MODEL NAME": "A207FD SAMSUNG MOBILE GALAXY A20s (3/32) - BLACK",
//     "sku": "SamsungGalaxyA20S32GBBlack3GBRAM",
//     "MODEL ID": 166496,
//     "MRP": 12888,
//     "Bajaj-MOP": 11588,
//     "HappiMOP": 11588,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "A207FD BLUE",
//     "APEX-MODEL NAME": "A207FD SAMSUNG MOBILE GALAXY A20s (3/32) - BLUE",
//     "sku": "SamsungGalaxyA20S32GBBlue3GBRAM",
//     "MODEL ID": 166494,
//     "MRP": 12888,
//     "Bajaj-MOP": 11588,
//     "HappiMOP": 11588,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "A207FD GREEN",
//     "APEX-MODEL NAME": "A207FD SAMSUNG MOBILE GALAXY A20s (3/32) - GREEN",
//     "sku": "SamsungGalaxyA20S32GBGreen3GBRAM",
//     "MODEL ID": 166495,
//     "MRP": 12888,
//     "Bajaj-MOP": 11588,
//     "HappiMOP": 11588,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "A207FG BLACK",
//     "APEX-MODEL NAME": "A207FG SAMSUNG MOBILE GALAXY A20s (4/64) - BLACK",
//     "sku": "SamsungGalaxyA20S64GBBlack4GBRAM",
//     "MODEL ID": 166499,
//     "MRP": 14380,
//     "Bajaj-MOP": 13695,
//     "HappiMOP": 12499,
//     "Difference": -1196
//   },
//   {
//     "APEXModelCode": "A207FG GREEN",
//     "APEX-MODEL NAME": "A207FG SAMSUNG MOBILE GALAXY A20s (4/64) - GREEN",
//     "sku": "SamsungGalaxyA20S64GBGreen4GBRAM",
//     "MODEL ID": 166498,
//     "MRP": 14380,
//     "Bajaj-MOP": 13695,
//     "HappiMOP": 12499,
//     "Difference": -1196
//   },
//   {
//     "APEXModelCode": "Y12  BLUE 3/64GB",
//     "APEX-MODEL NAME": "Y12 VIVO MOBILE 3/64- BLUE",
//     "sku": "VIVOY12G64GBGLACIERBLUE3GBRAM",
//     "MODEL ID": 240758,
//     "MRP": 11990,
//     "Bajaj-MOP": 11990,
//     "HappiMOP": 10990,
//     "Difference": -1000
//   },
//   {
//     "APEXModelCode": "11XPro 8/128 White",
//     "APEX-MODEL NAME": "Mi 11X Pro (8G+128G) - White",
//     "sku": "MI11XPro128GBLunarWhite8GBRAM",
//     "MODEL ID": 225830,
//     "MRP": 40499,
//     "Bajaj-MOP": 39999,
//     "HappiMOP": 37099,
//     "Difference": -2900
//   },
//   {
//     "APEXModelCode": "11Ultra 12/256 White",
//     "APEX-MODEL NAME": "Mi 11 Ultra (12G+256G) - White",
//     "sku": "XiaomiMi11Ultra256GBStorageCeramicWhite12GBRAM",
//     "MODEL ID": 234244,
//     "MRP": 70999,
//     "Bajaj-MOP": 69999,
//     "HappiMOP": 69999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "5.4DS 4/64 Purple",
//     "APEX-MODEL NAME": "Nokia 5.4 4/64 - Purple",
//     "sku": "NOKIA5464GBSTORAGEDUSK6GBRAM",
//     "MODEL ID": 222464,
//     "MRP": 14499,
//     "Bajaj-MOP": 14499,
//     "HappiMOP": 13099,
//     "Difference": -1400
//   },
//   {
//     "APEXModelCode": "A325FH 6/128 Black",
//     "APEX-MODEL NAME": "A325FH Samsung A32 (6/128) - Black",
//     "sku": "SamsungGalaxyA32128GBBlack6GBRAM",
//     "MODEL ID": 220046,
//     "MRP": 25000,
//     "Bajaj-MOP": 21999,
//     "HappiMOP": 21999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "a325fh 6/128 Blue",
//     "APEX-MODEL NAME": "A325FH Samsung A32 (6/128) - Blue",
//     "sku": "SamsungGalaxyA32128GBBlue6GBRAM",
//     "MODEL ID": 220045,
//     "MRP": 25000,
//     "Bajaj-MOP": 21999,
//     "HappiMOP": 21999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "E625FG 8/128 green",
//     "APEX-MODEL NAME": "E625FG Samsung F62 (8/128) - Green",
//     "sku": "SamsungGalaxyF62128GBStorageLaserGreen8GBRAM",
//     "MODEL ID": 218534,
//     "MRP": 28000,
//     "Bajaj-MOP": 25999,
//     "HappiMOP": 25999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "F415FG 6/128 Blue",
//     "APEX-MODEL NAME": "F415FG Samsung F41 6/128 - Blue",
//     "sku": "SamsungGalaxyF41128GBStorageFusionBlue6GBRAM",
//     "MODEL ID": 215838,
//     "MRP": 16499,
//     "Bajaj-MOP": 16499,
//     "HappiMOP": 16499,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "M315FG 6/128 Black",
//     "APEX-MODEL NAME": "M315FG Samsung M31 6/128 - Black",
//     "sku": "SamsungGalaxyM31128GBBlack6GBRAM",
//     "MODEL ID": 212055,
//     "MRP": 19424,
//     "Bajaj-MOP": 16499,
//     "HappiMOP": 16499,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "M315FD 6/64 Blue",
//     "APEX-MODEL NAME": "M315FD Samsung M31 6/64- Blue",
//     "sku": "SamsungGalaxyM3164GBBlue6GBRAM",
//     "MODEL ID": 210073,
//     "MRP": 18374,
//     "Bajaj-MOP": 15999,
//     "HappiMOP": 15999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "M315FD 6/64 Black",
//     "APEX-MODEL NAME": "M315FD Samsung M31 6/64- Black",
//     "sku": "SamsungGalaxyM3164GBBlack6GBRAM",
//     "MODEL ID": 210074,
//     "MRP": 18374,
//     "Bajaj-MOP": 15999,
//     "HappiMOP": 15999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "M315FG 6/128 Blue",
//     "APEX-MODEL NAME": "M315FG Samsung M31 6/128 - Blue",
//     "sku": "SamsungM316128OceanBlue128GBStorageOceanBlue6GBRAM",
//     "MODEL ID": 210075,
//     "MRP": 19424,
//     "Bajaj-MOP": 16499,
//     "HappiMOP": 16499,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "M215FD 4/64 Blue",
//     "APEX-MODEL NAME": "M215FD Samsung M21 4/64 - Blue",
//     "sku": "SamsungGalaxyM2164GBBlue4GBRAM",
//     "MODEL ID": 215839,
//     "MRP": 14699,
//     "Bajaj-MOP": 12499,
//     "HappiMOP": 12499,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "M325FB 4/64 Black",
//     "APEX-MODEL NAME": "M325FB Samsung M32 4/64 - Black",
//     "sku": "SamsungGalaxyM3264GBStorageBlack4GBRAM",
//     "MODEL ID": 233369,
//     "MRP": 16899,
//     "Bajaj-MOP": 14999,
//     "HappiMOP": 14999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "M325FB 4/64 Blue",
//     "APEX-MODEL NAME": "M325FB Samsung M32 4/64 - Blue",
//     "sku": "SamsungGalaxyM3264GBStorageBlue4GBRAM",
//     "MODEL ID": 233370,
//     "MRP": 16899,
//     "Bajaj-MOP": 14999,
//     "HappiMOP": 14999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "A037F6 4/64 Black",
//     "APEX-MODEL NAME": "A037F6 Samsung A037S (4/64) - Black",
//     "sku": "SamsungGalaxyA03s64GBStorageBlack4GBRAMSMA037FZK6INS",
//     "MODEL ID": 240702,
//     "MRP": 15000,
//     "Bajaj-MOP": 11899,
//     "HappiMOP": 11899,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "A037SFG 4/64 Blue",
//     "APEX-MODEL NAME": "A037FG Samsung A037S (4/64) - Blue",
//     "sku": "SamsungGalaxyA03s64GBStorageBlue4GBRAMSMA037FZB6INS",
//     "MODEL ID": 240703,
//     "MRP": 15000,
//     "Bajaj-MOP": 11899,
//     "HappiMOP": 11899,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "V20 8/256 Melody",
//     "APEX-MODEL NAME": "V20 Vivo 8/256 - Sunset Melody",
//     "sku": "VivoV202021256GBStorageSunsetMelody8GBRAM",
//     "MODEL ID": 218519,
//     "MRP": 25990,
//     "Bajaj-MOP": 25990,
//     "HappiMOP": 25990,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "Y51 8/128 TSaphire",
//     "APEX-MODEL NAME": "Y51 Vivo 8/128 - Titanium Saphire",
//     "sku": "VivoY51128GBStorageTitaniumSapphire8GBRAM",
//     "MODEL ID": 211677,
//     "MRP": 17990,
//     "Bajaj-MOP": 17990,
//     "HappiMOP": 17990,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "RM 85G 4/64 Black",
//     "APEX-MODEL NAME": "Realme 8 5G 4/64 - Black",
//     "sku": "realme85GSupersonicBlack4GB64GB",
//     "MODEL ID": 234006,
//     "MRP": 15499,
//     "Bajaj-MOP": 15499,
//     "HappiMOP": 15499,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "RM 85G 4/64 Blue",
//     "APEX-MODEL NAME": "Realme 8 5G 4/64 - Blue",
//     "sku": "realme85GSupersonicBlue4GB64GB",
//     "MODEL ID": 234005,
//     "MRP": 15499,
//     "Bajaj-MOP": 15499,
//     "HappiMOP": 15499,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "8Pro 8/128 Black",
//     "APEX-MODEL NAME": "Realme 8Pro 8/128 Black",
//     "sku": "Realme8Pro128GBStorageInfiniteBlack8GBRAM",
//     "MODEL ID": 222242,
//     "MRP": 19999,
//     "Bajaj-MOP": 19999,
//     "HappiMOP": 19999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "8Pro 8/128 Blue",
//     "APEX-MODEL NAME": "Realme 8Pro 8/128 Blue",
//     "sku": "Realme8Pro128GBStorageInfiniteBlue8GBRAM",
//     "MODEL ID": 222243,
//     "MRP": 19999,
//     "Bajaj-MOP": 19999,
//     "HappiMOP": 19999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "A525 6/128 Blue",
//     "APEX-MODEL NAME": "A525FG Samsung A52 (6/128) - Blue",
//     "sku": "SamsungGalaxyA52128GBStorageBlue6GBRAM",
//     "MODEL ID": 221683,
//     "MRP": 28349,
//     "Bajaj-MOP": 27499,
//     "HappiMOP": 27499,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "A725 8/128 Black",
//     "APEX-MODEL NAME": "A725FG Samsung A72 (8/128) - Black",
//     "sku": "SamsungGalaxyA72128GBStorageBlack8GBRAM",
//     "MODEL ID": 221692,
//     "MRP": 37799,
//     "Bajaj-MOP": 34999,
//     "HappiMOP": 34999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "M127GH 6/128 Blue",
//     "APEX-MODEL NAME": "M127GH Samsung M12 6/128 - Blue",
//     "sku": "SamsungGalaxyM12128GBStorageBlue6GBRAM",
//     "MODEL ID": 221488,
//     "MRP": 15000,
//     "Bajaj-MOP": 13499,
//     "HappiMOP": 13499,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "9power 4/128 - Black",
//     "APEX-MODEL NAME": "Redmi 9 Power (4G+128G ) - Black",
//     "sku": "Redmi9Power128GBStorageMightyBlackÂ 4GBRAM",
//     "MODEL ID": 215995,
//     "MRP": 12499,
//     "Bajaj-MOP": 11999,
//     "HappiMOP": 11999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "X70Pro 8/256 Aura Dw",
//     "APEX-MODEL NAME": "X70 Pro Vivo 8/256 - Aura Dwan",
//     "sku": "VIVOX70PRO256GBSTORAGEAURORADAWN8GBRAMSMARTPHONE",
//     "MODEL ID": 244946,
//     "MRP": 49990,
//     "Bajaj-MOP": 49990,
//     "HappiMOP": 49990,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "F17  6/128 Silver",
//     "APEX-MODEL NAME": "F17 Oppo 6/128 - Silver",
//     "sku": "OppoF17128GBClassicSilver6GBRAM",
//     "MODEL ID": 191521,
//     "MRP": 16990,
//     "Bajaj-MOP": 16990,
//     "HappiMOP": 16990,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "Y51 8/128 Silver",
//     "APEX-MODEL NAME": "Y51 Vivo 8/128 - Silver",
//     "sku": "VivoY51128GBTitaniumSapphire8GBRAM",
//     "MODEL ID": 211677,
//     "MRP": 17990,
//     "Bajaj-MOP": 17990,
//     "HappiMOP": 17990,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "V20SE 8/128 Green",
//     "APEX-MODEL NAME": "V20SE Vivo 8/128 - Green",
//     "sku": "VivoV20SE128GBAquamarineGreen8GBRAM",
//     "MODEL ID": 209760,
//     "MRP": 19990,
//     "Bajaj-MOP": 19990,
//     "HappiMOP": 19990,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "Y20 4/64 Blue",
//     "APEX-MODEL NAME": "Y20 Vivo 4/64 - Blue",
//     "sku": "VivoY2064GBPuristBlue4GBRAM",
//     "MODEL ID": 190858,
//     "MRP": 12990,
//     "Bajaj-MOP": 12990,
//     "HappiMOP": 12990,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "V20Pro 8/128 Melody",
//     "APEX-MODEL NAME": "V20Pro Vivo 8/128- Sunset Melody",
//     "sku": "VivoV20Pro128GBSunsetMelody8GBRAM",
//     "MODEL ID": 211235,
//     "MRP": 29990,
//     "Bajaj-MOP": 29990,
//     "HappiMOP": 29990,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "V20Pro 8/128 Jazz",
//     "APEX-MODEL NAME": "V20pro Vivo 8/128 - Midnight Jazz",
//     "sku": "VivoV20Pro128GBMidnightJazz8GBRAM",
//     "MODEL ID": 211235,
//     "MRP": 29990,
//     "Bajaj-MOP": 29990,
//     "HappiMOP": 29990,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "T1 4/128 Black",
//     "APEX-MODEL NAME": "T1 Vivo 4/128 - Starlight Black",
//     "sku": "VIVOT15G128GBSTORAGESTARLIGHTBLACK4GBRAM",
//     "MODEL ID": 263156,
//     "MRP": 15990,
//     "Bajaj-MOP": 15990,
//     "HappiMOP": 15990,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "T1 4/128 Fantasy",
//     "APEX-MODEL NAME": "T1 Vivo 4/128 - Rainbow Fantasy",
//     "sku": "VIVOT15G128GBSTORAGERAINBOWFANTASY4GBRAM",
//     "MODEL ID": 263156,
//     "MRP": 15990,
//     "Bajaj-MOP": 15990,
//     "HappiMOP": 15990,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "T1 8/128 Black",
//     "APEX-MODEL NAME": "T1 Vivo 8/128 - Starlight Black",
//     "sku": "VIVOT15G128GBSTORAGESTARLIGHTBLACK8GBRAM",
//     "MODEL ID": 263158,
//     "MRP": 19990,
//     "Bajaj-MOP": 19990,
//     "HappiMOP": 19990,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "T1 8/128 Fantasy",
//     "APEX-MODEL NAME": "T1 Vivo 8/128 - Rainbow Fantasy",
//     "sku": "VIVOT15G128GBSTORAGERAINBOWFANTASY8GBRAM",
//     "MODEL ID": 263158,
//     "MRP": 19990,
//     "Bajaj-MOP": 19990,
//     "HappiMOP": 19990,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "8Pro 6/128 Blue",
//     "APEX-MODEL NAME": "Realme 8Pro 6/128 Blue",
//     "sku": "Realme8Pro128GBInfiniteBlue6GBRAM",
//     "MODEL ID": 222240,
//     "MRP": 17999,
//     "Bajaj-MOP": 17999,
//     "HappiMOP": 17999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "A226BH 6/128 Violet",
//     "APEX-MODEL NAME": "A226BH Samsung A22 5G (6/128) - Violet",
//     "sku": "SAMSUNGGALAXYA225G128GBSTORAGEVIOLET6GBRAM",
//     "MODEL ID": 235205,
//     "MRP": 20999,
//     "Bajaj-MOP": 19999,
//     "HappiMOP": 19999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "A226BJ 8/128 Grey",
//     "APEX-MODEL NAME": "A226BJ Samsung A22 5G (8/128) - Grey",
//     "sku": "SAMSUNGGALAXYA225G128GBSTORAGEGRAY8GBRAM",
//     "MODEL ID": 235203,
//     "MRP": 23099,
//     "Bajaj-MOP": 21999,
//     "HappiMOP": 21999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "A226BJ 8/128 Violet",
//     "APEX-MODEL NAME": "A226BJ Samsung A22 5G (8/128) - Violet",
//     "sku": "SAMSUNGGALAXYA225G128GBSTORAGEVIOLET8GBRAM",
//     "MODEL ID": 235202,
//     "MRP": 23099,
//     "Bajaj-MOP": 21999,
//     "HappiMOP": 21999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "A325FH 6/128 Violet",
//     "APEX-MODEL NAME": "A325FH Samsung A32 (6/128)- Violet",
//     "sku": "SamsungGalaxyA32128GBViolet6GBRAM",
//     "MODEL ID": 220044,
//     "MRP": 25000,
//     "Bajaj-MOP": 21999,
//     "HappiMOP": 21999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "A515FH 8/128 WHITE",
//     "APEX-MODEL NAME": "A515FH Samsung A51 (8/128) - WHITE",
//     "sku": "SamsungGalaxyA51128GBWhite8GBRAMmfr2",
//     "MODEL ID": 179386,
//     "MRP": 23624,
//     "Bajaj-MOP": 22499,
//     "HappiMOP": 22499,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "A515FH 8/18 BLACK",
//     "APEX-MODEL NAME": "A515FH Samsung A51 (8/128)- BLACK",
//     "sku": "SamsungGalaxyA51128GBBlack8GBRAMmfr2",
//     "MODEL ID": 179385,
//     "MRP": 23624,
//     "Bajaj-MOP": 22499,
//     "HappiMOP": 22499,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "A525 6/128 Black",
//     "APEX-MODEL NAME": "A525FG Samsung A52 (6/128) - Black",
//     "sku": "SamsungGalaxyA52128GBBlack6GBRAM",
//     "MODEL ID": 221684,
//     "MRP": 28349,
//     "Bajaj-MOP": 27499,
//     "HappiMOP": 27499,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "A525 6/128 Violet",
//     "APEX-MODEL NAME": "A525FG Samsung A52 (6/128) - Violet",
//     "sku": "SamsungGalaxyA52128GBViolet6GBRAM",
//     "MODEL ID": 221682,
//     "MRP": 28349,
//     "Bajaj-MOP": 27499,
//     "HappiMOP": 27499,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "A525 6/128 White",
//     "APEX-MODEL NAME": "A525FG Samsung A52 (6/128) - White",
//     "sku": "SamsungGalaxyA52128GBWhite6GBRAM",
//     "MODEL ID": 221685,
//     "MRP": 28349,
//     "Bajaj-MOP": 27499,
//     "HappiMOP": 27499,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "A525 8/128 Black",
//     "APEX-MODEL NAME": "A525FH Samsung A52 (8/128) - Black",
//     "sku": "SamsungGalaxyA52128GBBlack8GBRAM",
//     "MODEL ID": 221688,
//     "MRP": 30449,
//     "Bajaj-MOP": 28999,
//     "HappiMOP": 28999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "A525 8/128 Blue",
//     "APEX-MODEL NAME": "A525FH Samsung A52 (8/128) - Blue",
//     "sku": "SamsungGalaxyA52128GBBlue8GBRAM",
//     "MODEL ID": 221687,
//     "MRP": 30449,
//     "Bajaj-MOP": 28999,
//     "HappiMOP": 28999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "A525 8/128 Violet",
//     "APEX-MODEL NAME": "A525FH Samsung A52 (8/128) - Violet",
//     "sku": "SamsungGalaxyA52128GBViolet8GBRAM",
//     "MODEL ID": 221686,
//     "MRP": 30449,
//     "Bajaj-MOP": 28999,
//     "HappiMOP": 28999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "A525 8/128 White",
//     "APEX-MODEL NAME": "A525FH Samsung A52 (8/128) - White",
//     "sku": "SamsungGalaxyA52128GBWhite8GBRAM",
//     "MODEL ID": 221689,
//     "MRP": 30449,
//     "Bajaj-MOP": 28999,
//     "HappiMOP": 28999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "A715FW 8/128 SILVER",
//     "APEX-MODEL NAME": "A715FW Samsung A71 (8/128GB) - SILVER",
//     "sku": "SamsungGalaxyA71128GBSilver8GBRAMmfr2",
//     "MODEL ID": 179389,
//     "MRP": 28874,
//     "Bajaj-MOP": 27499,
//     "HappiMOP": 27499,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "A725 8/128 Violet",
//     "APEX-MODEL NAME": "A725FG Samsung A72 (8/128) - Violet",
//     "sku": "SamsungGalaxyA72128GBViolet8GBRAM",
//     "MODEL ID": 221690,
//     "MRP": 37799,
//     "Bajaj-MOP": 34999,
//     "HappiMOP": 34999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "A725 8/128 White",
//     "APEX-MODEL NAME": "A725FG Samsung A72 (8/128) - White",
//     "sku": "SamsungGalaxyA72128GBWhite8GBRAM",
//     "MODEL ID": 221693,
//     "MRP": 37799,
//     "Bajaj-MOP": 34999,
//     "HappiMOP": 34999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "A725 8/256 Black",
//     "APEX-MODEL NAME": "A725FH Samsung A72 (8/256) - Black",
//     "sku": "SamsungGalaxyA72256GBBlack8GBRAM",
//     "MODEL ID": 221696,
//     "MRP": 40949,
//     "Bajaj-MOP": 37999,
//     "HappiMOP": 37999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "A725 8/256 Blue",
//     "APEX-MODEL NAME": "A725FH Samsung A72 (8/256) - Blue",
//     "sku": "SamsungGalaxyA72256GBBlue8GBRAM",
//     "MODEL ID": 221695,
//     "MRP": 40949,
//     "Bajaj-MOP": 37999,
//     "HappiMOP": 37999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "M115FD 4/64 Violet",
//     "APEX-MODEL NAME": "M115FD Samsung M11 (4/64) - Violet",
//     "sku": "SamsungGalaxyM1164GBVoilet4GBRAM",
//     "MODEL ID": 184044,
//     "MRP": 12599,
//     "Bajaj-MOP": 10999,
//     "HappiMOP": 10999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "M127GH 6/128 Black",
//     "APEX-MODEL NAME": "M127GH Samsung M12 6/128 - Black",
//     "sku": "SamsungGalaxyM12128GBBlack6GBRAM",
//     "MODEL ID": 221489,
//     "MRP": 15000,
//     "Bajaj-MOP": 13499,
//     "HappiMOP": 13499,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "M127GH 6/128 WH",
//     "APEX-MODEL NAME": "M127GH Samsung M12 6/128 - White.",
//     "sku": "SamsungGalaxyM12128GBWhite6GBRAM",
//     "MODEL ID": 221490,
//     "MRP": 15000,
//     "Bajaj-MOP": 13499,
//     "HappiMOP": 13499,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "Note 10s 6/64 white",
//     "APEX-MODEL NAME": "Redmi Note 10s (6+64) - White",
//     "sku": "RedmiNote10S64GBStorageFrostWhite6GBRAM",
//     "MODEL ID": 234033,
//     "MRP": 15499,
//     "Bajaj-MOP": 14999,
//     "HappiMOP": 14999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "A15s 4/128 Black",
//     "APEX-MODEL NAME": "A15s Oppo 4/128 - Black",
//     "sku": "OPPOA15s128GBDynamicBlack4GBRAM",
//     "MODEL ID": 215861,
//     "MRP": 12490,
//     "Bajaj-MOP": 12490,
//     "HappiMOP": 12490,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "A15s 4/128 White",
//     "APEX-MODEL NAME": "A15s Oppo 4/128- White",
//     "sku": "OPPOA15s128GBFancyWhite4GBRAM",
//     "MODEL ID": 215861,
//     "MRP": 12490,
//     "Bajaj-MOP": 12490,
//     "HappiMOP": 12490,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "F19Pro  8/256 Black",
//     "APEX-MODEL NAME": "F19Pro Oppo 8/256 BLACK",
//     "sku": "OppoF19Pro256GBFluidBlack8GBRAM",
//     "MODEL ID": 221872,
//     "MRP": 23490,
//     "Bajaj-MOP": 23490,
//     "HappiMOP": 23490,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "F19Pro  8/256 Silver",
//     "APEX-MODEL NAME": "F19Pro Oppo 8/256 SILVER",
//     "sku": "OppoF19Pro256GBStorageCrystalSilver8GBRAM",
//     "MODEL ID": 221872,
//     "MRP": 23490,
//     "Bajaj-MOP": 23490,
//     "HappiMOP": 23490,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "A125FG 4/64 Black",
//     "APEX-MODEL NAME": "A125FG Sasmung A12 4/64 - Black",
//     "sku": "SamsungGalaxyA1264GBBlack4GBRAM",
//     "MODEL ID": 218278,
//     "MRP": 14699,
//     "Bajaj-MOP": 12999,
//     "HappiMOP": 12999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "A127FG 4/64 Black",
//     "APEX-MODEL NAME": "A127FG Samsung A12 (4/64) Black",
//     "sku": "SamsungGalaxyA1264GBBlack4GBRAMSMA127FZKGINS",
//     "MODEL ID": 238545,
//     "MRP": 14699,
//     "Bajaj-MOP": 12999,
//     "HappiMOP": 12999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "A127FG 4/64 Black",
//     "APEX-MODEL NAME": "A127FG Samsung A12 (4/64) Black",
//     "sku": "SAMSUNGGALAXYA1264GBSTORAGEBLACK4GBRAM",
//     "MODEL ID": 238547,
//     "MRP": 14699,
//     "Bajaj-MOP": 12899,
//     "HappiMOP": 12899,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "A127FG 4/64 Blue",
//     "APEX-MODEL NAME": "A127FG Samsung A12 (4/64) Blue",
//     "sku": "SAMSUNGGALAXYA1264GBSTORAGEBLUE4GBRAM",
//     "MODEL ID": 238548,
//     "MRP": 14699,
//     "Bajaj-MOP": 12899,
//     "HappiMOP": 12899,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "A127FG 4/64 White",
//     "APEX-MODEL NAME": "A127FG Samsung A12 (4/64) White",
//     "sku": "SAMSUNGGALAXYA1264GBSTORAGEWHITESMA127FZWLINS4GBRAM",
//     "MODEL ID": 238549,
//     "MRP": 14699,
//     "Bajaj-MOP": 12899,
//     "HappiMOP": 12899,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "A125FH 4/128 Black",
//     "APEX-MODEL NAME": "A125FH Sasmung A12 4/128- Black",
//     "sku": "SamsungGalaxyA12128GBBlack4GBRAM",
//     "MODEL ID": 218275,
//     "MRP": 15749,
//     "Bajaj-MOP": 13999,
//     "HappiMOP": 13999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "A125FH 4/128 Blue",
//     "APEX-MODEL NAME": "A125FH Sasmung A12 4/128- Blue",
//     "sku": "SamsungGalaxyA12128GBBlue4GBRAM",
//     "MODEL ID": 218274,
//     "MRP": 15749,
//     "Bajaj-MOP": 13999,
//     "HappiMOP": 13999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "A125FH 4/128 White",
//     "APEX-MODEL NAME": "A125FH Sasmung A12 4/128- White",
//     "sku": "SamsungGalaxyA12128GBWhite4GBRAM",
//     "MODEL ID": 218276,
//     "MRP": 15749,
//     "Bajaj-MOP": 13999,
//     "HappiMOP": 13999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "A125FJ 6/128 Black",
//     "APEX-MODEL NAME": "A125FJ Samsung A12 6/128 - Black",
//     "sku": "SAMSUNGGALAXYA12128GBSTORAGEBLACK6GBRAM",
//     "MODEL ID": 235143,
//     "MRP": 17324,
//     "Bajaj-MOP": 15499,
//     "HappiMOP": 15499,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "A125FJ 6/128 Black",
//     "APEX-MODEL NAME": "A125FJ Samsung A12 6/128 - Black",
//     "sku": "SAMSUNGGALAXYA12128GBSTORAGEBLACKSMA127FZKNINS6GBRAM",
//     "MODEL ID": 238541,
//     "MRP": 17324,
//     "Bajaj-MOP": 15499,
//     "HappiMOP": 15499,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "A125FJ 6/128 Blue",
//     "APEX-MODEL NAME": "A125FJ Samsung A12 6/128 - Blue",
//     "sku": "SAMSUNGGALAXYA12128GBSTORAGEBLUESMA127FZBNINS6GBRAM",
//     "MODEL ID": 238542,
//     "MRP": 17324,
//     "Bajaj-MOP": 15499,
//     "HappiMOP": 15499,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "A226BH 6/128 Mint",
//     "APEX-MODEL NAME": "A226BH Samsung A22 5G (6/128) - Mint",
//     "sku": "SAMSUNGGALAXYA225G128GBSTORAGEGREEN6GBRAM",
//     "MODEL ID": 235204,
//     "MRP": 20999,
//     "Bajaj-MOP": 19999,
//     "HappiMOP": 19999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "A225FR 6/128 Black",
//     "APEX-MODEL NAME": "A225FR Samsung A22 (6/128) - Black",
//     "sku": "SamsungGalaxyA22128GBStorageBlack6GBRAM",
//     "MODEL ID": 233583,
//     "MRP": 20000,
//     "Bajaj-MOP": 18499,
//     "HappiMOP": 18499,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "A225FR 6/128 Mint",
//     "APEX-MODEL NAME": "A225FR Samsung A22 (6/128) - Mint",
//     "sku": "SamsungGalaxyA22128GBStorageLightGreen6GBRAM",
//     "MODEL ID": 233584,
//     "MRP": 20000,
//     "Bajaj-MOP": 18499,
//     "HappiMOP": 18499,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "A315FW 6/128 - BLUE",
//     "APEX-MODEL NAME": "A315FW Samsung A31 (6/128) - BLUE",
//     "sku": "SamsungGalaxyA31128GBBlue6GBRAM",
//     "MODEL ID": 169508,
//     "MRP": 18899,
//     "Bajaj-MOP": 16999,
//     "HappiMOP": 16999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "A315FW 6/128 BLACK",
//     "APEX-MODEL NAME": "A315FW Samsung A31 (6/128)- BLACK",
//     "sku": "SamsungGalaxyA31128GBBlack6GBRAM",
//     "MODEL ID": 169507,
//     "MRP": 18899,
//     "Bajaj-MOP": 16999,
//     "HappiMOP": 16999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "A31FW 6/128 WHITE",
//     "APEX-MODEL NAME": "A315FW Samsung A31 (6/128) -WHITE",
//     "sku": "SamsungGalaxyA31128GBWhite6GBRAM",
//     "MODEL ID": 169509,
//     "MRP": 18899,
//     "Bajaj-MOP": 16999,
//     "HappiMOP": 16999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "A515FH 8/128 BLUE",
//     "APEX-MODEL NAME": "A515FH Samsung A51 (8/128) - BLUE",
//     "sku": "SamsungGalaxyA51128GBBlue8GBRAM",
//     "MODEL ID": 169511,
//     "MRP": 23624,
//     "Bajaj-MOP": 22499,
//     "HappiMOP": 22499,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "A515FW 6/128 Blue",
//     "APEX-MODEL NAME": "A515FW Samsung A51 (6/128) - BLUE",
//     "sku": "SamsungGalaxyA51128GBBlue6GBRAM",
//     "MODEL ID": 166500,
//     "MRP": 22049,
//     "Bajaj-MOP": 20999,
//     "HappiMOP": 20999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "A515FW 6/128 White",
//     "APEX-MODEL NAME": "A515FW Samsung A51 (6/128) - WHITE",
//     "sku": "SamsungGalaxyA51128GBWhite6GBRAM",
//     "MODEL ID": 166502,
//     "MRP": 22049,
//     "Bajaj-MOP": 20999,
//     "HappiMOP": 20999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "A715FW 8/128 BLACK",
//     "APEX-MODEL NAME": "A715FW Samsung A71 (8/128GB) - BLACK",
//     "sku": "SamsungGalaxyA71128GBPrismCrushBlack8GBRAM",
//     "MODEL ID": 163431,
//     "MRP": 28874,
//     "Bajaj-MOP": 27499,
//     "HappiMOP": 27499,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "A715FW 8/128 BLUE",
//     "APEX-MODEL NAME": "A715FW Samsung A71 (8/128GB) - BLUE",
//     "sku": "SamsungGalaxyA71128GBBlue8GBRAM",
//     "MODEL ID": 163430,
//     "MRP": 28874,
//     "Bajaj-MOP": 27499,
//     "HappiMOP": 27499,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "A725 8/256 Violet",
//     "APEX-MODEL NAME": "A725FH Samsung A72 (8/256) - Violet",
//     "sku": "SamsungGalaxyA72256GBViolet8GBRAM",
//     "MODEL ID": 221694,
//     "MRP": 40949,
//     "Bajaj-MOP": 37999,
//     "HappiMOP": 37999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "M115FE 4/64 BLACK",
//     "APEX-MODEL NAME": "M115FD Samsung M11 (4/64) - Black",
//     "sku": "SamsungGalaxyM1164GBBlack4GBRAM",
//     "MODEL ID": 184043,
//     "MRP": 12599,
//     "Bajaj-MOP": 10999,
//     "HappiMOP": 10999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "M115FD 4/64 - Blue",
//     "APEX-MODEL NAME": "M115FD Samsung M11 (4/64) - Blue",
//     "sku": "SamsungGalaxyM1164GBMetalicBlue4GBRAM",
//     "MODEL ID": 184042,
//     "MRP": 12599,
//     "Bajaj-MOP": 10999,
//     "HappiMOP": 10999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "V21 8/256 Blue",
//     "APEX-MODEL NAME": "V21 Vivo 8/256 - Dust Blue",
//     "sku": "VivoV215G256GBDuskBlue8GBRAM",
//     "MODEL ID": 225922,
//     "MRP": 32990,
//     "Bajaj-MOP": 32990,
//     "HappiMOP": 32990,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "V21 8/256 S Dazzle",
//     "APEX-MODEL NAME": "V21 Vivo 8/256 - Sunset Dazzle",
//     "sku": "VivoV215G256GBSunsetDazzle8GBRAM",
//     "MODEL ID": 225922,
//     "MRP": 32990,
//     "Bajaj-MOP": 32990,
//     "HappiMOP": 32990,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "Y20A 3/64 Blue",
//     "APEX-MODEL NAME": "Y20A Vivo 3/64 - Blue",
//     "sku": "VivoY20A64GBNebulaBlue3GBRam",
//     "MODEL ID": 213705,
//     "MRP": 11990,
//     "Bajaj-MOP": 11990,
//     "HappiMOP": 11990,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "Y20A 3/64 White",
//     "APEX-MODEL NAME": "Y20A Vivo 3/64 - White",
//     "sku": "VivoY20A64GBDawnWhite3GBRam",
//     "MODEL ID": 213705,
//     "MRP": 11990,
//     "Bajaj-MOP": 11990,
//     "HappiMOP": 11990,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "Y20G 4/64 Black",
//     "APEX-MODEL NAME": "Y20G Vivo 4/64 - Black",
//     "sku": "VivoY20G64GBStorageObsidiantBlack4GBRAM",
//     "MODEL ID": 233511,
//     "MRP": 13990,
//     "Bajaj-MOP": 13990,
//     "HappiMOP": 13990,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "Y20G 4/64 Blue",
//     "APEX-MODEL NAME": "Y20G Vivo 4/64 - Blue",
//     "sku": "VivoY20G64GBStoragePuristBlue4GBRAM",
//     "MODEL ID": 233511,
//     "MRP": 13990,
//     "Bajaj-MOP": 13990,
//     "HappiMOP": 13990,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "Y20G 6/128 Black",
//     "APEX-MODEL NAME": "Y20G Vivo 6/128 - Black",
//     "sku": "VivoY20G128GBObsidianBlack6GBRAM",
//     "MODEL ID": 215826,
//     "MRP": 15990,
//     "Bajaj-MOP": 15990,
//     "HappiMOP": 15990,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "Y20G 6/128 Blue",
//     "APEX-MODEL NAME": "Y20G Vivo 6/128 - Blue",
//     "sku": "VivoY20G128GBPuristBlue6GBRAM",
//     "MODEL ID": 215826,
//     "MRP": 15990,
//     "Bajaj-MOP": 15990,
//     "HappiMOP": 15990,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "Y31 6/128 Black",
//     "APEX-MODEL NAME": "Y31 Vivo 6/128 - Black",
//     "sku": "VivoY31128GBRacingBlack6GBRAM",
//     "MODEL ID": 215380,
//     "MRP": 16490,
//     "Bajaj-MOP": 16490,
//     "HappiMOP": 16490,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "Y31 6/128 Blue",
//     "APEX-MODEL NAME": "Y31 Vivo 6/128 - Blue",
//     "sku": "VivoY31128GBOceanBlue6GBRAM",
//     "MODEL ID": 215380,
//     "MRP": 16490,
//     "Bajaj-MOP": 16490,
//     "HappiMOP": 16490,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "Y51A 6/128 Symohony",
//     "APEX-MODEL NAME": "Y51A Vivo 6/128 - Cristal Symphony",
//     "sku": "VivoY51A128GBStorageCrystalSymphony6GBRAM",
//     "MODEL ID": 233633,
//     "MRP": 16990,
//     "Bajaj-MOP": 16990,
//     "HappiMOP": 16990,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "Y51A 6/128 Saphire",
//     "APEX-MODEL NAME": "Y51A Vivo 6/128 - Titanium Saphire",
//     "sku": "VivoY51A128GBStorageTitaniumSapphire6GBRAM",
//     "MODEL ID": 233633,
//     "MRP": 16990,
//     "Bajaj-MOP": 16990,
//     "HappiMOP": 16990,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "Y51A 8/128 Symphony",
//     "APEX-MODEL NAME": "Y51A Vivo 8/128 - Cristal Symphony",
//     "sku": "VivoY51A128GBCrystalSymphony8GBRAM",
//     "MODEL ID": 215379,
//     "MRP": 17990,
//     "Bajaj-MOP": 17990,
//     "HappiMOP": 17990,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "Y51A 8/128 Saphire",
//     "APEX-MODEL NAME": "Y51A Vivo 8/128 - Titanium Saphire",
//     "sku": "VivoY51A128GBTitaniumSapphire8GBRAM",
//     "MODEL ID": 215379,
//     "MRP": 17990,
//     "Bajaj-MOP": 17990,
//     "HappiMOP": 17990,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "9power 4/128 - Blue",
//     "APEX-MODEL NAME": "Redmi 9 Power (4G+128G ) - Blue",
//     "sku": "Redmi9Power128GBBlazingBlue4GBRAM",
//     "MODEL ID": 215988,
//     "MRP": 12499,
//     "Bajaj-MOP": 11999,
//     "HappiMOP": 11999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "10 ProMax 6/128 BK",
//     "APEX-MODEL NAME": "Redmi Note 10 Pro Max (6+128) - Black",
//     "sku": "RedmiNote10ProMax128GBStorageDarkNight6GBRAM",
//     "MODEL ID": 226302,
//     "MRP": 20499,
//     "Bajaj-MOP": 19999,
//     "HappiMOP": 19999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "10 ProMax 8/128 Blue",
//     "APEX-MODEL NAME": "Redmi Note 10 Pro Max (8+128) - Blue",
//     "sku": "MIRedmiNote10ProMax128GBGlacialBlue8GBRAM",
//     "MODEL ID": 222683,
//     "MRP": 22499,
//     "Bajaj-MOP": 21999,
//     "HappiMOP": 21999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "10 ProMax 8/128 Bron",
//     "APEX-MODEL NAME": "Redmi Note 10 Pro Max (8+128) - Bronze",
//     "sku": "MIRedmiNote10ProMax128GBVintageBronze8GBRAM",
//     "MODEL ID": 222682,
//     "MRP": 22499,
//     "Bajaj-MOP": 21999,
//     "HappiMOP": 21999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "2.4ds 3/64 Grey",
//     "APEX-MODEL NAME": "NOKIA 2.4  3/64 - Grey",
//     "sku": "NOKIA2464GBSTORAGECHARCOALGREY3GBRAM",
//     "MODEL ID": 211236,
//     "MRP": 10399,
//     "Bajaj-MOP": 10399,
//     "HappiMOP": 10399,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "3.4 4/64 Blue",
//     "APEX-MODEL NAME": "Nokia 3.4 4/64 Blue",
//     "sku": "NOKIA3464GBSTORAGEFJORD4GBRAM",
//     "MODEL ID": 222462,
//     "MRP": 11499,
//     "Bajaj-MOP": 11499,
//     "HappiMOP": 11499,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "5.4 DS 4/64 Blue",
//     "APEX-MODEL NAME": "Nokia 5.4 4/64 - Blue",
//     "sku": "NOKIA5464GBSTORAGEPOLARNIGHT4GBRAM",
//     "MODEL ID": 222463,
//     "MRP": 12999,
//     "Bajaj-MOP": 12999,
//     "HappiMOP": 12999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "5.4 DS 6/64 Blue",
//     "APEX-MODEL NAME": "Nokia 5.4 6/64 Blue",
//     "sku": "NOKIA5464GBSTORAGEPOLARNIGHT6GBRAM",
//     "MODEL ID": 222464,
//     "MRP": 14499,
//     "Bajaj-MOP": 14499,
//     "HappiMOP": 14499,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "C20+ 2/32 Grey",
//     "APEX-MODEL NAME": "Nokia C20 Plus DS 2/32 - Grey",
//     "sku": "NOKIAC20PLUS32GBSTORAGEGREY2GBRAM",
//     "MODEL ID": 241860,
//     "MRP": 8999,
//     "Bajaj-MOP": 8999,
//     "HappiMOP": 8999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "C20+ 3/32 Blue",
//     "APEX-MODEL NAME": "Nokia C20 Plus DS 3/32 - Blue",
//     "sku": "NOKIAC20PLUS32GBSTORAGEBLUE3GBRAM",
//     "MODEL ID": 241859,
//     "MRP": 8999,
//     "Bajaj-MOP": 8999,
//     "HappiMOP": 8999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "G20 4/64 Blue",
//     "APEX-MODEL NAME": "Nokia G20 DS 4/64 -  Blue",
//     "sku": "NOKIAG2064GBSTORAGENIGHT4GBRAM",
//     "MODEL ID": 243358,
//     "MRP": 13499,
//     "Bajaj-MOP": 13499,
//     "HappiMOP": 13499,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "8s 5G 8/129 Purple",
//     "APEX-MODEL NAME": "Realme 8s 5G 8/128 - Purple",
//     "sku": "REALME8S5G128GBSTORAGEUNIVERSEPURPLE8GBRAM",
//     "MODEL ID": 243261,
//     "MRP": 20999,
//     "Bajaj-MOP": 19999,
//     "HappiMOP": 19999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "RM 8 6/128 Silver",
//     "APEX-MODEL NAME": "REALME 8 6/128 - Silver",
//     "sku": "realme8128GBStorageCyberSilver6GBRAM",
//     "MODEL ID": 229268,
//     "MRP": 17999,
//     "Bajaj-MOP": 16999,
//     "HappiMOP": 16999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "A528BG 8/128 Black",
//     "APEX-MODEL NAME": "A528BG Samsung A52s 5G 8/128 - Black",
//     "sku": "SAMSUNGGALAXYA52S128GBSTORAGEBLACK8GBRAM",
//     "MODEL ID": 242150,
//     "MRP": 39374,
//     "Bajaj-MOP": 37499,
//     "HappiMOP": 37499,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "A528BG 8/128 Violet",
//     "APEX-MODEL NAME": "A528BG Samsung A52s 5G 8/128 - Violet",
//     "sku": "SAMSUNGGALAXYA52S128GBSTORAGELIGHTVIOLET8GBRAM",
//     "MODEL ID": 242151,
//     "MRP": 39374,
//     "Bajaj-MOP": 37499,
//     "HappiMOP": 37499,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "A528BD 6/128 White",
//     "APEX-MODEL NAME": "A528BD Samsung A52s 5G 6/128 - White",
//     "sku": "SAMSUNGGALAXYA52S128GBSTORAGEWHITE6GBRAM",
//     "MODEL ID": 242155,
//     "MRP": 37799,
//     "Bajaj-MOP": 35999,
//     "HappiMOP": 35999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "A528BG 8/128 White",
//     "APEX-MODEL NAME": "A528BG Samsung A52s 5G 8/128 - White",
//     "sku": "SAMSUNGGALAXYA52S128GBSTORAGEWHITE8GBRAM",
//     "MODEL ID": 242152,
//     "MRP": 39374,
//     "Bajaj-MOP": 37499,
//     "HappiMOP": 37499,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "A037F5 3/32 Black",
//     "APEX-MODEL NAME": "A037F5 Samsung A037S (3/32) - Black",
//     "sku": "SamsungGalaxyA03s32GBStorageBlack3GBRAMSMA037FZK5INS",
//     "MODEL ID": 240704,
//     "MRP": 11099,
//     "Bajaj-MOP": 10999,
//     "HappiMOP": 10999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "A037FD 3/32 Blue",
//     "APEX-MODEL NAME": "A037FD Samsung A037S (3/32) - Blue",
//     "sku": "SamsungGalaxyA03s32GBStorageBlue3GBRAMSMA037FZB5INS",
//     "MODEL ID": 240705,
//     "MRP": 11099,
//     "Bajaj-MOP": 10999,
//     "HappiMOP": 10999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "A037FD 3/32 White",
//     "APEX-MODEL NAME": "A037FD Samsung A037S (3/32) - White",
//     "sku": "SamsungGalaxyA03s32GBStorageWhite3GBRAM",
//     "MODEL ID": 240399,
//     "MRP": 11099,
//     "Bajaj-MOP": 10999,
//     "HappiMOP": 10999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "A037FG 4/64 White",
//     "APEX-MODEL NAME": "A037FG Samsung A037S (4/64) - White",
//     "sku": "SamsungGalaxyA03s64GBStorageWhite4GBRAM",
//     "MODEL ID": 240402,
//     "MRP": 12099,
//     "Bajaj-MOP": 11999,
//     "HappiMOP": 11999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "C30 3/32 Green",
//     "APEX-MODEL NAME": "Nokia C30 3/32 - Green",
//     "sku": "NOKIAC3032GBSTORAGEGREEN3GBRAM",
//     "MODEL ID": 246442,
//     "MRP": 10999,
//     "Bajaj-MOP": 10999,
//     "HappiMOP": 10999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "C30 3/32 White",
//     "APEX-MODEL NAME": "Nokia C30 3/32 - White",
//     "sku": "NOKIAC3032GBSTORAGEWHITE3GBRAM",
//     "MODEL ID": 246442,
//     "MRP": 10999,
//     "Bajaj-MOP": 10999,
//     "HappiMOP": 10999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "C30 4/64 Green",
//     "APEX-MODEL NAME": "Nokia C30 4/64 - Green",
//     "sku": "NOKIAC3064GBSTORAGEGREEN4GBRAM",
//     "MODEL ID": 246443,
//     "MRP": 11999,
//     "Bajaj-MOP": 11999,
//     "HappiMOP": 11999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "C30 4/64 White",
//     "APEX-MODEL NAME": "Nokia C30 4/64 - White",
//     "sku": "NOKIAC3064GBSTORAGEWHITE4GBRAM",
//     "MODEL ID": 246443,
//     "MRP": 11999,
//     "Bajaj-MOP": 11999,
//     "HappiMOP": 11999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "G20 4/64 Silver",
//     "APEX-MODEL NAME": "Nokia G20 DS 4/64 - Silver",
//     "sku": "NOKIAG2064GBSTORAGEGLACIER4GBRAM",
//     "MODEL ID": 243358,
//     "MRP": 13499,
//     "Bajaj-MOP": 13499,
//     "HappiMOP": 13499,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "10Prime 6/128 White",
//     "APEX-MODEL NAME": "Redmi 10 Prime (6G+128G) - White",
//     "sku": "REDMI10PRIME128GBSTORAGEWHITE6GBRAM",
//     "MODEL ID": 244744,
//     "MRP": 14999,
//     "Bajaj-MOP": 14499,
//     "HappiMOP": 14499,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "A325FI 8/128 Black",
//     "APEX-MODEL NAME": "A325FI Samsung A32 (8/128) - Black",
//     "sku": "SAMSUNGGALAXYA32128GBSTORAGEAWESOMEBLACK8GBRAM",
//     "MODEL ID": 249020,
//     "MRP": 25000,
//     "Bajaj-MOP": 23599,
//     "HappiMOP": 23599,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "A325FI 8/128 Blue",
//     "APEX-MODEL NAME": "A325FI Samsung A32 (8/128) - Blue",
//     "sku": "SAMSUNGGALAXYA32128GBSTORAGEAWESOMEBLUE8GBRAM",
//     "MODEL ID": 249021,
//     "MRP": 25000,
//     "Bajaj-MOP": 23599,
//     "HappiMOP": 23599,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "A515FW 6/128 Silver",
//     "APEX-MODEL NAME": "A515FW Samsung A51 (6/128) - SILVER",
//     "sku": "SamsungGalaxyA51128GBHazeCrushSilver6GBRAM",
//     "MODEL ID": 183233,
//     "MRP": 22049,
//     "Bajaj-MOP": 20999,
//     "HappiMOP": 20999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "A528BG 8/128 Mint",
//     "APEX-MODEL NAME": "A528BG Samsung A52s 5G 8/128GB - Mint",
//     "sku": "SAMSUNGGALAXYA52S128GBSTORAGEAWESOMEMINT8GBRAM",
//     "MODEL ID": 246233,
//     "MRP": 39374,
//     "Bajaj-MOP": 37499,
//     "HappiMOP": 37499,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "A528BD 6/128 Black",
//     "APEX-MODEL NAME": "A528BD Samsung A52s 5G 6/128 - Black",
//     "sku": "SAMSUNGGALAXYA52S128GBSTORAGEBLACK6GBRAM",
//     "MODEL ID": 242153,
//     "MRP": 37799,
//     "Bajaj-MOP": 35999,
//     "HappiMOP": 35999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "M325FC 6/128 Black",
//     "APEX-MODEL NAME": "M325FC Samsung M32 6/128 - Black",
//     "sku": "SamsungGalaxyM32128GBStorageBlack6GBRAM",
//     "MODEL ID": 233367,
//     "MRP": 18999,
//     "Bajaj-MOP": 16999,
//     "HappiMOP": 16999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "M325FC 6/128 Blue",
//     "APEX-MODEL NAME": "M325FC Samsung M32 6/128 - Blue",
//     "sku": "SamsungGalaxyM32128GBStorageBlue6GBRAM",
//     "MODEL ID": 233368,
//     "MRP": 18999,
//     "Bajaj-MOP": 16999,
//     "HappiMOP": 16999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "M326BI 6/128 Blue",
//     "APEX-MODEL NAME": "M326BI Samsung M32 5G 6/128 - Blue",
//     "sku": "SAMSUNGGALAXYM325G128GBSTORAGESKYBLUE6GBRAM",
//     "MODEL ID": 242158,
//     "MRP": 22049,
//     "Bajaj-MOP": 20999,
//     "HappiMOP": 20999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "M326BH 8/128 Blue",
//     "APEX-MODEL NAME": "M326BH Samsung M32 5G 8/128 - Blue",
//     "sku": "SAMSUNGGALAXYM325G128GBSTORAGESKYBLUE8GBRAM",
//     "MODEL ID": 242156,
//     "MRP": 24149,
//     "Bajaj-MOP": 22999,
//     "HappiMOP": 22999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "M326BI 6/128 Black",
//     "APEX-MODEL NAME": "M326BI Samsung M32 5G 6/128 - Black",
//     "sku": "SAMSUNGGALAXYM325G128GBSTORAGESLATEBLACK6GBRAM",
//     "MODEL ID": 242159,
//     "MRP": 22049,
//     "Bajaj-MOP": 20999,
//     "HappiMOP": 20999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "M326BH 8/128 Black",
//     "APEX-MODEL NAME": "M326BH Samsung M32 5G 8/128 - Black",
//     "sku": "SAMSUNGGALAXYM325G128GBSTORAGESLATEBLACK8GBRAM",
//     "MODEL ID": 242157,
//     "MRP": 24149,
//     "Bajaj-MOP": 22999,
//     "HappiMOP": 22999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "M526BH 6/128 Blue",
//     "APEX-MODEL NAME": "M526BH Samsung M52 5G 6/128 - Blue",
//     "sku": "SAMSUNGGALAXYM525G128GBSTORAGEICYBLUE6GBRAM",
//     "MODEL ID": 244930,
//     "MRP": 31499,
//     "Bajaj-MOP": 29999,
//     "HappiMOP": 29999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "M526BI 8/128 Blue",
//     "APEX-MODEL NAME": "M526BI Samsung M52 5G 8/128 - Blue",
//     "sku": "SAMSUNGGALAXYM525G128GBSTORAGEICYBLUE8GBRAM",
//     "MODEL ID": 244932,
//     "MRP": 33599,
//     "Bajaj-MOP": 31999,
//     "HappiMOP": 31999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "F711BA Cream",
//     "APEX-MODEL NAME": "F711BA Galaxy Z Flip 3 8/128 - Cream",
//     "sku": "SAMSUNGGALAXYZFLIP35G128GBSTORAGECREAM8GBRAM",
//     "MODEL ID": 248513,
//     "MRP": 100000,
//     "Bajaj-MOP": 84999,
//     "HappiMOP": 84999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "F711BA Black",
//     "APEX-MODEL NAME": "F711BA Galaxy Z Flip 3 8/128 - Black",
//     "sku": "SAMSUNGGALAXYZFLIP35G256GBSTORAGEBLACK8GBRAM",
//     "MODEL ID": 248516,
//     "MRP": 100000,
//     "Bajaj-MOP": 84999,
//     "HappiMOP": 84999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "X70Pro 12/256 Cosmic",
//     "APEX-MODEL NAME": "X70Pro Vivo 12/256 - Cosmic Black",
//     "sku": "VIVOX70PRO256GBSTORAGECOSMICBLACK12GBRAMSMARTPHONE",
//     "MODEL ID": 244947,
//     "MRP": 52990,
//     "Bajaj-MOP": 52990,
//     "HappiMOP": 52990,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "Y21T 4/128 Blue",
//     "APEX-MODEL NAME": "Y21T (4+128) - Midnight Blue",
//     "sku": "VIVOY21T128GBSTORAGEMIDNIGHTBLUE4GBRAM",
//     "MODEL ID": 256191,
//     "MRP": 16490,
//     "Bajaj-MOP": 16490,
//     "HappiMOP": 16490,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "Y21T 4/128 White",
//     "APEX-MODEL NAME": "Y21T (4+128) - Pearl White",
//     "sku": "VIVOY21T128GBSTORAGEPEARLWHITE4GBRAM",
//     "MODEL ID": 256191,
//     "MRP": 16490,
//     "Bajaj-MOP": 16490,
//     "HappiMOP": 16490,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "11i 8/128 Black",
//     "APEX-MODEL NAME": "Xiaomi 11i (8G+128G) - Black",
//     "sku": "MI11I128GBSTORAGESTEALTHBLACK8GBRAM",
//     "MODEL ID": 256747,
//     "MRP": 27499,
//     "Bajaj-MOP": 26999,
//     "HappiMOP": 26999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "11i HC 6/128 Green",
//     "APEX-MODEL NAME": "Xiaomi 11i Hypercharge (6G+128G) - Green",
//     "sku": "MI11IHYPERCHARGE128GBSTORAGECAMOGREEN6GBRAM",
//     "MODEL ID": 256736,
//     "MRP": 27499,
//     "Bajaj-MOP": 26999,
//     "HappiMOP": 26999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "11i HC 8/128 Green",
//     "APEX-MODEL NAME": "Xiaomi 11i Hypercharge (8G+128G) - Green",
//     "sku": "MI11IHYPERCHARGE128GBSTORAGECAMOGREEN8GBRAM",
//     "MODEL ID": 256741,
//     "MRP": 29499,
//     "Bajaj-MOP": 28999,
//     "HappiMOP": 28999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "11i HC 8/128 Pearl",
//     "APEX-MODEL NAME": "Xiaomi 11i Hypercharge (8G+128G) - Pearl",
//     "sku": "MI11IHYPERCHARGE128GBSTORAGEPACIFICPEARL8GBRAM",
//     "MODEL ID": 256742,
//     "MRP": 29499,
//     "Bajaj-MOP": 28999,
//     "HappiMOP": 28999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "11i HC 6/128 Mist",
//     "APEX-MODEL NAME": "Xiaomi 11i Hypercharge (6G+128G) - Mist",
//     "sku": "MI11IHYPERCHARGE128GBSTORAGEPURPLEMIST6GBRAM",
//     "MODEL ID": 256735,
//     "MRP": 27499,
//     "Bajaj-MOP": 26999,
//     "HappiMOP": 26999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "11i HC 6/128 Black",
//     "APEX-MODEL NAME": "Xiaomi 11i Hypercharge (6G+128G) - Black",
//     "sku": "MI11IHYPERCHARGE128GBSTORAGESTEALTHBLACK6GBRAM",
//     "MODEL ID": 256738,
//     "MRP": 27499,
//     "Bajaj-MOP": 26999,
//     "HappiMOP": 26999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "11i HC 8/128 Black",
//     "APEX-MODEL NAME": "Xiaomi 11i Hypercharge (8G+128G) - Black",
//     "sku": "MI11IHYPERCHARGE128GBSTORAGESTEALTHBLACK8GBRAM",
//     "MODEL ID": 256739,
//     "MRP": 29499,
//     "Bajaj-MOP": 28999,
//     "HappiMOP": 28999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "11Lite NE 8/128 Cora",
//     "APEX-MODEL NAME": "Mi 11 Lite NE 5G (8G+128G) - Coral",
//     "sku": "MI11LITENE5G128GBSTORAGETUSCANYCORAL8GBRAM",
//     "MODEL ID": 244740,
//     "MRP": 29499,
//     "Bajaj-MOP": 28999,
//     "HappiMOP": 28999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "11Lite NE 8/128 Blac",
//     "APEX-MODEL NAME": "Mi 11 Lite NE 5G (8G+128G) - Black",
//     "sku": "MI11LITENE5G128GBSTORAGEVINYLBLACK8GBRAM",
//     "MODEL ID": 244743,
//     "MRP": 29499,
//     "Bajaj-MOP": 28999,
//     "HappiMOP": 28999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "Note 10s 6/128 Blue",
//     "APEX-MODEL NAME": "Redmi Note 10s (6+128) - Blue",
//     "sku": "RedmiNote10S128GBStorageDeepSeaBlue6GBRAM",
//     "MODEL ID": 234038,
//     "MRP": 16999,
//     "Bajaj-MOP": 16499,
//     "HappiMOP": 16499,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "Note 10s 8/128 White",
//     "APEX-MODEL NAME": "Redmi Note 10s (8+128) - White",
//     "sku": "REDMINOTE10S128GBSTORAGEFROSTWHITE8GBRAM",
//     "MODEL ID": 252521,
//     "MRP": 18999,
//     "Bajaj-MOP": 18499,
//     "HappiMOP": 18499,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "11T 6/128 White",
//     "APEX-MODEL NAME": "Redmi Note 11T 5G (6G+128G) - White",
//     "sku": "REDMINOTE11T5G128GBSTORAGEAQUAMARINEBLUE6GBRAM",
//     "MODEL ID": 252419,
//     "MRP": 18499,
//     "Bajaj-MOP": 17999,
//     "HappiMOP": 17999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "11T 8/128 Blue",
//     "APEX-MODEL NAME": "Redmi Note 11T 5G (8G+128G) - Blue",
//     "sku": "REDMINOTE11T5G128GBSTORAGEAQUAMARINEBLUE8GBRAM",
//     "MODEL ID": 252422,
//     "MRP": 20499,
//     "Bajaj-MOP": 19999,
//     "HappiMOP": 19999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "11T 8/128 Black",
//     "APEX-MODEL NAME": "Redmi Note 11T 5G (8G+128G) - Black",
//     "sku": "REDMINOTE11T5G128GBSTORAGEMATTEBLACK8GBRAM",
//     "MODEL ID": 252424,
//     "MRP": 20499,
//     "Bajaj-MOP": 19999,
//     "HappiMOP": 19999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "32HDX7XPRO",
//     "APEX-MODEL NAME": "KODAK LED TV - 32HDX7XPRO",
//     "sku": "KODAK81CM32INCHHDREADYLEDSMARTTVBLACK32HDX7XPROBL",
//     "MODEL ID": 238622,
//     "MRP": 16990,
//     "Bajaj-MOP": 13999,
//     "HappiMOP": 13999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "4A 40",
//     "APEX-MODEL NAME": "MI TV 4A 40 INCH",
//     "sku": "MI100cm40InchFullHDLEDSmartTVBlackL40M55AIN",
//     "MODEL ID": 222684,
//     "MRP": 24999,
//     "Bajaj-MOP": 23999,
//     "HappiMOP": 23999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "4X 43",
//     "APEX-MODEL NAME": "MI TV 4X 43 INCH",
//     "sku": "Mi108cm43Inch4KUltraHDLEDSmartTVBlackL43M44AIN",
//     "MODEL ID": 206748,
//     "MRP": 29999,
//     "Bajaj-MOP": 29999,
//     "HappiMOP": 29999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "43 4A",
//     "APEX-MODEL NAME": "Mi TV 4A 43 Inch ( Horizon Edition)",
//     "sku": "Mi108cm43InchFullHDLEDSmartTVBlack4AHorizon43",
//     "MODEL ID": 206411,
//     "MRP": 28999,
//     "Bajaj-MOP": 27999,
//     "HappiMOP": 27999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "4A PRO 43",
//     "APEX-MODEL NAME": "MI TV 4A PRO 43INC",
//     "sku": "Mi108cm43inchFullHDLEDSmartTVBlack4APromfr",
//     "MODEL ID": 154901,
//     "MRP": 27999,
//     "Bajaj-MOP": 26999,
//     "HappiMOP": 26999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "4X 50",
//     "APEX-MODEL NAME": "MI TV 4X 50 INCH",
//     "sku": "Mi1257cm50Inch4KUltraHDLEDSmartTVBlackL50M55AIN",
//     "MODEL ID": 206749,
//     "MRP": 38999,
//     "Bajaj-MOP": 38999,
//     "HappiMOP": 38999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "5X 50 Inch",
//     "APEX-MODEL NAME": "Xiaomi TV 5X 50\" 125.7cm",
//     "sku": "MI1257CM50INCHULTRAHD4KLEDSMARTTVBLACK5X50",
//     "MODEL ID": 242661,
//     "MRP": 42999,
//     "Bajaj-MOP": 41999,
//     "HappiMOP": 41999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "Redmi X50",
//     "APEX-MODEL NAME": "Redmi Smart TV X50 125.7 cm (50)",
//     "sku": "Mi126cm50Inch4KUltraHDLEDSmartTVBlackL50M6RA",
//     "MODEL ID": 222687,
//     "MRP": 39999,
//     "Bajaj-MOP": 38999,
//     "HappiMOP": 38999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "4X55 INCH TV",
//     "APEX-MODEL NAME": "MI 4X 55 INCH TV ;L55M5-5XIN",
//     "sku": "Mi1388cm55Inch4KUltraHDLEDSmartTVBlackL55M55XIN",
//     "MODEL ID": 206751,
//     "MRP": 44999,
//     "Bajaj-MOP": 44999,
//     "HappiMOP": 44999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "Redmi X55",
//     "APEX-MODEL NAME": "Redmi Smart TV X55 138.8cm (55)",
//     "sku": "Mi1388cm55Inch4KUltraHDLEDSmartTVBlackL55M6RA",
//     "MODEL ID": 222688,
//     "MRP": 46999,
//     "Bajaj-MOP": 45999,
//     "HappiMOP": 45999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "Q1 55",
//     "APEX-MODEL NAME": "Mi TV Q1 138.8cm (55)",
//     "sku": "Mi139cm55InchUltraHD4KLEDSmartTVBlackMiTVQ155",
//     "MODEL ID": 211757,
//     "MRP": 59999,
//     "Bajaj-MOP": 59999,
//     "HappiMOP": 59999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "4A PRO 32",
//     "APEX-MODEL NAME": "MI TV 4A PRO 32 INCH",
//     "sku": "Mi80cm32InchHDReadyLEDSmartTV4APro",
//     "MODEL ID": 226306,
//     "MRP": 17499,
//     "Bajaj-MOP": 16999,
//     "HappiMOP": 16999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "32 4A",
//     "APEX-MODEL NAME": "Mi TV 4A 80cm (32)BZ (Horizon) Edition",
//     "sku": "Mi80cm32InchHDReadyLEDSmartTVHorizonGrey4A",
//     "MODEL ID": 226309,
//     "MRP": 17999,
//     "Bajaj-MOP": 17499,
//     "HappiMOP": 17499,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "55U1S",
//     "APEX-MODEL NAME": "OnePlus TV U1S Series 55U1S Smart TV",
//     "sku": "OnePlus139cm55Inch4KUltraHDLEDSmartTVBlack55UC1A00",
//     "MODEL ID": 235199,
//     "MRP": 50999,
//     "Bajaj-MOP": 50999,
//     "HappiMOP": 50999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "32Y",
//     "APEX-MODEL NAME": "ONEPLUS TV 32\"Y Series",
//     "sku": "Oneplus80cm32InchHDReadyLEDSmartTVBlack32Y1",
//     "MODEL ID": 235196,
//     "MRP": 18999,
//     "Bajaj-MOP": 18999,
//     "HappiMOP": 18999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "RM 43",
//     "APEX-MODEL NAME": "Realme Smart TV 43inch",
//     "sku": "Realme108cm43inchHDReadyLEDSmartAndroidTVBlackTV43",
//     "MODEL ID": 221869,
//     "MRP": 26999,
//     "Bajaj-MOP": 26999,
//     "HappiMOP": 26999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "RM 55",
//     "APEX-MODEL NAME": "Realme Smart TV 55inch",
//     "sku": "Realme139cm55Inch4KUltraHDLEDSmartTVBlackRMV2001SLEDTV55",
//     "MODEL ID": 221871,
//     "MRP": 46999,
//     "Bajaj-MOP": 46999,
//     "HappiMOP": 46999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "RM 32",
//     "APEX-MODEL NAME": "Realme TV 32 inch",
//     "sku": "Realme80cm32inchHDReadyLEDSmartAndroidTVBlackTV32",
//     "MODEL ID": 221870,
//     "MRP": 16999,
//     "Bajaj-MOP": 16999,
//     "HappiMOP": 16999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "RMV2003",
//     "APEX-MODEL NAME": "REALME Smart FHD 32 Inch TV",
//     "sku": "REALME81CM32INCHFULLHDLEDSMARTTVBLACKSMARTTVFULLHD80CM32",
//     "MODEL ID": 233728,
//     "MRP": 18999,
//     "Bajaj-MOP": 18999,
//     "HappiMOP": 18999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "RMP2102 3/32 Grey",
//     "APEX-MODEL NAME": "Realme Tablet LTE 3+32GB [RMP2102] - Grey",
//     "sku": "REALMEPAD32GBSTORAGEGREY3GBRAM",
//     "MODEL ID": 244732,
//     "MRP": 15999,
//     "Bajaj-MOP": 15999,
//     "HappiMOP": 15999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "RMP2102 4/64 Gold",
//     "APEX-MODEL NAME": "Realme Tablet LTE 4+64GB [RMP2102] - Gold",
//     "sku": "REALMEPAD64GBSTORAGEGOLD4GBRAM",
//     "MODEL ID": 244735,
//     "MRP": 17999,
//     "Bajaj-MOP": 17999,
//     "HappiMOP": 17999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "RMP2102 4/64 Grey",
//     "APEX-MODEL NAME": "Realme Tablet LTE 4+64GB [RMP2102] - Grey",
//     "sku": "REALMEPAD64GBSTORAGEGREY4GBRAM",
//     "MODEL ID": 244734,
//     "MRP": 17999,
//     "Bajaj-MOP": 17999,
//     "HappiMOP": 17999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "T505 3/32 Gold",
//     "APEX-MODEL NAME": "T505 Tab A7 10.4 (Wi-Fi + LTE) - Gold",
//     "sku": "SamsungGalaxyTabA7LTE32GBGold3GBRAM",
//     "MODEL ID": 215830,
//     "MRP": 23099,
//     "Bajaj-MOP": 21999,
//     "HappiMOP": 21999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "T505 3/32 Grey",
//     "APEX-MODEL NAME": "T505 Tab A7 10.4 (Wi-Fi + LTE) - Grey",
//     "sku": "SamsungGalaxyTabA7LTE32GBGray3GBRAM",
//     "MODEL ID": 215831,
//     "MRP": 23099,
//     "Bajaj-MOP": 21999,
//     "HappiMOP": 21999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "T505 3/32 Silver",
//     "APEX-MODEL NAME": "T505 Tab A7 10.4 (Wi-Fi + LTE) - Silver",
//     "sku": "SamsungGalaxyTabA7LTE32GBSilver3GBRAM",
//     "MODEL ID": 215832,
//     "MRP": 23099,
//     "Bajaj-MOP": 21999,
//     "HappiMOP": 21999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "T975 S7+ Black",
//     "APEX-MODEL NAME": "T975 Tab S7+ LTE - Black",
//     "sku": "SamsungGalaxyTabS7PlusLTE128GBMysticBlack6GBRAM",
//     "MODEL ID": 191222,
//     "MRP": 83999,
//     "Bajaj-MOP": 76999,
//     "HappiMOP": 76999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "T975 S7+ Bronze",
//     "APEX-MODEL NAME": "T975 Tab S7+ LTE - Bronze",
//     "sku": "SamsungGalaxyTabS7PlusLTE128GBMysticBronze6GBRAM",
//     "MODEL ID": 191223,
//     "MRP": 83999,
//     "Bajaj-MOP": 76999,
//     "HappiMOP": 76999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "T975 S7+ Silver",
//     "APEX-MODEL NAME": "T975 Tab S7+ LTE - Silver",
//     "sku": "SamsungGalaxyTabS7PlusLTE128GBMysticSilver6GBRAM",
//     "MODEL ID": 191224,
//     "MRP": 83999,
//     "Bajaj-MOP": 79999,
//     "HappiMOP": 79999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "IND3202ST",
//     "APEX-MODEL NAME": "Treeview LED 32 - IND3202ST",
//     "sku": "Treeview81cm32InchHDReadyLEDSmartTVBlackIND3202ST",
//     "MODEL ID": 191346,
//     "MRP": 15990,
//     "Bajaj-MOP": 15990,
//     "HappiMOP": 15990,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "Reno7Pro 12/256 Blue",
//     "APEX-MODEL NAME": "Reno 7 Pro Oppo 12/256 - Blue",
//     "sku": "OPPORENO7PRO5G256GBSTORAGESTARTRAILSBLUE12GBRAM",
//     "MODEL ID": 261680,
//     "MRP": 39999,
//     "Bajaj-MOP": 39999,
//     "HappiMOP": 39999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "Reno7Pro 12/256 Blac",
//     "APEX-MODEL NAME": "Reno 7 Pro Oppo 12/256 - Black",
//     "sku": "OPPORENO7PRO5G256GBSTORAGESTARLIGHTBLACK12GBRAM",
//     "MODEL ID": 261680,
//     "MRP": 39999,
//     "Bajaj-MOP": 39999,
//     "HappiMOP": 39999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "A16K 4/64 Black",
//     "APEX-MODEL NAME": "A16K Oppo 4/64 - Black",
//     "sku": "OPPOA16K64GBSTORAGEMYSTERYBLACK4GBRAM",
//     "MODEL ID": 261681,
//     "MRP": 11990,
//     "Bajaj-MOP": 11990,
//     "HappiMOP": 11990,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "A16K 4/64 White",
//     "APEX-MODEL NAME": "A16K Oppo 4/64 - White",
//     "sku": "OPPOA16K64GBSTORAGEWHITE4GBRAM",
//     "MODEL ID": 261681,
//     "MRP": 11990,
//     "Bajaj-MOP": 11990,
//     "HappiMOP": 11990,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "9i 6/128 Black",
//     "APEX-MODEL NAME": "Realme 9i 6/128 - Black",
//     "sku": "REALME9I128GBSTORAGEPRISMBLACK6GBRAM",
//     "MODEL ID": 258882,
//     "MRP": 16999,
//     "Bajaj-MOP": 15999,
//     "HappiMOP": 15999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "9i 6/128 Blue",
//     "APEX-MODEL NAME": "Realme 9i 6/128 - Blue",
//     "sku": "REALME9I128GBSTORAGEPRISMBLUE6GBRAM",
//     "MODEL ID": 258881,
//     "MRP": 16999,
//     "Bajaj-MOP": 15999,
//     "HappiMOP": 15999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "RM 9Pro 8/128 Green",
//     "APEX-MODEL NAME": "Realme 9 Pro 8/128 - Green",
//     "sku": "REALME9PRO5G128GBSTORAGEAURORAGREEN8GBRAM",
//     "MODEL ID": 263668,
//     "MRP": 21999,
//     "Bajaj-MOP": 20999,
//     "HappiMOP": 20999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "RM 9Pro 8/128 Black",
//     "APEX-MODEL NAME": "Realme 9 Pro 8/128 - Black",
//     "sku": "REALME9PRO5G128GBSTORAGEMIDNIGHTBLACK8GBRAM",
//     "MODEL ID": 263666,
//     "MRP": 21999,
//     "Bajaj-MOP": 20999,
//     "HappiMOP": 20999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "RM 9Pro+ 8/128 Green",
//     "APEX-MODEL NAME": "Realme 9 Pro+ 8/128 - Green",
//     "sku": "REALME9PROPLUS5G128GBSTORAGEAURORAGREEN8GBRAM",
//     "MODEL ID": 263662,
//     "MRP": 27999,
//     "Bajaj-MOP": 26999,
//     "HappiMOP": 26999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "RM 9Pro+ 8/128 Black",
//     "APEX-MODEL NAME": "Realme 9 Pro+ 8/128 - Black",
//     "sku": "REALME9PROPLUS5G128GBSTORAGEMIDNIGHTBLACK8GBRAM",
//     "MODEL ID": 263661,
//     "MRP": 27999,
//     "Bajaj-MOP": 26999,
//     "HappiMOP": 26999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "RM 9Pro 6/128 Green",
//     "APEX-MODEL NAME": "Realme 9 Pro 6/128 - Green",
//     "sku": "REALME9PRO5G128GBSTORAGEAURORAGREEN6GBRAM",
//     "MODEL ID": 263656,
//     "MRP": 18999,
//     "Bajaj-MOP": 17999,
//     "HappiMOP": 17999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "RM 9Pro 6/128 Blue",
//     "APEX-MODEL NAME": "Realme 9 Pro 6/128 - Blue",
//     "sku": "REALME9PRO5G128GBSTORAGESUNRISEBLUE6GBRAM",
//     "MODEL ID": 263655,
//     "MRP": 18999,
//     "Bajaj-MOP": 17999,
//     "HappiMOP": 17999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "RM 9Pro 6/128 Black",
//     "APEX-MODEL NAME": "Realme 9 Pro 6/128 - Black",
//     "sku": "REALME9PRO5G128GBSTORAGEMIDNIGHTBLACK6GBRAM",
//     "MODEL ID": 263654,
//     "MRP": 18999,
//     "Bajaj-MOP": 17999,
//     "HappiMOP": 17999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "Y21A 4/64 Blue",
//     "APEX-MODEL NAME": "Y21A Vivo 4/64 - Midnight Blue",
//     "sku": "VIVOY21A64GBSTORAGEMIDNIGHTBLUE4GBRAM",
//     "MODEL ID": 258486,
//     "MRP": 13990,
//     "Bajaj-MOP": 13990,
//     "HappiMOP": 13990,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "Y21A 4/64 Glow",
//     "APEX-MODEL NAME": "Y21A Vivo 4/64 - Diamond Glow",
//     "sku": "VIVOY21A64GBSTORAGEDIAMONDGLOW4GBRAM",
//     "MODEL ID": 258486,
//     "MRP": 13990,
//     "Bajaj-MOP": 13990,
//     "HappiMOP": 13990,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "Y21e 3/64 Blue",
//     "APEX-MODEL NAME": "Y21e VIVO 3/64 - Midnight Blue",
//     "sku": "VIVOY21E64GBSTORAGEMIDNIGHTBLUE3GBRAM",
//     "MODEL ID": 256753,
//     "MRP": 12990,
//     "Bajaj-MOP": 12990,
//     "HappiMOP": 12990,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "Y21e 3/64 Glow",
//     "APEX-MODEL NAME": "Y21e VIVO 3/64 - Diamond Glow",
//     "sku": "VIVOY21E64GBSTORAGEDIAMONDGLOW3GBRAM",
//     "MODEL ID": 256753,
//     "MRP": 12990,
//     "Bajaj-MOP": 12990,
//     "HappiMOP": 12990,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "V23e 8/128 Gold",
//     "APEX-MODEL NAME": "V23e 5G Vivo 8/128 - Sunshine Gold",
//     "sku": "VIVOV23E5G128GBSTORAGESUNSHINEGOLD8GBRAM",
//     "MODEL ID": 263545,
//     "MRP": 25990,
//     "Bajaj-MOP": 25990,
//     "HappiMOP": 25990,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "V23e 8/128 Blue",
//     "APEX-MODEL NAME": "V23e 5G Vivo 8/128 - Midnight Blue",
//     "sku": "VIVOV23E5G128GBSTORAGEMIDNIGHTBLUE8GBRAM",
//     "MODEL ID": 263545,
//     "MRP": 25990,
//     "Bajaj-MOP": 25990,
//     "HappiMOP": 25990,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "S908EG Burgundy",
//     "APEX-MODEL NAME": "S908EG S22 Ultra (12/256GB) - Burgundy",
//     "sku": "SAMSUNGGALAXYS22ULTRA5G256GBSTORAGEBURGUNDY12GBRAM",
//     "MODEL ID": 264789,
//     "MRP": 115499,
//     "Bajaj-MOP": 109999,
//     "HappiMOP": 109999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "D560365WIN9B",
//     "APEX-MODEL NAME": "Dell i3-10th Gen 1005G1/ 8GB / 1TB HDD  / 15.6\" FHD (D560365WIN9B)",
//     "sku": "DELLINSPIRION3501INTELCOREI310THGEN8GBRAM1TBHDDWINDOWS10HOME156INCHLAPTOPACCENTBLACKD560365WIN9B",
//     "MODEL ID": 227933,
//     "MRP": 41999,
//     "Bajaj-MOP": 41999,
//     "HappiMOP": 41999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "D560509WIN9S",
//     "APEX-MODEL NAME": "Dell i5-1135G7 | 8GB DDR4 | 512GB SSD (D560509WIN9S)",
//     "sku": "DELLINSPIRON153000INTELCOREI511THGEN8GBRAM512GBSSDWINDOWS10156INCHLAPTOPPLATINUMSILVERD560509WIN9S",
//     "MODEL ID": 243339,
//     "MRP": 58099,
//     "Bajaj-MOP": 58099,
//     "HappiMOP": 58099,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "D560504WIN9S",
//     "APEX-MODEL NAME": "Dell i5-1135G7 / 8GB / 1TB HDD + 256GB SSD /15.6\" FHD SLV (D560504WIN9S)",
//     "sku": "DELLINSPIRON153511INTELCOREI511THGEN8GBRAM1TBHDD256GBSSDWINDOWS10156INCHLAPTOPSOFTMINTD560504WIN9S",
//     "MODEL ID": 241848,
//     "MRP": 61217,
//     "Bajaj-MOP": 59099,
//     "HappiMOP": 59099,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "D560503WIN9B",
//     "APEX-MODEL NAME": "Dell i5-1135G7 / 8GB / 1TB HDD + 256GB SSD /15.6\" FHD Carbonn(D560503WIN9B)",
//     "sku": "DELLINSPIRON3511INTELCOREI510THGEN8GBRAM1TBHDD256GBSSDWINDOWS10156INCHLAPTOPBLACKD560503WIN9B",
//     "MODEL ID": 241847,
//     "MRP": 56399,
//     "Bajaj-MOP": 56399,
//     "HappiMOP": 56399,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "D560587WIN9S",
//     "APEX-MODEL NAME": "Dell i5-1135G7 | 16GB DDR4 | 512GB SSD (D560587WIN9S)",
//     "sku": "DELLINSPIRON3511INTELCOREI511THGEN16GBRAM512GBSSDWINDOWS10156INCHLAPTOPPLATINUMSILVERD560587WIN9S",
//     "MODEL ID": 243337,
//     "MRP": 67269,
//     "Bajaj-MOP": 62249,
//     "HappiMOP": 62249,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "D560673WIN9S",
//     "APEX-MODEL NAME": "DELL 3511 i5 1135G7 8/1TB+256/2GB/WIN10 SLV(D560673WIN9S)",
//     "sku": "DELLINSPIRON3511INTELCOREI511THGEN8GBRAM1TBHDD256GBSSDWINDOWS10HOME156INCHLAPTOPSILVERD560673WIN9S",
//     "MODEL ID": 244469,
//     "MRP": 67988,
//     "Bajaj-MOP": 64999,
//     "HappiMOP": 64999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "D560568WIN9S",
//     "APEX-MODEL NAME": "DELL i3-1115G4/ 8GB / 1TB HDD  / 15.6\" FHD |SLV(D560568WIN9S)",
//     "sku": "DELLINTELCOREI311THGEN8GBRAM1TBHDDWINDOWS10156INCHLAPTOPPLATINUMSILVERD560568WIN9S",
//     "MODEL ID": 243350,
//     "MRP": 42899,
//     "Bajaj-MOP": 42899,
//     "HappiMOP": 42899,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "81WE01M8IN",
//     "APEX-MODEL NAME": "IP Slim 3| i3-10th Gen/8GB/256GB SSD| 15.6\" FHD/Win 11+MSO (81WE01M8IN)",
//     "sku": "LENOVOIDEAPAD3INTELCOREI310THGEN8GBRAM256GBSSDWINDOWS10156INCHLAPTOPPLATINUMGREY81WE01M8IN",
//     "MODEL ID": 244654,
//     "MRP": 55890,
//     "Bajaj-MOP": 44712,
//     "HappiMOP": 38999,
//     "Difference": -5713
//   },
//   {
//     "APEXModelCode": "82K100MVIN",
//     "APEX-MODEL NAME": "NB PC IP-G3 I5 Win 10 8G 512GB SSD 4GB GTX 1650 GFX 39.6cms (15.6) Black (82K100MVIN)",
//     "sku": "LENOVOIDEAPADGAMING3INTELCOREI511THGEN8GBRAM512GBSSDWINDOWS10HOME156INCHLAPTOPSHADOWBLACK82K100MVIN",
//     "MODEL ID": 244058,
//     "MRP": 93690,
//     "Bajaj-MOP": 74952,
//     "HappiMOP": 65499,
//     "Difference": -9453
//   },
//   {
//     "APEXModelCode": "D560627WIN9S",
//     "APEX-MODEL NAME": "Dell i5 -1155G7| 8GBRam|512GB|14.0\" |Win 11+MSO /touch(D560627WIN9S)",
//     "sku": "DELLINSPIRON14INTELCOREI511THGEN8GBRAM512GBSSDWINDOWS11HOME14INCHLAPTOPPLATINUMSILVERD560627WIN9S",
//     "MODEL ID": 248983,
//     "MRP": 72944,
//     "Bajaj-MOP": 69599,
//     "HappiMOP": 69599,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "D560679WIN9B",
//     "APEX-MODEL NAME": "i3-1115G4/ 8GB / 256GB SSD  / 15.6\" FHD / Win 10 + MSO(D560679WIN9B)",
//     "sku": "DELLINSPIRON3501INTELCOREI311THGEN8GBRAM256GBSSDWINDOWS11HOME156INCHLAPTOPQUERYBLUED560679WIN9B",
//     "MODEL ID": 246343,
//     "MRP": 44444,
//     "Bajaj-MOP": 42999,
//     "HappiMOP": 42999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "D560505WIN9S",
//     "APEX-MODEL NAME": "Dell i5-1135G7 / 8GB / 1TB HDD + 256GB SSD / 15.6\" FHD / 2GB MX350  (D560505WIN9S)",
//     "sku": "DELLINSPIRON3511INTELCOREI511THGEN8GBRAM1TBHDD256GBSSDWINDOWS10156INCHLAPTOPPLATINUMSILVERD560505WIN9S",
//     "MODEL ID": 244469,
//     "MRP": 67988,
//     "Bajaj-MOP": 64999,
//     "HappiMOP": 64999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "D560631WIN9S",
//     "APEX-MODEL NAME": "Dell i5 -1155G7| 8GBRam|512GB| | NVIDIA® GEFORCE® MX350 2GB GDDR5| 14.0\" |Win 11+MSO /touch(D560631WIN9S)",
//     "sku": "DELLINSPIRONINTELCOREI511THGEN8GBRAM512GBHDD512GBSSDWINDOWS11HOME14INCHLAPTOPPLATINUMSILVERD560631WIN9S",
//     "MODEL ID": 249128,
//     "MRP": 80403,
//     "Bajaj-MOP": 76999,
//     "HappiMOP": 76999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "81WB0190IN",
//     "APEX-MODEL NAME": "IP-Slim3| I5-11th Gen/ 8GB/512GB SSD/ 15.6\"FHD/Win 10+MSO | NVIDIA GeForce MX330 2GB GDDR5| Win 11 +MSO(81WB0190IN)",
//     "sku": "LENOVOIDEAPAD3INTELCOREI510THGEN8GBRAM512GBSSDWINDOWS10HOME156INCHLAPTOPPLATINUMGREY81WB0190IN",
//     "MODEL ID": 244038,
//     "MRP": 76890,
//     "Bajaj-MOP": 61512,
//     "HappiMOP": 54999,
//     "Difference": -6513
//   },
//   {
//     "APEXModelCode": "82H801LJIN",
//     "APEX-MODEL NAME": "IP Slim 3| i3-11th Gen/8GB/512GB SSD| 15.6\" FHD/Win 11+MSO(82H801LJIN)",
//     "sku": "LENOVOSLIM3INTELCOREI311THGEN8GBRAM512GBSSDWINDOWS1114INCHLAPTOPARCTICGREY82H801LJIN",
//     "MODEL ID": 244268,
//     "MRP": 60000,
//     "Bajaj-MOP": 48000,
//     "HappiMOP": 42999,
//     "Difference": -5001
//   },
//   {
//     "APEXModelCode": "32HDX7XPRO",
//     "APEX-MODEL NAME": "KODAK LED TV - 32HDX7XPRO",
//     "sku": "KODAK81CM32INCHHDREADYLEDSMARTTVBLACK32HDX7XPROBL",
//     "MODEL ID": 238622,
//     "MRP": 16990,
//     "Bajaj-MOP": 13999,
//     "HappiMOP": 13999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "82FG010AIN",
//     "APEX-MODEL NAME": "NB PC IP-Slim5 I5 WIN 10 8G 1TB+256GB SSD Off 19 H&S 2GB GFX 39.6cms (15.6) Graphite Grey - Lenovo",
//     "sku": "LenovoIdeaPad5IntelCorei511thGen8GBRAM1TBHDD256GBSSDWindows10Home156InchesLaptopGraphiteGrey82FG010AIN",
//     "MODEL ID": 222391,
//     "MRP": 103490,
//     "Bajaj-MOP": 82792,
//     "HappiMOP": 69999,
//     "Difference": -12793
//   },
//   {
//     "APEXModelCode": "82L3009LIN",
//     "APEX-MODEL NAME": "NB PC IP Slim5 Pro I5 16GB 512GB SSD Win 10 OFFICE H&S Storm Grey - Lenovo",
//     "sku": "LENOVOIDEAPAD5PROINTELCOREI511THGEN16GBRAM512GBSSDWINDOWS10HOME14INCHLAPTOPSTORMGREY14ITL6",
//     "MODEL ID": 225955,
//     "MRP": 104890,
//     "Bajaj-MOP": 83912,
//     "HappiMOP": 74999,
//     "Difference": -8913
//   },
//   {
//     "APEXModelCode": "82H801CSIN",
//     "APEX-MODEL NAME": "NB PC IP-Slim3 I5 WIN 10 8G 256GB SSD Off 19 H&S 39.6cms (15.6) Arctic Grey - Lenovo",
//     "sku": "LenovoIdeapadSlim3i2021IntelCorei511thGen8GBRAM512GBSSDWindows10Home156InchesLaptopArcticGreySlim315ITL6",
//     "MODEL ID": 233691,
//     "MRP": 75490,
//     "Bajaj-MOP": 60392,
//     "HappiMOP": 54499,
//     "Difference": -5893
//   },
//   {
//     "APEXModelCode": "82H801KEIN",
//     "APEX-MODEL NAME": "NB PC IP Slim 3i(2021)| i5 8GB+512GB| 15.6\" FHD - 82H801KEIN",
//     "sku": "LENOVOIDEAPADSLIM3IINTELCOREI511THGEN8GBRAM512GBSSDWINDOWS10HOME156INCHLAPTOPGREY82H801KEIN",
//     "MODEL ID": 244039,
//     "MRP": 88990,
//     "Bajaj-MOP": 71192,
//     "HappiMOP": 56599,
//     "Difference": -14593
//   },
//   {
//     "APEXModelCode": "81WA00K1IN",
//     "APEX-MODEL NAME": "Laptop Lenovo IP3 81WA00K1IN (i3 - 10110U/8GB Ram/256GB SSD/14/W10H/MS/Grey/1yr)",
//     "sku": "LENOVOIDEAPADSLIMINTELCOREI310THGEN8GBRAM256GBSSDWINDOWS10HOME14INCHLAPTOPPLATINUMGREY81WA00K1IN",
//     "MODEL ID": 233671,
//     "MRP": 39000,
//     "Bajaj-MOP": 39000,
//     "HappiMOP": 39000,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "81WB010XIN",
//     "APEX-MODEL NAME": "NB PC IP-Slim3 I3 WIN 10 4G 256GB SSD Off 19 H&S 39.6cms (15.6) Platinum Grey - Lenovo",
//     "sku": "LENOVOINTELCOREI310THGEN4GBRAM256GBSSDWINDOWS10156INCHLAPTOPPLATINUMGREY81WB010XIN",
//     "MODEL ID": 222314,
//     "MRP": 50990,
//     "Bajaj-MOP": 40792,
//     "HappiMOP": 36999,
//     "Difference": -3793
//   },
//   {
//     "APEXModelCode": "4A 40",
//     "APEX-MODEL NAME": "MI TV 4A 40 INCH",
//     "sku": "MI100cm40InchFullHDLEDSmartTVBlackL40M55AIN",
//     "MODEL ID": 222684,
//     "MRP": 24999,
//     "Bajaj-MOP": 23999,
//     "HappiMOP": 23999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "4X 43",
//     "APEX-MODEL NAME": "MI TV 4X 43 INCH",
//     "sku": "Mi108cm43Inch4KUltraHDLEDSmartTVBlackL43M44AIN",
//     "MODEL ID": 206748,
//     "MRP": 29999,
//     "Bajaj-MOP": 29999,
//     "HappiMOP": 29999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "43 4A",
//     "APEX-MODEL NAME": "Mi TV 4A 43 Inch ( Horizon Edition)",
//     "sku": "Mi108cm43InchFullHDLEDSmartTVBlack4AHorizon43",
//     "MODEL ID": 206411,
//     "MRP": 28999,
//     "Bajaj-MOP": 27999,
//     "HappiMOP": 27999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "4A PRO 43",
//     "APEX-MODEL NAME": "MI TV 4A PRO 43INC",
//     "sku": "Mi108cm43inchFullHDLEDSmartTVBlack4APromfr",
//     "MODEL ID": 154901,
//     "MRP": 27999,
//     "Bajaj-MOP": 26999,
//     "HappiMOP": 26999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "4X 50",
//     "APEX-MODEL NAME": "MI TV 4X 50 INCH",
//     "sku": "Mi1257cm50Inch4KUltraHDLEDSmartTVBlackL50M55AIN",
//     "MODEL ID": 206749,
//     "MRP": 38999,
//     "Bajaj-MOP": 38999,
//     "HappiMOP": 38999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "5X 50 Inch",
//     "APEX-MODEL NAME": "Xiaomi TV 5X 50\" 125.7cm",
//     "sku": "MI1257CM50INCHULTRAHD4KLEDSMARTTVBLACK5X50",
//     "MODEL ID": 242661,
//     "MRP": 42999,
//     "Bajaj-MOP": 41999,
//     "HappiMOP": 41999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "Redmi X50",
//     "APEX-MODEL NAME": "Redmi Smart TV X50 125.7 cm (50)",
//     "sku": "Mi126cm50Inch4KUltraHDLEDSmartTVBlackL50M6RA",
//     "MODEL ID": 222687,
//     "MRP": 39999,
//     "Bajaj-MOP": 38999,
//     "HappiMOP": 38999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "5X 43 Inch",
//     "APEX-MODEL NAME": "Xiaomi TV 5X 43\" 108cm",
//     "sku": "MI108CM43INCHULTRAHD4KLEDSMARTTVBLACK5X43",
//     "MODEL ID": 242660,
//     "MRP": 32999,
//     "Bajaj-MOP": 32999,
//     "HappiMOP": 32999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "4X55 INCH TV",
//     "APEX-MODEL NAME": "MI 4X 55 INCH TV ;L55M5-5XIN",
//     "sku": "Mi1388cm55Inch4KUltraHDLEDSmartTVBlackL55M55XIN",
//     "MODEL ID": 206751,
//     "MRP": 44999,
//     "Bajaj-MOP": 44999,
//     "HappiMOP": 44999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "Redmi X55",
//     "APEX-MODEL NAME": "Redmi Smart TV X55 138.8cm (55)",
//     "sku": "Mi1388cm55Inch4KUltraHDLEDSmartTVBlackL55M6RA",
//     "MODEL ID": 222688,
//     "MRP": 46999,
//     "Bajaj-MOP": 45999,
//     "HappiMOP": 45999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "Q1 55",
//     "APEX-MODEL NAME": "Mi TV Q1 138.8cm (55)",
//     "sku": "Mi139cm55InchUltraHD4KLEDSmartTVBlackMiTVQ155",
//     "MODEL ID": 211757,
//     "MRP": 59999,
//     "Bajaj-MOP": 59999,
//     "HappiMOP": 59999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "4A PRO 32",
//     "APEX-MODEL NAME": "MI TV 4A PRO 32 INCH",
//     "sku": "Mi80cm32InchHDReadyLEDSmartTV4APro",
//     "MODEL ID": 226306,
//     "MRP": 17499,
//     "Bajaj-MOP": 16999,
//     "HappiMOP": 16999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "32 4A",
//     "APEX-MODEL NAME": "Mi TV 4A 80cm (32)BZ (Horizon) Edition",
//     "sku": "Mi80cm32InchHDReadyLEDSmartTVHorizonGrey4A",
//     "MODEL ID": 226309,
//     "MRP": 17999,
//     "Bajaj-MOP": 17499,
//     "HappiMOP": 17499,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "D560652WIN9S",
//     "APEX-MODEL NAME": "i5-1135G7 / 8GB / 512GBSSD/15.6\" FHD Carbonn/Win 10 + MSO(D560652WIN9S)",
//     "sku": "DELLINSPIRON153511INTELCOREI511THGEN8GBRAM512GBSSDWINDOWS11HOME156INCHLAPTOPPLATINUMSILVERD560652WIN9S",
//     "MODEL ID": 246347,
//     "MRP": 60649,
//     "Bajaj-MOP": 58599,
//     "HappiMOP": 58599,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "55U1S",
//     "APEX-MODEL NAME": "OnePlus TV U1S Series 55U1S Smart TV",
//     "sku": "OnePlus139cm55Inch4KUltraHDLEDSmartTVBlack55UC1A00",
//     "MODEL ID": 235199,
//     "MRP": 50999,
//     "Bajaj-MOP": 50999,
//     "HappiMOP": 50999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "32Y",
//     "APEX-MODEL NAME": "ONEPLUS TV 32\"Y Series",
//     "sku": "Oneplus80cm32InchHDReadyLEDSmartTVBlack32Y1",
//     "MODEL ID": 235196,
//     "MRP": 18999,
//     "Bajaj-MOP": 18999,
//     "HappiMOP": 18999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "RM 43",
//     "APEX-MODEL NAME": "Realme Smart TV 43inch",
//     "sku": "Realme108cm43inchHDReadyLEDSmartAndroidTVBlackTV43",
//     "MODEL ID": 221869,
//     "MRP": 26999,
//     "Bajaj-MOP": 26999,
//     "HappiMOP": 26999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "RM 55",
//     "APEX-MODEL NAME": "Realme Smart TV 55inch",
//     "sku": "Realme139cm55Inch4KUltraHDLEDSmartTVBlackRMV2001SLEDTV55",
//     "MODEL ID": 221871,
//     "MRP": 46999,
//     "Bajaj-MOP": 46999,
//     "HappiMOP": 46999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "RM 32",
//     "APEX-MODEL NAME": "Realme TV 32 inch",
//     "sku": "Realme80cm32inchHDReadyLEDSmartAndroidTVBlackTV32",
//     "MODEL ID": 221870,
//     "MRP": 16999,
//     "Bajaj-MOP": 16999,
//     "HappiMOP": 16999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "RMV2003",
//     "APEX-MODEL NAME": "REALME Smart FHD 32 Inch TV",
//     "sku": "REALME81CM32INCHFULLHDLEDSMARTTVBLACKSMARTTVFULLHD80CM32",
//     "MODEL ID": 233728,
//     "MRP": 18999,
//     "Bajaj-MOP": 18999,
//     "HappiMOP": 18999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "RMP2102 3/32 Grey",
//     "APEX-MODEL NAME": "Realme Tablet LTE 3+32GB [RMP2102] - Grey",
//     "sku": "REALMEPAD32GBSTORAGEGREY3GBRAM",
//     "MODEL ID": 244732,
//     "MRP": 15999,
//     "Bajaj-MOP": 15999,
//     "HappiMOP": 15999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "RMP2102 4/64 Gold",
//     "APEX-MODEL NAME": "Realme Tablet LTE 4+64GB [RMP2102] - Gold",
//     "sku": "REALMEPAD64GBSTORAGEGOLD4GBRAM",
//     "MODEL ID": 244735,
//     "MRP": 17999,
//     "Bajaj-MOP": 17999,
//     "HappiMOP": 17999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "RMP2102 4/64 Grey",
//     "APEX-MODEL NAME": "Realme Tablet LTE 4+64GB [RMP2102] - Grey",
//     "sku": "REALMEPAD64GBSTORAGEGREY4GBRAM",
//     "MODEL ID": 244734,
//     "MRP": 17999,
//     "Bajaj-MOP": 17999,
//     "HappiMOP": 17999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "T505 3/32 Gold",
//     "APEX-MODEL NAME": "T505 Tab A7 10.4 (Wi-Fi + LTE) - Gold",
//     "sku": "SamsungGalaxyTabA7LTE32GBGold3GBRAM",
//     "MODEL ID": 215830,
//     "MRP": 23099,
//     "Bajaj-MOP": 21999,
//     "HappiMOP": 21999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "T505 3/32 Grey",
//     "APEX-MODEL NAME": "T505 Tab A7 10.4 (Wi-Fi + LTE) - Grey",
//     "sku": "SamsungGalaxyTabA7LTE32GBGray3GBRAM",
//     "MODEL ID": 215831,
//     "MRP": 23099,
//     "Bajaj-MOP": 21999,
//     "HappiMOP": 21999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "T505 3/32 Silver",
//     "APEX-MODEL NAME": "T505 Tab A7 10.4 (Wi-Fi + LTE) - Silver",
//     "sku": "SamsungGalaxyTabA7LTE32GBSilver3GBRAM",
//     "MODEL ID": 215832,
//     "MRP": 23099,
//     "Bajaj-MOP": 21999,
//     "HappiMOP": 21999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "T975 S7+ Black",
//     "APEX-MODEL NAME": "T975 Tab S7+ LTE - Black",
//     "sku": "SamsungGalaxyTabS7PlusLTE128GBMysticBlack6GBRAM",
//     "MODEL ID": 191222,
//     "MRP": 83999,
//     "Bajaj-MOP": 76999,
//     "HappiMOP": 76999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "T975 S7+ Bronze",
//     "APEX-MODEL NAME": "T975 Tab S7+ LTE - Bronze",
//     "sku": "SamsungGalaxyTabS7PlusLTE128GBMysticBronze6GBRAM",
//     "MODEL ID": 191223,
//     "MRP": 83999,
//     "Bajaj-MOP": 76999,
//     "HappiMOP": 76999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "T975 S7+ Silver",
//     "APEX-MODEL NAME": "T975 Tab S7+ LTE - Silver",
//     "sku": "SamsungGalaxyTabS7PlusLTE128GBMysticSilver6GBRAM",
//     "MODEL ID": 191224,
//     "MRP": 83999,
//     "Bajaj-MOP": 79999,
//     "HappiMOP": 79999,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "82H801FWIN",
//     "APEX-MODEL NAME": "NB PC IP-Slim3 i3 WIN 10 8G 512GB SSD Off 19 H&S 39.6cms (15.6) Arctic Grey  (82H801FWIN)",
//     "sku": "LENOVOIDEAPADSLIM3INTELCOREI311THGEN8GBRAM512GBSSDWINDOWS10HOME156INCHLAPTOPGREY82H801FWIN",
//     "MODEL ID": 244263,
//     "MRP": 60000,
//     "Bajaj-MOP": 48000,
//     "HappiMOP": 43999,
//     "Difference": -4001
//   },
//   {
//     "APEXModelCode": "82FE00QLIN",
//     "APEX-MODEL NAME": "NB PC IP-Slim5 i5 WIN 10 8G 512GB SSD Off 1 H&S 35.6cms (14.0) Graphite Grey (82FE00QLIN)",
//     "sku": "LenovoIdeapadIntelCorei511thGen8GBRAM512GBSSDWindows1014InchLaptopGraphiteGrey82FE00QLIN",
//     "MODEL ID": 222366,
//     "MRP": 88090,
//     "Bajaj-MOP": 70472,
//     "HappiMOP": 58499,
//     "Difference": -11973
//   },
//   {
//     "APEXModelCode": "82FG0148IN",
//     "APEX-MODEL NAME": "NB PC IP-Slim5 i5 WIN 10 16G 512GB SSD Off 19 H&S 2GB GFX 39.6cms (15.6) Graphite Grey- (82FG0148IN)",
//     "sku": "LENOVOIDEAPADINTELCOREI511THGEN16GBRAM512GBSSDWINDOWS10HOME156INCHLAPTOPGRAPHITEGREY82FG0148IN",
//     "MODEL ID": 222391,
//     "MRP": 103490,
//     "Bajaj-MOP": 82792,
//     "HappiMOP": 66999,
//     "Difference": -15793
//   },
//   {
//     "APEXModelCode": "82L3009MIN",
//     "APEX-MODEL NAME": "NB PC IP-Slim5 Pro I5 WIN 10 16G 512GB SSD 2GB GFX Off 19 H&S 35.6cms (14.0) Storm Grey - Lenovo",
//     "sku": "LENOVOIDEAPAD5PROINTELCOREI511THGEN16GBRAM512GBSSDWINDOWS10HOME14INCHLAPTOPSTORMGREY82L3009MIN",
//     "MODEL ID": 225955,
//     "MRP": 104890,
//     "Bajaj-MOP": 83912,
//     "HappiMOP": 80699,
//     "Difference": -3213
//   },
//   {
//     "APEXModelCode": "IND3202ST",
//     "APEX-MODEL NAME": "Treeview LED 32 - IND3202ST",
//     "sku": "Treeview81cm32InchHDReadyLEDSmartTVBlackIND3202ST",
//     "MODEL ID": 191346,
//     "MRP": 15990,
//     "Bajaj-MOP": 15990,
//     "HappiMOP": 15990,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "43P615",
//     "APEX-MODEL NAME": "43P615 4K UHD Smart Andriod TCL LED TV",
//     "sku": "Tcl107cm43InchUltraHD4KsmartLEDTVBlack43P615",
//     "MODEL ID": 191253,
//     "MRP": 30990,
//     "Bajaj-MOP": 29990,
//     "HappiMOP": 33000,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "55P715",
//     "APEX-MODEL NAME": "55P715 4K UHD Smart Andriod TCL LED TV",
//     "sku": "TCL139cm55inchUltraHD4KTVBlack55P715NDS",
//     "MODEL ID": 179842,
//     "MRP": 45490,
//     "Bajaj-MOP": 43990,
//     "HappiMOP": 43990,
//     "Difference": 0
//   },
//   {
//     "APEXModelCode": "43S6500FS",
//     "APEX-MODEL NAME": "43S6500FS 43inch HD Smart Andiord TCL LED TV",
//     "sku": "TCL108cm43InchFullHDLEDSmartTVBlack43S6500FS",
//     "MODEL ID": 179021,
//     "MRP": 26490,
//     "Bajaj-MOP": 25490,
//     "HappiMOP": 30990,
//     "Difference": 0
//   }
// ];



// console.log(SKUs.length)

// async function SyncDataToBajaj() {



//   //var sellerId = "337641,342689,343807,347568,347569,347570,347571,347573,358250,358272,366285,373629,376522,376523,378110,379330,381979,386318,387852,408934,409118,409798,421614,435956,492532,510804,510805,526428".split(",");
//   var db = await mongo.connect();
//   //var BajajStoreMaster = db.collection("BajajStoreMaster")
//   //var sellerId = await BajajStoreMaster.find({CITYID:47}).toArray();



//   var db = await mongo.connect();
//   var sku = db.collection("FINAL_SKU_SHEET");

//   // for(var i = 0; i < SKUs.length ; i++){
//   //     // console.log(`${SKUs[i]}`)
//   //   var record =  await sku.findOne( { model_id : SKUs[i]['MODELID']});
//   //   if(record != null){
//   //       console.log(record);
//   //       console.log(`${SKUs[i].MODELID} ${SKUs[i].ItemModelCode} - OK `, record['Dealers SDM Pass'].split(","))

//   //   }else{
//   //       console.log(`${SKUs[i].MODELID} ${SKUs[i].ItemModelCode} - NOTOK`)
//   //   }
//   // }

//   // return;

//   //for(var i = 0; i < sellerId.length ; i++){


//   //console.log(SKUs.length);

//   // setTimeout(() => {
//   //   reject(new Error('three'));
//   //  }, 1000);

//   //   setTimeout(() => {
//   //     console.log("gbgfjbkfdb");

//   //    }, 1000);

//   //  function fun(){
//   //     setTimeout();
//   //  }

//   let database = await mongo.connect();
//   let SKUsMaster = await database.collection('FINAL_SKU_SHEET');

//   let SKUs = await SKUsMaster.find().toArray();
//   // console.log(bajajres.length);


//   for (var k = 0; k < SKUs.length; k++) {
//     // console.log("kvalue-----------",k);
  
//     let response = SKUs[k];

//     if (response != null) {

//       try {

//         let bajajstore = await database.collection('BajajStoreMaster');
//         let storeres = await bajajstore.find().toArray();

//         for (var j = 0; j < storeres.length; j++) {
//           // console.log("jvalue----------",j);
          
//           // as.eachOfLimit(products, 25, async function(item, j){

//           // let SUPPLIERID = parseInt(suppliersplit[j])
//           // let storeres = await bajajstore.findOne({ "SUPPLIERID": SUPPLIERID });
//           // console.log(storeres.BRANCH_CODE);
//           //for(var i = 0; i < SKUs.length ; i++){
//             storeres=storeres[j];
//             // console.log("storeres999999999", storeres)
//           if (storeres.BRANCH_CODE != null) {
//             if (storeres.BRANCH_NAME != null) {
//               if (response.apx != null) {
//                 var queryData = {
//                   'CompanyCode': 'HM',
//                   'ItemCode': SKUs[k].apx,
//                   'AsonDate': 0,
//                   Brand: 0,
//                   BranchCode: storeres.BRANCH_CODE,
//                   BranchName: storeres.BRANCH_NAME
//                 };
//                 var query = qs.stringify(queryData);

//                 var options = {
//                   method: 'GET',
//                   url:
//                     'http://183.82.44.213:80/api/apxapi/GetStockInfo?' + query,
//                   headers: {
//                     UserId: 'WEBSITE',
//                     SecurityCode: '3489-7629-9163-3979'
//                   }
//                 }

//                 var stock = await axios(options);

//                 var date = new Date();
//                 var getYear = date.getFullYear().toString();
//                 var month = date.getMonth() + 1;

//                 if (month.toString().length > 1) {
//                   month = month.toString();
//                 }
//                 else {
//                   month = '0' + month;
//                 }

//                 var day = date.getDate();
//                 if (day.toString().length > 1) {
//                   day = day.toString();
//                 }
//                 else {
//                   day = '0' + day;
//                 }
//                 var dateInput = getYear + month + day;
//                 var queryData = {
//                   'CompanyCode': 'HM',
//                   'PriceTemplate': "ECOMMERCE",
//                   'PriceEffetiveFrom': dateInput,
//                   'ItemCode': SKUs[k].apx
//                 };



//                 var query = qs.stringify(queryData);

//                 var options_price = {
//                   method: 'GET',
//                   url: 'http://183.82.44.213/api/apxapi/GetPriceFromPriceTemplate?' + query,
//                   //headers: {}
//                   headers: {
//                     UserId: 'WEBSITE',
//                     SecurityCode: '3489-7629-9163-3979'
//                   }
//                 };

//                 var price = await axios(options_price);
//                 // console.log("bajajmrp and mop", SKUs[k].MRP, SKUs[k].MOP);

//                 // console.log("dinesh", price.data.Table[0].ITEM_PRICE);





//                 // console.log("harisir",newPrice);
//                 // console.log("************************* APX REQ \n", options);
//                 // console.log("************************* APX RESPOSE \n", stock.data);
//                 //console.log(stock.data.Data[0]!=null);

//                 if (stock.data.Data[0] != null) {

// console.log("skus",SKUs[k]['Happi MOP']);
//                   let newPrice;
//                   let num = price.data.Table[0].ITEM_PRICE;
//                   let low = SKUs[k].MOP;
//                   let high = SKUs[k].MRP;

//                   if (num > low && num < high) {
//                     console.log("EQUAL -->sending happi value");
//                     newPrice = price.data.Table[0].ITEM_PRICE
//                   }
//                   else {
//                     console.log("not between happi price -->sending mop value")

//                     newPrice = SKUs[k].MOP//mop value
//                   }


//                   // var raw = price.data.Table[0];
//                   //  newPrice = raw.ITEM_PRICE;

//                   //  console.log("------sku",SKUs[k].sku,stock.data.Data[0].SALEABLE_STOCK);
//                   let data;

//                   if (stock.data.Data[0].SALEABLE_STOCK == 0) {
//                     data = JSON.stringify(
//                       {
//                         "dealer_grpid": "74586",
//                         "seller_id": storeres.SUPPLIERID,
//                         "data": [
//                           {
//                             "sku": SKUs[k].sku,
//                             "price_value": newPrice,
//                             // "stock_value": parseInt(stock.data.Data[0].SALEABLE_STOCK) || 0,
//                             "stock_value": 1,
//                             // "stock_value": 1,
//                             "status": 2,
//                             "BRANCHCODE": stock.data.Data[0].BRANCH_CODE,
//                             "BRANCHNAME": stock.data.Data[0].BRANCH_NAME

//                           }
//                         ]
//                       });

//                   }

//                   else {


//                     data = JSON.stringify(
//                       {
//                         "dealer_grpid": "74586",
//                         "seller_id": storeres.SUPPLIERID,
//                         "data": [
//                           {
//                             "sku": SKUs[k].sku,
//                             "price_value": newPrice,
//                             "stock_value": parseInt(stock.data.Data[0].SALEABLE_STOCK) || 0,
//                             // "stock_value": 1,
//                             "status": 1,
//                             "BRANCHCODE": stock.data.Data[0].BRANCH_CODE,
//                             "BRANCHNAME": stock.data.Data[0].BRANCH_NAME

//                           }
//                         ]
//                       });
//                   }

//                   // console.log("bajaj_request:", data);
//                   // console.log("k value",k);

//                   //dineshcheck

//                   var config = {
//                     method: 'post',
//                     //url: 'https://bfsd.qa.bfsgodirect.com/dps/web/api/updateinventorypricestatus',
//                     url: "https://www.bajajfinservmarkets.in/dps/web/api/updateinventorypricestatus",
//                     headers: {
//                       'Content-Type': 'application/json',
//                       'Acceskeyid': 'b0tORkVMbXZzcmhNU3kyclJYRiszTjhHcjl0a2F1czN6M3RTWk9URi9ZLzAyMzZBMys3YSs4ajhaNjQ1TDMzSA==',
//                       'MarketPlaceId': 'MU5mVktWZGRlbWVtMmRYTXh1TnphZ2NKZ0dsSHVLa0lNR3d3YnNRT0t2cy80cmlSRGVMcGp4M0U1TFhxK3hFQQ==',
//                       'SecretAccessKey': 'dy91STczcVF2Z0E4Zjlpc2kzODNRRS9mR2ZHZW1tc1dROFVuSTlyUEMvOW9rdzFoMXpCVSt4dDZURHRFZDUvRg=='
//                     },
//                     data: data
//                   };

//                   var result = await axios(config);



//                   // console.log("bajajresponse-------", result.data.data[0]);
//                   if (result.data.data[0].sku != 'NA' && result.data.data[0].price_value != 'NA' && result.data.data[0].stock_value != 'NA') {



//                     var logs = {
//                       id: createUUID(),
//                       request: JSON.parse(data),
//                       created_on: new Date(),
//                       bajaj_logs: result.data,
//                       bajaj_msg: result.data.data[0].status_msg,
//                       bajaj_status_code: parseInt(result.data.data[0].status_code),
//                       // bajaj_status_code:parseInt( result.data.data[0].status_code),
//                     };

//                     // console.log("BAJAJ", JSON.stringify(logs));


//                     var config_es_link_test = {
//                       method: 'post',
//                       url: 'https://my-deployment-031377.es.ap-south-1.aws.elastic-cloud.com:9243/bajaj-log/_doc/' + logs.id,
//                       headers: {
//                         'Content-Type': 'application/json',
//                         'Authorization': 'Basic ZWxhc3RpYzo2SmVITmhBWFdmWFBDWTVQMzFpcGVNSUo='
//                       },
//                       data: JSON.stringify(logs)
//                     };
//                     // console.log("config_es_link_test", config_es_link_test)
//                     await axios(config_es_link_test);

//                     await db.collection("bajaj_stock_logs").insertOne(logs);


//                   }
//                   else {

//                     console.log("this seller_id has no sku,stock_value,price_value,status_value", result.data.data[0].seller_id);


//                     var logs = {
//                       id: createUUID(),
//                       request: JSON.parse(data),
//                       created_on: new Date(),
//                       bajaj_logs: {
//                         SUPPLIERID:storeres.SUPPLIERID,
//                         msg: "sku,price_value,stock_value  fields are required"
//                       },
//                       bajaj_msg: result.data.data[0].status_msg,
//                       bajaj_status_code: parseInt(result.data.data[0].status_code),
//                       // bajaj_status_code:parseInt( result.data.data[0].status_code),
//                     };

//                     var config_es_link_test = {
//                       method: 'post',
//                       url: 'https://my-deployment-031377.es.ap-south-1.aws.elastic-cloud.com:9243/bajaj-log/_doc/' + logs.id,
//                       headers: {
//                         'Content-Type': 'application/json',
//                         'Authorization': 'Basic ZWxhc3RpYzo2SmVITmhBWFdmWFBDWTVQMzFpcGVNSUo='
//                       },
//                       data: JSON.stringify(logs)
//                     };
//                     // console.log("config_es_link_test", config_es_link_test)
//                     await axios(config_es_link_test);

//                     await db.collection("bajaj_stock_logs").insertOne(logs);





//                   }
//                 }


//               }

//               else {

//                 console.log(response.apx, " ==== ", "Apx Code not found ")
//                 var logs = {
//                   id: createUUID(),
//                   request: SKUs[k].sku,
//                   created_on: new Date(),
//                   bajaj_logs: {
//                     SUPPLIERID: storeres.SUPPLIERID,
//                     msg: "Apx Code Not Found  In BajajSku_Master"
//                   },
//                   bajaj_msg: "Apx Code Not Found  In BajajSku_Master",
//                   bajaj_status_code: 0
//                 };
//                 //vamsi
//                 // console.log("BAJAJ", JSON.stringify(logs));
//                 var config_es_link_test = {
//                   method: 'post',
//                   url: 'https://my-deployment-031377.es.ap-south-1.aws.elastic-cloud.com:9243/bajaj-log/_doc/' + logs.id,
//                   headers: {
//                     'Content-Type': 'application/json',
//                     'Authorization': 'Basic ZWxhc3RpYzo2SmVITmhBWFdmWFBDWTVQMzFpcGVNSUo='
//                   },
//                   data: JSON.stringify(logs)
//                 };

//                 await db.collection("bajaj_stock_logs").insertOne(logs);

//               }
//             }
//             else {
//               console.log("kvalue", k);
//               console.log(SKUs[k].sku, " ==== ", "Storeres BranchName Not Found Store Code: ", store.SUPPLIERID)
//               var logs = {
//                 id: createUUID(),
//                 request: SKUs[k].sku,
//                 created_on: new Date(),
//                 bajaj_logs: {
//                   SUPPLIERID: storeres.SUPPLIERID,
//                   msg: "Storeres BranchName Not Found Store Code"
//                 },
//                 bajaj_msg: "Storeres  BranchName Not Found Store Code",
//                 bajaj_status_code: 0
//               };
//               //vamsi
//               // console.log("BAJAJ", JSON.stringify(logs));
//               var config_es_link_test = {
//                 method: 'post',
//                 url: 'https://my-deployment-031377.es.ap-south-1.aws.elastic-cloud.com:9243/bajaj-log/_doc/' + logs.id,
//                 headers: {
//                   'Content-Type': 'application/json',
//                   'Authorization': 'Basic ZWxhc3RpYzo2SmVITmhBWFdmWFBDWTVQMzFpcGVNSUo='
//                 },
//                 data: JSON.stringify(logs)
//               };

//               await db.collection("bajaj_stock_logs").insertOne(logs);

//             }
//             //}
//           } else {
//             console.log("kvalue", k);
//             console.log("storecode not found",storeres);
//             console.log(SKUs[k].sku, " ==== ", "Storeres Code Not Found Store Code: ", storeres.SUPPLIERID)
//             var logs = {
//               id: createUUID(),
//               request: SKUs[k].sku,
//               created_on: new Date(),
//               bajaj_logs: {
//                 SUPPLIERID: storeres.SUPPLIERID,
//                 msg: "Storeres Code Not Found Store Code"
//               },
//               bajaj_msg: "Storeres Code Not Found Store Code",
//               bajaj_status_code: 0
//             };
//             // console.log("BAJAJ", JSON.stringify(logs));

//             var config_es_link_test = {
//               method: 'post',
//               url: 'https://my-deployment-031377.es.ap-south-1.aws.elastic-cloud.com:9243/bajaj-log/_doc/' + logs.id,
//               headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': 'Basic ZWxhc3RpYzo2SmVITmhBWFdmWFBDWTVQMzFpcGVNSUo='
//               },
//               data: JSON.stringify(logs)
//             };

//             await db.collection("bajaj_stock_logs").insertOne(logs);
//           }


//         }
//       }
//       catch (error) {
//         console.log(error);
//       }

//     } else {
//       console.log(SKUs[k].sku, " ==== ", "SKU NOT FOUND IN BAJAJ SKU MASTER")
//       var logs = {
//         id: createUUID(),
//         request: SKUs[k].sku,
//         created_on: new Date(),
//         bajaj_logs: {
//           sku: SKUs[k].sku,
//           msg: "SKU NOT FOUND IN BAJAJ SKU MASTER"
//         },
//         bajaj_msg: "SKU NOT FOUND IN BAJAJ SKU MASTER",
//         bajaj_status_code: 0
//       };

//       // console.log("BAJAJ", JSON.stringify(logs));

//       var config_es_link_test = {
//         method: 'post',
//         url: 'https://my-deployment-031377.es.ap-south-1.aws.elastic-cloud.com:9243/bajaj-log/_doc/' + logs.id,
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': 'Basic ZWxhc3RpYzo2SmVITmhBWFdmWFBDWTVQMzFpcGVNSUo='
//         },
//         data: JSON.stringify(logs)
//       };
//       await db.collection("bajaj_stock_logs").insertOne(logs);
//     }

//   }
// }


// async function fetchSkuBajaj() {
//   var data = JSON.stringify(
//     {
//       "groupcode": "74586",
//       // "seller_id": sellerId[i],
//       // "data": [
//       //     {
//       //         "sku": SKUs[j].sku,
//       //         "price_value": SKUs[j].price,
//       //         "stock_value": 20,
//       //         "status": 1
//       //     }
//       //     ]
//     });
//   var config = {
//     method: 'post',
//     //url: 'https://bfsd.qa.bfsgodirect.com/dps/web/api/updateinventorypricestatus',
//     url: "https://www.bajajfinservmarkets.in/dps/web/api/getskudetails",
//     headers: {
//       'Content-Type': 'application/json',
//       'Acceskeyid': 'b0tORkVMbXZzcmhNU3kyclJYRiszTjhHcjl0a2F1czN6M3RTWk9URi9ZLzAyMzZBMys3YSs4ajhaNjQ1TDMzSA==',
//       'MarketPlaceId': 'MU5mVktWZGRlbWVtMmRYTXh1TnphZ2NKZ0dsSHVLa0lNR3d3YnNRT0t2cy80cmlSRGVMcGp4M0U1TFhxK3hFQQ==',
//       'SecretAccessKey': 'dy91STczcVF2Z0E4Zjlpc2kzODNRRS9mR2ZHZW1tc1dROFVuSTlyUEMvOW9rdzFoMXpCVSt4dDZURHRFZDUvRg=='
//     },
//     data: data
//   };
//   var result = await axios(config);
//   //console.log("FUn", result.data);
//   var db = await mongo.connect();
//   var sku = db.collection("BajajSKUMaster");
//   for (var i = 0; i < result.data.data.length; i++) {
//     var apx = SKUs.find(o => o.sku === result.data.data[i].sku);

//     if (apx != null) {
//       result.data.data[i].apx = apx.APEXModelCode;
//     }

//     sku.insertOne(result.data.data[i])
//   }
//   //
// }

// // fetchSkuBajaj();

// SyncDataToBajaj();


// async function PushAllBajajSKUmaster() {

//   var db = await mongo.connect();
//   var sku = db.collection("BajajSKUMaster");

//   var SKUs = await sku.find().toArray();

//   for (var i = 0; i < SKUs.length; i++) {
//     var queryData = {
//       'CompanyCode': 'HM',
//       'ItemCode': SKUs[i].ItemModelCode,
//       'AsonDate': 0,
//       Brand: 0,
//       BranchCode: SKUs[i].Code,
//       // BranchName:SKUs[i].
//     };

//   }



// }


// let data=[
//   { 
//     "_id" : ObjectId("619b31d6203a6f8c30f410a6"), 
//     "createdOn" : ISODate("2021-11-22T05:59:50.398+0000"), 
//     "assign_to" : "9154827666"
// },
// { 
//     "_id" : ObjectId("619b3c2c203a6f8c30f627bb"), 
//     "createdOn" : ISODate("2021-11-22T06:43:56.380+0000"), 
//     "assign_to" : "9154827666"
// },
// { 
//     "_id" : ObjectId("619b40c8f72eacea70738d43"), 
//     "createdOn" : ISODate("2021-11-22T07:03:36.007+0000"), 
//     "assign_to" : "9154827666"
// },

// ]

// async function  dinesh(){
//   try{
//     let db= await mongo.connect();
//     let cart= await db.collection('cart');
//     for(var i=0;i<data.length;i++){
//       let update= await UpdateMany({"createdOn":data[i].createdOn,})

//     }
   

//   }
//   catch(error){

//   }
// }



