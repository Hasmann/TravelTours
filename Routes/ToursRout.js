const express = require('express');
const Tcon = require(`${__dirname}/../Controllers/ToursController`);
const authCon = require(`${__dirname}/../Controllers/authController.js`);
const reviewRouter = require('./ReviewRout.js');
const Router = express.Router();

// //implementing a better way of doing the reviews
// Router.route('/:tourId/reviews').post(
//   authCon.protect,
//   authCon.authorizedRole('user'),
//   revCon.createReviews
// );

// //but there is also a better way of doing this
// //we can do this by using a concept called mergeparams
Router.use('/:tourId/reviews', reviewRouter);

Router.route('/')
  .get(Tcon.getallTours)
  .post(authCon.protect, authCon.authorizedRole('admin', 'lead-guide'), Tcon.createTour);

Router.route('/most-expensive').get(Tcon.setAliases, Tcon.getallTours);
Router.route('/data-aggregation').get(Tcon.dataAggregation);
Router.route('/Busiest-month/:year').get(
  authCon.protect,
  authCon.authorizedRole('admin', 'lead-guide', 'guide'),
  Tcon.BusiestMonth
);
//param Middleware
// Router.param('id', Tcon.checkid);

Router.route('/tours-within/:distance/center/:latlng/unit/:unit').get(Tcon.getRadius);
Router.route('/distance/center/:latlng/unit/:unit').get(Tcon.getDistance);
Router.route('/:id')
  .get(Tcon.getTour)
  .patch(Tcon.patchTour)
  .delete(authCon.protect, authCon.authorizedRole('admin', 'lead-guide'), Tcon.deleteTour);

module.exports = Router;
