const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, html) => {
  await transporter.sendMail({
    from: `"Nibss By Phoenix" <noreply@nibssbyphoenix.tsacademy.com>`,
    to,
    subject,
    html,
  });
};

module.exports =  { sendEmail };