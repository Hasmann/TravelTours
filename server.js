const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
process.on('uncaughtException', (err) => {
  console.log(`UncaughtException :${err}`);
});
const app = require('./app');

const port = process.env.PORT || 4000;

// console.log(app.get('env'));

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

console.log(DB);

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

// const saveTours = new Tours({
//   name: 'Hello World2',
//   price: 200,
//   rating: 4.5,
// });

// saveTours
//   .save()
//   .then((doc) => {
//     console.log('SUCCESSFULLY SAVED \n', doc);
//   })
//   .catch((err) => {
//     console.log('THERE IS AN ERROR', err);
//   });

// console.log(process.env);
const server = app.listen(port, () => {
  console.log(`LISTENING AT PORT ${port}...`);
});

//handling database errors otherwise known as unhandled rejection
//we do this because of the process emits an event called the unhanled rejection and we do this by listening to it

process.on('unhandledRejection', (err) => {
  console.log(err.name, '----', err.message);
  server.close(() => {
    process.exit(1);
  });
});
