const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    googleId:  String,
    displayName: String,
    email: String,
    image: String
},{timestamps:true})

export default users = new mongoose.model('users', userSchema) 