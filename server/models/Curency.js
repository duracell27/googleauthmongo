const mongoose = require('mongoose')

const curencySchema = new mongoose.Schema({
    curencyValue:  String,
    curencyDesc: String,
},{timestamps:true})

const curencydb = new mongoose.model('curency', curencySchema) 

module.exports = curencydb