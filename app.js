const dotenv = require('dotenv').config();
const express = require('express');
const socket = require('socket.io');
const app = express();

//session işlemleri için gereken paket
const session = require('express-session');
//render edilen sayfalarda mesaj göstermek için kullanılan
//ve de çalısmak için session paketi isteyen yardımcı paket
const flash = require('connect-flash');

const passport = require('passport');

//template engine ayarları
const ejs = require('ejs');

const path = require('path');

app.use(express.static('public'));
app.use("/uploads", express.static(path.join(__dirname, '/src/uploads')));
app.set('view engine', 'ejs');
app.set('views', path.resolve(__dirname, './src/views'));


//db baglantısı
require('./src/config/database');
const MongoDBStore = require('connect-mongodb-session')(session);


const sessionStore = new MongoDBStore({
    uri: process.env.MONGODB_CONNECTION_STRING,
    collection: 'sessionlar'
});


//session ve flash message
app.use(session(
    {
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24
        },
        store: sessionStore
    }
));

//flah mesajların middleware olarak kullanılmasını sagladık
app.use(flash());

app.use((req, res, next) => {
    res.locals.validation_error = req.flash('validation_error');
    res.locals.success_message = req.flash('success_message');
    res.locals.email = req.flash('email');
    res.locals.ad = req.flash('ad');
    res.locals.soyad = req.flash('soyad');
    res.locals.sifre = req.flash('sifre');
    res.locals.resifre = req.flash('resifre');

    res.locals.login_error = req.flash('error');


    next();
})

app.use(passport.initialize());
app.use(passport.session());


//routerlar include edilir
const authRouter = require('./src/routers/auth_router');
const User = require('./src/model/user_model');
const { id } = require('./src/controllers/auth_controller');
const Chat = require('./src/model/chat_model');
const Room = require('./src/model/room_model');



//formdan gelen değerlerin okunabilmesi için
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use(express.json({ limit: '10mb' })); // JSON veri limiti ayarı


let requestid

app.get('/chat', (req, res, next) => {



    requestid = req
    next();
});

app.use('/', authRouter);


const server = app.listen(process.env.PORT, async () => {
    console.log(`Server ${process.env.PORT} portundan ayaklandı`);
})

const io = socket(server)

io.on('connection', async (socket) => {
    const userId = requestid;
    socket.join('as9865')
    socket.on('joinRoom', async () => {
        let roomid
        let user
        let chatuser
        if (userId.query.id) {
            chatuser = await User.findOne({ _id: userId.query.id });
            user = await User.findOne({ _id: userId.user.id })
            roomid = await Room.findOne({ user1: user._id, user2: chatuser._id })
            if (!roomid) {
                roomid = await Room.findOne({ user2: user._id, user1: chatuser._id })
            }// Belirli bir odada soketi kullanıma al
            if (roomid) {
                socket.join(roomid.roomid);
                console.log('giriş sağlandı' + roomid._id);
            }
        }


    });
    socket.on('mainroom', async () => {
        console.log('mainroom a bağlandı');



    });
    //console.log(requestid);


    // Burada requestid'in nasıl tanımlandığını ve kullanılması gerektiğini kontrol edin.
    // Eğer requestid kullanıcı kimliğini içeriyorsa, doğru şekilde alın.
    // Örnek olarak requestid, kullanıcı kimliği içeriyorsa.

    if (userId) {
        try {
            const user = await User.findOne({ _id: userId.user.id });

            if (user) {
                user.socketid = socket.id;
                await user.save();
                // Kullanıcının socket bilgilerini kaydetmek veya başka işlemler yapmak için burada devam edin.

                //console.log(user);
            } else {
                console.log('Kullanıcı bulunamadı');
            }
        } catch (error) {
            console.error(error);
        }
    } else {
        console.log('Geçersiz kullanıcı kimliği (requestid)');
    }
    socket.on('disconnect', async () => {
        // Kullanıcı bağlantısı koparsa, Socket ID'sini kaldır
        const user = await User.findOne({ socketid: socket.id });
        if (user) {
            user.socketid = null
            await user.save();
        }
    });
    socket.on('chat', async data => {
        if (userId) {
            const chatuser = await User.findOne({ _id: userId.query.id });
            const user = await User.findOne({ _id: userId.user.id })


            if (chatuser.friends.length >= 2) {
                for (let index = 0; index < chatuser.friends.length; index++) {
                    if (chatuser.friends[index] == userId.user.id) {
                        chatuser.friends.unshift(chatuser.friends[index]);
                        break
                    }

                }
            }
            if (user.friends.length >= 2) {
                for (let index = 0; index < user.friends.length; index++) {
                    if (user.friends[index] == userId.query.id) {
                        user.friends.unshift(user.friends[index]);
                        break
                    }

                }
            }
            /*const newMessage = new Chat({
                mesaj: data.message,
                id: chatuser._id + user._id,
                gonderen: user._id,
                alan: chatuser._id
            })*/
            let chats = await Chat.findOne({ kullanici1: userId.query.id, kullanici2: userId.user.id })
            if (!chats) {
                chats = await Chat.findOne({ kullanici2: userId.query.id, kullanici1: userId.user.id })
            }
            let pushmesaj = {}
            chats.mesaj.push({ gonderen: user._id, alan: chatuser._id, mesaj: data.message })
            await chats.save();

            data.sender = user._id
            data.receiver = chatuser._id
            data.query = userId.query.id
            data.socket = chatuser.socketid
            data.usersocket = user.socketid
            data.me = false

            let roomid = await Room.findOne({ user1: user._id, user2: chatuser._id })

            if (!roomid) {
                roomid = await Room.findOne({ user2: user._id, user1: chatuser._id })
            }
            //console.log(data, socket.id);
            //io.to(user.socketid).emit('chat', data2);


            console.log(roomid.roomid);
            io.to(roomid.roomid).emit('chat', data);
            io.to('as9865').emit('ongosterim', data)
            chatuser.save();
            user.save();
        }
    });
    socket.on('typing', async data => {
        if (userId) {
            const chatuser = await User.findOne({ _id: userId.query.id });
            const user = await User.findOne({ _id: userId.user.id })
            data.sender = user._id


            //console.log(data, socket.id);
            //io.to(user.socketid).emit('chat', data2);


            let roomid = await Room.findOne({ user1: user._id, user2: chatuser._id })

            if (!roomid) {
                roomid = await Room.findOne({ user2: user._id, user1: chatuser._id })
            }
            io.to(roomid.roomid).emit('typing', data);
        }

    })

});















