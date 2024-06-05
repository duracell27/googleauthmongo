require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
require("./db/connection");
const PORT = 5050;
const session = require("express-session");
const userdb = require("./models/User");
const friendRequestdb = require("./models/FriendRequest");
const curencydb = require("./models/Curency");
const languagedb = require("./models/Language");
const groupdb = require("./models/Group");
const expensedb = require("./models/Expense");
const { populate } = require("dotenv");
const { PutObjectCommand, S3Client } = require("@aws-sdk/client-s3");
const uniqid = require("uniqid");
const fileUpload = require("express-fileupload");
const convert = require("heic-convert");
const admin = require("firebase-admin");
const { getAuth } = require("firebase-admin/auth");
const sharp = require("sharp");
const settledb = require("./models/Settele");

admin.initializeApp({
  credential: admin.credential.cert({
    type: process.env.GOOGLE_ADMIN_TYPE,
    project_id: process.env.GOOGLE_ADMIN_PROJECT_ID,
    private_key_id: process.env.GOOGLE_ADMIN_PRIVATE_KEY_ID,
    private_key: process.env.GOOGLE_ADMIN_PRIVATE_KEY,
    client_email: process.env.GOOGLE_ADMIN_CLIENT_EMAIL,
    client_id: process.env.GOOGLE_ADMIN_CLIENT_ID,
    auth_uri: process.env.GOOGLE_ADMIN_AUTH_URI,
    token_uri: process.env.GOOGLE_ADMIN_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.GOOGLE_ADMIN_AUTH_PROVIDER,
    client_x509_cert_url: process.env.GOOGLE_ADMIN_AUTH_CLIENT_CERT,
    universe_domain: process.env.GOOGLE_ADMIN_DOMAIN,
  }),
});

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
    cookie: { maxAge: 86400000, secure: false },
  })
);
// для роботи з файлами, щоб можна було грузити на авс
app.use(fileUpload());

app.get("/", (req, res) => {
  res.status(200).send({ message: "server is running" });
});
// тестовий ендпоінт
app.get("/test", (req, res) => {
  res.status(200).send({ message: "test route" });
});

// логін через гугл, та реєстрація коростувача в бд
app.post("/google-auth", async (req, res) => {
  let { access_token } = req.body;

  getAuth()
    .verifyIdToken(access_token)
    .then(async (decodedUser) => {
      let { email, name, picture } = decodedUser;
      //якщо треаба більшу картинку то розкоментувати рядок нижче
      // picture = picture.replace('s96-c', 's384-c');

      let user = await userdb
        .findOne({ email: email })
        .populate("curency language")
        .then((u) => {
          return u || null;
        })
        .catch((err) => {
          return res.status(500).json({ message: err.message });
        });

      if (user) {
        if (!user.isGoogleAuth) {
          return res.status(403).send({
            message:
              "Цей акаунт зареєстрований НЕ через гугл. Ввійдіть з імейлом та паролем",
          });
        }
      }
      //якщо користувача не знайдено то реєструємо його
      else {
        user = new userdb({
          displayName: name,
          email: email,
          image: picture,
          isGoogleAuth: true,
          curency: '6634d18e65ca60af6619a518', // default for Ukraine UAH
          language: '6634d572ebffe4f500e02e0d' // default for Ukraine UKRAINIAN
        });
        await user
          .save()
          .then((u) => {
            user = u;
          })
          .catch((err) => {
            return res.status(500).json({ message: err.message });
          });
      }
      return res.status(200).json(user);
    })
    .catch((err) => {
      return res.status(500).json({ message: "Не вдалось увійти через гугл" });
    });
});

//пошук користувачів по імені
app.post("/searchuser", async (req, res) => {
  const searchquery = req.body.searchquery;
  // if(!searchquery) return res.status(500).json({ message: "Помилка при обробці запиту" })

  const users = await userdb
    .find({ displayName: { $regex: searchquery, $options: "i" } })
    .limit(10);
  res.status(200).send(users);
});

