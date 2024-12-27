'use strict';

const Ledger = require('../models/ledgerModel');
const LedgerType = require('../models/ledgerTypeModel');
const Supplier = require('../models/supplierModel');
const moment = require('moment');
const db = require('../../config/dbConfig');
const EntryType = require('../models/entryTypeModel');
class SupplierController {
  static async createSupplier(req, res) {
    const t = await db.transaction();
    try {
      const { firstName, lastName, email, phoneNumber, shopLocation, shopName, city, amountDue, branchId } = req.body;
      const supplier = await Supplier.create({ firstName, lastName, email, phoneNumber, shopLocation, shopName, city, amountDue }, { transaction: t });

      if (amountDue && amountDue != 0) {
        const ledgerType = await LedgerType.findOne({ where: { ledgerTypeName: 'supplier' } });
        const entryType = await EntryType.findOne({ where: { typeName: 'OB' } });

        await Ledger.create({
          accountId: supplier.supplierId,
          date: moment().toDate(),
          description: 'opening balance',
          debit: amountDue > 0 ? amountDue : 0,
          credit: amountDue < 0 ? Math.abs(amountDue) : 0,
          branchId: branchId,
          ledgerTypeId: ledgerType.ledgerTypeId,
          entryTypeId: entryType.entryTypeId,
        }, { transaction: t });
      }

      await t.commit();
      return res.status(201).json({ success: true, message: 'Supplier created successfully', supplier });
    } catch (error) {
      await t.rollback();
      console.error('Error creating supplier:', error);
      return res.status(500).json({ success: false, message: 'Failed to create supplier', error: error.message });
    }
  }

  static async getAllSuppliers(req, res) {
    try {
      const suppliers = await Supplier.findAll({
        order: [
          ['firstName', 'ASC']
        ],
        where: {
          isDeleted: false,
        },
      });

      return res.status(200).json({ success: true, suppliers });
    } catch (error) {
      console.error('Error retrieving suppliers:', error);
      return res.status(500).json({ success: false, message: 'Failed to retrieve suppliers', error: error.message });
    }
  }

  static async getSupplierById(req, res) {
    try {
      const supplier = await Supplier.findByPk(req.params.id);

      if (!supplier) {
        return res.status(404).json({ success: false, message: 'Supplier not found' });
      }

      return res.status(200).json({ success: true, supplier });
    } catch (error) {
      console.error('Error retrieving supplier:', error);
      return res.status(500).json({ success: false, message: 'Failed to retrieve supplier', error: error.message });
    }
  }

  static async getSupplierLedgerById(req, res) {
    try {
      const supplierId = req.params.id;
      const ledgerType = await LedgerType.findOne({ where: { ledgerTypeName: 'supplier' } });
      const supplierLedger = await Ledger.findAll({
        where: {
          ledgerTypeId: ledgerType.ledgerTypeId,
          accountId: supplierId
        }
      });

      if (!supplierLedger) {
        return res.status(404).json({ success: false, message: 'supplier Ledger not found' });
      }

      return res.status(200).json({ success: true, supplierLedger });
    } catch (error) {
      console.error('Error retrieving supplier Ledger:', error);
      return res.status(500).json({ success: false, message: 'Failed to retrieve supplier ledger', error: error.message });
    }
  }

  static async updateSupplier(req, res) {
    const t = await db.transaction();
    try {
      const { firstName, lastName, email, phoneNumber, shopLocation, shopName, city, amountDue } = req.body;
      const supplier = await Supplier.findByPk(req.params.id);

      if (!supplier) {
        await t.rollback();
        return res.status(404).json({ success: false, message: 'Supplier not found' });
      }

      if (supplier.amountDue != amountDue) {

        if (supplier.isLocked) {
          await t.rollback();
          return res.status(404).json({ success: false, message: 'Opening balance is locked and cannot be edited' });
        }

        const ledgerType = await LedgerType.findOne({ where: { ledgerTypeName: 'supplier' } });

        const entryType = await EntryType.findOne({ where: { typeName: 'OB' } });

        const openingLedger = await Ledger.findOne({
          where: {
            accountId: supplier.supplierId,
            description: 'opening balance',
            entryTypeId: entryType.entryTypeId,
            ledgerTypeId: ledgerType.ledgerTypeId,
          }
        }, { transaction: t });

        await openingLedger.update({
          date: moment().toDate(),
          debit: amountDue > 0 ? amountDue : 0,
          credit: amountDue < 0 ? Math.abs(amountDue) : 0,
        }, { transaction: t });

        // await Ledger.create({
        //   accountId: supplier.supplierId,
        //   date: moment().toDate(),
        //   description: 'opening balance edited',
        //   debit: amountDue - supplier.amountDue > 0 ? amountDue - supplier.amountDue : 0,
        //   credit: amountDue - supplier.amountDue < 0 ? Math.abs(amountDue - supplier.amountDue) : 0,
        //   ledgerTypeId: ledgerType.ledgerTypeId
        // }, { transaction: t });
      }

      await supplier.update({ firstName, lastName, email, phoneNumber, shopLocation, shopName, city, amountDue }, { transaction: t });
      await t.commit();

      return res.status(200).json({ success: true, message: 'Supplier updated successfully', supplier });
    } catch (error) {
      await t.rollback();
      console.error('Error updating supplier:', error);
      return res.status(500).json({ success: false, message: 'Failed to update supplier', error: error.message });
    }
  }

  static async deleteSupplier(req, res) {
    try {
      const supplier = await Supplier.findByPk(req.params.id);

      if (!supplier) {
        return res.status(404).json({ success: false, message: 'Supplier not found' });
      }

      await supplier.update({ isDeleted: true });

      return res.status(200).json({ success: true, message: 'Supplier deleted successfully' });
    } catch (error) {
      console.error('Error deleting supplier:', error);
      return res.status(500).json({ success: false, message: 'Failed to delete supplier', error: error.message });
    }
  }
}

module.exports = SupplierController;
