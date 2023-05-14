const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const mongoose = require('mongoose');
const fs = require('fs');
const Tours = require(`${__dirname}/model/model.js`);
const Reviews = require(`${__dirname}/model/reviewModel.js`);
const User = require(`${__dirname}/model/userModel.js`);
// console.log(app.get('env'));

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('DB CONNECTION SUCCESSFUL');
  });

const ToursFile = JSON.parse(fs.readFileSync('dev-data/data/tours.json', 'utf-8'));
const UserFile = JSON.parse(fs.readFileSync('dev-data/data/users.json', 'utf-8'));
const ReviewsFile = JSON.parse(fs.readFileSync('dev-data/data/reviews.json', 'utf-8'));

const deleteDb = async () => {
  try {
    // await Tours.deleteMany();
    await User.deleteMany();
    // await Reviews.deleteMany();
    console.log('DB DELETED SUCCESSFULLY');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

const populateDb = async () => {
  try {
    // await Tours.create(ToursFile);
    await User.create(UserFile, { validateBeforeSave: false });
    //await Reviews.create(ReviewsFile);
    console.log('DB POPULATED  SUCCESSFULLY');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

console.log(process.argv);

if (process.argv[2] === '--delete') {
  deleteDb();
} else if (process.argv[2] === '--populate') {
  populateDb();
} else {
  console.log('NOTHING IS HAPPENING');
}
