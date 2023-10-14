const dotenv = require("dotenv").config();
const express = require("express");
const app = express();
//session işlemleri için gereken paket
const session = require("express-session");
//render edilen sayfalarda mesaj göstermek için kullanılan
//ve de çalısmak için session paketi isteyen yardımcı paket
const flash = require("connect-flash");

const passport = require("passport");

//template engine ayarları
const ejs = require("ejs");

const path = require("path");

app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", path.resolve(__dirname, "./src/views"));
app.use("/uploads", express.static(path.join(__dirname, "/src/uploads")));
//db baglantısı
require("./src/config/database");
const MongoDBStore = require("connect-mongodb-session")(session);

const sessionStore = new MongoDBStore({
  uri: process.env.MONGODB_CONNECTION_STRING,
  collection: "sessionlar",
});

//session ve flash message
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
    },
    store: sessionStore,
  })
);

//flah mesajların middleware olarak kullanılmasını sagladık
app.use(flash());

app.use((req, res, next) => {
  res.locals.validation_error = req.flash("validation_error");
  res.locals.success_message = req.flash("success_message");
  res.locals.email = req.flash("email");
  res.locals.ad = req.flash("ad");
  res.locals.soyad = req.flash("soyad");
  res.locals.sifre = req.flash("sifre");

  res.locals.login_error = req.flash("error");

  next();
});

app.use(passport.initialize());
app.use(passport.session());

//routerlar include edilir
const authRouter = require("./src/routers/auth_router");
const yonetimRouter = require("./src/routers/yonetim_router");
const { none } = require("./src/config/multer_config");

//formdan gelen değerlerin okunabilmesi için
app.use(express.urlencoded({ extended: true }));

let sayac = 0;

app.use("/", authRouter);
app.use("/yonetim", yonetimRouter);

app.listen(process.env.PORT, () => {
  console.log(`Server ${process.env.PORT} portundan ayaklandı`);
});
