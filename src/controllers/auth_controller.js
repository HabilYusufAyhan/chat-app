const { validationResult } = require('express-validator');
const User = require('../model/user_model');
const passport = require('passport');
require('../config/passport_local')(passport);
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const Chat = require('../model/chat_model');

const loginFormunuGoster = (req, res, next) => {
    res.render('login', { layout: './layout/auth_layout.ejs', title: 'Giriş Yap' });
}

const login = (req, res, next) => {

    const hatalar = validationResult(req);
    // console.log(hatalarDizisi);
    req.flash('email', req.body.email);
    req.flash('sifre', req.body.sifre);
    if (!hatalar.isEmpty()) {

        req.flash('validation_error', hatalar.array());


        //console.log(req.session);
        res.redirect('/login');
    } else {
        passport.authenticate('local', {
            successRedirect: '/chat',
            failureRedirect: '/login',
            failureFlash: true
        })(req, res, next);
    }




}

const registerFormunuGoster = (req, res, next) => {

    res.render('register', { layout: './layout/auth_layout.ejs', title: 'Kayıt Ol' });
}

const register = async (req, res, next) => {

    const hatalar = validationResult(req);
    // console.log(hatalarDizisi);
    if (!hatalar.isEmpty()) {

        req.flash('validation_error', hatalar.array());
        req.flash('email', req.body.email);
        req.flash('ad', req.body.ad);
        req.flash('soyad', req.body.soyad);
        req.flash('sifre', req.body.sifre);
        req.flash('resifre', req.body.resifre);

        //console.log(req.session);
        res.redirect('/register');

    } else {


        try {
            const _user = await User.findOne({ email: req.body.email });

            if (_user && _user.emailAktif == true) {
                req.flash('validation_error', [{ msg: "Bu mail kullanımda" }]);
                req.flash('email', req.body.email);
                req.flash('ad', req.body.ad);
                req.flash('soyad', req.body.soyad);
                req.flash('sifre', req.body.sifre);
                req.flash('resifre', req.body.resifre);
                res.redirect('/register');
            } else if ((_user && _user.emailAktif == false) || _user == null) {

                if (_user) {
                    await User.findByIdAndRemove({ _id: _user._id });
                }
                const newUser = new User({
                    email: req.body.email,
                    ad: req.body.ad,
                    soyad: req.body.soyad,
                    sifre: await bcrypt.hash(req.body.sifre, 10)
                });
                await newUser.save();
                console.log("kullanıcı kaydedildi");






                //jwt işlemleri 

                const jwtBilgileri = {
                    id: newUser.id,
                    mail: newUser.email
                };

                const jwtToken = jwt.sign(jwtBilgileri, process.env.CONFIRM_MAIL_JWT_SECRET, { expiresIn: '1d' });
                console.log(jwtToken);


                //MAIL GONDERME ISLEMLERI
                const url = process.env.WEB_SITE_URL + 'verify?id=' + jwtToken;
                console.log("gidilecek url:" + url);

                let transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: process.env.GMAIL_USER,
                        pass: process.env.GMAIL_SIFRE
                    }
                });

                await transporter.sendMail({

                    from: 'Nodejs Uygulaması <info@nodejskursu.com',
                    to: newUser.email,
                    subject: "Emailiniz Lütfen Onaylayın",
                    text: "Emailinizi onaylamak için lütfen şu linki tıklayın: " + " " + url

                }, (error, info) => {
                    if (error) {
                        console.log("bir hata var" + error);
                    }
                    console.log("Mail gönderildi");
                    console.log(info);
                    transporter.close();
                });

                req.flash('success_message', [{ msg: 'Lütfen mail kutunuzu kontrol edin' }]);
                res.redirect('/login');

            }
        } catch (err) {
            console.log("user kaydedilirken hata cıktı " + err);
        }
    }





}

