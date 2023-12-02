const router = require('express').Router();
const authController = require('../controllers/auth_controller');
const validatorMiddleware = require('../middlewares/validation_middleware');
const authMiddleware = require('../middlewares/auth_middleware');




router.get('/login', authMiddleware.oturumAcilmamis, authController.loginFormunuGoster);
router.post('/login', authMiddleware.oturumAcilmamis, validatorMiddleware.validateLogin(), authController.login);

router.get('/register', authMiddleware.oturumAcilmamis, authController.registerFormunuGoster);
router.post('/register', authMiddleware.oturumAcilmamis, validatorMiddleware.validateNewUser(), authController.register);

router.get('/forget-password', authMiddleware.oturumAcilmamis, authController.forgetPasswordFormunuGoster);
router.post('/forget-password', authMiddleware.oturumAcilmamis, validatorMiddleware.validateEmail(), authController.forgetPassword);

router.get('/verify', authController.verifyMail);
router.get('/profile', authMiddleware.oturumAcilmis, authController.openprofilepage)
router.post('/profile', authMiddleware.oturumAcilmis, authController.postprofilepage)
router.get('/reset-password/:id/:token', authController.yeniSifreFormuGoster);
router.get('/reset-password', authController.yeniSifreFormuGoster);
router.post('/reset-password', validatorMiddleware.validateNewPassword(), authController.yeniSifreyiKaydet);
router.get('/logout', authMiddleware.oturumAcilmis, authController.logout);


router.get('/chat', authMiddleware.oturumAcilmis, authController.openchatpage)
router.post('/search', authMiddleware.oturumAcilmis, authController.searchvalue)
router.get('/getfriendreq', authMiddleware.oturumAcilmis, authController.getfriendreq)
router.get('/sendfriendreq', authMiddleware.oturumAcilmis, authController.sendfriendreq)
router.get('/friendreject', authMiddleware.oturumAcilmis, authController.rejectfriendreq)
router.get('/acceptfriendreq', authMiddleware.oturumAcilmis, authController.acceptfriendreq)

router.get('/changepassword', authMiddleware.oturumAcilmis, authController.openchangepassword);
router.post('/changepassword', authMiddleware.oturumAcilmis, validatorMiddleware.validateNewPassword(), authController.postchangepassword)


router.get('/removefriend', authMiddleware.oturumAcilmis, authController.removefriend)

module.exports = router;