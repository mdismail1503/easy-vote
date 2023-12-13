/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable prettier/prettier */
const mongoose = require("mongoose");
const slugify = require("slugify");

//const validator = require("validator");

const partySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A party must have a name"],
      maxlength: [30, "A party name must have less or equal than 30 chars"],
      minlength: [8, "A party name must have minimum of 8 chars"],
      unique: true,
    },
    photo: {
      type: String,
      required: [true, "A party must have a photo"],
    },
    symbol: {
      type: String,
      unique: true,
    },
    votesCount: {
      type: Number,
      default: 0,
    },
    slug: {
      type: String,
    },
    candidateName: {
      type: String,
      required: [true, "A party should have a candidate"],
    },
    age: {
      type: Number,
      max: 75,
      min: 21,
    },
    candidateDetails: {
      type: String,
    },
    summary: [
      {
        type: String,
      },
    ],
    candidatePic: {
      type: String,
    },
    partyArray: [
      {
        type: String,
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

partySchema.pre("save", function (next) {
  //console.log(this);
  this.slug = slugify(this.name, { lower: true });
  next();
});

const Party = mongoose.model("Party", partySchema);

module.exports = Party;
