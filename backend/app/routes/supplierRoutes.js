'use strict';

const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');

// Create a new supplier
router.post('/', supplierController.createSupplier);

// Get all suppliers
router.get('/', supplierController.getAllSuppliers);

// Get a specific supplier by ID
router.get('/:id', supplierController.getSupplierById);

// Get a specific supplier ledger by ID
router.get('/ledger/:id', supplierController.getSupplierLedgerById);

// Update a supplier by ID
router.put('/:id', supplierController.updateSupplier);

// Delete a supplier by ID
router.delete('/:id', supplierController.deleteSupplier);

module.exports = router;
