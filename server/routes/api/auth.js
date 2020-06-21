const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
// const User = mongoose.model('User');
const User = require('../../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('config');
const JWT_SECRET = config.get('jwtSecret');
const auth = require('../../middleware/auth');

// @route   POST /api/auth/signup
// @desc    Sign Up an User
// @access  Public
router.post('/signup', (req, res) => {
  const { name, email, password, pic } = req.body;
  if (!email || !password || !name) {
    return res.status(422).json({ error: 'Please Add all the Details' });
  }
  User.findOne({ email: email })
    .then((savedUser) => {
      if (savedUser) {
        return res.status(422).json({ error: 'User Already Exists.' });
      }
      const user = new User({
        email,
        password,
        name,
      });
      user
        .save()
        .then((user) => {
          res.json({ message: 'User Created' });
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch((err) => {
      console.log(err);
    });
});

// @route   POST /api/auth/signin
// @desc    Sign In an User
// @access  Public
router.post('/signin', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(422).json({ error: 'Please Enter your credentials.' });
  }
  User.findOne({ email: email }).then((savedUser) => {
    if (!savedUser) {
      return res.status(422).json({ error: 'Invalid credentials' });
    }
    bcrypt
      .compare(password, savedUser.password)
      .then((doMatch) => {
        if (doMatch) {
          const token = jwt.sign({ _id: savedUser._id }, JWT_SECRET);
          // const { _id, name, email, followers, following, pic } = savedUser;
          res.json({
            token,
            // user: { _id, name, email, followers, following, pic },
          });
        } else {
          return res.status(422).json({ error: 'Invalid credentials' });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  });
});

// @route   GET /api/auth
// @desc    Authenticate an User
// @access  Public
router.get('/', auth, (req, res) => {
  res.send('Authenticated');
});

module.exports = router;
