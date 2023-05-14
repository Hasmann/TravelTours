const Tours = require('./../model/model.js');
const catchAsync = require('./../errorhandling');

exports.getOverview = catchAsync(async (req, res, next) => {
  const tours = await Tours.find();
  res.status(200).render('overview', {
    header: 'THE OVERVIEW PAGE',
    tours,
  });
});
exports.getTour = catchAsync(async (req, res, next) => {
  const tourname = req.params.tourname;

  const tour = await Tours.findOne({ slug: tourname }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  res.status(200).render('tour', {
    header: tour.name,
    tour: tour,
  });
});
exports.login = catchAsync(async (req, res, next) => {
  res.status(200).render('login', {
    header: 'Login',
  });
});
