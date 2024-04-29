const mongoose = require('mongoose')

const DB = process.env.MONGO_URL

mongoose.connect(DB).then(()=>console.log('Connected')).catch((err)=>console.log('err', err))