app.get("/getUser", async (req, res) => {
  const userId = req.query.userId;
  if (!userId)
    return res.status(500).json({ message: "Помилка при обробці запиту" });

  const user = await userdb.findById(userId).populate("curency language");
  if (user._id) {
    return res.status(200).json(user);
  } else {
    return res.status(500).json({ message: "Не вдалось оновити дані юзера" });
  }
});
// робота з логіном, вхід і логаут і робота з юзерами кінець

// робота з друзями початок
//створення запиту на дружбу
app.post("/friendrequest", async (req, res) => {
  const userId = req.body.userId;
  if (!userId)
    return res.status(500).json({ message: "Помилка при обробці запиту" });
  
  const userIdToSend = req.body.userIdToSend;
  if (!userIdToSend)
    return res.status(500).json({ message: "Помилка при обробці запиту" });

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
  if (!userId)
    return res.status(500).json({ message: "Помилка при обробці запиту" });

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
      friends.push({ userInfo: itemObj.to, reqId: itemObj._id });
    } else {
      friends.push({ userInfo: itemObj.from, reqId: itemObj._id });
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
  if (!reqestId)
    return res.status(500).json({ message: "Помилка при обробці запиту" });
  const status = req.body.status;
  if (!status)
    return res.status(500).json({ message: "Помилка при обробці запиту" });

  const updatedFriendRequest = await friendRequestdb.findOneAndUpdate(
    { _id: reqestId },
    { status: status },
    { new: true }
  );

  if (updatedFriendRequest._id) {
    res.status(200).send({ message: "Статус оновлено" });
  } else {
    res.status(404).send({ message: "Статус не оновлено" });
  }
});
// робота з друзями кінець

//робота з профілем користувача початок
//Додавання валюти в список
app.post("/profile/addCurency", async (req, res) => {
  const value = req.body.curencyValue;
  if (!value)
    return res.status(500).json({ message: "Помилка при обробці запиту" });
  const desc = req.body.curencyDesc;
  if (!desc)
    return res.status(500).json({ message: "Помилка при обробці запиту" });

  const newCurency = await curencydb.create({
    curencyValue: value,
    curencyDesc: desc,
  });
  const resp = await newCurency.save();
  if (resp._id) {
    res.status(200).send({ message: "Валюта додана" });
  } else {
    res.status(404).send({ message: "Валюта не додана" });
  }
});

//Додавання мови в список
app.post("/profile/addLanguage", async (req, res) => {
  const value = req.body.langValue;
  if (!value)
    return res.status(500).json({ message: "Помилка при обробці запиту" });
  const desc = req.body.langDesc;
  if (!desc)
    return res.status(500).json({ message: "Помилка при обробці запиту" });

  const newLanguage = await languagedb.create({
    langValue: value,
    langDesc: desc,
  });
  const resp = await newLanguage.save();
  if (resp._id) {
    res.status(200).send({ message: "Мова додана" });
  } else {
    res.status(404).send({ message: "Мова не додана" });
  }
});

//Отримати список мов та валют а також стандартних юзерських мови валюити та картки
app.get("/profile/info", async (req, res) => {
  const userId = req.query.userId;
  if (!userId)
    return res.status(500).json({ message: "Помилка при обробці запиту" });

  const curency = await curencydb.find();
  const language = await languagedb.find();

  const user = await userdb
    .findOne({ _id: userId })
    .populate("curency language");
  const defCurency = user?.curency?.curencyValue;
  const defLanguage = user?.language?.langValue;
  const defCardNumber = user?.cardNumber;

  res.status(200).json({
    curency: curency,
    language: language,
    defCurency,
    defLanguage,
    defCardNumber,
  });
});

