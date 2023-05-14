const mongoose = require('mongoose');
const Tour = require('./../model/model.js');

const ReviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'This field Is Required'],
      minlength: [10, 'you have a max of 50 characters'],
    },
    rating: {
      type: Number,
      min: [1, 'you have a min rating of 1'],
      max: [5, 'you have a max rating of 5'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tours',
      required: [true, 'Review must belong to a tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must have a user'],
    },
  },
  {
    toObject: { virtuals: true },
    toJson: { virtuals: true },
  }
);

ReviewSchema.pre(/^find/, function (next) {
  this.populate({ path: 'tour', select: 'name' }).populate({ path: 'user', select: 'name' });
  next();
});

//ensuring that the user does not have multiple reviews we can use indexes just like this
ReviewSchema.index({ tour: 1, user: 1 }, { unique: true });

ReviewSchema.statics.calcAverageRating = async function (tourId) {
  const avgRat = await this.aggregate([
    { $match: { tour: tourId } },
    {
      $group: { _id: '$tour', ratingNum: { $sum: 1 }, ratingAvg: { $avg: '$rating' } },
    },
  ]);
  console.log(avgRat);
  if (avgRat.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: avgRat[0].ratingAvg,
      ratingsQuantity: avgRat[0].ratingNum,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: 0,
      ratingsQuantity: 4.5,
    });
  }
};

ReviewSchema.post('save', function () {
  this.constructor.calcAverageRating(this.tour);
});

// findByIdAndUpdate
// findByIdAndDelete
ReviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne();
  // console.log(this.r);
  next();
});

ReviewSchema.post(/^findOneAnd/, async function () {
  // await this.findOne(); does NOT work here, query has already executed
  await this.r.constructor.calcAverageRating(this.r.tour);
});

const Review = mongoose.model('Review', ReviewSchema);

module.exports = Review;
