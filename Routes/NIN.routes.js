const express = require('express');
const router = express.Router();

const { createNIN, validateNIN } = require ('../Controllers/NIN.controllers')

router.post('/insertNin', createNIN);
router.post('/validateNin', validateNIN);

module.exports = router;