//зберегти налаштування валюти валюти та номеру картки
app.put("/profile/settings", async (req, res) => {
  const id = req.body.id;
  // if (!id) return res.status(500).json({ message: "Помилка при обробці запиту" })
  const userId = req.body.userId;
  if (!userId)
    return res.status(500).json({ message: "Помилка при обробці запиту" });
  const whatToChange = req.body.whatToChange;
  if (!whatToChange)
    return res.status(500).json({ message: "Помилка при обробці запиту" });

  if (!id) {
    res.status(404).json({ message: "Не передано ід" });
  } else {
    if (whatToChange === "curency") {
      const updatedUser = await userdb.findOneAndUpdate(
        { _id: userId },
        { curency: id },
        { new: true }
      );
      res.status(200).json({ message: "Валюта оновлена" });
    } else if (whatToChange === "language") {
      const updatedUser = await userdb.findOneAndUpdate(
        { _id: userId },
        { language: id },
        { new: true }
      );
      res.status(200).json({ message: "Мова оновлена" });
    } else if (whatToChange === "card") {
      const updatedUser = await userdb.findOneAndUpdate(
        { _id: userId },
        { cardNumber: id },
        { new: true }
      );
      res.status(200).json({ message: "Картка оновлена" });
    } else {
      res.status(404).json({ message: "Помилка при оновленні даних профілю" });
    }
  }
});

//робота з профілем користувача кінець

//робота з групами початок
// створити групу
app.post("/group", async (req, res) => {
  const userId = req.body.userId;
  if (!userId)
    return res.status(500).json({ message: "Помилка при обробці запиту" });
  const groupName = req.body.groupName;
  if (!groupName)
    return res.status(500).json({ message: "Помилка при обробці запиту" });
  const groupImage = req.body.groupImage || "";
  // if (!groupImage)
  //   return res.status(500).json({ message: "Помилка при обробці запиту" });

  const newGroup = await groupdb.create({
    name: groupName,
    image: groupImage,
    members: [userId],
  });
  const resp = await newGroup.save();
  if (resp._id) {
    res.status(200).json({ message: "Група створена" });
  } else {
    res.status(404).json({ message: "Група не створена" });
  }
});

//отримати списк груп
app.get("/group", async (req, res) => {
  const groupId = req.query.groupId;
  if (!groupId)
    return res.status(500).json({ message: "Помилка при обробці запиту" });

  const group = await groupdb
    .findOne({ _id: groupId })
    .populate("members", "_id displayName image");

  res.status(200).json(group);
});

//отримати списк груп
app.get("/groupAll", async (req, res) => {
  const userId = req.query.userId;
  if (!userId)
    return res.status(500).json({ message: "Помилка при обробці запиту" });

  const groups = await groupdb
    .find({ members: userId })
    .populate("expenses members");

  res.status(200).json(groups);
});

//редагування групи: імя та картинка
app.put("/group", async (req, res) => {
  const groupId = req.body.groupId;
  if (!groupId)
    return res.status(500).json({ message: "Помилка при обробці запиту" });
  const name = req.body.name;
  if (!name)
    return res.status(500).json({ message: "Помилка при обробці запиту" });
  const image = req.body.image;
  if (!image)
    return res.status(500).json({ message: "Помилка при обробці запиту" });

  const updatedGroup = await groupdb.findOneAndUpdate(
    { _id: groupId },
    { name: name, image: image },
    { new: true }
  );

  if (updatedGroup._id) {
    res.status(200).send({ message: "Група оновлена" });
  } else {
    res.status(404).send({ message: "Група не оновлена" });
  }
});

