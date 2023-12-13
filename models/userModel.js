/* eslint-disable no-undef */
/* eslint-disable prettier/prettier */
const mongoose = require("mongoose");
const validator = require("validator");

const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "A user must have a name"],
  },
  email: {
    type: String,
    required: [true, "A user must have an email"],
    unique: true,
    validate: [validator.isEmail, "Please enter a valid email"],
  },
  password: {
    type: String,
    required: [true, "A user must set a password"],
    validate: {
      validator: function (password) {
        return password.length >= 8;
      },
      messsage: "Password must be at least 8 characters long.",
    },
  },
  confirmPassword: {
    type: String,
    required: [true, "A user must confirm password"],
    validate: {
      validator: function (val) {
        return this.password === val;
      },
      message: "Passwords do not match. Please try again.",
    },
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  secretForAdmin: {
    type: String,
    select: false,
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  voted: {
    type: Boolean,
    default: false,
  },
  votedFor: {
    type: String,
  },
  photo: {
    type: String,
    default: "default.jpg",
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // if we aren't creating a password field or if it isn't modified we no need to hash

  // if password is changed or something is happened to password then we hash it
  this.password = await bcrypt.hash(this.password, 12);
  //if (this.secretForAdmin != null)
  //this.secretForAdmin = await bcrypt.hash(this.secretForAdmin, 12);
  this.confirmPassword = undefined;
  this.secretForAdmin = undefined;
  this.name = this.name.toUpperCase();
  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  //if password is modified
  this.passwordChangedAt = Date.now();
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  actualPassword
) {
  return await bcrypt.compare(candidatePassword, actualPassword);
};

userSchema.methods.changePasswordAfterTokenIssued = function (TokenIssueTime) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return TokenIssueTime < changedTimeStamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  // console.log(`passwordResetToken ${this.passwordResetToken}`);
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};
const User = mongoose.model("User", userSchema);

module.exports = User;
