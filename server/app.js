require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
require('./db/connection')
const PORT = 5050
//for google auth
const session = require('express-session')
const passport = require('passport')
const OAuth2Strategy = require('passport-google-oauth20').Strategy
const users = require('./models/User')


app.use(cors({
    origin: "http://localhost:3000",
    methods: "GET,POST,PUT,DELETE",
    credentials: true
}
))

app.use(express.json())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}))

app.use(passport.initialize())
app.use(passport.session())

passport.use(new OAuth2Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_SECRET,
    callbackURL: '/auth/google/callback',
    scope: ['profile', 'email']
}, async(
    accessToken, refreshToken, profile, done
)=>{
    try {
        
    } catch (error) {
        
    }
}))



// app.get('/', (req, res) => {
//     res.status(200).json("server started")
// })

app.listen(PORT, () => {
    console.log(`server start on port ${PORT}`)
})