'use strict';

const express = require('express');
const router = express.Router();
const LedgerTypeController = require('../controllers/ledgerTypeController');

// Create a new ledger type
router.post('/', LedgerTypeController.createLedgerType);

// Get all ledger types
router.get('/', LedgerTypeController.getAllLedgerTypes);

// Get a specific LedgerType by ID
router.get('/:id', LedgerTypeController.getLedgerTypeById);

// Update a LedgerType by ID
router.put('/:id', LedgerTypeController.updateLedgerType);

// Delete a LedgerType by ID
router.delete('/:id', LedgerTypeController.deleteLedgerType);

module.exports = router;
