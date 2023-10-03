const express = require('express')
const multer = require('multer');
const upload = multer();
const path = require('path')
const dotenv = require('dotenv')
const jsonwebtoken = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const {checkAuthorizedApiUserMiddleware} = require('./api_security/api_user_auth.js')
const {requestLogger} = require('./util/middleware.js')
const {findUser, getAllUsers} = require('./util/db_util.js')
const {getTokenFromBearerRequestHeader, secondsSinceEpoch, extractRefreshToken} = require('./util/utils.js')
const {blackListToken, checkBlacklistedToken} = require('./util/redis_util.js')
const fs = require('fs');
const { application } = require('express');

const app = express()

// parse cookies
app.use(cookieParser())

app.use(requestLogger)

// support parsing multi-part post data
app.use(upload.array());

// support parsing of application/json type post data
app.use(express.json());
//support parsing of application/x-www-form-urlencoded post data
app.use(express.urlencoded({ extended: true }));

// check if API requester has valid API_KEY
app.use(checkAuthorizedApiUserMiddleware)

// mock db path
db_path = path.join(__dirname, 'mockup-DB.json')

// print all users route
app.get('/users', (req, res) => {
    getAllUsers().then(users => res.send(users))
})

// authenticate user 
app.post('/users/login', (req, res) => {
    // get user credentials from post body
    let username = req.body.username
    let password = req.body.password

    // check for credentials match in db
    findUser({username: username, password: password}).then(user => {
        if (!user){
            res.status(404).send("user does not exist")
            return
        }
        // setup access token payload
        const jwtAccessTokenPayload = {
            id: user._id,
        }
        // generate access token
        const jwtAccessToken = jsonwebtoken.sign(jwtAccessTokenPayload, process.env.TEMP_JWT_SECRET, {
            expiresIn: 60 * 10 // expires in 10 minutes
        })
        //setup refresh token payload
        const jwtRefreshTokenPayload = {
            id: user._id,
        }
        // generate refresh token
        const jwtRefreshToken = jsonwebtoken.sign(jwtRefreshTokenPayload, process.env.TEMP_JWT_SECRET, {
            expiresIn: 60 * 60 * 24 * 7 // expires in 7 days
        })
        res.cookie("access-token", jwtAccessToken)
        res.cookie("refresh-token", jwtRefreshToken, {httpOnly: true})
        res.send("user has been authenticated")
    })
})

// use refresh token to grant new access tokens
app.post('/users/refresh-auth', (req, res) => {
    const {refreshToken} = extractRefreshToken(req)
    if (!refreshToken){
        res.status(404).send("no refresh token was provided")
        return
    }

    // check if refresh token not black listed
    checkBlacklistedToken(refreshToken).then(value => {
        if (value){
            res.status(301).send("refresh token is blacklisted")
            return
        }
        // refresh if valid token
        jsonwebtoken.verify(refreshToken, process.env.TEMP_JWT_SECRET, (err, decodedPayload) => {
            if (err){
                res.status(404).send("invalid refresh token please login again")
                return 
            }
            // generate new access token
            const jwtAccessTokenPayload = {
                id: decodedPayload.id,
            }
            const jwtAccessToken = jsonwebtoken.sign(jwtAccessTokenPayload, process.env.TEMP_JWT_SECRET, {
                expiresIn: 60 * 60 * 1 // expires in 1 hour
            })
            res.cookie("access-token", jwtAccessToken)
            res.send("refresh successful")
        })
    })
})

// check if user is authenticated route
// client requests this route if result is 404 it requests refresh if 404 prompt login else use and store access token from refresh request
app.post('/users/is-authenticated', function(req, res) {
    const {refreshToken} = extractRefreshToken(req)
    if (!refreshToken){
        res.status(404).send("no refresh token was provided")
        return
    }

    // check if refresh token not black listed
    checkBlacklistedToken(refreshToken).then(value => {
        if (value){
            res.status(301).send("refresh token is blacklisted")
            return
        }
        // ! TODO: verify refresh token after checking not blacklisted

        // get access token from Access-Header
        const accessHeader = req.headers["access-header"] || null
        // if header not set return 404
        if (!accessHeader){
            res.status(404).send("Access-Header not set")
            return
        }

        let accessToken = getTokenFromBearerRequestHeader(accessHeader)
        // if no token return 404
        if (!accessToken){
            res.status(404).send("access token header is not properly set")
            return
        }

        // verify access token
        jsonwebtoken.verify(accessToken, process.env.TEMP_JWT_SECRET, (err, decodedPayload) => {
            if (err){
                res.status(404).send("invalid access token please refresh the token")
                return 
            }
            // return user
            findUser({_id: decodedPayload.id}).then(user => {
                if (!user){
                    res.status(404).send("user doesn't exists anymore")
                    return
                }
                res.status(200).send(user)
                return
            })
        })
    })

    
})

app.post('/users/logout', (req, res) => {
    // extract and verify refresh token
    // if tokens are valid connect to redis and register the token as a key with the value of 'logout'

    // get refresh token if it's a cookie else null
    const {refreshToken} = extractRefreshToken(req)
    if (!refreshToken){
        res.status(404).send("no refresh token was provided")
        return
    }
    // get access token from Access-Header 
    const accessHeader = req.headers["access-header"] || null
    // if header not set return 404
    if (!accessHeader){
        res.status(404).send("Access-Header not set")
        return
    }
    const accessToken = getTokenFromBearerRequestHeader(accessHeader)
    // if no token return 404
    if (!accessToken){
        res.status(404).send("access token header is not properly set")
        return
    }
    // verify tokens
    let decodedRefreshPayload = null
    let decodedAccessPayload = null
    let invalidAccessToken = false
    try {
        decodedRefreshPayload = jsonwebtoken.verify(refreshToken, process.env.TEMP_JWT_SECRET)
        try {
            decodedAccessPayload = jsonwebtoken.verify(accessToken, process.env.TEMP_JWT_SECRET)
        } catch (err) {
            invalidAccessToken = true
        }
    } catch (err) {
        if (!invalidAccessToken) {
            // refresh token invalid but access token is valid
            const blackListExpirationTime = decodedAccessPayload.exp - secondsSinceEpoch() // access token remaining expiration time
            blackListToken(refreshToken, "logout", blackListExpirationTime)
            res.status(200).send("user logged out")
            return
        } else {
            // access and refresh tokens invalid 
            res.status(404).send("user not logged in")
            return 
        }
    }
    // refresh token valid but access token invalid
    const blackListExpirationTime = decodedRefreshPayload.exp - secondsSinceEpoch() // refresh token remaining expiration time
    blackListToken(refreshToken, "logout", blackListExpirationTime)
    res.status(200).send("user logged out")
    return
})


app.listen(process.env.PORT, (err) => {
    if (err) {
        console.log(err)
    }else {
        console.log(`Listening on port ${process.env.PORT}`)
    }
}) 








