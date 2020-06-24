const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
// const User = mongoose.model('User');
const User = require('../../models/user');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../../../config/keys');
const auth = require('../../middleware/auth');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const { SENDGRID_API, EMAIL_URI, MAIL_ID } = require('../../../config/keys');
const emailExistence = require('email-existence');

// Forgot Password Mail Service API: NODEMAILER
const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key: SENDGRID_API,
    },
  })
);

// @route   POST /api/auth/signup
// @desc    Sign Up an User
// @access  Public
router.post('/signup', (req, res) => {
  const { name, email, password, pic } = req.body;
  if (!email || !password || !name.trim()) {
    return res.status(422).json({ error: 'Please Add all the Details' });
  }
  User.findOne({ email: email })
    .then((savedUser) => {
      if (savedUser) {
        return res.status(422).json({ error: 'User Already Exists.' });
      }
      // Email - existence Check
      // emailExistence.check(email, (error, response) => {
      //   console.log('res: ' + response);
      //   if (error) {
      //     return res.status(422).json({ error: 'Email does not exists.' });
      //   }
      bcrypt.hash(password, 12).then((hashedpassword) => {
        let lc_name = name.toLowerCase().trim();
        const user = new User({
          email,
          password: hashedpassword,
          name: lc_name,
          pic,
        });
        user
          .save()
          .then((user) => {
            // Sending a Welcome Mail
            transporter.sendMail({
              to: user.email,
              from: MAIL_ID,
              subject: `Bienvenue ${lc_name} - Insta Clone Z`,
              html: `<h1>Welcome ${lc_name}, to My Version of Insta Clone</h1>
              <h3>Thanks for joining! Have a lovely day!</h3>`,
            });
            // Token
            const token = jwt.sign({ _id: user._id }, JWT_SECRET);
            // User data
            const { _id, name, email, followers, following, pic } = user;

            res.json({
              token,
              user: { _id, name, email, followers, following, pic },
              message: 'Profile Created Successfully',
            });
          })
          .catch((err) => {
            console.log(err);
          });
      });
      // });
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
          const { _id, name, email, followers, following, pic } = savedUser;
          res.json({
            token,
            user: { _id, name, email, followers, following, pic },
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

// @route   POST /api/auth/reset-password
// @desc    Reset Password For an User
// @access  Public
router.post('/reset-password', (req, res) => {
  // Creating a Random Bytes Code to add in reset passwork Link
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
    }
    const token = buffer.toString('hex');
    User.findOne({ email: req.body.email }).then((user) => {
      if (!user) {
        return res.status(422).json({ error: 'User Does not exists' });
      }
      user.resetToken = token;
      user.expireToken = Date.now() + 3600000; // Expires in an Hour
      user.save().then((result) => {
        transporter.sendMail({
          to: user.email,
          from: MAIL_ID,
          subject: 'Password Reset - Inst Clone Z',
          html: `
                  <p>As you have requested for a password reset,</p>
                  <h5>Click in this <a href="${EMAIL_URI}/reset/${token}">link</a> to reset password</h5>
                  `,
        });
        // .then((info) => {
        //   console.log(info);
        //   return res.status(200).json({ message: info });
        // })
        // .catch((err) => {
        //   console.log(err);
        //   return res.status(422).json({ error: err });
        // });
        res.json({ message: 'Please check your mail.' });
      });
    });
  });
});

// @route   POST /api/auth/new-password
// @desc    Setting a new Password
// @access  Public
router.post('/new-password', (req, res) => {
  const newPassword = req.body.password;
  const sentToken = req.body.token;
  User.findOne({
    resetToken: sentToken,
    expireToken: {
      $gt: Date.now(),
      // , $lt: Date.now() + 3600000
    },
  })
    .then((user) => {
      if (!user) {
        return res.status(422).json({ error: 'Try Again! Session expired' });
      }
      bcrypt.hash(newPassword, 12).then((hashedpassword) => {
        user.password = hashedpassword;
        user.resetToken = undefined;
        user.expireToken = undefined;
        user.save().then((saveduser) => {
          res.json({
            message: 'Password resetted successfully. Now you can Sign In.',
          });
        });
      });
    })
    .catch((err) => {
      console.log(err);
    });
});

module.exports = router;
