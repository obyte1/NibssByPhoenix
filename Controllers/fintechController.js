const crypto = require("crypto");
const Fintech = require("../Models/Fintechs");

const jwt = require("jsonwebtoken");

const Account = require("../Models/Account");
const { generateAccountNumber } = require("../Utils/accountGenerator");

const Transaction = require("../Models/Transaction");

const { loadTemplate } = require("../Utils/emailTemplate");
const { sendEmail } = require("../Utils/mailer");


exports.generateToken = async (req, res) => {
  const { apiKey, apiSecret } = req.body;

  const fintech = await Fintech.findOne({ apiKey, apiSecret });

  if (!fintech) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    {
      fintechId: fintech._id,
      name: fintech.name,
      email: fintech.email,
      bankCode: fintech.bankCode,
      bankName: fintech.bankName,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.json({
    token,
    fintech: {
      name: fintech.name,
      email: fintech.email,
      bankCode: fintech.bankCode,
      bankName: fintech.bankName,
    }
  });
};


exports.onboardFintech = async (req, res) => {
  const { name, email } = req.body;

  if (!email.includes("@")) {
      return res.status(400).json({ message: "Invalid email" });
    }

    const existing = await Fintech.findOne({ email });

    if (existing) {
      return res.status(400).json({
        apiKey: existing.apiKey,
        apiSecret: existing.apiSecret,
        bankCode: existing.bankCode,
        bankName: existing.bankName,
        message: "Fintech already onboarded"
      });
    }

  const apiKey = crypto.randomBytes(16).toString("hex");
  const apiSecret = crypto.randomBytes(32).toString("hex");

  const bankCode = Math.floor(100 + Math.random() * 900).toString();
  let bankName = `${name.slice(0,3).toUpperCase()} Bank`;


  let exists = await Fintech.findOne({ bankName });

  let index = 0;

  const suffixes = [
  "Alpha",
  "Nova",
  "Prime",
  "Core",
  "Axis",
  "Trust",
  "Unity",
  "Global",
  "Metro",
  "Capital"
];

  while (exists) {
    bankName = `${name.slice(0,3).toUpperCase()} Bank ${suffixes[index]}`;

    index++;

    if (index >= suffixes.length) {
      throw new Error("Unable to generate unique bank name");
    }

    exists = await Fintech.findOne({ bankName });
  }

  const fintech = await Fintech.create({
    name,
    email,
    apiKey,
    apiSecret,
    bankCode,
    bankName
  });

  // 🔥 Load and inject variables into HTML
    const html = loadTemplate("onboardingEmail", {
      name,
      apiKey,
      apiSecret,
      bankCode,
      bankName,
      baseUrl: process.env.BASE_URL || "http://localhost:3000",
    });

    // 🔥 Send email
    await sendEmail(email, "Welcome to NibssByPhoenix", html);

  res.json({
    apiKey,
    apiSecret,
    bankCode,
    bankName
  });
};


exports.createAccount = async (req, res) => {
  const { accountName } = req.body;

  if (!accountName) {
    return res.status(400).json({ message: "Account name is required" });
  }

  if (!req.user.fintechId) {
  return res.status(403).json({ message: "Unauthorized fintech access" });}

  const fintech = await Fintech.findById(req.user.fintechId);

  const accountNumber = generateAccountNumber(fintech.bankCode);

  const account = await Account.create({
    accountName,
    accountNumber,
    bankCode: fintech.bankCode,
    fintechId: fintech._id,
    balance: 0
  });

  res.json(account);
};


exports.nameEnquiry = async (req, res) => {
  const { accountNumber } = req.params;

  const account = await Account.findOne({ accountNumber });

  if (!account) return res.status(404).json({ message: "Account not found" });

  res.json({
    accountName: account.accountName,
    accountNumber: account.accountNumber,
    bankCode: account.bankCode
  });
};

exports.getFintechAccounts = async (req, res) => {
  try {
    const fintechId = req.user.fintechId;

    const accounts = await Account.find({ fintechId });

    res.json({
      count: accounts.length,
      accounts
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


exports.transfer = async (req, res) => {
  try {

    const { from, to } = req.body;
    const amount = Number(req.body.amount);

    if (!from || !to) {
  return res.status(400).json({
    message: "Both sender (from) and receiver (to) account numbers are required"
  });}

if(!amount){
  return res.status(400).json({
    message: "Amount is required"
  });
}

// Validate
if (!Number.isFinite(amount)) {
  return res.status(400).json({
    message: "Invalid amount, Amount must be a number"
  });
}



if (amount <= 0) {
  return res.status(400).json({
    message: "Amount must be greater than zero"
  });
}

    if (amount <= 0) {
      return res.status(400).json({ message: "Amount must be greater than zero" });
    }

    const sender = await Account.findOne({ accountNumber: from });
    const receiver = await Account.findOne({ accountNumber: to });

    if (sender.fintechId.toString() !== req.user.fintechId) {
  return res.status(403).json({ message: "Unauthorized" });}

    if (!sender || !receiver) {
      return res.status(404).json({ message: "Invalid account" });
    }

    if (sender.balance < amount) {
      return res.status(400).json({ message: "Insufficient funds" });
    }

    // 🔐 Get fintechs
    const senderFintech = await Fintech.findById(sender.fintechId);
    const receiverFintech = await Fintech.findById(receiver.fintechId);

    // 💸 Perform transaction
    sender.balance -= amount;
    receiver.balance += amount;

    await sender.save();
    await receiver.save();

    const reference = "TX" + Date.now();

    const tx = await Transaction.create({
      reference,
      senderAccount: from,
      receiverAccount: to,
      amount,
      status: "SUCCESS"
    });

    // 📩 Sender Email (Debit)
    const debitHtml = loadTemplate("debitEmail", {
      fintechName: senderFintech.name,
      amount,
      from,
      to,
      reference,
      balance: sender.balance
    });

    await sendEmail(
      senderFintech.email,
      "Debit Alert - NibssByPhoenix",
      debitHtml
    );

    // 📩 Receiver Email (Credit)
    const creditHtml = loadTemplate("creditEmail", {
      fintechName: receiverFintech.name,
      amount,
      from,
      to,
      reference,
      balance: receiver.balance
    });

    await sendEmail(
      receiverFintech.email,
      "Credit Alert - NibssByPhoenix",
      creditHtml
    );

    res.json(tx);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Transfer failed" });
  }
};

exports.getTransaction = async (req, res) => {
  const tx = await Transaction.findOne({ reference: req.params.ref });

  if (!tx) return res.status(404).json({ message: "Not found" });

  res.json(tx);
};

exports.getAccountBalance = async (req, res) => {
  try {
    const { accountNumber } = req.params;

    const account = await Account.findOne({
      accountNumber,
      fintechId: req.user.fintechId // 🔐 ensure ownership
    });

    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    res.json({
      accountName: account.accountName,
      accountNumber: account.accountNumber,
      balance: account.balance
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};