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

// async function replaceUser(oldUserQuery, newUser) {
//     const dbConnection = await mongooseConnect()
//     // delete old user
//     await UserModel.deleteOne(oldUserQuery)
//     // add new user to db
//     const instance = new UserModel(newUser);
//     instance.save((err, user) => {
//         if (err) {
//             console.log(err)
//             console.error("couldn't add user")
//             dbConnection.close()
//             return
//         }
//         dbConnection.close()
//         console.log("user added successfully")
//     })
// }


// findUser({username: "Ahmad"}).then(async user => {
//     if (!user){
//         console.log("user not found")
//         return
//     }
//     user.username = "Ahmad"
//     user._id = mongoose.Types.ObjectId()
//     await replaceUser({username: "Ahmad"}, user)
//     findUser({username: "Ahmad"}).then(newUser => {
//         console.log(newUser)
//     })
// })


module.exports = {
    findUser : findUser,
    getAllUsers : getAllUsers,
}