const forgetPasswordFormunuGoster = (req, res, next) => {
    res.render('forget_password', { layout: './layout/auth_layout.ejs', title: 'Şifremi Unuttum' });
}
const forgetPassword = async (req, res, next) => {

    const hatalar = validationResult(req);

    if (!hatalar.isEmpty()) {

        req.flash('validation_error', hatalar.array());
        req.flash('email', req.body.email);


        //console.log(req.session);
        res.redirect('/forget-password');



    }
    //burası calısıyorsa kullanıcı düzgün bir mail girmiştir
    else {

        try {
            const _user = await User.findOne({ email: req.body.email, emailAktif: true });

            if (_user) {
                //kullanıcıya şifre sıfırlama maili atılabilir
                const jwtBilgileri = {
                    id: _user._id,
                    mail: _user.email
                };
                const secret = process.env.RESET_PASSWORD_JWT_SECRET + "-" + _user.sifre;
                const jwtToken = jwt.sign(jwtBilgileri, secret, { expiresIn: '1d' });

                //MAIL GONDERME ISLEMLERI
                const url = process.env.WEB_SITE_URL + 'reset-password/' + _user._id + "/" + jwtToken;


                let transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: process.env.GMAIL_USER,
                        pass: process.env.GMAIL_SIFRE
                    }
                });

                await transporter.sendMail({

                    from: 'Nodejs Uygulaması <info@nodejskursu.com',
                    to: _user.email,
                    subject: "Şifre Güncelleme",
                    text: "Şifrenizi oluşturmak için lütfen şu linki tıklayın:" + url

                }, (error, info) => {
                    if (error) {
                        console.log("bir hata var" + error);
                    }
                    console.log("Mail gönderildi");
                    console.log(info);
                    transporter.close();
                });

                req.flash('success_message', [{ msg: 'Lütfen mail kutunuzu kontrol edin' }]);
                res.redirect('/login');





            } else {
                req.flash('validation_error', [{ msg: "Bu mail kayıtlı değil veya Kullanıcı pasif" }]);
                req.flash('email', req.body.email);
                res.redirect('forget-password');
            }
            //jwt işlemleri 








        } catch (err) {
            console.log("user kaydedilirken hata cıktı " + err);
        }



    }

    //res.render('forget_password', { layout: './layout/auth_layout.ejs' });
}

const logout = (req, res, next) => {
    req.logout();
    req.session.destroy((error) => {
        res.clearCookie('connect.sid');
        //req.flash('success_message', [{ msg: 'Başarıyla çıkış yapıldı' }]);
        res.render('login', { layout: './layout/auth_layout.ejs', title: 'Giriş Yap', success_message: [{ msg: 'Başarıyla çıkış yapıldı' }] });
        //res.redirect('/login');
        //res.send('çıkış yapıldı');
    });

}

const verifyMail = (req, res, next) => {

    const token = req.query.id;
    if (token) {

        try {
            jwt.verify(token, process.env.CONFIRM_MAIL_JWT_SECRET, async (e, decoded) => {

                if (e) {
                    req.flash('error', 'Kod Hatalı veya Süresi Geçmiş');
                    res.redirect('/login');
                } else {

                    const tokenIcindekiIDDegeri = decoded.id;
                    const sonuc = await User.findByIdAndUpdate(tokenIcindekiIDDegeri, { emailAktif: true });

                    if (sonuc) {
                        req.flash("success_message", [{ msg: 'Başarıyla mail onaylandı' }]);
                        res.redirect('/login');
                    } else {
                        req.flash("error", 'Lütfen tekrar kullanıcı oluşturun');
                        res.redirect('/login');
                    }
                }
            });
        } catch (err) {

        }



    } else {
        req.flash("error", 'Token Yok veya Geçersiz');
        res.redirect('/login');
    }


}

