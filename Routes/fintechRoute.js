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
 * /api/fintech/webhook:
 *   post:
 *     summary: Register a webhook URL for inward transaction notifications
 *     description: |
 *       Registers the authenticated fintech's HTTPS or HTTP endpoint for inward transaction notifications.
 *       When another fintech sends money to one of this fintech's accounts, NibssByPhoenix sends a POST request
 *       to the registered URL after the transfer is committed successfully. Only one webhook URL is stored per
 *       fintech; submitting this endpoint again replaces the previously registered URL.
 *
 *       The notification request includes the `X-Webhook-Event: INWARD_TRANSACTION` header and this JSON body:
 *       `{ "event": "INWARD_TRANSACTION", "data": { "reference": "TX...", "senderAccount": "...", "receiverAccount": "...", "amount": 1000, "status": "SUCCESS", "receivedAt": "2026-09-22T12:00:00.000Z" } }`.
 *       The receiving fintech should respond with a 2xx status code. Webhook delivery failures are logged and do
 *       not reverse or fail the completed transfer.
 *     tags: [Fintech]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - url
 *             properties:
 *               url:
 *                 type: string
 *                 format: uri
 *                 description: HTTP or HTTPS URL that will receive inward transaction notifications.
 *                 example: https://partner.example.com/webhooks/transactions
 *     responses:
 *       200:
 *         description: Webhook URL registered successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Webhook registered successfully
 *                 url:
 *                   type: string
 *                   format: uri
 *                 active:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Missing, invalid, or unsupported webhook URL.
 *       401:
 *         description: Missing, invalid, or expired bearer token.
 *       500:
 *         description: Webhook registration could not be completed.
 */
router.post("/fintech/webhook", auth, fintechController.registerWebhook);

/**
 * @swagger
 * /api/account/create:
 *   post:
 *     summary: Create account using KYC
 *     tags: [Account]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - kycType
 *               - kycID
 *               - dob
 *             properties:
 *               kycType:
 *                 type: string
 *                 example: BVN
 *               kycID:
 *                 type: string
 *                 example: "12345678901"
 *               dob:
 *                 type: string
 *                 format: date
 *                 example: "1995-06-15"
 *     responses:
 *       200:
 *         description: Account created successfully
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