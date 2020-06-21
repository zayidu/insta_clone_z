const jwt = require('jsonwebtoken');
const config = require('config');
const JWT_SECRET = config.get('jwtSecret');
const mongoose = require('mongoose');
const User = mongoose.model('User');

module.exports = (req, res, next) => {
  // const { token } = req.headers;
  const token = req.header('token');
  console.log(token);
  if (!token) {
    return res.status(401).json({ error: 'You must be logged in' });
  }
  jwt.verify(token, JWT_SECRET, (err, payload) => {
    if (err) {
      return res.status(401).json({ error: 'You must be logged in' });
    }

    const { _id } = payload;
    User.findById(_id).then((userdata) => {
      req.user = userdata;
      next();
    });
  });
};
