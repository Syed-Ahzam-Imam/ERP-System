const express = require('express');
const router = express.Router();
const SalesReturnController = require('../controllers/salesReturnController');

// Create a new sale
router.post('/', SalesReturnController.createSalesReturn);

// Get all sales
router.get('/', SalesReturnController.getAllSalesReturn);

// Get all sales by branch
router.get('/branch/:id', SalesReturnController.getAllSalesReturnByBranch);

// Get a specific sale by ID
router.get('/:id', SalesReturnController.getSalesReturnById);


// // Update a sale by ID
router.put('/:id', SalesReturnController.updateSalesReturn);

// // Delete a sale by ID
router.delete('/:id', SalesReturnController.deleteSalesReturn);

module.exports = router;
