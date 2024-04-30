require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
require("./db/connection");
const PORT = 5050;
//for google auth
const session = require("express-session");
const passport = require("passport");
const OAuth2Strategy = require("passport-google-oauth20").Strategy;
const userdb = require("./models/User");

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);

app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new OAuth2Strategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      callbackURL: "/auth/google/callback",
      scope: ["profile", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      
      try {
        let user = await userdb.findOne({ googleId: profile.id });
        if (!user) {
          user = new userdb({
            googleId: profile.id,
            displayName: profile.displayName,
            email: profile.emails[0].value,
            image: profile.photos[0].value,
          });
          await user.save();
        }
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

//initial google outh
app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    successRedirect: "http://localhost:3000/dashboard",
    failureRedirect: "http://localhost:3000/login",
  })
);

app.get('/login/success', async (req, res) => {
   
    if(req.user){
      res.status(200).send({message: 'user Login', user: req.user})
    }else{
      res.status(404).send({message: 'user not authenticated'})
    }
})

app.get("/logout", (req, res, next) => {
  req.logout(function(err) {
    if (err) {
      return next(err);
    }
  });
  res.redirect("http://localhost:3000");
});

app.listen(PORT, () => {
  console.log(`server start on port ${PORT}`);
});
