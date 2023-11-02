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

    //console.log(requestid);

    //console.log(socket.id);

    // Burada requestid'in nasıl tanımlandığını ve kullanılması gerektiğini kontrol edin.
    // Eğer requestid kullanıcı kimliğini içeriyorsa, doğru şekilde alın.
    const userId = requestid; // Örnek olarak requestid, kullanıcı kimliği içeriyorsa.

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
        const chatuser = await User.findOne({ _id: userId.query.id });
        const user = await User.findOne({ _id: userId.user.id })
        const newMessage = new Chat({
            mesaj: data.message,
            id: chatuser._id + user._id,
            gonderen: user._id
        })
        await newMessage.save();
        data.sender = user._id
        data.receiver = chatuser._id
        data.query = userId.query.id
        data.socket = chatuser.socketid
        data.usersocket = user.socketid
        data.me = false
        //console.log(data, socket.id);
        //io.to(user.socketid).emit('chat', data2);



        io.to(chatuser.socketid).emit('chat', data);

    });
});
//Bu kod parçasında requestid değişkenini nasıl almanız gerektiğine dikkat edin. Ayrıca, kullanıcı bulunamazsa veya requestid geçersizse ilgili hataları işlemek için try-catch blokları kullanılmıştır. Bu şekilde hataların daha iyi ele alınmasını sağlayabilirsiniz.














