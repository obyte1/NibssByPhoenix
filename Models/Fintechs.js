const mongoose = require("mongoose");

const fintechSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    apiKey: {
      type: String,
      required: true,
      unique: true,
    },

    apiSecret: {
      type: String,
      required: true,
    },

    bankCode: {
      type: String,
      required: true,
    },

    bankName: {
      type: String,
      required: true,
    },
  },
  {
    timestamps:  true,
    versionKey: false,
  }
);


module.exports = mongoose.model("Fintech", fintechSchema);