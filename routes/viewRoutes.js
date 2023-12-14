/* eslint-disable no-undef */
/* eslint-disable prettier/prettier */
const express = require("express");

const router = express.Router();
const viewController = require("../controllers/viewController");
const authController = require("../controllers/authController");

router.get("/newPassword/:token", viewController.newPassword);
router.use(authController.isLoggedIn);

router.get("/", authController.isLoggedIn, viewController.getOverview);

router.get("/login", authController.isLoggedIn, viewController.getLoginForm);
router.get("/signup", authController.isLoggedIn, viewController.getSignupForm);

router.get(
  "/parties/:slug",
  authController.protect,
  // eslint-disable-next-line prettier/prettier
  viewController.getPartyPage
);
router.get("/logout", viewController.logout);
router.get("/parties/vote/:slug", authController.protect, viewController.vote);
router.get("/me", authController.protect, viewController.getMe);
router.get("/thank-you", authController.protect, viewController.thankYou);
router.get("/me/vote", authController.protect, viewController.myVote);
router.get("/forgotPassword", viewController.forgotPassword);
router.get(
  "/results",
  authController.protect,
  authController.restrictToAdmin,
  viewController.results
);
router.get(
  "/userList",
  authController.protect,
  authController.restrictToAdmin,
  viewController.getUserList
);
router.post("/sign-up-complete", viewController.signupComplete);
router.post("/login-complete", viewController.loginComplete);
router.post("/new-password", viewController.newPassRender);

module.exports = router;
