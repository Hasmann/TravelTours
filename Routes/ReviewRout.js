const express = require('express');
const revCon = require('./../Controllers/ReviewController');

const Router = express.Router({ mergeParams: true });
const authCon = require(`${__dirname}/../Controllers/authController.js`);

Router.use(authCon.protect);
Router.route('/')
  .get(revCon.getAllReviews)
  .post(
    authCon.protect,
    authCon.authorizedRole('user'),
    revCon.reviewCreateMiddleware,
    revCon.createReviews
  );

Router.route('/:id')
  .get(revCon.getOneReview)
  .delete(authCon.authorizedRole('user', 'admin'), revCon.deleteReview)
  .patch(authCon.authorizedRole('user', 'admin'), revCon.updateReview);

module.exports = Router;
