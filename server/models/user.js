const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;
const bcrypt = require('bcrypt');
const SALT_I = 10;

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  // resetToken:String,
  // expireToken:Date,
  // pic:{
  //  type:String,
  //  default:"https://res.cloudinary.com/cnq/image/upload/v1586197723/noimage_d4ipmd.png"
  // },
  // followers:[{type:ObjectId,ref:"User"}],
  // following:[{type:ObjectId,ref:"User"}]
});

userSchema.pre('save', function (next) {
  var user = this;
  if (user.isModified('password')) {
    bcrypt.genSalt(SALT_I, function (err, salt) {
      if (err) return next(err);

      bcrypt.hash(user.password, salt, function (err, hash) {
        if (err) return next(err);
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

const User = mongoose.model('User', userSchema);
module.exports = User;
