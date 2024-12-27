'use strict'
const PaymentMethod = require('../models/paymentMethodModel');

class PaymentMethodController {

  // Create a new payment method
  static async createPaymentMethod(req, res) {
    try {
      const { paymentMethodName, description } = req.body;
      const newPaymentMethod = await PaymentMethod.create({ paymentMethodName, description });

      return res.status(201).json({ success: true, message: 'Payment method created successfully', newPaymentMethod });
    } catch (error) {
      console.error('Error creating payment method:', error);
      return res.status(500).json({ success: false, message: 'Failed to create payment method', error: error.message });
    }
  }

  // Get all payment methods
  static async getAllPaymentMethods(req, res) {
    try {
      const paymentMethods = await PaymentMethod.findAll({
        where: {
          isDeleted: false,
        },
      });

      return res.status(200).json({ success: true, paymentMethods });
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch payment methods', error: error.message });
    }
  }

  // Get payment method by ID
  static async getPaymentMethodById(req, res) {
    try {
      const { id } = req.params;
      const paymentMethod = await PaymentMethod.findByPk(id);

      if (!paymentMethod) {
        return res.status(404).json({ success: false, message: 'Payment method not found' });
      }

      return res.status(200).json({ success: true, paymentMethod });
    } catch (error) {
      console.error('Error fetching payment method:', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch payment method', error: error.message });
    }
  }

  // Update a payment method
  static async updatePaymentMethod(req, res) {
    try {
      const { id } = req.params;
      const { paymentMethodName, description } = req.body;

      const paymentMethod = await PaymentMethod.findByPk(id);

      if (!paymentMethod) {
        return res.status(404).json({ success: false, message: 'Payment method not found' });
      }

      if (paymentMethodName === 'cash') {
        return res.status(404).json({ success: false, message: 'This payment method cannot be updated' });
      }

      const updatedPaymentMethod = await PaymentMethod.update({ paymentMethodName, description }, { where: { paymentMethodId: id } });

      return res.status(200).json({ success: true, message: 'Payment method updated successfully', updatedPaymentMethod });
    } catch (error) {
      console.error('Error updating payment method:', error);
      return res.status(500).json({ success: false, message: 'Failed to update payment method', error: error.message });
    }
  }

  // Soft delete a payment method
  static async softDeletePaymentMethod(req, res) {
    try {
      const { id } = req.params;
      const paymentMethod = await PaymentMethod.findByPk(id);

      if (!paymentMethod) {
        return res.status(404).json({ success: false, message: 'Payment method not found' });
      }

      if (paymentMethod.paymentMethodName === 'cash') {
        return res.status(404).json({ success: false, message: 'This payment method cannot be deleted' });
      }

      // Update the isDeleted flag for the found PaymentMethod
      await paymentMethod.update({ isDeleted: true });

      return res.status(200).json({ success: true, message: 'Payment method soft deleted successfully' });
    } catch (error) {
      console.error('Error soft deleting payment method:', error);
      return res.status(500).json({ success: false, message: 'Failed to soft delete payment method', error: error.message });
    }
  }

}

module.exports = PaymentMethodController;
