const express = require('express');
const router = express.Router();

const { createNIN, validateNIN } = require ('../Controllers/NIN.controllers')

router.post('/create', createNIN);
router.post('/validate', validateNIN);

module.exports = router;