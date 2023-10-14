const User = require("../model/user_model");

const anaSayfayiGoster = function (req, res, next) {
  res.render("index", {
    layout: "./layout/yonetim_layout.ejs",
    title: "Yönetim Paneli Ana Sayfa",
  });
};

const profilSayfasiniGoster = function (req, res, next) {
  res.render("profil", {
    user: req.user,
    layout: "./layout/yonetim_layout.ejs",
    title: "ProfilSayfası",
  });
};

module.exports = {
  anaSayfayiGoster,
  profilSayfasiniGoster,
};
