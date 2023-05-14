const express = require('express');
const userController = require('./../Controllers/UserController');
const authController = require('./../Controllers/authController');
const { application } = require('express');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/resetPassword', authController.changeReset);
router.patch('/passwordChange/:token', authController.changePassword);
//we can also use this to set middleware
router.use(authController.protect);

router.patch('/updatePassword', authController.protect, authController.updatePassword);
router.patch('/updateMe', authController.protect, userController.updateMe);
router.delete('/deleteMe', authController.protect, userController.deleteMe);
router.get('/me', authController.protect, userController.setGetMe, userController.getMe);

router.use(authController.authorizedRole('admin', 'lead-guide'));
router.route('/').get(userController.getAllUsers).post(userController.createUser);
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
