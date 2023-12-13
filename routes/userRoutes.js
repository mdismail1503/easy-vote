/* eslint-disable no-undef */
/* eslint-disable prettier/prettier */
/* eslint-disable import/no-extraneous-dependencies */
const express = require("express");

const authController = require("../controllers/authController");
const userController = require("../controllers/userController");

const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.get("/logout", authController.logout);

router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resPassword/:token", authController.resetPassword);

//router.use(authController.protect);

router.patch(
  "/updateMyPassword",
  authController.protect,
  authController.updatePassword
);
router.get("/deleteMe", authController.protect, userController.deleteMe);
router.get(
  "/me",
  authController.protect,
  userController.getMe,
  userController.getUser
);
router.patch(
  "/updateMe",
  authController.protect,
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe
);

module.exports = router;
