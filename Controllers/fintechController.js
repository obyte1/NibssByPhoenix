const crypto = require("crypto");
const Fintech = require("../Models/Fintechs");
const mongoose = require("mongoose");

const jwt = require("jsonwebtoken");

const Account = require("../Models/Account");
const { generateAccountNumber } = require("../Utils/accountGenerator");

const Transaction = require("../Models/Transaction");

const { loadTemplate } = require("../Utils/emailTemplate");
const { sendEmail } = require("../Utils/mailer");

const BVN = require("../Models/BVN");
const NIN = require("../Models/NIN");


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
      Swagger_Documentation: process.env.BASE_URL || "https://nibssbyphoenix.onrender.com/api/docs/",
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
  try {
    const { kycID, dob, kycType } = req.body;

    // 🔐 Auth check
    if (!req.user.fintechId) {
      return res.status(403).json({ message: "Unauthorized fintech access" });
    }

    // 🔍 Validate input
    if (!kycType || !kycID || !dob) {
      return res.status(400).json({
        message: "kycType, kycID and DOB are required"
      });
    }

    let identityRecord;

    // 🔄 KYC TYPE SWITCH
    if (kycType.toLowerCase() === "bvn") {
      identityRecord = await BVN.findOne({ bvn: kycID });

      if (!identityRecord) {
        return res.status(404).json({ message: "BVN not found" });
      }

    } else if (kycType.toLowerCase() === "nin") {
      identityRecord = await NIN.findOne({ nin: kycID });

      if (!identityRecord) {
        return res.status(404).json({ message: "NIN not found" });
      }

    } else {
      return res.status(400).json({
        message: "Invalid kycType. Use BVN or NIN"
      });
    }

    // 🔍 DOB VALIDATION
     const parsedDate = new Date(dob);

if (!dob || isNaN(parsedDate.getTime())) {
  return res.status(400).json({
    message: "Invalid date format. Use YYYY-MM-DD"
  });
}

const inputDob = parsedDate.toISOString().split("T")[0];
const recordDob = new Date(identityRecord.dob).toISOString().split("T")[0];

if (inputDob !== recordDob) {
  return res.status(400).json({
    message: `${kycType} and DOB do not match`
  });
}

    // ✅ Fetch fintech
    const fintech = await Fintech.findById(req.user.fintechId);

    // 🔢 Generate account number
    const accountNumber = generateAccountNumber(fintech.bankCode);

    // 🧠 Use verified data
    const accountName = `${identityRecord.firstName} ${identityRecord.lastName}`;

    // 🔒 Prevent duplicate account for same identity
    const existing = await Account.findOne({
      fintechId: fintech._id,
      kycID
    });

    if (existing) {
      return res.status(400).json({
        message: `${kycType} already linked to an account`
      });
    }

    // ✅ Create account
    const account = await Account.create({
      accountName,
      accountNumber,
      bankCode: fintech.bankCode,
      fintechId: fintech._id,
      balance: 15000,

      // unified identity
      kycType,
      kycID
    });

    return res.json({
      message: "Account created successfully",
      account
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Account creation failed"
    });
  }
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

// exports.transfer = async (req, res) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const { from, to } = req.body;
//     const amount = Number(req.body.amount);

//     // ✅ Basic validation
//     if (!from || !to) {
//       return res.status(400).json({
//         message: "Both sender (from) and receiver (to) account numbers are required"
//       });
//     }

//     if (from === to) {
//   return res.status(400).json({
//     message: "You cannot transfer to the same account"
//   });}

//     if (!amount || !Number.isFinite(amount)) {
//       return res.status(400).json({
//         message: "Invalid amount"
//       });
//     }

//     if (amount <= 0) {
//       return res.status(400).json({
//         message: "Amount must be greater than zero"
//       });
//     }

//     // 🔍 Fetch accounts inside transaction
//     const sender = await Account.findOne({ accountNumber: from }).session(session);
//     const receiver = await Account.findOne({ accountNumber: to }).session(session);

//     if (!sender || !receiver) {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(404).json({ message: "Invalid account" });
//     }

//     // 🔐 Authorization check
//     if (sender.fintechId.toString() !== req.user.fintechId) {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(403).json({ message: "Unauthorized: Sender is not the owner of the account" });
//     }

//     if (sender.balance < amount) {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(400).json({ message: "Insufficient funds" });
//     }

//     // 🔍 Fetch fintechs
//     const senderFintech = await Fintech.findById(sender.fintechId).session(session);
//      if (!senderFintech) {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(404).json({
//         message: "Senders fintech not found"
//       });
//     }

    
//     const receiverFintech = await Fintech.findById(receiver.fintechId).session(session);

//     if (!receiverFintech) {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(404).json({
//         message: "Receiver fintech not found"
//       });
//     }

//     // 💸 Perform transfer
//     sender.balance -= amount;
//     receiver.balance += amount;

//     await sender.save({ session });
//     await receiver.save({ session });

//     const reference = "TX" + Date.now();

//     const [tx] = await Transaction.create([{
//       reference,
//       senderAccount: from,
//       receiverAccount: to,
//       amount,
//       status: "SUCCESS"
//     }], { session });

//     // ✅ Commit transaction (VERY IMPORTANT)
//     await session.commitTransaction();
//     session.endSession();

//     // 📩 Send emails (DO NOT break transfer if they fail)

// //     // Debit email
// //     try {
// //       const debitHtml = loadTemplate("debitEmail", {
// //         fintechName: senderFintech.name,
// //         amount,
// //         from,
// //         to,
// //         reference,
// //         balance: sender.balance
// //       });

// //       await sendEmail(
// //         senderFintech.email,
// //         "Debit Alert - NibssByPhoenix",
// //         debitHtml
// //       );
// //     } catch (e) {
// //       console.error("Debit email failed:", e.message);
// //     }

// //     // Credit email
// //     if (!receiverFintech) {
// //   console.error("Receiver fintech not found, skipping credit email");
// // } else {
// //   try {
// //     const creditHtml = loadTemplate("creditEmail", {
// //       fintechName: receiverFintech.bankName || "Customer",
// //       amount,
// //       from,
// //       to,
// //       reference,
// //       balance: receiver.balance
// //     });

// //     await sendEmail(
// //       receiverFintech.email,
// //       "Credit Alert - NibssByPhoenix",
// //       creditHtml
// //     );
// //   } catch (e) {
// //     console.error("Credit email failed:", e.message);
// //   }
// // }

//     return res.json(tx);

//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();

//     console.error("TRANSFER ERROR:", error);
//     return res.status(500).json({ message: "Transfer failed" });
//   }
// };


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