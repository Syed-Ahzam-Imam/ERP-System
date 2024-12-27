'use strict';

const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

// Create a new customer
router.post('/', customerController.createCustomer);

// Get all customers
router.get('/', customerController.getAllCustomers);

// Get a specific customer by ID
router.get('/:id', customerController.getCustomerById);

// Get a specific customer ledger by ID
router.get('/ledger/:id', customerController.getCustomerLedgerById);

// Get a specific customer by branch ID
router.get('/branch/:id', customerController.getAllCustomersByBranch);

// Update a customer by ID
router.put('/:id', customerController.updateCustomer);

// Delete a customer by ID
router.delete('/:id', customerController.deleteCustomer);

module.exports = router;
