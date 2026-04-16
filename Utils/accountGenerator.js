// utils/accountGenerator.js
exports.generateAccountNumber = (bankCode) => {
  const random = Math.floor(1000000 + Math.random() * 9000000);
  return bankCode + random; // 10 digits
};