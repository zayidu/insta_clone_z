const mongoose = require('mongoose');

const config = require('config');
const db = config.get('mongoURI');

// const config = require('./config').get(process.env.NODE_ENV);

mongoose.Promise = global.Promise;
const connectDB = async () => {
  try {
    await mongoose.connect(db, {
      // await mongoose.connect(config.DATABASE, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: true,
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error(err.message);
    // Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;
