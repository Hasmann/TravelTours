const express = require('express');
const router = express.Router();
const authCon = require('./../Controllers/authController');
const viewCon = require('./../Controllers/viewController.js');
// router.use(authCon.isLoggedIn);
router.get('/', viewCon.getOverview);
router.get('/tour/:tourname', viewCon.getTour);
router.get('/login', viewCon.login);

module.exports = router;
