// Cashbook Routes
const express = require('express');
const router = express.Router();
const CashbookController = require('../controllers/cashbookController');

// Create a new cashbook entry
router.post('/', CashbookController.createCashbookEntry);

// Create a new cashbook entry
router.post('/transfer/', CashbookController.directTransfer);

// Transfer to Noorani
router.post('/transferToNoorani/', CashbookController.transferToNoorani);

// Get all cashbook entries
router.get('/', CashbookController.getCashbookEntries);

// Get all cashbook entries
router.get('/branch/:id', CashbookController.getCashbookEntriesByBranch);

// Get all account entries
router.get('/accounts/:id', CashbookController.getAccounts);

// Get a cashbook entry by ID
router.get('/:id', CashbookController.getCashbookEntryById);

// Update a cashbook entry
router.put('/:id', CashbookController.updateCashbookEntry);

// Delete a cashbook entry
router.delete('/:id', CashbookController.deleteCashbookEntry);

module.exports = router;
