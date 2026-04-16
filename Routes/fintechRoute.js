const express = require("express");
const router = express.Router();

const fintechController = require("../Controllers/fintechController");
const auth = require("../Middleware/auth");

/**
 * @swagger
 * tags:
 *   name: Fintech
 *   description: Fintech Operations
 */

/**
 * @swagger
 * /api/auth/token:
 *   post:
 *     summary: Generate JWT token
 *     tags: [Fintech]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               apiKey:
 *                 type: string
 *               apiSecret:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token generated
 */
router.post("/auth/token", fintechController.generateToken); //tested

/**
 * @swagger
 * /api/fintech/onboard:
 *   post:
 *     summary: Onboard a fintech
 *     tags: [Fintech]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Fintech onboarded
 */
// Onboard a fintech
router.post("/fintech/onboard", fintechController.onboardFintech); //tested

/**
 * @swagger
 * /api/account/create:
 *   post:
 *     summary: Create account
 *     tags: [Fintech]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               accountName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Account created
 */
// Create account (requires auth)
router.post("/account/create", auth, fintechController.createAccount); //tested

/**
 * @swagger
 * /api/account/name-enquiry/{accountNumber}:
 *   get:
 *     summary: Get account name
 *     tags: [Fintech]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: accountNumber
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Account details
 */
// Name enquiry
router.get("/account/name-enquiry/:accountNumber", auth, fintechController.nameEnquiry); //tested


/**
 * @swagger
 * /api/transfer:
 *   post:
 *     summary: Transfer funds
 *     tags: [Fintech]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               from:
 *                 type: string
 *               to:
 *                 type: string
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Transfer successful
 */
// Transfer funds
router.post("/transfer", auth, fintechController.transfer); //tested


/**
 * @swagger
 * /api/transaction/{ref}:
 *   get:
 *     summary: Get transaction by reference
 *     tags: [Fintech]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ref
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Transaction found
 */
router.get("/transaction/:ref", auth, fintechController.getTransaction);

/**
 * @swagger
 * /api/accounts:
 *   get:
 *     summary: Get all fintech accounts
 *     tags: [Fintech]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of accounts
 */
router.get("/accounts", auth, fintechController.getFintechAccounts);

/**
 * @swagger
 * /api/account/balance/{accountNumber}:
 *   get:
 *     summary: Get account balance
 *     tags: [Fintech]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: accountNumber
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Account balance
 */
router.get("/account/balance/:accountNumber", auth, fintechController.getAccountBalance);

module.exports = router;