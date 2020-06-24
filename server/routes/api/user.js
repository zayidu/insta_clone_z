const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../../middleware/auth');
const Post = mongoose.model('Post');
const User = mongoose.model('User');

// @route   GET /api/user/:id
// @desc    Get an User Profile and it's corresponding posts
// @access  Private
router.get('/:id', auth, (req, res) => {
  User.findOne({ _id: req.params.id })
    .select('-password')
    .then((user) => {
      Post.find({ postedBy: req.params.id })
        .populate('postedBy', '_id name')
        .exec((err, posts) => {
          if (err) {
            return res.status(422).json({ error: err });
          }
          res.json({ user, posts });
        });
    })
    .catch((err) => {
      return res.status(404).json({ error: 'User not found' });
    });
});

// @route   PUT /api/user/follow
// @desc    Follow an User - To update Followers and Following Arrays on the User Model
// @access  Private
router.put('/follow', auth, (req, res) => {
  User.findByIdAndUpdate(
    req.body.followId,
    {
      $push: { followers: req.user._id },
    },
    {
      new: true,
    },
    (err, result) => {
      if (err) {
        return res.status(422).json({ error: err });
      }
      User.findByIdAndUpdate(
        req.user._id,
        {
          $push: { following: req.body.followId },
        },
        { new: true }
      )
        .select('-password')
        .then((result) => {
          res.json(result);
        })
        .catch((err) => {
          return res.status(422).json({ error: err });
        });
    }
  );
});

// @route   PUT /api/user/unfollow
// @desc    UnFollow an User - To update Followers and Following Arrays on the User Model
// @access  Private
router.put('/unfollow', auth, (req, res) => {
  User.findByIdAndUpdate(
    req.body.unfollowId,
    {
      $pull: { followers: req.user._id },
    },
    {
      new: true,
    },
    (err, result) => {
      if (err) {
        return res.status(422).json({ error: err });
      }
      User.findByIdAndUpdate(
        req.user._id,
        {
          $pull: { following: req.body.unfollowId },
        },
        { new: true }
      )
        .select('-password')
        .then((result) => {
          res.json(result);
        })
        .catch((err) => {
          return res.status(422).json({ error: err });
        });
    }
  );
});

// @route   PUT /api/user/updateprofilepic
// @desc    Update Profile Pic of the logged in User.
// @access  Private
router.put('/updateprofilepic', auth, (req, res) => {
  User.findByIdAndUpdate(
    req.user._id,
    { $set: { pic: req.body.pic } },
    { new: true },
    (err, result) => {
      if (err) {
        return res
          .status(422)
          .json({ error: 'Error updating the profile image.' });
      }
      res.json(result);
    }
  );
});

// @route   POST /api/user/search-users
// @desc    Search Users
// @access  Private
router.post('/search-users', (req, res) => {
  let userPattern = new RegExp('^' + req.body.query);
  User.find({ name: { $regex: userPattern } })
    .select('_id name')
    .then((user) => {
      // console.log(user);
      res.json({ user });
    })
    .catch((err) => {
      console.log(err);
    });
});

module.exports = router;
