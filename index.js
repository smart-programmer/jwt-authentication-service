const express = require('express')
const multer = require('multer');
const upload = multer();
const path = require('path')
const dotenv = require('dotenv')
const jsonwebtoken = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const {readJsonFile} = require('./util/json_utils.js')
const {checkAuthorizedApiUserMiddleware} = require('./api_security/api_user_auth.js')
const {requestLogger} = require('./util/middleware.js')
const {findUser, findUserWithId, replaceUser} = require('./util/db_util.js')
const {getTokenFromBearerRequestHeader} = require('./util/utils.js')
const fs = require('fs')

//read env variables
dotenv.config();

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




// print all users
app.get('/users', (req, res) => {
    readJsonFile(db_path, data => { res.send(data) })
})

// authenticate user if not logged in
app.post('/users/login', (req, res) => {
    // get user credentials from post body
    let username = req.body.username
    let password = req.body.password

    // check for credentials match in db
    readJsonFile(db_path, data => {
        // get user index
        let userIndex = findUser(data, username, password)
        // extract user if exists
        user = userIndex >= 0 ? data.users[userIndex] : null
        // console.log(user)

        // if credentials valid authenticate user else 404
        // in mock db authenticate user by adding jwt to it's user object
        // in real life just return jwt and client will store it as they wish
        if (user) {
            // setup access token payload
            const jwtAccessTokenPayload = {
                id: user.id,
            }
            // generate access token
            const jwtAccessToken = jsonwebtoken.sign(jwtAccessTokenPayload, process.env.TEMP_JWT_SECRET, {
                expiresIn: 60 * 60 * 1 // expires in 1 hour
            })
            //setup refresh token payload
            const jwtRefreshTokenPayload = {
                id: user.id,
            }
            // generate refresh token
            const jwtRefreshToken = jsonwebtoken.sign(jwtRefreshTokenPayload, process.env.TEMP_JWT_SECRET, {
                expiresIn: 60 * 60 * 24 * 7 // expires in 7 days
            })
            // store tokens in mockup DB
            user.access_token = jwtAccessToken
            user.refresh_token = jwtRefreshToken
            replaceUser(data.users, userIndex, user)
            fs.writeFileSync(db_path, JSON.stringify(data))
            // console.log(data)
            res.send("user has been authenticated")
        } else {
            res.status(404).send("user does not exist")
        }

    })
})

// use refresh token to grant new access tokens
app.post('/users/refresh-auth', (req, res) => {
    /* get refresh token, if it's valid return new access token if not return 404(user needs to re-login) */
    // get refresh token if it's a cookie else null
    let refreshToken = req.cookies.refresh_token || null
    let source = refreshToken? "cookie" : null
    // if not in cookie check if it's in body form field and get else null
    refreshToken = refreshToken? refreshToken : (req.body.refresh_token || null)
    source = source? "cookie" : "body"
    // if no token return 404
    if (!refreshToken){
        res.status(404).send("no refresh token was provided")
        return
    }
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
        // in mockup db reset access token in user object
        readJsonFile(db_path, data => {
            // get user index
            let userIndex = findUserWithId(data, decodedPayload.id.toString())
            // extract user if exists
            user = userIndex >= 0 ? data.users[userIndex] : null
            if (user) {
                user.access_token = jwtAccessToken
                replaceUser(data.users, userIndex, user)
                fs.writeFileSync(db_path, JSON.stringify(data))
                res.send("user access token refreshed")
            } else {
                res.status(404).send("possible payload tampering, user doesn't exist")
            }
        })
        // return new access token in real world
        // res.send(jwtAccessToken)
    })
})

// check if user is authenticated route
app.post('/users/is-authenticated', function(req, res) {
    // get refresh token if it's a cookie else null
    let refreshToken = req.cookies.refresh_token || null
    // if not in cookie check if it's in body form field and get else null
    refreshToken = refreshToken? refreshToken : (req.body.refresh_token || null)
    // if no token return 404
    if (!refreshToken){
        res.status(404).send("no refresh token was provided")
        return
    }
    // get access token from Access-Header that i've invented
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
    // verify refresh token
    try {
        jsonwebtoken.verify(refreshToken, process.env.TEMP_JWT_SECRET)
    } catch {
        res.status(404).send("invalid refresh token please login")
        return
    }
    // verify access token
    jsonwebtoken.verify(accessToken, process.env.TEMP_JWT_SECRET, (err, decodedPayload) => {
        if (err){
            res.status(404).send("invalid access token please refresh the token")
            return 
        }
        res.status(200).send(decodedPayload)
    })
})



app.listen(process.env.PORT, (err) => {
    if (err) {
        console.log(err)
    }else {
        console.log(`Listening on port ${process.env.PORT}`)
    }
}) 








