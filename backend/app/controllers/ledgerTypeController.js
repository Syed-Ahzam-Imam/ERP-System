const LedgerType = require('../models/ledgerTypeModel');

class LedgerTypeController {

  // Create a new ledger type
  static async createLedgerType(req, res) {
    try {
      const { ledgerTypeName } = req.body;
      const newLedgerType = await LedgerType.create({ ledgerTypeName });

      return res.status(201).json({ success: true, message: 'Ledger type created successfully', newLedgerType });
    } catch (error) {
      console.error('Error creating ledger type:', error);
      return res.status(500).json({ success: false, message: 'Failed to create ledger type', error: error.message });
    }
  }

  // Get all ledger types
  static async getAllLedgerTypes(req, res) {
    try {
      const ledgerTypes = await LedgerType.findAll({
        where: {
          isDeleted: false,
        },
      });

      return res.status(200).json({ success: true, ledgerTypes });
    } catch (error) {
      console.error('Error fetching ledger types:', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch ledger types', error: error.message });
    }
  }

  // Get ledger type by ID
  static async getLedgerTypeById(req, res) {
    try {
      const { id } = req.params;
      const ledgerType = await LedgerType.findByPk(id);

      if (!ledgerType) {
        return res.status(404).json({ success: false, message: 'Ledger type not found' });
      }

      return res.status(200).json({ success: true, ledgerType });
    } catch (error) {
      console.error('Error fetching ledger type:', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch ledger type', error: error.message });
    }
  }

  // Update a ledger type
  static async updateLedgerType(req, res) {
    try {
      const { id } = req.params;
      const { ledgerTypeName } = req.body;

      const ledgerType = await LedgerType.findByPk(id);

      if (!ledgerType) {
        return res.status(404).json({ success: false, message: 'Ledger type not found' });
      }

      if (ledgerTypeName === 'customer' ||
        ledgerTypeName === 'advance' ||
        ledgerTypeName === 'transfer' ||
        ledgerTypeName === 'supplier' ||
        ledgerTypeName === 'product' ||
        ledgerTypeName === 'purchase' ||
        ledgerTypeName === 'purchaseReturn' ||
        ledgerTypeName === 'sales' ||
        ledgerTypeName === 'salesReturn'
      ) {
        return res.status(404).json({ success: false, message: 'This ledger type cannot be updated' });
      }

      await LedgerType.update({ ledgerTypeName }, { where: { ledgerTypeId: id } });
      const updatedLedgerType = await LedgerType.findByPk(id);

      return res.status(200).json({ success: true, message: 'Ledger type updated successfully', updatedLedgerType });
    } catch (error) {
      console.error('Error updating ledger type:', error);
      return res.status(500).json({ success: false, message: 'Failed to update ledger type', error: error.message });
    }
  }

  // Delete a ledger type
  static async deleteLedgerType(req, res) {
    try {
      const { id } = req.params;
      const ledgerType = await LedgerType.findByPk(id);

      if (!ledgerType) {
        return res.status(404).json({ success: false, message: 'Ledger type not found' });
      }

      if (ledgerType.ledgerTypeName === 'customer' ||
        ledgerType.ledgerTypeName === 'advance' ||
        ledgerType.ledgerTypeName === 'transfer' ||
        ledgerType.ledgerTypeName === 'supplier' ||
        ledgerType.ledgerTypeName === 'product' ||
        ledgerType.ledgerTypeName === 'purchase' ||
        ledgerType.ledgerTypeName === 'purchaseReturn' ||
        ledgerType.ledgerTypeName === 'sales' ||
        ledgerType.ledgerTypeName === 'salesReturn'
      ) {
        return res.status(404).json({ success: false, message: 'This ledger type cannot be deleted' });
      }

      // Update the isDeleted flag for the found LedgerType
      await ledgerType.update({ isDeleted: true });

      return res.status(200).json({ success: true, message: 'Ledger type deleted successfully' });
    } catch (error) {
      console.error('Error deleting ledger type:', error);
      return res.status(500).json({ success: false, message: 'Failed to delete ledger type', error: error.message });
    }
  }

}

module.exports = LedgerTypeController;
