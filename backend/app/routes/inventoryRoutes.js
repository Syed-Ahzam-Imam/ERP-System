'use strict';

const express = require('express');
const router = express.Router();
const InventoryController = require('../controllers/inventoryController');
const AuthMiddleware = require('../middleware/authMiddleware');


// add a new inventory item
router.post('/', InventoryController.addInventoryItem);

// Get all inventory items
router.get('/', InventoryController.getAllInventoryItems);

// Get combined inventory items by branch
router.get('/combined/', InventoryController.getCombinedInventoryByBranch);

// Get combined inventory items by branch
router.get('/newCombined/', InventoryController.getCombinedWithDistribution);

// Get inventory by product Id
router.get('/byProduct/:productId', InventoryController.getInventoryByProductId);

// Get an inventory item by ID
router.get('/:id', InventoryController.getInventoryItemById);

// Get an inventory item by branchID
router.get('/byBranch/:branchId', InventoryController.getInventoryItemByBranchId);

// Update an inventory item by ID
// router.put('/:id', InventoryController.updateInventoryItem);

// Delete an inventory item by ID
// router.delete('/:id', InventoryController.deleteInventoryItem);

module.exports = router;
