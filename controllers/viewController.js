/* eslint-disable no-undef */
/* eslint-disable prettier/prettier */
/* eslint-disable no-restricted-syntax */

const Party = require("../models/partyModel");

const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const User = require("../models/userModel");
const Email = require("../utils/email");

exports.getOverview = catchAsync(async (req, res, next) => {
  const parties = await Party.find();
  res.status(200).render("overview", {
    title: "All Parties",
    parties,
    visitedBefore: req.cookies.visitedBefore,
  });
});

exports.getLoginForm = (req, res, next) => {
  setTimeout(() => {
    res.status(200).render("login", {
      title: "Log into your account",
    });
  }, 1100);
};

exports.getSignupForm = (req, res, next) => {
  res.status(200).render("signup", {
    title: "Sign up your account",
  });
};

exports.getPartyPage = catchAsync(async (req, res, next) => {
  const party = await Party.findOne({ slug: req.params.slug });

  if (!party) {
    return next(new AppError("There is no party with that name !", 404));
  }

  res.status(200).render("party", {
    title: party.name,
    party,
  });
});

exports.logout = catchAsync(async (req, res, next) => {
  // const { cookies } = req;
  // for (const cookieName of Object.keys(cookies)) {
  //   res.clearCookie(cookieName);
  // }
  res.clearCookie("jwt");
  setTimeout(() => {
    res.redirect("/");
  }, 2500);
});

// VOTING //

// function encrypt(text, key) {
//   const cipher = crypto.createCipheriv("aes-256-cbc", key);
//   let encrypted = cipher.update(text, "utf-8", "hex");
//   encrypted += cipher.final("hex");
//   return encrypted;
// }
function mask(text) {
  // Use Base64 encoding as a simple masking mechanism
  return Buffer.from(text).toString("base64");
}
exports.vote = async (req, res, next) => {
  try {
    if (!req.user.voted) {
      const party = await Party.findOne({ slug: req.params.slug });
      req.user.voted = true;
      //  req.user.votedFor = encrypt(party.name, process.env.ENCRYPTION_KEY);
      req.user.votedFor = mask(party.name);
      await req.user.save({ validateBeforeSave: false });
      party.votesCount += 1;
      if (req.user.role === "admin") party.votesCount -= 1;
      await party.save({ validateBeforeSave: false });
      res.status(200).render("votingParty", {
        title: "Vote in progress",
        message: "Your vote is in progress 👍... please wait a second!",
        user: req.user,
      });
    } else {
      res.status(400).render("votingParty", {
        title: "Already voted",
        message: "You have already voted! 😊",
        india: "Won",
      });
    }
  } catch (err) {
    console.log(err);
  }
};

exports.getMe = (req, res) => {
  res.status(200).render("account", {
    title: "Your Account",
  });
};

exports.updateUserData = async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    }
  );
  res.status(200).render("account", {
    title: "Your account ",
    user: updatedUser,
  });
};

exports.thankYou = async (req, res, next) => {
  const { user } = req;
  const url = `${req.protocol}://${req.get("host")}`;
  await new Email(user, url).sendThankYou();

  res.status(200).render("thank-you", {
    title: "Vote Successful",
  });
};

// function decrypt(text, key) {
//   const decipher = crypto.createDecipheriv("aes-256-cbc", key);
//   let decrypted = decipher.update(text, "hex", "utf-8");
//   decrypted += decipher.final("utf-8");
//   return decrypted;
// }
function unmask(text) {
  // Use Base64 decoding to unmask
  return Buffer.from(text, "base64").toString("utf-8");
}
exports.myVote = catchAsync(async (req, res, next) => {
  let partyName = null;
  if (req.user.votedFor) {
    partyName = unmask(req.user.votedFor);
  } else {
    partyName = null;
  }
  res.status(200).render("myVote", {
    title: "Your Vote",
    user: req.user,
    party: await Party.findOne({ name: partyName }),
  });
});

exports.results = catchAsync(async (req, res, next) => {
  const parties = await Party.find().sort({ votesCount: -1 });
  res.status(200).render("results", {
    title: "Results",
    party: parties,
  });
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  res.status(200).render("forgotPassword", {
    title: "Forgot Password",
  });
});

exports.newPassword = catchAsync(async (req, res, next) => {
  res.status(200).render("newPassword", {
    title: "New password",
  });
});

exports.getUserList = catchAsync(async (req, res, next) => {
  const users = await User.find();
  res.status(200).render("userList", {
    titile: "EasyVote | Users List",
    users: users,
  });
});
