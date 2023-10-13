const router = require("express").Router();
const authController = require("../controllers/auth_controller");
const validatorMiddleware = require("../middlewares/validation_middleware");
const authMiddleware = require("../middlewares/auth_middleware");
const guideController = require("../controllers/guide_controller");
router.post("/", authMiddleware.oturumAcilmis);
router.get("/", authMiddleware.oturumAcilmis, guideController.openpersonpage);

router.get(
  "/login",
  authMiddleware.oturumAcilmamis,
  authController.loginFormunuGoster
);
router.get(
  "/signup",
  authMiddleware.oturumAcilmamis,
  authController.registerFormunuGoster
);
router.post(
  "/login",
  authMiddleware.oturumAcilmamis,
  validatorMiddleware.validateLogin(),
  authController.login
);
router.post(
  "/signup",
  authMiddleware.oturumAcilmamis,
  validatorMiddleware.validateNewUser(),
  authController.register
);
router.get("/forgetpassword", authController.forgetPasswordFormunuGoster);
router.post(
  "/forgetpassword",
  validatorMiddleware.validateEmail(),
  authController.forgetPassword
);

router.get("/resetpassword/:id/:token", authController.yeniSifreFormuGoster);
router.get("/resetpassword", authController.yeniSifreFormuGoster);
router.post(
  "/resetpassword/:id/:token",
  validatorMiddleware.validateNewPassword(),
  authController.yeniSifreyiKaydet
);

router.get("/verify", authController.verifyMail);
router.get("/logout", authMiddleware.oturumAcilmis, authController.logout);

router.get("/profile", authController.getprofile);

module.exports = router;
