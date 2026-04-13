const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    reference: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    senderAccount: {
      type: string,
      required: true,
    },

    receiverAccount: {
      type: string,
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED"],
      default: "PENDING",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Index for fast lookups
transactionSchema.index({ reference: 1 });
transactionSchema.index({ senderAccount: 1 });
transactionSchema.index({ receiverAccount: 1 });


module.exports = mongoose.model("Transaction", transactionSchema);