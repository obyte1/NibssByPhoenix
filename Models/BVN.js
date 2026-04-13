const mongoose = require("mongoose");

const bvnSchema = new mongoose.Schema(
  {
    bvn: {
      type: String,
      required: true,
      unique: true,
      length: 11, // BVN is 11 digits
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

    phone: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true, // gives createdAt & updatedAt (optional for BVN records)
    versionKey: false,
  }
);

module.exports = mongoose.model("BVN", bvnSchema);