const mongoose = require("mongoose");

const ninSchema = new mongoose.Schema(
  {
    nin: {
      type: String,
      required: true,
      unique: true,
      match: /^[0-9]{11}$/, 
      trim: true,
    },

    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
    },

    dob: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true, 
    versionKey: false,
  }
);

module.exports = mongoose.model("NIN", ninSchema);