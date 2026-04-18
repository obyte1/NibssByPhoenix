const express = require('express');
const router = express.Router();
const bvnController = require('../Controllers/BVNController');

/**
 * @swagger
 * tags:
 *   name: BVN
 *   description: BVN Management
 */

/**
 * @swagger
 * /api/insertBvn:
 *   post:
 *     summary: Insert a new BVN
 *     tags: [BVN]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bvn
 *               - firstName
 *               - lastName
 *               - dob
 *               - phone
 *             properties:
 *               bvn:
 *                 type: string
 *                 example: "12345678901"
 *               firstName:
 *                 type: string
 *                 example: "John"
 *               lastName:
 *                 type: string
 *                 example: "Doe"
 *               dob:
 *                 type: string
 *                 format: date
 *                 example: "1990-01-01"
 *               phone:
 *                 type: string
 *                 example: "08012345678"
 *     responses:
 *       201:
 *         description: BVN created successfully
 *       400:
 *         description: Invalid input
 */
router.post('/insertBvn', bvnController.insertBVN);

/**
 * @swagger
 * /api/validateBvn:
 *   post:
 *     summary: Validate a BVN
 *     tags: [BVN]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bvn
 *             properties:
 *               bvn:
 *                 type: string
 *                 example: "12345678901"
 *     responses:
 *       200:
 *         description: BVN is valid
 *       404:
 *         description: BVN not found
 */
router.post('/validateBvn', bvnController.validateBVN);

module.exports = router;
