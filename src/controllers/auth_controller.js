const { validationResult } = require("express-validator");
const User = require("../model/user_model");
const guide = require("../model/guide_model");
const passport = require("passport");
require("../config/passport_local")(passport);
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

const loginFormunuGoster = (req, res, next) => {
  console.log(res.locals.validation_error);
  res.render("login.ejs");
};
const registerFormunuGoster = (req, res, next) => {
  res.render("signup.ejs");
};

const login = (req, res, next) => {
  console.log(res.locals.validation_error);
  const hatalar = validationResult(req);
  // console.log(hatalarDizisi);
  req.flash("email", req.body.email);
  req.flash("sifre", req.body.sifre);
  if (!hatalar.isEmpty()) {
    req.flash("validation_error", hatalar.array());

    //console.log(req.session);
    res.redirect("/login");
  } else {
    passport.authenticate("local", {
      successRedirect: "/",
      failureRedirect: "/login",
      failureFlash: true,
    })(req, res, next);
  }
};

const register = async (req, res, next) => {
  const hatalar = validationResult(req);
  // console.log(hatalarDizisi);
  if (!hatalar.isEmpty()) {
    req.flash("validation_error", hatalar.array());
    req.flash("email", req.body.email);
    req.flash("companyName", req.body.companyName);

    req.flash("sifre", req.body.sifre);

    //console.log(req.session);
    res.redirect("/signup");
  } else {
    try {
      const _user = await User.findOne({ email: req.body.email });

      if (_user && _user.emailAktif == true) {
        req.flash("validation_error", [{ msg: "Bu mail kullanımda" }]);
        req.flash("email", req.body.email);
        req.flash("companyName", req.body.companyName);
        req.flash("sifre", req.body.sifre);

        res.redirect("/signup");
      } else if ((_user && _user.emailAktif == false) || _user == null) {
        if (_user) {
          await User.findByIdAndRemove({ _id: _user._id });
        }
        const newUser = new User({
          email: req.body.email,
          companyName: req.body.companyName,
          sifre: await bcrypt.hash(req.body.sifre, 10),
        });
        await newUser.save();
        console.log("kullanıcı kaydedildi");

        //jwt işlemleri

        const jwtBilgileri = {
          id: newUser.id,
          mail: newUser.email,
        };

        const jwtToken = jwt.sign(
          jwtBilgileri,
          process.env.CONFIRM_MAIL_JWT_SECRET,
          { expiresIn: "1d" }
        );
        console.log(jwtToken);

        //MAIL GONDERME ISLEMLERI
        const url = process.env.WEB_SITE_URL + "verify?id=" + jwtToken;
        console.log("gidilecek url:" + url);

        let transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_SIFRE,
          },
        });

        await transporter.sendMail(
          {
            from: "Guide APP <info@guideapp.com",
            to: newUser.email,
            subject: "Emailiniz Lütfen Onaylayın",
            text:
              "Emailinizi onaylamak için lütfen şu linki tıklayın:" + " " + url,
          },
          (error, info) => {
            if (error) {
              console.log("bir hata var" + error);
            }
            console.log("Mail gönderildi");
            console.log(info);
            transporter.close();
          }
        );

        req.flash("success_message", [
          { msg: "Lütfen mail kutunuzu kontrol edin" },
        ]);
        res.redirect("/login");
      }
    } catch (err) {
      console.log("user kaydedilirken hata cıktı " + err);
    }
  }
};

const forgetPasswordFormunuGoster = (req, res, next) => {
  res.render("forget_password", {});
};
const forgetPassword = async (req, res, next) => {
  const hatalar = validationResult(req);

  if (!hatalar.isEmpty()) {
    req.flash("validation_error", hatalar.array());
    req.flash("email", req.body.email);

    //console.log(req.session);
    res.redirect("/forgetpassword");
  }
  //burası calısıyorsa kullanıcı düzgün bir mail girmiştir
  else {
    try {
      const _user = await User.findOne({
        email: req.body.email,
        emailAktif: true,
      });

      if (_user) {
        //kullanıcıya şifre sıfırlama maili atılabilir
        const jwtBilgileri = {
          id: _user._id,
          mail: _user.email,
        };
        const secret =
          process.env.RESET_PASSWORD_JWT_SECRET + "-" + _user.sifre;
        const jwtToken = jwt.sign(jwtBilgileri, secret, { expiresIn: "1d" });

        //MAIL GONDERME ISLEMLERI
        const url =
          process.env.WEB_SITE_URL +
          "resetpassword/" +
          _user._id +
          "/" +
          jwtToken;

        let transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_SIFRE,
          },
        });

        await transporter.sendMail(
          {
            from: "Nodejs Uygulaması <info@nodejskursu.com",
            to: _user.email,
            subject: "Şifre Güncelleme",
            text:
              "Şifrenizi oluşturmak için lütfen şu linki tıklayın:" + " " + url,
          },
          (error, info) => {
            if (error) {
              console.log("bir hata var" + error);
            }
            console.log("Mail gönderildi");
            console.log(info);
            transporter.close();
          }
        );

        req.flash("success_message", [
          { msg: "Lütfen mail kutunuzu kontrol edin" },
        ]);
        res.redirect("/login");
      } else {
        req.flash("validation_error", [
          { msg: "Bu mail kayıtlı değil veya Kullanıcı pasif" },
        ]);
        req.flash("email", req.body.email);
        res.redirect("/forgetpassword");
      }
      //jwt işlemleri
    } catch (err) {
      console.log("user kaydedilirken hata cıktı " + err);
    }
  }

  //res.render('forget_password', { layout: './layout/auth_layout.ejs' });
};

