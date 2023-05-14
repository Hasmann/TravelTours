const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
const User = require('./userModel');
const TourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have less or equal then 40 characters'],
      minlength: [10, 'A tour name must have more or equal then 10 characters'],
      // validate: [validator.isAlpha, 'Tour name must only contain characters']
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      //to set the incoming value
      set: (val) => Math.round(val * 10) / 10, // 4.666666, 46.6666, 47, 4.7
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // this only points to current doc on NEW document creation
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below regular price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  //second object param used to set the virtual tours
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
TourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// adding indexing to make tour queries more faster
//we will add it to the most queried fiels
//doing compound indexing

TourSchema.index({ price: 1, ratingsAverage: -1 });
//single indexing
TourSchema.index({ slug: 1 });

TourSchema.index({ startLocation: '2dsphere' });
//NOTE 1 FOR ASCENDING ,-1 FOR DESCENDING and also NOTE ADDING UNIQUE TO A DB FIELD AUTOMATICALLY GIVES IT AN INDEX

//using a concept called virtual populate to populate the child reference insteadof adding a real array to reference it

TourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

//middlewares or hooks can be applied to mongoose and only in this four scenerios that is for documents,model ,query and aggregators and one more o have forgotten

//to use middleware for documents we can only use it for two scenerios that is for the create and save functions
//so lets apply a document middleware

//we can also set parameters with middlewares

TourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

//displaying alldata for embedded entity relationship
// TourSchema.pre('save', async function (next) {
//   const guideProm = this.guides.map(async (el) => {
//     return await User.findById(el);
//   });
//   this.guides = await Promise.all(guideProm);
//   next();
// });

// TourSchema.pre('save', function (next) {
//   console.log('Hassan Rulz');
//   next();
// });

// //we can also set a post middleware

// TourSchema.post('save', function (doc, next) {
//   //doc arguement which is the document that has just been passed
//   console.log(doc);
//   console.log('this is a post middleware');
//   next();
// });

//APPLYING THE QUERY MIDDLEWARE
//query middleware uses the same format as a document middleware just with a different hook but in this case it is  using yje find hook
//here we will use the find yje hook in a regexp so that any it will be applicable on any method that starts with find

TourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  next();
});

TourSchema.pre(/^find/, function (next) {
  this.populate('guides');
  next();
});

TourSchema.post(/^find/, function (doc, next) {
  console.log(`THE TIME TAKEN TO DO THIS IS ${Date.now() - this.start}`);
  this.find({ secretTour: { $ne: true } });
  next();
});
//now we will be doing the aggregate middleware

//with the aggregate middeware the syntax is still the same just that we have to use the aggregate pipleline method
// TourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   next();
// });

const Tours = mongoose.model('Tours', TourSchema);
module.exports = Tours;
