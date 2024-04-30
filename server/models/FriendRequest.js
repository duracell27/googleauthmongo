const mongoose = require('mongoose')

const friendRequestSchema = new mongoose.Schema({
    from:  { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    to: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    status: String,
},{timestamps:true})

const friendRequestdb = new mongoose.model('friendRequests', friendRequestSchema) 

module.exports = friendRequestdb