// видалити групу
app.delete("/group", async (req, res) => {
  const groupId = req.query.groupId;
  if (!groupId)
    return res.status(500).json({ message: "Помилка при обробці запиту" });

  const response = await groupdb.deleteOne({ _id: groupId });

  if (response.deletedCount == 1) {
    res.status(200).json({ message: "Група видалена" });
  } else {
    res.status(404).json({ message: "Група не видалена" });
  }
});
//додавання учасника до групи
app.post("/group/members", async (req, res) => {
  const groupId = req.body.groupId;
  if (!groupId)
    return res.status(500).json({ message: "Помилка при обробці запиту" });
  const userId = req.body.userId;
  if (!userId)
    return res.status(500).json({ message: "Помилка при обробці запиту" });

  const group = await groupdb.findOne({ _id: groupId });
  if (group.members.includes(userId)) {
    res.status(200).json({ message: "Учасник вже доданий", warning: true });
  } else {
    const updatedGroup = await groupdb.findOneAndUpdate(
      { _id: groupId },
      { $push: { members: userId } },
      { new: true }
    );
    if (updatedGroup._id) {
      res.status(200).json({ message: "Учасник доданий" });
    } else {
      res.status(404).json({ message: "Учасник не доданий" });
    }
  }
});
//видалення учасника з групи
app.delete("/group/members", async (req, res) => {
  const groupId = req.query.groupId;
  if (!groupId)
    return res.status(500).json({ message: "Помилка при обробці запиту" });
  const deleteuserId = req.query.delUserId;
  if (!deleteuserId)
    return res.status(500).json({ message: "Помилка при обробці запиту" });

  const response = await groupdb.updateOne(
    { _id: groupId },
    { $pull: { members: deleteuserId } }
  );

  if (response.modifiedCount === 1) {
    res.status(200).json({ message: "Учасник видалений" });
  } else {
    res.status(404).json({ message: "Учасник не видалений" });
  }
});
//отримати посилання на картинку від aws
app.post("/aws/getIngameUrl", async (req, res) => {
  const file = req.files.file;
  if (!file)
    return res.status(500).json({ message: "Помилка при обробці запиту" });
  console.log('файл є')
  if (file.mimetype.includes("heic") || file.mimetype.includes("heif")) {
    const changedBuffer = await convert({
      buffer: file.data, // the HEIC file buffer
      format: "JPEG", // output format
      quality: 1, // the jpeg compression quality, between 0 and 1
    });
    file.data = changedBuffer;
    console.log('файл є хейк')
    //еееексперіменти
    sharp(file.data)
      .resize(200, 200, {
        fit: sharp.fit.inside,
      })
      .toFormat("jpeg")
      .toBuffer()
      .then(async function (outputBuffer) {
        file.data = outputBuffer;
        console.log('файл є в шарп')

        if (file) {
          const s3Client = new S3Client({
            region: "eu-north-1",
            credentials: {
              accessKeyId: process.env.AWS_ACCESS_KEY,
              secretAccessKey: process.env.AWS_SECRET_KEY,
            },
          });
          console.log('створився інстант с3')
          const randomId = uniqid();
          const ext = file.name.split(".").pop();
          const newFileName = randomId + "." + ext;

         await s3Client.send(
            new PutObjectCommand({
              Bucket: process.env.BUCKET_NAME,
              Key: newFileName,
              Body: file.data,
              ACL: "public-read",
              ContentType: file.mimetype,
            })
          );

          

          const link =
            "https://" +
            process.env.BUCKET_NAME +
            ".s3.amazonaws.com/" +
            newFileName;

         

          res.status(200).json(link);
        }
      });
    //еееексперіменти
  } else {

    console.log('а то не хейф ')
    //еееексперіменти
    sharp(file.data)
      .resize(200, 200, {
        fit: sharp.fit.inside,
      })
      .toFormat("jpeg")
      .toBuffer()
      .then(async function (outputBuffer) {
        file.data = outputBuffer;
        console.log('файл є в шарп')
        console.log('файл сам', file)

        if (file) {
          const s3Client = new S3Client({
            region: "eu-north-1",
            credentials: {
              accessKeyId: process.env.AWS_ACCESS_KEY,
              secretAccessKey: process.env.AWS_SECRET_KEY,
            },
          });

          console.log('створено інстанс авс')

          const randomId = uniqid();
          const ext = file.name.split(".").pop();
          const newFileName = randomId + "." + ext;

          console.log('новий файл нейм', newFileName);

          const swa = await s3Client.send(
            new PutObjectCommand({
              Bucket: process.env.BUCKET_NAME,
              Key: newFileName,
              Body: file.data,
              ACL: "public-read",
              ContentType: file.mimetype,
            })
          );

          console.log('після сенд')
          console.log('відповідь', swa)

          const link =
            "https://" +
            process.env.BUCKET_NAME +
            ".s3.amazonaws.com/" +
            newFileName;
            console.log('лінка на файл',link)
          res.status(200).json(link);
        }
      });
  }
});

