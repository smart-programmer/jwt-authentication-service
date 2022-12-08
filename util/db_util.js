const {mongooseConnect} = require('../config/dbConn.js')
const {UserModel} = require('../models/users.js')
const mongoose = require('mongoose');
const Schema = mongoose.Schema;


async function findUser(queryObject) {
    const dbConnection = await mongooseConnect()
    const users = await UserModel.find(queryObject).lean() // lean returns the plain js object instead of the mongoose document
    let user = (users.length > 0)? users[0] : null
    dbConnection.close()
    return user
}

async function getAllUsers() {
    const dbConnection = await mongooseConnect()
    const users = await UserModel.find({}).lean() // lean returns the plain js object instead of the mongoose document
    dbConnection.close()
    return users
}

module.exports = {
    findUser : findUser,
    getAllUsers : getAllUsers,
}