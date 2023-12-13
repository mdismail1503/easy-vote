/* eslint-disable node/no-unsupported-features/es-syntax */
const Party = require("../models/partyModel");
const APIfeatures = require("../utils/APIfeatures");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.createParty = catchAsync(async (req, res, next) => {
  const newParty = await Party.create(req.body);

  res.status(201).json({
    status: "success",
    data: {
      newParty,
    },
  });
});

exports.getAllParties = catchAsync(async (req, res, next) => {
  let query = APIfeatures.features(req.query, Party);

  query = await query;
  res.status(201).json({
    status: "success",
    results: query.length,
    data: {
      query,
    },
  });
});

exports.getParty = catchAsync(async (req, res, next) => {
  const newParty = await Party.findById(req.params.id);

  res.status(201).json({
    status: "success",
    data: {
      newParty,
    },
  });
});

exports.updateParty = catchAsync(async (req, res, next) => {
  const party = await Party.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!party) {
    return next(new AppError("No doc found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      data: party,
    },
  });
});
