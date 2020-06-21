const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

// const mongoose = require('mongoose');
// const config = require('./config/config').get(process.env.NODE_ENV);
const connectDB = require('../config/db');

const app = express();

// Connect Database MongoDB Atlas
connectDB();
// Start the community Server
// ./mongod --dbpath ~/mongo-data
// mongo

const { User } = require('./models/user');
// const { Router } = require('express');

// INIT Middleware
app.use(bodyParser.json());
app.use(cookieParser());
app.use(
  express.json({
    extended: false,
  })
);

// After Application Build and Deployed, Letting know the Server to find and run the static files like CSS and JS from client/build folder.
// app.use(express.static('client/build'));

// Routes/ API End-points:

// Authenticating
app.use('/api/auth', require('./routes/api/auth'));

// CRUD for User Model
// app.use('/api/user', require('./routes/api/user'));
// app.use('/api/users', require('./routes/api/user'));

// IN Production, Except the routes above, Routing the UI routes and anyother routes that isn't above will be routed to index.html as below:
// if (process.env.NODE_ENV === 'production') {
//   const path = require('path');
//   app.get('/*', (req, res) => {
//     res.sendfile(path.resolve(__dirname, '../client', 'build', 'index.html'));
//   });
// }

const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