const yeniSifreyiKaydet = async (req, res, next) => {
    const hatalar = validationResult(req);

    if (!hatalar.isEmpty()) {

        req.flash('validation_error', hatalar.array());
        req.flash('sifre', req.body.sifre);
        req.flash('resifre', req.body.resifre);

        console.log("formdan gelen değerler");
        console.log(req.body);
        //console.log(req.session);
        res.redirect('/reset-password/' + req.body.id + "/" + req.body.token);

    } else {

        const _bulunanUser = await User.findOne({ _id: req.body.id, emailAktif: true });

        const secret = process.env.RESET_PASSWORD_JWT_SECRET + "-" + _bulunanUser.sifre;

        try {
            jwt.verify(req.body.token, secret, async (e, decoded) => {

                if (e) {
                    req.flash('error', 'Kod Hatalı veya Süresi Geçmiş');
                    res.redirect('/forget-password');
                } else {

                    const hashedPassword = await bcrypt.hash(req.body.sifre, 10);
                    const sonuc = await User.findByIdAndUpdate(req.body.id, { sifre: hashedPassword });

                    if (sonuc) {
                        req.flash("success_message", [{ msg: 'Başarıyla şifre güncellendi' }]);
                        res.redirect('/login');
                    } else {
                        req.flash("error", 'Lütfen tekrar şifre sıfırlama adımlarını yapın');
                        res.redirect('/login');
                    }
                }
            });
        } catch (err) {
            console.log("hata cıktı" + err);
        }




    }
}
const yeniSifreFormuGoster = async (req, res, next) => {
    const linktekiID = req.params.id;
    const linktekiToken = req.params.token;

    if (linktekiID && linktekiToken) {

        const _bulunanUser = await User.findOne({ _id: linktekiID });

        const secret = process.env.RESET_PASSWORD_JWT_SECRET + "-" + _bulunanUser.sifre;

        try {
            jwt.verify(linktekiToken, secret, async (e, decoded) => {

                if (e) {
                    req.flash('error', 'Kod Hatalı veya Süresi Geçmiş');
                    res.redirect('/forget-password');
                } else {


                    res.render('new_password', { id: linktekiID, token: linktekiToken, layout: './layout/auth_layout.ejs', title: 'Şifre Güncelle' });

                }
            });
        } catch (err) {

        }


    } else {
        req.flash('validation_error', [{ msg: "Lütfen maildeki linki tıklayın. Token Bulunamadı" }]);

        res.redirect('forget-password');
    }
}
const openprofilepage = async function (req, res, next) {
    if (!req.query.id) {
        res.redirect('/profile?id=' + req.user.id)

    }

    let usesr = await User.findOne({ _id: req.query.id })
    console.log(usesr);
    res.render('profil', { req: req, user: usesr, title: 'Profile' });
}
const postprofilepage = async function (req, res, next) {
    if (req.body.ad.length < 2 || req.body.ad.length > 30) {
        console.log('lengthe takıldı');
        req.flash('validation_error', [{ msg: "Ad en az 2 harften oluşmalı" }]);

        req.body.ad = req.user.ad
    }
    else if (req.body.soyad.length < 2 || req.body.soyad.length > 30) {
        req.flash('validation_error', [{ msg: "Soyad en az 2 harften oluşmalı" }]);

        req.body.soyad = req.user.soyad


    }




    else if (req.user.id != req.query.id) {
        res.redirect('/profile')
    }
    const fs = require('fs');

    console.log(req.body);
    const guncelBilgiler = {
        ad: req.body.ad,
        soyad: req.body.soyad,
        userabout: req.body.userabout
    }


    try {
        if (req.body.links2) {
            const fileData = req.body.links2

            // Base64 veriyi çıkar
            const base64Data = fileData.replace(/^data:image\/jpeg;base64,/, '');

            // Dosyayı sunucuya kaydet
            fs.writeFile('./src/uploads/avatars/' + req.user.email + '.jpg', base64Data, 'base64', (err) => {
                if (err) throw err;
                console.log('Dosya kaydedildi.');
            });
            guncelBilgiler.banner = req.user.email + '.jpg'
        } if (req.body.links1) {
            const fileData = req.body.links1

            // Base64 veriyi çıkar
            const base64Data = fileData.replace(/^data:image\/jpeg;base64,/, '');

            // Dosyayı sunucuya kaydet
            fs.writeFile('./src/uploads/avatars/' + req.user.email + 'avatar.jpg', base64Data, 'base64', (err) => {
                if (err) throw err;
                console.log('Dosya kaydedildi.');
            });
            guncelBilgiler.avatar = req.user.email + 'avatar.jpg'
        } if (req.body.instagram) {
            console.log('instagrama girdi');
            guncelBilgiler.instagram = req.body.instagram
        } if (req.body.twitter) {
            console.log('twittera girdi');
            guncelBilgiler.twitter = req.body.twitter
        } if (req.body.linkedin) {
            console.log('linkedine girdi');
            guncelBilgiler.linkedin = req.body.linkedin
        }

        const sonuc = await User.findByIdAndUpdate(req.user.id, guncelBilgiler);

        if (sonuc) {
            console.log("update tamamlandı");
            res.redirect('/profile');
        }


    } catch (hata) {
        console.log(hata);
    }
}


const openchatpage = async function (req, res, next) {
    let receiver
    const userIdToExclude = req.user.id;
    const alluser = await User.find({ _id: { $ne: userIdToExclude } });
    if (req.query.id) {
        receiver = await User.findOne({ _id: req.query.id })
    }
    let usesr = await User.findOne({ _id: req.user.id })
    res.render('chat.ejs', { req: req, user: usesr, title: 'Chat', receiver: receiver, alluser: alluser });
}
const sendfriendreq = async function (req, res, next) {
    if (req.query.id != req.user.id) {
        let requser = await User.findOne({ _id: req.query.id })
        if (requser) {
            // Eğer kullanıcı bulunduysa, friendreq dizisine req.user.id ekleyin.
            requser.friendsreq.push(req.user.id);

            // Değişikliği kaydedin.
            await requser.save();
            res.redirect('/chat')
        }
    }
}
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
    openprofilepage,
    postprofilepage,
    openchatpage,
    sendfriendreq
}