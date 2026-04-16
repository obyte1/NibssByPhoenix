require('dotenv').config();

const express = require('express');
const connectDB = require('./Configs/database');


const app = express();

app.use(express.json());
app.use('/nin', ninRoutes);

// DB
connectDB();

// Routes
const bvnRoutes = require('./routes/BVN');
app.use('/api/bvn', bvnRoutes);

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