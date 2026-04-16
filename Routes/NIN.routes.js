const express = require('express');
const router = express.Router();

const { createNIN, validateNIN } = require ('../Controllers/NIN.controllers')

/**
 * @swagger
 * tags:
 *   name: NIN
 *   description: NIN Management
 */

/**
 * @swagger
 * /api/insertNin:
 *   post:
 *     summary: Create a NIN record
 *     tags: [NIN]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nin
 *               - firstName
 *               - lastName
 *               - dob
 *             properties:
 *               nin:
 *                 type: string
 *                 example: "12345678901"
 *               firstName:
 *                 type: string
 *                 example: "Jane"
 *               lastName:
 *                 type: string
 *                 example: "Doe"
 *               dob:
 *                 type: string
 *                 format: date
 *                 example: "1995-05-10"
 *     responses:
 *       200:
 *         description: NIN created successfully
 */
router.post('/insertNin', createNIN);

/**
 * @swagger
 * /api/validateNin:
 *   post:
 *     summary: Validate a NIN
 *     tags: [NIN]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nin
 *             properties:
 *               nin:
 *                 type: string
 *                 example: "12345678901"
 *     responses:
 *       200:
 *         description: NIN verified
 *       400:
 *         description: Invalid NIN
 */
router.post('/validateNin', validateNIN);

module.exports = router;