//робота з групами кінець

//робота з витратами початок
//створення витрати
app.post("/expenses", async (req, res) => {
  const expenseData = req.body;
  if (!expenseData)
    return res.status(500).json({ message: "Помилка при обробці запиту" });

  const newExpense = await expensedb.create(expenseData);
  const response = await newExpense.save();

  if (response._id) {
    const updatedGroup = await groupdb.findOneAndUpdate(
      { _id: response.group },
      { $push: { expenses: response._id } },
      { new: true }
    );

    res.status(200).json({ message: "Витрата створена" });
  } else {
    res.status(404).json({ message: "Учасник не видалений" });
  }
});
//редагування витрати
app.put("/expenses", async (req, res) => {
  const expenseId = req.body.expenseId;
  if (!expenseId)
    return res.status(500).json({ message: "Помилка при обробці запиту" });
  const expense = req.body.expense;
  if (!expense)
    return res.status(500).json({ message: "Помилка при обробці запиту" });

  const updatedExpense = await expensedb.findOneAndUpdate(
    { _id: expenseId },
    expense,
    { new: true }
  );

  if (updatedExpense._id) {
    res.status(200).json({ message: "Витрата відредагована" });
  } else {
    res.status(404).json({ message: "Витрата не відредагована" });
  }
});
//отримати 1 витрату по ід
app.get("/expenses", async (req, res) => {
  const expenseId = req.query.expenseId;
  if (!expenseId)
    return res.status(500).json({ message: "Помилка при обробці запиту" });

  const response = await expensedb
    .findOne({ _id: expenseId })
    .populate("owe.user land.user")
    .populate({
      path: "group",
      populate: {
        path: "members",
        model: "users", // Assuming 'curency' is the model name for currencySchema
      },
    });

  res.status(200).json(response);
});

// видалити витрату
app.delete("/expenses", async (req, res) => {
  const expenseId = req.query.expenseId;
  if (!expenseId)
    return res.status(500).json({ message: "Помилка при обробці запиту" });

  const expense = await expensedb.findOne({_id: expenseId})

  const response = await expensedb.deleteOne({ _id: expenseId });

  if (response.deletedCount == 1) {
    await groupdb.updateOne({_id: expense.group},{ $pull: { expenses: expenseId } })

    res.status(200).json({ message: "Витрата видалена" });
  } else {
    res.status(404).json({ message: "Витрата не видалена" });
  }
});
// отримати всі витрати по ід групи
app.get("/expensesAll", async (req, res) => {
  const groupId = req.query.groupId;
  if (!groupId)
    return res.status(500).json({ message: "Помилка при обробці запиту" });

  const response = await expensedb
    .find({ group: groupId })
    .populate({ path: "group" })
    .populate({ path: "owe.user" })
    .populate({
      path: "land.user",
      populate: {
        path: "curency",
        model: "curency", // Assuming 'curency' is the model name for currencySchema
      },
    })
    .sort({ createdAt: -1 });

  res.status(200).json(response);
});
// отримати суму всіх витрат для головної сторінки
app.get("/expensesSum", async (req, res) => {
  const response = await expensedb.aggregate([
    {
      $group: {
        _id: null,
        totalPrice: { $sum: "$price" },
      },
    },
  ]);
  res.status(200).json(response[0].totalPrice);
});
//робота з витратами кінець

//робота з розрахунками початок

