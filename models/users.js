const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    _id: Schema.ObjectId,
    username: {type: String, required: true},
    email: {type: String, required: true},
    password: {type: String, required: true},
    first_name: {type: String, required: true},
    last_name: {type: String, required: true},
    phone_number: {
        country_code: {type: String, required: true},
        number: {type: String, required: true}
    },
    country: {type: String, required: true},
    birth_date: {type: Date, required: true},
    created_at: {type: Date, required: true, default: Date.now()},
    updated_at: {type: Date, required: true, default: Date.now()},
    refresh_token: {type: String},
    access_token: {type: String}
})



module.exports = {
    UserModel : mongoose.model('User', UserSchema) // collection name is users, mongos adds plural s and lower cases the name
}


