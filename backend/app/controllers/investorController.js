'use strict';

const Investor = require('../models/investorModel');

class InvestorController {
  static async createInvestor(req, res) {
    try {
      const { firstName, lastName, email, phoneNumber, shares } = req.body;
      const investor = await Investor.create({ firstName, lastName, email, phoneNumber, shares });

      return res.status(201).json({ success: true, message: 'Investor created successfully', investor });
    } catch (error) {
      console.error('Error creating investor:', error);
      return res.status(500).json({ success: false, message: 'Failed to create investor', error: error.message });
    }
  }

  static async getAllInvestors(req, res) {
    try {
      const investors = await Investor.findAll({
        where: {
          isDeleted: false,
        },
      });

      return res.status(200).json({ success: true, investors });
    } catch (error) {
      console.error('Error retrieving investors:', error);
      return res.status(500).json({ success: false, message: 'Failed to retrieve investors', error: error.message });
    }
  }

  static async getInvestorById(req, res) {
    try {
      const investor = await Investor.findByPk(req.params.id);

      if (!investor) {
        return res.status(404).json({ success: false, message: 'Investor not found' });
      }

      return res.status(200).json({ success: true, investor });
    } catch (error) {
      console.error('Error retrieving investor:', error);
      return res.status(500).json({ success: false, message: 'Failed to retrieve investor', error: error.message });
    }
  }

  static async updateInvestor(req, res) {
    try {
      const { firstName, lastName, email, phoneNumber, shares } = req.body;
      const investor = await Investor.findByPk(req.params.id);

      if (!investor) {
        return res.status(404).json({ success: false, message: 'Investor not found' });
      }

      await investor.update({ firstName, lastName, email, phoneNumber, shares });

      return res.status(200).json({ success: true, message: 'Investor updated successfully', investor });
    } catch (error) {
      console.error('Error updating investor:', error);
      return res.status(500).json({ success: false, message: 'Failed to update investor', error: error.message });
    }
  }

  static async deleteInvestor(req, res) {
    try {
      const investor = await Investor.findByPk(req.params.id);

      if (!investor) {
        return res.status(404).json({ success: false, message: 'Investor not found' });
      }

      await investor.update({ isDeleted: true });

      return res.status(200).json({ success: true, message: 'Investor deleted successfully' });
    } catch (error) {
      console.error('Error deleting investor:', error);
      return res.status(500).json({ success: false, message: 'Failed to delete investor', error: error.message });
    }
  }
}

module.exports = InvestorController;
