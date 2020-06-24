const mongoose = require('mongoose');

const { MONGOURI } = require('../config/keys');
// const { MONGOURI_LOCAL } = require('../config/keys');

mongoose.Promise = global.Promise;
const connectDB = async () => {
  try {
    await mongoose.connect(MONGOURI, {
      // await mongoose.connect(configLocal.DATABASE, {
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
