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
const friendRequestdb = require("./models/FriendRequest");

app.use(
  cors({
    origin: process.env.CLIENT_URL,
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

app.get('/', (req, res) => {
  res.status(200).send({ message: "server is running" });
})
app.get('/test', (req, res) => {
  res.status(200).send({ message: "test route" });
})

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
    successRedirect: process.env.CLIENT_URL + "/profile",
    failureRedirect: process.env.CLIENT_URL + "/login",
  })
);
// робота з логіном, вхід і логаут і робота з юзерами початок
app.get("/login/success", async (req, res) => {
  if (req.user) {
    res.status(200).send({ message: "user Login", user: req.user });
  } else {
    res.status(404).send({ message: "user not authenticated" });
  }
});

app.get("/logout", (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
  });
  res.redirect(process.env.CLIENT_URL);
});
//пошук користувачів по імені
app.post('/searchuser', async (req, res) => {
  const searchquery = req.body.searchquery;

  const users = await userdb.find({displayName: {$regex: searchquery, $options: 'i'}}).limit(10)
  res.status(200).send(users)
})
// робота з логіном, вхід і логаут і робота з юзерами кінець

// робота з друзями початок
//створення запиту на дружбу
app.post("/friendrequest", async (req, res) => {
  const userId = req.body.userId;
  const userIdToSend = req.body.userIdToSend;
  
  const isRequestExists = await friendRequestdb.findOne({
    from: userId,
    to: userIdToSend,
  });

  if (isRequestExists) {
    res.status(404).send({ message: "Такий запит вже існує" });
  } else {
    const frReq = await friendRequestdb.create({
      from: userId,
      to: userIdToSend,
      status: "pending",
    });
    const resp = await frReq.save();
    if (resp._id) {
      res.status(200).send({ message: "Запит надіслано" });
    } else {
      res.status(404).send({ message: "Помилка запиту дзузів" });
    }
  }
});
//отримати дані про друзів та запити друзів
app.get("/friendrequest", async (req, res) => {
  const userId = req.query.userId;
 
  //знаходжу ті реквести в яких статус прийнятий і тоя ід в from або to
  const friendsData = await friendRequestdb
    .find({
      $and: [
        { status: "accepted" },
        { $or: [{ from: userId }, { to: userId }] },
      ],
    })
    .populate("from to");
  const friends = [];
  //сортую дату і вибираю всі ід які не мої щоб знайти моїх друзів
  friendsData.forEach((itemObj) => {
    if (itemObj.from._id == userId) {
      friends.push({userInfo: itemObj.to, reqId: itemObj._id});
    } else {
      friends.push({userInfo: itemObj.from, reqId: itemObj._id});
    }
  });



  //знаходжу ті реквести в яких статус пендінг і моя ід в to щоб побачити хто мені надіслав запити
  const requestsData = await friendRequestdb
    .find({ status: "pending", to: userId })
    .populate("from");
  const requests = [];
  // сортую тільки профілі тих хто запити скинув, і ід реквеста щоб потім можна було статус поміняти
  requestsData.forEach((itemObj) => {
    requests.push({ userInfo: itemObj.from, reqId: itemObj._id });
  });


  res.status(200).send({ friends: friends, requests: requests });
});
//відповісти на запит дружби та видалити з друзів
app.put("/friendrequest", async (req, res) => {
//шукаю реквест по ід і заміняю статус або accepted або rejected
  const reqestId = req.body.reqestId;
  const status = req.body.status;

  const updatedFriendRequest = await friendRequestdb.findOneAndUpdate({_id: reqestId}, {status: status}, {new: true})

  if(updatedFriendRequest._id){
    res.status(200).send({message: "Статус оновлено"})
  }else{
    res.status(404).send({message: "Статус не оновлено"})
  }
})
// робота з друзями кінець
//test
app.listen(PORT, () => {
  console.log(`server start on port ${PORT}`);
});