// отримати розрахунки(танзакції) по ід групи
app.get("/calculateSettle", async function (req, res) {
  const groupId = req.query.groupId;
  if (!groupId)
    return res.status(500).json({ message: "Помилка при обробці запиту" });

  // перед початком актуальних розрахунків видалямо старі окрім тих хто сеттлед (вони залишаються)
  await settledb.deleteMany({
    $and: [{ groupId: groupId }, { settled: { $eq: 0 } }],
  });
  // для розрахунку отримуємо всі експенси та учасників групи
  const group = await groupdb
    .findById(groupId)
    .populate("members")
    .select("members -_id");

  const members = group.members;
  const expenses = await expensedb
    .find({ group: groupId })
    .populate("land.user owe.user");
  // якщо є мембери та екпенси то починаємо розрахунок
  if (members.length > 0 && expenses.length > 0) {
    // для кожного мембера робимо запис і сума 0
    let sums = members.reduce((acc, member) => {
      acc[member._id] = 0;
      return acc;
    }, {});

    // проходимся по масиву і сумуємо хто в лендерах і мінусуємо тих хто в оверах
    expenses.forEach((expense) => {
      expense.land.forEach((land) => {
        sums[land.user._id] += land.sum;
      });
      expense.owe.forEach((owe) => {
        sums[owe.user._id] -= owe.sum;
      });
    });

    // готуємо результат
    const result = members.map((member) => {
      return {
        _id: member._id,
        image: member.image,
        displayName: member.displayName,
        sum: sums[member._id].toFixed(2),
      };
    });

    // якщо є результат то фільтруємо і готуємо масив транзакцій які будуть повертатись на фронтенд

    if (result.length > 0) {
      const positives = result
        .filter((member) => parseFloat(member.sum) > 0)
        .sort((a, b) => parseFloat(b.sum) - parseFloat(a.sum));
      const negatives = result
        .filter((member) => parseFloat(member.sum) < 0)
        .sort((a, b) => parseFloat(a.sum) - parseFloat(b.sum));

      const transactions = [];

      while (positives.length > 0 && negatives.length > 0) {
        const positive = positives[0];
        const negative = negatives[0];

        const positiveSum = parseFloat(positive.sum);
        const negativeSum = parseFloat(negative.sum);

        const amount = Math.min(positiveSum, -negativeSum);

        transactions.push({
          groupId: groupId,
          ower: negative,
          lender: positive,
          amount: amount.toFixed(2),
          settled: 0,
        });

        positive.sum = (positiveSum - amount).toFixed(2);
        negative.sum = (negativeSum + amount).toFixed(2);

        if (parseFloat(positive.sum) === 0) {
          positives.shift();
        }
        if (parseFloat(negative.sum) === 0) {
          negatives.shift();
        }
      }
      // створюємо масив транзакцій в базі даних
      await settledb.create(transactions);
      // грузимо створені транзакції з бази
      const transactionArray = await settledb
        .find({ groupId: groupId })
        .populate("ower lender");

      res.status(200).send(transactionArray);
    }
  }
});

// створення розрахунку з прапорем сеттл (виплати)
app.post("/settle", async (req, res) => {
  const settleData = req.body;
  if (!settleData)
    return res.status(500).json({ message: "Помилка при обробці запиту" });

  const newSettle = await settledb.create(settleData);
  const response = await newSettle.save();

  if (response._id) {
    res.status(200).json({ message: "Розрахунок створено" });
  } else {
    res.status(404).json({ message: "Розрахунок не створено" });
  }
});
// отримати всі розрахунки по ід користувача
app.get("/settle", async (req, res) => {
  const userId = req.query.userId;
  if (!userId)
    return res.status(500).json({ message: "Помилка при обробці запиту" });

  const settles = await settledb
    .find({ $or: [{ ower: { $eq: userId } }, { lender: { $eq: userId } }] })
    .populate("ower lender groupId");

  res.status(200).send(settles);
});

// видалення оплати за розрахунки
app.delete("/settle", async (req, res) => {
  const settleId = req.query.settleId;
  if (!settleId)
    return res.status(500).json({ message: "Помилка при обробці запиту" });

  const response = await settledb.deleteOne({ _id: settleId });

  if (response.deletedCount == 1) {
    res.status(200).json({ message: "Розрахунок видалено" });
  } else {
    res.status(404).json({ message: "Розрахунок не видалено" });
  }
});

//робота з розрахунками кінець

//запуск сервера
app.listen(PORT, () => {
  console.log(`server start on port ${PORT}`);
});



