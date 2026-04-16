// controllers/authController.js
const jwt = require("jsonwebtoken");
const Fintech = require("../models/Fintech");

exports.generateToken = async (req, res) => {
  const { apiKey, apiSecret } = req.body;

  const fintech = await Fintech.findOne({ apiKey, apiSecret });

  if (!fintech) return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign(
    { fintechId: fintech._id },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.json({ token });
};