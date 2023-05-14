const { promisify } = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require(`${__dirname}/../model/userModel.js`);
const catchAsync = require(`${__dirname}/../errorhandling.js`);
const errorClass = require(`${__dirname}/../errorClass.js`);
const dotenv = require('dotenv').config({ path: `${__dirname}/../config.env` });
const sendMail = require(`${__dirname}/../sendMail.js`);
///////////////////////////////////
///////////////////////////////////
///////////////////////////////////
///////////////////////////////////
///////////////////////////////////
///////////////////////////////////
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.COOKIE_TIME,
  });
};

///////////////////////////////////
///////////////////////////////////
///////////////////////////////////
///////////////////////////////////
///////////////////////////////////
///////////////////////////////////
const sendToken = (user, res, statusCode) => {
  const token = generateToken(user._id);
  const cookieOptions = {
    expires: new Date(Date.now() + process.env.COOKIE_TIME * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);
  res.cookie('hasmanCookiw', 'hhhhdjdddkdkdk');
  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};
///////////////////////////////////
///////////////////////////////////
///////////////////////////////////
///////////////////////////////////
///////////////////////////////////
///////////////////////////////////
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirmation: req.body.passwordConfirmation,
    roles: req.body.roles,
  });
  //login the new user
  sendToken(newUser, res, 200);

  // res.status(200).json({
  //   status: 'success',
  //   token: token,
  //   data: {
  //     user: newUser,
  //   },
  // });
});
///////////////////////////////////
///////////////////////////////////
///////////////////////////////////
///////////////////////////////////
///////////////////////////////////
///////////////////////////////////
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }
  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.checkPass(password, user.password))) {
    return next(new errorClass('Incorrect email or password', 401));
  }

  // 3) If everything ok, send token to client
  sendToken(user, res, 200);
});
///////////////////////////////////
///////////////////////////////////
///////////////////////////////////
///////////////////////////////////
///////////////////////////////////
///////////////////////////////////
exports.protect = catchAsync(async (req, res, next) => {
  //1) step1 check if there is a token on the page
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  console.log(token);
  if (!token) {
    next(new errorClass('you need to login To access this page', 401));
  }

  //step 2 verify the token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log('THIS IS DECODED', decoded);
  //check if the user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new errorClass('this User associated with this token does not exist any longer :)', 400)
    );
  }

  //check if the password of the user has not changed

  if (currentUser.checkPasswordChange(decoded.iat)) {
    next(new errorClass('YOU HAVE CHANGED YOUR PASSWORD PLEASE LOGIN AGAIN', 401));
  }
  //GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  console.log('successfully passed');
  next();
});

///////////////////////////////////
///////////////////////////////////
///////////////////////////////////
///////////////////////////////////
///////////////////////////////////
///////////////////////////////////

// exports.isLoggedIn = catchAsync(async (req, res, next) => {
//   if (req.cookies.jwt) {
//     const token = req.cookies.jwt;

//     //step 2 verify the token
//     const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
//     console.log('THIS IS DECODED', decoded);
//     //check if the user still exists
//     const currentUser = await User.findById(decoded.id);
//     if (!currentUser) {
//       return next();
//     }

//     //check if the password of the user has not changed

//     if (currentUser.checkPasswordChange(decoded.iat)) {
//       next();
//     }
//     //GRANT ACCESS TO PROTECTED ROUTE
//     res.locals.user = currentUser;
//     console.log('successfully passed');
//     return next();
//   } else {
//     return next();
//   }
// });

///////////////////////////////////
///////////////////////////////////
///////////////////////////////////
///////////////////////////////////
///////////////////////////////////
///////////////////////////////////
exports.authorizedRole = (...roles) => {
  return (req, res, next) => {
    // roles ['admin', 'lead-guide']. role='user'
    if (!roles.includes(req.user.roles)) {
      return next(new errorClass('You do not have permission to perform this action', 403));
    }

    next();
  };
};
///////////////////////////////////
///////////////////////////////////
///////////////////////////////////
///////////////////////////////////
///////////////////////////////////
///////////////////////////////////
exports.changeReset = catchAsync(async (req, res, next) => {
  //THERE ARE TWO STEPS IN THE PASSWORD RESET

  //STEP 1 CHECK IF THE EMAIL IS VALID
  const validateUser = await User.findOne({ email: req.body.email });

  if (!validateUser) {
    next(new errorClass('ENTER A VALID EMAIL', 400));
  }

  //ASSIGN A RESET TOKEN
  const resetToken = validateUser.createPasswordResetToken();
  await validateUser.save({ validateBeforeSave: false });

  //now actually send the reset email and reset  the password

  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/passwordChange/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

  try {
    await sendMail({
      email: validateUser.email,
      subject: 'Your password reset token (valid for 10 min)',
      message,
    });
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    validateUser.passwordResetToken = undefined;
    validateUser.passwordResetExpires = undefined;
    await validateUser.save({ validateBeforeSave: false });

    return next(new errorClass('There was an error sending the email. Try again later!'), 500);
  }
});
///////////////////////////////////
///////////////////////////////////
///////////////////////////////////
///////////////////////////////////
///////////////////////////////////
///////////////////////////////////
exports.changePassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  console.log(hashedToken);
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  console.log('user:', user);
  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new errorClass('Token is invalid or has expired', 400));
  }
  // 3) Update changedPasswordAt property for the user
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 4) Log the user in, send JWT
  const token = sendToken(user, res, 200);
  res.status(200).json({
    status: 'success',
    token: token,
  });
  console.log('logged in successfully');
});
///////////////////////////////////
///////////////////////////////////
///////////////////////////////////
///////////////////////////////////
///////////////////////////////////
///////////////////////////////////
////////////
//TO UPDATE PASSWORD MYSELF

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  const postPass = req.body.passwordCurrent;
  if (!(await user.checkPass(postPass, user.password))) {
    return next(new errorClass('THE PASSWORD ENTRED IS NOT CORRECT', 401));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  sendToken(user, res, 200);

  console.log('logged in successfully');
});
