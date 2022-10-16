const express = require('express')
const multer = require('multer');
const upload = multer();
const path = require('path')
const dotenv = require('dotenv')
const jsonwebtoken = require('jsonwebtoken')
const {readJsonFile} = require('./json_utils.js')
const {checkAuthorizedUserMiddleware} = require('./api_security/api_user_auth.js')
const {requestLogger} = require('./util/middleware.js')

dotenv.config();

const app = express()

app.use(requestLogger)

app.use(upload.array());

// support parsing of application/json type post data
app.use(express.json());
//support parsing of application/x-www-form-urlencoded post data
app.use(express.urlencoded({ extended: true }));

app.use(checkAuthorizedUserMiddleware)




app.get('/users', (req, res) => {
    readJsonFile(path.join(__dirname, 'data.json'), data => { res.send(data) })
})


app.listen(process.env.PORT, (err) => {
    if (err) {
        console.log(err)
    }else {
        console.log(`Listening on port ${process.env.PORT}`)
    }
}) 








