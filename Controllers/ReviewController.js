const Review = require(`${__dirname}/../model/reviewModel.js`);
const catchAsync = require(`${__dirname}/../errorhandling.js`);
const errorClass = require(`${__dirname}/../errorClass.js`);

const dotenv = require('dotenv').config({ path: `${__dirname}/../config.env` });
const factory = require('./handleFactory.js');

exports.reviewCreateMiddleware = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user._id;
  console.log('YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY');
  next();
};

exports.getOneReview = factory.readOne(Review);
exports.getAllReviews = factory.readAll(Review);
exports.createReviews = factory.create(Review);
exports.deleteReview = factory.deleteOne(Review);
exports.updateReview = factory.update(Review);
