const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_CONNECTION_STRING, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex:true, useFindAndModify:false
})
    .then(() => console.log('veritabanına bağlanıldı'))
    .catch(hata => console.log(`veritabanı baglantı hatası ${hata}`))
