const express = require('express')
const multer = require('multer');
const upload = multer();
const path = require('path')
const dotenv = require('dotenv')
const jsonwebtoken = require('jsonwebtoken')
const {readJsonFile} = require('./util/json_utils.js')
const {checkAuthorizedApiUserMiddleware} = require('./api_security/api_user_auth.js')
const {requestLogger} = require('./util/middleware.js')
const {findUser} = require('./util/db_util')
const {replaceUser} = require('./util/db_util')
const fs = require('fs')

//read env variables
dotenv.config();

const app = express()

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

// authenticate user
app.post('/users/authenticate', (req, res) => {
    // get user credentials from payload
    let username = req.body.username
    let password = req.body.password
    // res.send(username + ' ' + password)

    // check for credentials match in db
    readJsonFile(db_path, data => {
        // get user index
        let userIndex = findUser(data, username, password)
        // get user
        user = userIndex >= 0 ? data.users[userIndex] : null
        // console.log(user)

        // if credentials valid authenticate user else 404
        // in mock db authenticate user by adding jwt to it's user object
        // in real life just return jwt and client will store it as they wish
        if (user) {
            // setup jwt payload
            const jwtUserPayload = {
                id: user.id,
            }
            
            // generate jwt
            const jwtToken = jsonwebtoken.sign(jwtUserPayload, process.env.TEMP_JWT_SECRET, {
                expiresIn: 60 * 60 * 24 * 365 * 20 // expires in 20 years
            })
            // add refresh token
            
            // store tokens in mockup DB
            user.auth_token = jwtToken
            replaceUser(data.users, userIndex, user)
            fs.writeFileSync(db_path, JSON.stringify(data))
            // console.log(data)
            res.send("user has been authenticated")
        } else{
            res.status(404).send("user does not exist")
        }

    })
})

app.post('/users/refresh-auth', (req, res) => {
    // get refresh token, if it's valid return new access token
    // if refresh and access tokens are expired redirect to login route
})



app.listen(process.env.PORT, (err) => {
    if (err) {
        console.log(err)
    }else {
        console.log(`Listening on port ${process.env.PORT}`)
    }
}) 








