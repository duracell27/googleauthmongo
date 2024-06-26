const mongoose = require('mongoose')

const groupSchema = new mongoose.Schema({
    name:  String,
    image: String,
    members:[{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
    expenses:[{ type: mongoose.Schema.Types.ObjectId, ref: 'expenses' }],
},{timestamps:true})

const groupdb = new mongoose.model('groups', groupSchema) 

module.exports = groupdb