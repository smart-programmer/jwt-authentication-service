var CryptoJS = require("crypto-js");
const { request } = require("express");
const prompt = require('prompt-sync')({ sigint: true });
const path = require('path')
const jwt = require('jsonwebtoken')
const {getTokenFromBearerRequestHeader} = require('../util/utils')
require('dotenv').config({ path: path.join(__dirname, '../../.env') })



function extractJwt(encryptedToken){
    try {
        // remove api_auth_st_
        encryptedToken = encryptedToken.slice(12, encryptedToken.length) 
        // decode from base64 back to utf8
        let utf8DecodedString = Buffer.from(encryptedToken, 'base64').toString('utf8')
        // decode AES encryption
        let bytes  = CryptoJS.AES.decrypt(utf8DecodedString, process.env.TEMP_SITE_SECRET_KEY);
        let originalJwt = bytes.toString(CryptoJS.enc.Utf8);
        return originalJwt
    } catch (e) {
        return null
    }
}

function checkAuthorizedApiUserMiddleware(req, res, next) {
    let authorizationHeader = req.headers.authorization
    // check if header exists
    if (!authorizationHeader) {
        console.log("no authorization header found")
        res.status(401).send("you're unauthorized to access this page.");
        return;
    }
    let encryptedToken = getTokenFromBearerRequestHeader(authorizationHeader)
    let jwtToken = extractJwt(encryptedToken)
    // if not valid jwt token then unauthorized
    if (!jwtToken) {
        console.log("decryption error: invalid jwt token")
        res.status(401).send("you're unauthorized to access this page.");
        return;
    }
    // check for signature
    try {
        const jwtPayload = jwt.verify(jwtToken, process.env.TEMP_SITE_SECRET_KEY);
        console.log(jwtPayload)
    } catch (e) {
        console.log("incorrect or expired jwt token")
        res.status(401).send("you're unauthorized to access this page.");
        return;
    }
    next()
}



module.exports = {
    checkAuthorizedApiUserMiddleware: checkAuthorizedApiUserMiddleware
}