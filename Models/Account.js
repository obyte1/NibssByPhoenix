const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema(
  {
    accountNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    accountName: {
      type: String,
      required: true,
      trim: true,
    },

    bankCode: {
      type: String,
      required: true,
    },

    fintechId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Fintech",
      required: true,
    },

    balance: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Account", accountSchema);