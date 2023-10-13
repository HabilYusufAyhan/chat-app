const { body } = require("express-validator");

const validateNewUser = () => {
  return [
    body("email").trim().isEmail().withMessage("Geçerli bir mail giriniz"),

    body("ad")
      .trim()
      .isLength({ min: 2 })
      .withMessage("isim en az 2 karakter olmalı")
      .isLength({ max: 25 })
      .withMessage("isim en fazla 25 karakter olmalı"),
    body("soyad")
      .trim()
      .isLength({ min: 2 })
      .withMessage("soyisim en az 2 karakter olmalı")
      .isLength({ max: 25 })
      .withMessage("soyisim en fazla 25 karakter olmalı"),

    body("sifre")
      .trim()
      .isLength({ min: 6 })
      .withMessage("Şifre en az 6 karakter olmalı")
      .isLength({ max: 30 })
      .withMessage("Şifre en fazla 30 karakter olmalı"),
  ];
};

const validateNewPassword = () => {
  return [
    body("sifre")
      .trim()
      .isLength({ min: 6 })
      .withMessage("Şifre en az 6 karakter olmalı")
      .isLength({ max: 20 })
      .withMessage("Şifre en fazla 20 karakter olmalı"),
  ];
};

const validateLogin = () => {
  return [
    body("email").trim().isEmail().withMessage("Geçerli bir mail giriniz"),

    body("sifre")
      .trim()
      .isLength({ min: 6 })
      .withMessage("Şifre en az 6 karakter olmalı")
      .isLength({ max: 20 })
      .withMessage("Şifre en fazla 20 karakter olmalı"),
  ];
};

const validateEmail = () => {
  return [
    body("email").trim().isEmail().withMessage("Geçerli bir mail giriniz"),
  ];
};

module.exports = {
  validateNewUser,
  validateLogin,
  validateEmail,
  validateNewPassword,
};
