const path = require('path')
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '../../.env') })

let dbURI = process.env.DATABASE_URI || null

async function mongooseConnect(){
    await mongoose.connect(dbURI)
    if (mongoose.connection){
        console.log("connection to mongoDB was successful")
        return mongoose.connection
    }
    console.log("failed to connect to mongoDB")
    return null
}

module.exports = {
    mongooseConnect : mongooseConnect
}

// mongooseConnect()
// mongoose.connection.close()


