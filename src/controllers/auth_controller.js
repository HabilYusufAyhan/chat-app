const { validationResult } = require('express-validator');
const User = require('../model/user_model');
const passport = require('passport');
require('../config/passport_local')(passport);
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const Chat = require('../model/chat_model');
const Room = require('../model/room_model');

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



                    from: 'Guvercin <info@guvercin.com',
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
    if (req.query.id) {
        if (req.query.id.length != 24) {
            res.redirect('/profile')
        }
    }
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
    try {

        let user = await User.findOne({ _id: req.user.id });


        if (req.query.id) {
            if (req.query.id.length != 24) {
                res.redirect('/chat')
            }
        }
        if (req.query.id && !user.friends.includes(req.query.id)) {

            res.redirect('/chat')
        } else {


            var message;
            let allfriendlastmessage = await Chat.find({ kullanici1: req.user.id })

            let allfriendlastmessage2 = await Chat.find({ kullanici2: req.user.id })
            let mainallfriendlastmessage = [];
            mainallfriendlastmessage = mainallfriendlastmessage.concat(allfriendlastmessage, allfriendlastmessage2)
            console.log(mainallfriendlastmessage);
            /*  var datamessage1 = await Chat.find({ id: searchid1 })
              var datamessage2 = await Chat.find({ id: searchid2 })
              message = message.concat(datamessage1, datamessage2);
              message.sort((a, b) => a.createdAt - b.createdAt);*/

            if (req.query.id) {
                message = await Chat.findOne({ kullanici1: req.user.id, kullanici2: req.query.id })
                if (!message) {
                    message = await Chat.findOne({ kullanici2: req.user.id, kullanici1: req.query.id })
                }
            } else {
                message = { mesaj: [{ gonderen: null }] }
            }



            if (mainallfriendlastmessage.mesaj = []) {
                mainallfriendlastmessage.mesaj = []
            }
            let receiver


            let friends = [];
            for (let index = 0; index < user.friends.length; index++) {
                friends[index] = await User.findOne({ _id: user.friends[index] })

            }

            if (req.query.id) {
                //bu kullanıcı ile arkadaş mı onun kontrolü yapılacak
                receiver = await User.findOne({ _id: req.query.id })
            }

            let usesr = await User.findOne({ _id: req.user.id })
            /*  message.mesaj.forEach(element => {
                  console.log(element.gonderen);
                  console.log(String(element.gonderen));
                  if (String(element.gonderen) == String(usesr._id)) {
                      console.log('true');
                  }
              });*/

            //let messagesee = await Chat.findOne({ gonderen: req.user.id } || { alan: req.user.id })
            console.log(mainallfriendlastmessage);
            res.render('chat.ejs', { user: usesr, title: 'Chat', receiver: receiver, alluser: friends, message: message.mesaj, allfriendlastmessage: mainallfriendlastmessage });
        }
    } catch (error) {
        console.log('hata kodu: ' + error);
    }
}


const getfriendreq = async function (req, res, next) {
    const user = await User.findOne({ _id: req.user.id });
    const allfriendreq = [];

    for (const friendId of user.friendsreq) {
        const resuser = await User.findOne({ _id: friendId });
        allfriendreq.push(resuser);
    }

    res.json(allfriendreq);

}

const acceptfriendreq = async function (req, res, next) {
    if (req.query.id != req.user.id) {
        let roomsize = await Room.find()
        console.log(roomsize.length);
        const newRoom = new Room({
            user1: req.user.id,
            user2: req.query.id,
            roomid: roomsize.length
        })
        const newChat = new Chat({
            mesaj: [{ gonderen: null, alan: null, mesaj: null }],
            kullanici1: req.user.id,
            kullanici2: req.query.id
        })
        await newChat.save();
        await newRoom.save();
        let requser = await User.findOne({ _id: req.query.id })
        let mainuser = await User.findOne({ _id: req.user.id })
        if (requser) {
            // Eğer kullanıcı bulunduysa, friendreq dizisine req.user.id ekleyin.
            mainuser.friendsreq.remove(req.query.id);
            requser.friends.push(req.user.id)
            mainuser.friends.push(req.query.id)
            // Değişikliği kaydedin.
            await requser.save();
            await mainuser.save();
            res.redirect('/chat')
        }
    }
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
const rejectfriendreq = async function (req, res, next) {
    if (req.query.id != req.user.id) {

        let requser = await User.findOne({ _id: req.user.id })

        if (requser) {
            // Eğer kullanıcı bulunduysa, friendreq dizisine req.user.id ekleyin.
            requser.friendsreq.remove(req.query.id);

            // Değişikliği kaydedin.
            await requser.save();

            res.redirect('/chat')
        }
    }
}
const searchvalue = async function (req, res, next) {
    const searchuser = await User.find({ email: { $regex: `^${req.body.searchText}`, $options: 'i' } });
    console.log(searchuser);
    res.json(searchuser);
}
const openchangepassword = async function (req, res, next) {
    res.render('change_password.ejs', { title: 'Şifre Değiştir' });
}
const postchangepassword = async function (req, res, next) {
    const oldpass = req.body.oldsifre;
    const hatalar = validationResult(req);

    if (!hatalar.isEmpty()) {

        req.flash('validation_error', hatalar.array());
        req.flash('sifre', req.body.sifre);
        req.flash('resifre', req.body.resifre);

        console.log("formdan gelen değerler");
        console.log(req.body);
        //console.log(req.session);
        res.redirect('/changepassword');

    } else {
        const user = await User.findOne({ _id: req.user.id });
        const mevcutpass = await bcrypt.compare(oldpass, user.sifre);

        if (!mevcutpass) {
            req.flash('validation_error', { msg: 'Eski şifreniz yanlış' })
            res.redirect('/changepassword')
        } else {
            let sifre = await bcrypt.hash(req.body.sifre, 10)
            user.sifre = sifre;
            user.save();
            req.flash('success_message', { msg: 'Şifre başarıyla değiştirildi' })
            res.redirect('/changepassword')
        }
    }



}
const removefriend = async function (req, res, next) {
    let user = await User.findOne({ _id: req.user.id })

    if (req.query.id) {

        let friend = await User.findOne({ _id: req.query.id })
        if (user.friends.includes(req.query.id)) {
            user.friends.remove(req.query.id)
            friend.friends.remove(req.user.id)
            let room = await Room.findOne({ user1: req.user.id, user2: req.query.id })
            if (!room) {
                room = await Room.findOne({ user1: req.query.id, user2: req.user.id })
            }
            user.save();
            friend.save();
            room.remove();
            res.redirect('/chat')
        } else {
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
    sendfriendreq,
    searchvalue,
    getfriendreq,
    rejectfriendreq,
    acceptfriendreq,
    openchangepassword,
    postchangepassword,
    removefriend
}