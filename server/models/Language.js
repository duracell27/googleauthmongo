const mongoose = require('mongoose')

const languageSchema = new mongoose.Schema({
    langValue:  String,
    langDesc: String,
},{timestamps:true})

const languagedb = new mongoose.model('language', languageSchema) 

module.exports = languagedb