const logout = (req, res, next) => {
  req.logout();
  req.session.destroy((error) => {
    res.clearCookie("connect.sid");
    //req.flash('success_message', [{ msg: 'Başarıyla çıkış yapıldı' }]);
    res.render("login", {
      layout: "./layout/auth_layout.ejs",
      title: "Giriş Yap",
      success_message: [{ msg: "Başarıyla çıkış yapıldı" }],
    });
    //res.redirect('/login');
    //res.send('çıkış yapıldı');
  });
};

const verifyMail = (req, res, next) => {
  const token = req.query.id;
  if (token) {
    try {
      jwt.verify(
        token,
        process.env.CONFIRM_MAIL_JWT_SECRET,
        async (e, decoded) => {
          if (e) {
            req.flash("error", "Kod Hatalı veya Süresi Geçmiş");
            res.redirect("/login");
          } else {
            const tokenIcindekiIDDegeri = decoded.id;
            const sonuc = await User.findByIdAndUpdate(tokenIcindekiIDDegeri, {
              emailAktif: true,
            });

            if (sonuc) {
              req.flash("success_message", [
                { msg: "Başarıyla mail onaylandı" },
              ]);
              res.redirect("/login");
            } else {
              req.flash("error", "Lütfen tekrar kullanıcı oluşturun");
              res.redirect("/login");
            }
          }
        }
      );
    } catch (err) {}
  } else {
    req.flash("error", "Token Yok veya Geçersiz");
    res.redirect("/login");
  }
};

const yeniSifreyiKaydet = async (req, res, next) => {
  const hatalar = validationResult(req);

  if (!hatalar.isEmpty()) {
    req.flash("validation_error", hatalar.array());
    req.flash("sifre", req.body.sifre);

    console.log("formdan gelen değerler");
    console.log(req.body);
    //console.log(req.session);
    res.redirect("/resetpassword/" + req.body.id + "/" + req.body.token);
  } else {
    const _bulunanUser = await User.findOne({
      _id: req.params.id.trim(),
      emailAktif: true,
    });
    console.log(_bulunanUser);
    const secret =
      process.env.RESET_PASSWORD_JWT_SECRET + "-" + _bulunanUser.sifre;

    try {
      jwt.verify(req.params.token.trim(), secret, async (e, decoded) => {
        if (e) {
          req.flash("error", "Kod Hatalı veya Süresi Geçmiş");
          res.redirect("/forgetpassword");
        } else {
          const hashedPassword = await bcrypt.hash(req.body.sifre, 10);
          const sonuc = await User.findByIdAndUpdate(req.params.id.trim(), {
            sifre: hashedPassword,
          });

          if (sonuc) {
            req.flash("success_message", [
              { msg: "Başarıyla şifre güncellendi" },
            ]);
            res.redirect("/login");
          } else {
            req.flash(
              "error",
              "Lütfen tekrar şifre sıfırlama adımlarını yapın"
            );
            res.redirect("/login");
          }
        }
      });
    } catch (err) {
      console.log("hata cıktı" + err);
    }
  }
};
const yeniSifreFormuGoster = async (req, res, next) => {
  const linktekiID = req.params.id;
  const linktekiToken = req.params.token;

  if (linktekiID && linktekiToken) {
    const _bulunanUser = await User.findOne({ _id: linktekiID });

    const secret =
      process.env.RESET_PASSWORD_JWT_SECRET + "-" + _bulunanUser.sifre;

    try {
      jwt.verify(linktekiToken, secret, async (e, decoded) => {
        if (e) {
          req.flash("error", "Kod Hatalı veya Süresi Geçmiş");
          res.redirect("/forgetpassword");
        } else {
          res.render("new_password", {
            id: linktekiID,
            token: linktekiToken,
          });
        }
      });
    } catch (err) {}
  } else {
    req.flash("validation_error", [
      { msg: "Lütfen maildeki linki tıklayın. Token Bulunamadı" },
    ]);

    res.redirect("/forgetpassword");
  }
};

module.exports = {
  loginFormunuGoster,
  registerFormunuGoster,
  forgetPasswordFormunuGoster,
  register,
  login,
  forgetPassword,
  logout,
  verifyMail,
  yeniSifreFormuGoster,
  yeniSifreyiKaydet,
};
