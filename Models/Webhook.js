const mongoose = require("mongoose");

const webhookSchema = new mongoose.Schema(
  {
    fintechId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Fintech",
      required: true,
      unique: true,
    },

    url: {
      type: String,
      required: true,
      trim: true,
    },

    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
  }
);

module.exports = mongoose.model("Webhook", webhookSchema);