const AppError = require("../utils/appError");

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.keyValue.name;
  const message = `Invalid field value:${value} Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data: ${errors.join(".")}`;

  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError("Invalid token. Please login again!", 401);

const handleJWTExpiredError = () =>
  new AppError("Your token has expired!", 401);

// const globalErrorHandler = (err, req, res, next) => {
//   err.statusCode = err.statusCode || 500;
//   err.status = err.status || "error";

//   // DEVELOPMENT
//   if (process.env.NODE_ENV === "development") {
//     if (req.originalUrl.startsWith("/api")) {
//       res.status(err.statusCode).json({
//         status: err.status,
//         error: err,
//         message: err.message,
//         stack: err.stack,
//       });
//     } else {
//       res.status(err.statusCode).render("errorTemplate", {
//         title: "Something went wrong!",
//         msg: err.message,
//       });
//     }
//   }
//   //PRODUCTION
//   if (process.env.NODE_ENV === "production") {
//     let error = Object.create(err);
//     error.message = err.message;
//     console.log(err);
//     if (err.name === "CastError") {
//       error = handleCastErrorDB(error);
//     }
//     if (error.code === 11000) error = handleDuplicateFieldsDB(err);
//     if (error.name === "ValidationError")
//       error = handleValidationErrorDB(error);

//     if (error.name === "JsonWebTokenError") error = handleJWTError();
//     if (error.name === "TokenExpiredError") error = handleJWTExpiredError();

//     if (req.originalUrl.startsWith("/api")) {
//       if (err.isOperational) {
//         res.status(err.statusCode).json({
//           status: err.status,
//           message: err.message,
//         });
//       } else {
//         console.log("ERROR ⛔", err);
//         res.status(err.statusCode).json({
//           title: "Someting went  wrong!",
//           message: "Please try again later. ",
//         });
//       }
//     }
//     // templates
//     else {
//       // eslint-disable-next-line no-lonely-if
//       if (err.isOperational) {
//         res.status(err.statusCode).render("errorTemplate", {
//           title: "Something went wrong!",
//           msg: err.message,
//         });
//       } else {
//         console.log("ERROR ⛔", err);
//         res.status(err.statusCode).render("errorTemplate", {
//           title: "Someting went  wrong!",
//           msg: "Please try again later. ",
//         });
//       }
//     }
//   }
//   return next(err);
// };

const sendErrorDev = (err, req, res) => {
  // API
  if (req.originalUrl.startsWith("/api")) {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  } else {
    // RENDERED WEBSITE
    console.error("ERROR⛔ ", err);

    res.status(err.statusCode).render("error", {
      title: "Something went wrong!",
      msg: err.message,
    });
  }
};

const sendErrorProd = (err, req, res) => {
  //Operational, trusted error: send message to client

  // API
  if (req.originalUrl.startsWith("/api")) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
      //programming or other unknown error:don't leak error details
    }

    console.error("ERROR⛔ ", err);

    return res.status(500).json({
      status: "error",
      message: "Something went very wrong!",
    });
  }
  // B. Rendered Website
  if (err.isOperational) {
    res.status(err.statusCode).render("error", {
      title: "Something went wrong!",
      msg: err.message,
    });
  } else {
    console.error("ERROR⛔ ", err);

    res.status(err.statusCode).render("error", {
      title: "Something went wrong!",
      msg: "Please try again later.",
    });
  }
};

module.exports = (err, req, res, next) => {
  //error first middle ware
  //console.log(err.stack);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = Object.create(err);
    error.message = err.message;

    if (error.name === "CastError") {
      error = handleCastErrorDB(error);
    }
    if (err.code === 11000) error = handleDuplicateFieldsDB(err);

    if (err.name === "ValidationError") error = handleValidationErrorDB(error);
    if (error.name === "JsonWebTokenError") error = handleJWTError();
    if (error.name === "TokenExpiredError") error = handleJWTExpiredError();
    sendErrorProd(error, req, res);
  }
};
