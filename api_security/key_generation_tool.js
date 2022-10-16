const AES = require('crypto-js/aes')
const prompt = require('prompt-sync')({ sigint: true });
const randomstring = require("randomstring");
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../.env') })



console.log("\nplease answer the following questions as they will be stored in the api key\n")


let expirationPeriod = prompt("Enter expiration period in seconds, skip to make permanent: ")
if (expirationPeriod){
    expirationPeriod = parseInt(expirationPeriod)
} else {
    expirationPeriod = 0
}

let creatorName = prompt("Enter your name: ")
let createdAt = new Date()
let target = prompt("why are you generating this key for?: ")

const tokenData = {
    expirationPeriod: expirationPeriod,
    creatorName: creatorName,
    createdAt: createdAt,
    target: target,
    randomString: randomstring.generate(7)
}

const cipherText = AES.encrypt(JSON.stringify(tokenData), process.env.TEMP_SITE_SECRET_KEY).toString();
const base64Token = Buffer.from(cipherText).toString('base64')
const finalKey = "api_auth_st_" + base64Token // first word short for api secret token
console.log(finalKey)





