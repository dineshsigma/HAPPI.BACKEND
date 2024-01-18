
var config = {}
config.mongo_url ="mongodb+srv://sowmya:iNNrxOhVfEdvsUaI@happinewsls.cnw2n.mongodb.net/happi-new-sls?replicaSet=atlas-11ilgn-shard-0&readPreference=primary&connectTimeoutMS=10000&authSource=admin&authMechanism=SCRAM-SHA-1"


config.S3_ACCESS_KEY_ID          = "AKIASTAEMZYQTLP6FLB4"
config.PAYTM_MID                 = "kegRrv60547753089820"
config.PAYTM_WEBSITE             = "WEBSTAGING"
config.PAYTM_INDUSTRY_TYPE_ID    = "Retail"
config.PAYTM_CHANNEL_ID          = "WEB"
config.PAYTM_CALLBACK_URL        = "http://localhost:8000/order/paytm-return"
config.PAYTM_CALLBACK_LINK_URL   = "http://localhost:8000/order/paytm-return-link"
config.PAYTM_CHECK_SUM_KEY       = "Xd%ntxccKaCIzkN8"
config.PAYTM_ORDER_SUBMIT_URL    = "https://securegw-stage.paytm.in/order/process"
config.PAYTM_CALLBACK_COD_URL    = "http://localhost:8000/order/paytm-return-cod"
config.BAJAJ_EMI_RETURN_URL      = "http://localhost:8000/api/bajaj-emi-return"

module.exports = config;