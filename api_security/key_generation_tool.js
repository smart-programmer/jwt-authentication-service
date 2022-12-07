const AES = require('crypto-js/aes')
const prompt = require('prompt-sync')({ sigint: true });
const randomstring = require("randomstring");
const path = require('path')
const jwt = require('jsonwebtoken')
require('dotenv').config({ path: path.join(__dirname, '../../.env') })


/* build jwt token */
console.log("\nplease answer the following questions as they will be stored in the api key\n")

let expirationPeriod = prompt("Enter expiration period in seconds, skip to make permanent: ")
if (expirationPeriod){
    expirationPeriod = parseInt(expirationPeriod)
} else {
    expirationPeriod = 60 * 60 * 24 * 365 * 20 // default expires in a 20 years
}

let creatorName = prompt("Enter your name: ")
let target = prompt("why are you generating this key for?: ")

const jwtPayload = {
    creatorName: creatorName,
    target: target,
    randomString: randomstring.generate(7)
}

// generate jwt
const jwtToken = jwt.sign(jwtPayload, process.env.TEMP_SITE_SECRET_KEY, {
    expiresIn: expirationPeriod
})

// encrypt jwt
const cipherText = AES.encrypt(jwtToken, process.env.TEMP_SITE_SECRET_KEY).toString();

// base 64 encode the cipher 
const base64Token = Buffer.from(cipherText).toString('base64')

const finalToken = "api_auth_st_" + base64Token // first word short for api auth secret token

console.log(finalToken)





