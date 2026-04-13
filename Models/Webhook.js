const mongoose = require("mongoose");

const webhookLogSchema = new mongoose.Schema(
  {
    fintechId: {
      type: string,
      required: true,
    },

    url: {
      type: String,
      required: true,
      trim: true,
    },

    event: {
      type: String,
      enum: ["TRANSACTION_SUCCESS", "FAILED"],
      required: true,
    },

    payload: {
      type: Object, // store JSON payload sent to fintech
      required: true,
    },

    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED"],
      default: "PENDING",
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
  }
);

module.exports = mongoose.model("WebhookLog", webhookLogSchema);