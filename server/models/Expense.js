const mongoose = require('mongoose')

const expenseSchema = new mongoose.Schema({
    name:  String,
    image: String,
    price: Number,
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'groups' },
    land: [{ user: {type: mongoose.Schema.Types.ObjectId, ref: 'users'}, sum: Number }],
    owe: [{ user: {type: mongoose.Schema.Types.ObjectId, ref: 'users'}, sum: Number }]
},{timestamps:true})

const expensedb = new mongoose.model('expenses', expenseSchema)

module.exports = expensedb