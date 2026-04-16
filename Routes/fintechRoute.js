const express = require("express");
const router = express.Router();

const fintechController = require("../Controllers/fintechController");
const auth = require("../Middleware/auth");


router.post("/auth/token", fintechController.generateToken); //tested

// Onboard a fintech
router.post("/fintech/onboard", fintechController.onboardFintech); //tested

// Create account (requires auth)
router.post("/account/create", auth, fintechController.createAccount); //tested


// Name enquiry
router.get("/account/name-enquiry/:accountNumber", auth, fintechController.nameEnquiry); //tested

// Transfer funds
router.post("/transfer", auth, fintechController.transfer); //tested

router.get("/transaction/:ref", auth, fintechController.getTransaction);

router.get("/accounts", auth, fintechController.getFintechAccounts);

router.get("/account/balance/:accountNumber", auth, fintechController.getAccountBalance);

module.exports = router;