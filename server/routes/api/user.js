const express = require('express');
const router = express.Router();

const User = require('../../models/user');
const Book = require('../../models/book');

const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');

// @route   POST /api/user/register
// @desc    Post - Register a new User
// @access  Public/Private
router.post(
  '/register',

  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please enter a valid email').isEmail(),
    check(
      'password',
      'Please enter a password of 6 or more characters'
    ).isLength({ min: 6 }),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return (
        res
          // .status(401)
          .json(
            // ({ success: false })
            { success: false, message: errors.array()[0].msg }
          )
      );
    }
    User.findOne({ email: req.body.email }).then((user) => {
      if (user) {
        return (
          res
            // .status(401)
            .json(
              // ({ success: false })
              {
                success: false,
                message: 'User already exists!',
              }
            )
        );
      } else {
        const user = new User(req.body);
        user.save((err, doc) => {
          if (err) return res.json({ success: false });
          res.status(200).json({
            success: true,
            user: doc,
          });
        });
      }
    });
  }
);

// @route   GET /api/user/login
// @desc    Login a User
// @access  Public/Private
router.post(
  '/login',
  [
    check('email', 'Please enter a valid email').isEmail(),
    check('password', 'Please enter the password').not().isEmpty(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return (
        res
          // .status(400)
          .json({ isAuth: false, message: errors.array()[0].msg })
      );
    }
    User.findOne({ email: req.body.email }, (err, user) => {
      if (!user)
        return res.json({
          isAuth: false,
          message: 'Invalid Credentials',
        });
      // Compare
      user.comparePassword(req.body.password, (err, isMatch) => {
        if (!isMatch)
          return res.json({
            isAuth: false,
            message: 'Invalid Credentials',
          });
        // Sign() - Token
        user.generateToken((err, user) => {
          if (err) return res.status(400).send(err);
          res.cookie('auth', user.token).json({
            isAuth: true,
            id: user._id,
            email: user.email,
          });
        });
      });
    });
  }
);

// @route   GET /api/users
// @desc    Get all Users
// @access  Public/Private
router.get('/', (req, res) => {
  User.find({}, (err, users) => {
    if (err) return res.status(400).send(err);
    res.status(200).send(users);
  });
});

// @route   GET /api/user/reviewer/:id
// @desc    Get a Reviewer by it's ID
// @access  Public/Private
router.get('/reviewer/:id', (req, res) => {
  let id = req.params.id;

  User.findById(id, (err, doc) => {
    if (err) return res.status(400).send(err);
    res.json({
      name: doc.name,
      lastname: doc.lastname,
    });
  });
});

// @route   GET /api/user/posts/:userId
// @desc    Get all Posts of an User by it's ID
// @access  Public/Private
router.get('/posts/:userId', (req, res) => {
  Book.find({ ownerId: req.params.userId }).exec((err, docs) => {
    if (err) return res.status(400).send(err);
    res.send(docs);
  });
});

// @route   GET /api/user/logout
// @desc    Logout an User
// @access  Public/Private
router.get('/logout', auth, (req, res) => {
  req.user.deleteToken(req.token, (err, user) => {
    if (err) return res.status(400).send(err);
    res.sendStatus(200);
  });
});

module.exports = router;
