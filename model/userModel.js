const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'please input your name'],
  },
  email: {
    type: String,
    required: [true, 'please input your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'please provide a valid email'],
  },
  photo: {
    type: String,
  },

  password: {
    type: String,
    require: [true, 'please provide a password'],
    minlength: [10, 'password must have a minimum of 10 characters'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    require: [true, 'please confirm your password'],
    //validating if the passwordsMatch
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: `${this.passwordConfirm} does not match ${this.password}`,
    },
  },
  role: {
    type: String,
    enum: {
      values: ['admin', 'user', 'guide', 'lead-guide'],
      message: 'you must be a  admin ,user, guide ,lead-guide ',
    },
    default: 'user',
  },

  changedPasswordAfter: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: 'true',
  },
});

//now encrypting the password we will use an algorithm called bcryptjs to hash the password
//and it is perfect to do this with the schema

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.changedPasswordAfter = Date.now() - 1000;
  next();
});

UserSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

//TO check If the password Has Been Changed
UserSchema.methods.checkPasswordChange = function (jwt) {
  if (this.changedPasswordAfter) {
    const changedPass = parseInt(this.changedPasswordAfter.getTime() / 1000, 10);

    return jwt < changedPass;
  }
  return false;
};

//to check if passowrd is correct

UserSchema.methods.checkPass = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

UserSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', UserSchema);
module.exports = User;
