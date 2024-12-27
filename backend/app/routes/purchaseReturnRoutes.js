const express = require('express');
const router = express.Router();
const purchaseReturnController = require('../controllers/purchaseReturnController');

// Create a new purchase
router.post('/', purchaseReturnController.createPurchaseReturn);

// Get all purchases
router.get('/', purchaseReturnController.getAllPurchasesReturn);

// Get a specific purchase by ID
router.get('/:id', purchaseReturnController.getPurchaseReturnById);

// Get a specific purchase by ID
router.get('/details-by-id/:id', purchaseReturnController.getPurchaseReturnsWithDetailsById);

// Get an inventory item by branchID
//router.get('/byBranch/:branchId', purchaseController.getPurchasesByBranchId);

// Update a purchase by ID
router.put('/:id', purchaseReturnController.updatePurchaseReturn);

// Delete a purchase by ID
router.delete('/:id', purchaseReturnController.deletePurchaseReturn);

module.exports = router;
