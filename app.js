/* eslint-disable no-undef */
/* eslint-disable node/no-extraneous-require */
/* eslint-disable import/no-extraneous-dependencies */
const express = require("express");
const path = require("path");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const cookieParser = require("cookie-parser");
const compression = require("compression");

const partyRouter = require("./routes/partyRoutes");
const userRouter = require("./routes/userRoutes");

const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");

const app = express();
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000, // 1 hour
  message: "Too many requests form this IP, please try again in an hour!",
});

app.use("/api", limiter);
app.use(express.json({ limit: "10kb" }));
//app.use(express.urlencoded({ extended: true, limit: "10kb" }));

app.use(mongoSanitize());
app.use(xss());
app.use(cookieParser());
app.use(express.static("public"));

app.use((req, res, next) => {
  //console.log(req.cookies);
  // console.log(req.url.split("/").pop());
  next();
});
const viewRouter = require("./routes/viewRoutes");

app.get("/", (req, res, next) => {
  // const hasVisited = req.cookies.visitedBefore;
  // if (!hasVisited) {
  //   res.cookie("visitedBefore", true);
  //   console.log("First time visiting...");
  //   next();
  // } else {
  //   next();
  // }
  next();
});

app.use(compression());
app.use("/", viewRouter);
app.use("/api/v1/users/resetPassword/:token", (req, res, next) => {
  res.redirect(`/newPassword/${req.params.token}`);
  // console.log(req.params.token);
  next();
});
app.use("/api/v1/parties", partyRouter);
app.use("/api/v1/users", userRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Please Login or Signup to continue!`, 404));
});

app.use(globalErrorHandler);
module.exports = app;
