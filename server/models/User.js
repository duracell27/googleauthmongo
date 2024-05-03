const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    googleId:  String,
    displayName: String,
    email: String,
    image: String,
    cardNumber: String,
    language: { type: mongoose.Schema.Types.ObjectId, ref: 'language' },
    curency: { type: mongoose.Schema.Types.ObjectId, ref: 'curency' },
},{timestamps:true})

const userdb = new mongoose.model('users', userSchema) 

module.exports = userdb