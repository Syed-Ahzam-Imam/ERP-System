'use-strict'

const express = require('express');
const router = express.Router();
const TransfersController = require('../controllers/transferController');

// Create a new transfer
router.post('/', TransfersController.createTransfer);

// transfer directly
router.put('/', TransfersController.transferToBranch);

// Get all transfers
router.get('/', TransfersController.getAllTransfers);

// Get a specific transfer by ID
router.get('/:productId/:quantity', TransfersController.getBranchesForTransferById);

// Update a transfer by ID
router.put('/:transferId', TransfersController.acceptTransfer);

// Delete a transfer by ID
router.delete('/:id', TransfersController.rejectTransfer);

module.exports = router;
