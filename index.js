const express = require('express')
const path = require('path')
const dotenv = require('dotenv');
const {readJsonFile} = require('./json_utils.js')

dotenv.config();

const app = express()


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








