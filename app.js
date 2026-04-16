require('dotenv').config();

const express = require('express');
const connectDB = require('./Configs/database');
const fintechController = require('./Controller/fintechController');
const authController = require('./Controller/authController');
const accountController = require('./Controller/accountController');
const transferController = require('./Controller/transferController')

const app = express();

app.use(express.json());

// DB
connectDB();


// routes/index.js
router.post("/onboard", fintechController.onboardFintech);
router.post("/auth/token", authController.generateToken);

router.post("/account", auth, accountController.createAccount);
router.get("/name-enquiry/:accountNumber", auth, accountController.nameEnquiry);

router.post("/transfer", auth, transferController.transfer);
router.get("/transaction/:ref", auth, transferController.getTransaction);


app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});