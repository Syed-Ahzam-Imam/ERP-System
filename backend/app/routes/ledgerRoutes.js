'use strict';

const express = require('express');
const router = express.Router();
const Ledger = require('../controllers/ledgerController');


// Get customer ledger by id
router.get('/customer/:id', Ledger.getCustomerLedgerById);

// Get customer trial balance
router.get('/customer', Ledger.getCustomerTrialBalance);

// Get supplier trial balance
router.get('/supplier', Ledger.getSupplierTrialBalance);

// Get customer trial balance by branch
router.get('/customer/trialBalance/:id', Ledger.getCustomerTrialBalanceByBranch);

// Get supplier trial balance by branch
router.get('/supplier/trialBalance/:id', Ledger.getSupplierTrialBalanceByBranch);

// Get supplier ledger by id
router.get('/supplier/:id', Ledger.getSupplierLedgerById);

// Get product ledger by id
router.get('/product/:id', Ledger.getProductLedgerById);

// Get product ledger by branch id
router.get('/product/:productId/:branchId', Ledger.getProductLedgerByBranchId);


module.exports = router;
