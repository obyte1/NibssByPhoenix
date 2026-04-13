const mongoose = require("mongoose");

const bankSchema = new mongoose.Schema(
  {
    bankCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    bankName: {
      type: String,
      required: true,
      trim: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);


module.exports = mongoose.model("Bank", bankSchema);