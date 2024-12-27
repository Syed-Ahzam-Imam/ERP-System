
const express = require('express');
const router = express.Router();
const RecievablesController = require('../controllers/accountsRecievables');

router.get('/:id', RecievablesController.getRecievableByCustomerId);


router.get('/', RecievablesController.getAllRecievables);


module.exports = router;
