//const express = require("express");
const fs = require("fs");
//const Party = require("../models/partyModel");

const mongoose = require("mongoose");
/* eslint-disable prettier/prettier */
//const express = require("express");

// ENVIRONMENTAL VARIABLES
const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });

//const app = require("../app");
const Party = require("../models/partyModel");

//const port = process.env.PORT;

// DB CONNECTION
const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log("DB connection successful 💯");
  });

// LISTENING SERVER

const parties = JSON.parse(
  fs.readFileSync(`${__dirname}/partyData.json`, "utf-8")
);

const deleteEverything = async () => {
  try {
    await Party.deleteMany();
    console.log("Data successfully deleted");
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

const insertEverything = async () => {
  await Party.create(parties);
  console.log("Data successfully loaded");
};

if (process.argv[2] === "--import") {
  insertEverything();
} else if (process.argv[2] === "--delete") {
  deleteEverything();
}
