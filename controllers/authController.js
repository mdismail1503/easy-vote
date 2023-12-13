/* eslint-disable no-undef */
/* eslint-disable prettier/prettier */
/* eslint-disable import/no-extraneous-dependencies */
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const { promisify } = require("util");

const AppError = require("../utils/appError");

const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const Email = require("../utils/email");

const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  //console.log(token);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;
  res.cookie("jwt", token, cookieOptions);

  user.password = undefined; // so that password doesn't appear on response
  res.status(statusCode).json({
    status: "success",
    token: token,
    data: {
      user: user,
    },
  });
};

exports.signup = async (req, res, next) => {
  try {
    const adminConfirmation = process.env.ADMIN_SECRET;
    if (
      req.body.secretForAdmin !== adminConfirmation &&
      req.body.role === "admin"
    )
      return next(new AppError("Please enter valid secret! ", 400));

    const { email, password, confirmPassword } = req.body;

    const user = await User.findOne({ email });

    if (user)
      return next(new AppError("User with email id already exists !", 400));

    if (password.length < 8)
      return next(
        new AppError("Password must be at least 8 characters long.", 400)
      );

    if (confirmPassword !== password)
      return next(
        new AppError("Passwords do not match. Please try again!", 400)
      );

    const newUser = await User.create(req.body);
    const url = `${req.protocol}://${req.get("host")}/me`;
    await new Email(newUser, url).sendWelcome();
    //console.log(newUser);
    createSendToken(newUser, 201, res);
  } catch (err) {
    res.status(500).json({
      status: "fail",
      data: err,
    });
  }
};

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Please provide email and Password!", 400));
  }
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError(`Incorrect email or password`, 401));
  }

  createSendToken(user, 200, res);
});

exports.logout = catchAsync(async (req, res, next) => {
  res.clearCookie("jwt");
  res.status(200).json({
    status: "success",
    data: "Successfully logged Out",
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  //1.Getting token and checking if it's there
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  // console.log(token);
  if (!token) {
    //return res.redirect("/");
    return res.status(400).render("error", {
      title: "Un-authorized",
      msg: "PLEASE LOGIN TO CONTINUE!",
    });
  }

  //2.Verifying token:
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // console.log(decoded);

  // 3.Check if the user still exists
  const currentUser = await User.findById(decoded.id);

  if (!currentUser)
    return next(
      new AppError(`The user belonging to this token does no longer exist`, 401)
    );

  // 4.Check if user changedPassword after token was issued
  if (currentUser.changePasswordAfterTokenIssued(decoded.iat))
    return next(
      new AppError(`User recently changed password! Please login again`, 401)
    );

  // Granting access to specific routes
  req.user = currentUser; //setting user on req object
  res.locals.user = currentUser;
  next();
});

//ONLY FOR RENDERED PAGES: NO ERRORS
exports.isLoggedIn = catchAsync(async (req, res, next) => {
  //IF THERE'S TOKEN THEN EXECUTE ALL THE CODE
  if (req.cookies.jwt) {
    //1.Verifying token:
    const decoded = await promisify(jwt.verify)(
      req.cookies.jwt,
      process.env.JWT_SECRET
    );

    // 2.Check if the user still exists
    const currentUser = await User.findById(decoded.id);

    if (!currentUser) return next();

    // 3.Check if user changedPassword after token was issued
    if (currentUser.changePasswordAfterTokenIssued(decoded.iat)) return next();

    //there is a logged in user
    //setting user on req object
    res.locals.user = currentUser;
  }
  next();
});

exports.restrictToAdmin = (req, res, next) => {
  const { role } = req.user;
  if (role !== "admin") {
    next(
      new AppError("You do not have permission to perform this action", 403)
    );
  } else if (req.user.role === "admin") {
    next();
  }
};

let tk = "";

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("Please enter email address! ", 401));
  }

  // GENERATING THE RANDOM RESET TOKEN
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  //console.log(user);

  //console.log(resetToken);
  // SEND THE RESET TOKEN TO USER'S EMAIL

  try {
    // const resetURL = `${req.protocol}://${req.get(
    //   "host"
    // )}/api/v1/users/resetPassword/${resetToken}`;

    const resetURL = `${req.protocol}://${req.get(
      "host"
    )}/newPassword/${resetToken}`;
    await new Email(user, resetURL).sendPasswordReset();
    tk = resetToken;
    res.status(200).json({
      status: "success",
      message: "Token sent to the email!",
    });
  } catch (err) {
    //IF SENDING FAILS, CLEAN UP THE USERS RESET TOKEN AND EXPIRATION

    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        "There was an error sending the email. Try again lager! ",
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1. get user based on token
  // console.log(`req.params.token  ${req.params.token}`);
  const hashedToken = crypto.createHash("sha256").update(tk).digest("hex");
  // console.log(req.baseUrl);
  // const hashedToken = crypto
  //   .createHash("sha256")
  //   .update(req.url.split(":").pop())
  //   .digest("hex");

  //console.log(`hashedToken  ${hashedToken}`);

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }, // coz we gave a expire limit
  });
  //console.log(user);

  // 2. if token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;

  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();
  //3. Log the user in, send JWT
  createSendToken(user, 200, res);
});

exports.updatePassword = async (req, res, next) => {
  // 1. Get user from the collection
  const user = await User.findById(req.user.id).select("+password");

  // 2. check if posted current password is correct

  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError("Your current password is wrong ", 401));
  }

  // 3. if so, update password

  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  await user.save();

  // 4. log in user , send JWT
  createSendToken(user, 200, res);
};
