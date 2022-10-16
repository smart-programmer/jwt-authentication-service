var CryptoJS = require("crypto-js");
const { request } = require("express");
const prompt = require('prompt-sync')({ sigint: true });
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../.env') })



function getJsonFromToken(token){
    try {
        token = token.slice(12, token.length) // remove api_auth_st_
        let base64DecodedString = Buffer.from(token, 'base64').toString('utf8') // decode from base64 back to uf8
        // decode AES encryption
        let bytes  = CryptoJS.AES.decrypt(base64DecodedString, process.env.TEMP_SITE_SECRET_KEY);
        let originalText = bytes.toString(CryptoJS.enc.Utf8);
        let originalJson = JSON.parse(originalText)
        return originalJson
    } catch (e) {
        return null
    }
}

function checkAuthorizedUserMiddleware(req, res, next) {
    let authorizationHeader = req.headers.authorization
    if (!authorizationHeader) {
        res.status(401).send("you're unauthorized to access this page.");
        return;
    }
    let token = getTokenFromRequestHeader(authorizationHeader)
    let tokenJson = getJsonFromToken(token)
    // if it's a valid json object then user is authorized
    if (!tokenJson) {
        res.status(401).send("you're unauthorized to access this page.");
        return;
    }
    console.log(tokenJson)
    next()
}

function getTokenFromRequestHeader(authorizationHeader) {
    let token = authorizationHeader.split(' ')[1] // bearer token
    return token
}


module.exports = {
    getJsonFromToken: getJsonFromToken,
    checkAuthorizedUserMiddleware: checkAuthorizedUserMiddleware
}