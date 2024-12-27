const express = require('express');
const router = express.Router();
const SalesController = require('../controllers/salesController');

// Create a new sale
router.post('/', SalesController.createSale);

// Get a specific sale by ID
router.get('/', SalesController.getAllSales);

// Get a specific sale by ID
router.get('/:id', SalesController.getSaleById);

// Get a specific sale by ID
router.get('/branch/:id', SalesController.getAllSalesByBranch);

//add record payment
// router.post('/record/', SalesController.addRecordPayment);

//get record payment by id
// router.get('/record/:id', SalesController.getRecordPayment);


// // Update a sale by ID
router.put('/:id', SalesController.updateSale);

// Delete a sale by ID
router.delete('/:id', SalesController.deletesale);

module.exports = router;
