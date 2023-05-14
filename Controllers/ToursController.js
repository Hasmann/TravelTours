const { match } = require('assert');
const fs = require('fs');
const { listenerCount } = require('process');
const Tours = require(`./../model/model.js`);
const catchAsync = require(`${__dirname}/../errorhandling.js`);
const errorClass = require(`${__dirname}/../errorClass.js`);
const factory = require('./handleFactory.js');
// console.log('hello', Tours);

//doing aliasing
//which is simply just doing some preset queries such as rating price from lowest to highest

//This is to make the filter more functional and modular

exports.setAliases = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-price';
  req.query.fields = 'name,price,summary,ratingsAverag,ratingsQuantity';

  next();
};

// exports.checkid = (req, res, next, val) => {
//   if (val > tours.length) {
//     console.log(`YOUR ID IS :${val}`);
//   } else {
//     next();
//   }
// };

exports.getallTours = factory.readAll(Tours);
exports.getTour = factory.readOne(Tours, 'reviews');

exports.checkBody = (req, res, next) => {
  // if (!req.body.name.duration) {
  //   return res.status(400).json({
  //     status: 'failure',
  //   });
  // }
  // next();
};
exports.createTour = factory.create(Tours);
exports.patchTour = factory.update(Tours);

exports.deleteTour = factory.deleteOne(Tours);

exports.getRadius = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;

  const [lat, lng] = latlng.split(',');
  const radiance = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
  if (!lat || !lng) {
    return new errorClass('PLEASE INPUT YOUR LONGITUDE OR LATITUDE', 400);
  }
  if (!radiance) {
    return new errorClass('PLEASE INPUT YOUR DISTANCE!!', 400);
  }
  if (!unit) {
    return new errorClass('PLEASE YOUR UNIT', 400);
  }

  const radius = await Tours.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radiance] } },
  });

  res.status(200).json({
    status: 'success',
    result: radius.length,
    data: {
      radius,
    },
  });
});

exports.getDistance = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;

  const [lat, lng] = latlng.split(',');
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat && !lng) {
    return new errorClass('PLEASE INPUT YOUR LONGITUDE OR LATITUDE', 400);
  }

  const distance = Tours.aggregate([
    {
      $geoNear: {
        near: { type: 'Point', coordinates: [lng * 1, lat * 1] },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    { $project: { distance: 1, name: 1 } },
  ]);
});

//USING DATA AGGREGATION FOR DATA ANALYTICS
exports.dataAggregation = catchAsync(async (req, res, next) => {
  const agg = await Tours.aggregate([
    { $match: { ratingsAverage: { $gte: 4.5 } } },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        ratingsAverage: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    { $sort: { avgPrice: -1 } },
    {
      $match: {
        _id: { $ne: 'easy' },
      },
    },
  ]);
  if (!agg) {
    return next(new errorClass(`CANNOT DELIVER THIS AGGREGATE `, 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      agg,
    },
  });
});

exports.BusiestMonth = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;

  const bM = await Tours.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: { $gte: new Date(`${year}-01-01`), $lte: new Date(`${year}-12-31`) },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        number: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $sort: {
        _id: 1,
      },
    },
    { $addFields: { month: '$_id' } },
    // { $limit: 2 },
  ]);

  if (!bM) {
    return next(new errorClass(`CANNOT DELIVER THIS AGGREGATE `, 404));
  }
  res.status(200).json({
    results: bM.length,
    status: 'success',
    data: {
      bM,
    },
  });
});
