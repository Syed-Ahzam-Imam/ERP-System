const express = require('express');
const router = express.Router();
const InvestorController = require('../controllers/investorController');

// Create a new investor
router.post('/', InvestorController.createInvestor);

// Get all investors
router.get('/', InvestorController.getAllInvestors);

// Get a specific investor by ID
router.get('/:id', InvestorController.getInvestorById);

// Update an investor by ID
router.put('/:id', InvestorController.updateInvestor);

// Delete an investor by ID
router.delete('/:id', InvestorController.deleteInvestor);

module.exports = router;
