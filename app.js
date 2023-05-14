const fs = require('fs');
const path = require('path');
const express = require('express');
const { off } = require('process');
const morgan = require('morgan');
const cors = require('cors');
const tourRouter = require(`${__dirname}/Routes/ToursRout.js`);
const userRouter = require(`${__dirname}/Routes/UserRout.js`);
const viewsRouter = require(`${__dirname}/Routes/viewsRout.js`);
const reviewRouter = require(`${__dirname}/Routes/ReviewRout.js`);
const errObject = require(`${__dirname}/errorClass.js`);
const errorMid = require(`./errorMiddleware.js`);
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const app = express();

//view engines
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
//MIDDLEWARES
app.use((req, res, next) => {
  res.cookie('myCookie', 'hsggsgsgsgsgsggs');
  next();
});
//cors options

app.use(
  cors({
    origin: '*',
    credentials: true, //access-control-allow-credentials:true
  })
); // Use this after the variable declaration

//using express middleware to view static document

//MIDDLEWARE USED TO SECURE HTTP HEADERS
app.use(helmet({ contentSecurityPolicy: false }));

//used for data parsing
//we can also set the limit for the string allowed to pass
//body parsing
app.use(express.json());
//Cookie parsing
app.use(cookieParser());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
//adding request limit middleware
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: `THERE IS A RATE OF ONLY ${this.max} REQUESTS PER HOUR `,
});
app.use('/app', limiter);
app.use(express.static(path.join(__dirname, 'public')));
//Implementing data sanitization
//using express-mongo-sanitize
app.use(mongoSanitize());
//using xss-clean
app.use(xss());

//preventing parameter pollution

app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);
//creating my custom middleware

app.use((req, res, next) => {
  console.log('HEY THIS IS THE NEW MIDDLEWARE');
  console.log('COOKIES:', req.cookies.jwt);
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});
//we can also use it to set requests like

//unlike in node where we had to do the whole https in express we can just call the http methods to create the server

// nat.get('/', (req, res) => {
//   //and insted of the whole res.writehead staus code application-context we can just do it lime this in express

//   res.status(200).json({ fname: 'hassan', lastName: 'kehinde' });
// });

// nat.post('/', (req, res) => {
//   //and insted of the whole res.writehead staus code application-context we can just do it lime this in express

//   res.send('HASSANS CHILLING HERE!!!');
// });'

const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`, 'utf-8'));

//npw lets do something called mounting routes in express
//for us to mount routes we need a middleware i know right middleware middleware midleware
app.use('/', viewsRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

//now setting a route for undefined routes
app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `can't find page ${req.originalUrl}`,
  // });
  //defining our error
  //we pass in our error message as an argyement in the error object
  // const err = new Error(`can't find page ${req.originalUrl}`);
  // err.status = 'fail';
  // err.statusCode = 404;
  //we let the middleware know that we are passing an error by putting the error object as an arguement in next
  next(new errObject(`can't find pageee ${req.originalUrl}`, 404));
});

//implementing an error handling middleware
//how does a middleware know that it is an error handling middleware it does because in an error handling middleware we pass 4 arguements
app.use(errorMid);
module.exports = app;
