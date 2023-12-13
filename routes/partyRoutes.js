/* eslint-disable prettier/prettier */
const express = require("express");
const partyController = require("../controllers/partyController");
const authController = require("../controllers/authController");

const router = express.Router();

//router.route("/:id").get(partyController.getParty);

router
  .route("/")
  .get(partyController.getAllParties)
  .post(
    authController.protect,
    authController.restrictToAdmin,
    partyController.createParty
  );

router
  .route("/:id")
  .get(partyController.getParty)
  .patch(
    authController.protect,
    authController.restrictToAdmin,
    partyController.updateParty
  );

module.exports = router;
