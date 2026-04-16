// controllers/transferController.js
const Account = require("../Models/Account");
const Transaction = require("../Models/Transaction");

exports.transfer = async (req, res) => {
  const { from, to, amount } = req.body;

  const sender = await Account.findOne({ accountNumber: from });
  const receiver = await Account.findOne({ accountNumber: to });

  if (!sender || !receiver)
    return res.status(404).json({ message: "Invalid account" });

  if (sender.balance < amount)
    return res.status(400).json({ message: "Insufficient funds" });

  sender.balance -= amount;
  receiver.balance += amount;

  await sender.save();
  await receiver.save();

  const tx = await Transaction.create({
    reference: "TX" + Date.now(),
    senderAccount: from,
    receiverAccount: to,
    amount,
    status: "SUCCESS"
  });

  res.json(tx);
};

exports.getTransaction = async (req, res) => {
  const tx = await Transaction.findOne({ reference: req.params.ref });

  if (!tx) return res.status(404).json({ message: "Not found" });

  res.json(tx);
};