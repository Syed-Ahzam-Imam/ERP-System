'use strict';

const express = require('express');
const router = express.Router();
const PaymentMethodController = require('../controllers/paymentMethodController');

// Create a new payment method
router.post('/', PaymentMethodController.createPaymentMethod);

// Get all payment methods
router.get('/', PaymentMethodController.getAllPaymentMethods);

// Get a specific payment method by ID
router.get('/:id', PaymentMethodController.getPaymentMethodById);

// Update a payment method by ID
router.put('/:id', PaymentMethodController.updatePaymentMethod);

// Soft delete a payment method by ID
router.delete('/:id', PaymentMethodController.softDeletePaymentMethod);

module.exports = router;
