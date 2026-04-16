const express = require('express');
const router = express.Router();
const bvnController = require('../Controllers/BVNController');

router.post('/insertBvn', bvnController.insertBVN);
router.post('/validateBvn', bvnController.validateBVN);

module.exports = router;
