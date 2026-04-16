// controllers/accountController.js
const Account = require("../Models/Account");
const Fintech = require("../Models/Fintech");
const { generateAccountNumber } = require("../Utils/accountGenerator");

exports.createAccount = async (req, res) => {
  const { accountName } = req.body;

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
    accountNumber: account.accountNumber
  });
};