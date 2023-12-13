/* eslint-disable no-undef */
/* eslint-disable prettier/prettier */
//const express = require("express");
const mongoose = require("mongoose");

// ENVIRONMENTAL VARIABLES
const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });

process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION 👎");
  console.log(err.name, err.message);
  process.exit(1);
});

const app = require("./app");

const port = process.env.PORT || 3000;

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
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB connection successful 💯");
  });

// LISTENING SERVER
const server = app.listen(port, () => {
  console.log("APP started running!!");
});

process.on("unhandledRejection", (err) => {
  console.log(err);
  console.log("UNHANDLED REJECTION: ⛔ SHUTTING DOWN");
  server.close(() => {
    process.exit(1);
  });
});

process.on("SIGTERM", () => {
  console.log("👋 SIGTERM RECEIVED, Shutting down gracefully!");
  server.close(() => {
    console.log("😶‍🌫️ Process terminated!");
  });
});
