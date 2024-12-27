const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchaseController');

// Create a new purchase
router.post('/', purchaseController.createPurchase);

// Get all purchases
router.get('/', purchaseController.getAllPurchases);

// Get a specific purchase by ID
router.get('/:id', purchaseController.getPurchaseById);

//add record payment
// router.post('/record/', purchaseController.addRecordPayment);

//get record payment by id
// router.get('/record/:id', purchaseController.getRecordPayment);

// Get a specific purchase by ID
router.get('/details-by-id/:id', purchaseController.getPurchasesWithDetailsById);

// Get an inventory item by branchID
//router.get('/byBranch/:branchId', purchaseController.getPurchasesByBranchId);

// Update a purchase by ID
router.put('/:id', purchaseController.updatePurchase);

// Delete a purchase by ID
router.delete('/:id', purchaseController.deletePurchase);

module.exports = router;
