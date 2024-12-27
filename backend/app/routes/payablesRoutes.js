
const express = require('express');
const router = express.Router();
const PayablesController = require('../controllers/accountsPayables');


router.get('/:id', PayablesController.getPayableBySupplierId);


router.get('/', PayablesController.getAllPayables);


module.exports = router;
