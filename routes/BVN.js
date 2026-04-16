const express = require('express');
const router = express.Router();
const bvnController = require('../Controllers/BVNController');

router.post('/insertBvn', bvnController.insertBVN);
router.post('/validateBvn', bvnController.validateBVN);
router.get('/getBvn/:bvn', bvnController.getBVNByNumber);

module.exports = router;
