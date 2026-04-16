const crypto = require("crypto");
const Fintech = require("../models/Fintech");

exports.onboardFintech = async (req, res) => {
  const { name, email } = req.body;

  const apiKey = crypto.randomBytes(16).toString("hex");
  const apiSecret = crypto.randomBytes(32).toString("hex");

  const bankCode = Math.floor(100 + Math.random() * 900).toString();
  const bankName = `${name.slice(0,3).toUpperCase()} Bank`;

  const fintech = await Fintech.create({
    name,
    email,
    apiKey,
    apiSecret,
    bankCode,
    bankName
  });

  res.json({
    apiKey,
    apiSecret,
    bankCode,
    bankName
  });
};