'use strict';

const Branch = require('../models/branchModel');
const Transfers = require('../models/transfersModel');
const Inventory = require('../models/inventoryModel');
const Product = require('../models/productModel');
const LedgerType = require('../models/ledgerTypeModel');
const Ledger = require('../models/ledgerModel');
const db = require('../../config/dbConfig');
const { Op } = require('sequelize');
const moment = require('moment');

class TransfersController {
  // Create a new transfer
  static async createTransfer(req, res) {
    try {
      const { quantity, date, branchId, productId } = req.body;

      // Create the transfer
      const transfer = await Transfers.create({
        quantity,
        date,
        branchId,
        productId
      });

      return res.status(201).json({ success: true, message: 'Transfer created successfully', transfer });
    } catch (error) {
      console.error('Error creating transfer:', error);
      return res.status(500).json({ success: false, message: 'Failed to create transfer', error: error.message });
    }
  }

  // Get all transfers
  static async getAllTransfers(req, res) {
    try {
      const rawTransfers = await Transfers.findAll({
        include: [
          {
            model: Branch,
            attributes: ['branchName']
          },
          {
            model: Product,
            attributes: ['productName']
          }
        ]
      });

      const transfers = rawTransfers.map(item => {

        const branch = item.Branch;
        const product = item.Product;

        return {
          transferId: item.transferId,
          quantity: item.quantity,
          date: item.date,
          branchId: item.branchId,
          branchName: branch ? branch.branchName : null,
          productId: item.productId,
          productName: product ? product.productName : null,
        };
      });

      return res.status(200).json({ success: true, transfers });
    } catch (error) {
      console.error('Error retrieving transfers:', error);
      return res.status(500).json({ success: false, message: 'Failed to retrieve transfers', error: error.message });
    }
  }

  // reject a transfer
  static async rejectTransfer(req, res) {
    try {
      const { id } = req.params;
      const transfer = await Transfers.findByPk(id);

      if (!transfer) {
        return res.status(404).json({ success: false, message: 'Transfer not found' });
      }

      await transfer.destroy();

      return res.status(200).json({ success: true, message: 'Transfer deleted successfully' });
    } catch (error) {
      console.error('Error deleting transfer:', error);
      return res.status(500).json({ success: false, message: 'Failed to delete transfer', error: error.message });
    }
  }

  // accept a transfer 
  static async acceptTransfer(req, res) {
    const t = await db.transaction();
    try {

      const { requestedBranchId } = req.body;
      const { transferId } = req.params;

      const transfer = await Transfers.findByPk(transferId);
      if (!transfer) {
        await t.rollback();
        return res.status(404).json({ success: false, message: 'Transfer not found' });
      }

      let currentInventory = await Inventory.findOne({
        where: {
          branchId: transfer.branchId,
          productId: transfer.productId
        },
      });

      if (!currentInventory) {
        currentInventory = await Inventory.create({
          branchId: transfer.branchId,
          productId: transfer.productId
        }, { transaction: t });
      }

      const requestedInventory = await Inventory.findOne({
        where: {
          branchId: requestedBranchId,
          productId: transfer.productId
        },
      });

      if (requestedInventory.itemQuantity < transfer.quantity) {
        await t.rollback();
        return res.status(404).json({ success: false, message: 'Not enough inventory items present in this branch' });
      }

      await currentInventory.increment('itemQuantity', { by: transfer.quantity, transaction: t });
      await requestedInventory.decrement('itemQuantity', { by: transfer.quantity, transaction: t });

      const ledgerType = await LedgerType.findOne({ where: { ledgerTypeName: 'product' } });

      await Ledger.create({
        accountId: transfer.productId,
        date: moment().toDate(),
        description: 'stock transfer',
        debit: transfer.quantity,
        branchId: transfer.branchId,
        ledgerTypeId: ledgerType.ledgerTypeId
      }, {transaction: t});

      await Ledger.create({
        accountId: transfer.productId,
        date: moment().toDate(),
        description: 'stock transfer',
        credit: transfer.quantity,
        branchId: requestedBranchId,
        ledgerTypeId: ledgerType.ledgerTypeId
      }, {transaction: t});

      await transfer.destroy();
      await t.commit();

      return res.status(200).json({ success: true, message: 'Transfer accepted successfully' });
    } catch (error) {
      await t.rollback();
      console.error('Error deleting transfer:', error);
      return res.status(500).json({ success: false, message: 'Failed to accept transfer', error: error.message });
    }
  }

  // accept a transfer 
  static async transferToBranch(req, res) {
    const t = await db.transaction();
    try {

      const { requestFromBranchId, addToBranchId, quantity, productId } = req.body;

      let currentInventory = await Inventory.findOne({
        where: {
          branchId: addToBranchId,
          productId: productId
        },
      });

      if (!currentInventory) {
        currentInventory = await Inventory.create({
          branchId: addToBranchId,
          productId: productId
        }, { transaction: t });
      }

      const requestedInventory = await Inventory.findOne({
        where: {
          branchId: requestFromBranchId,
          productId: productId
        },
      });

      if (requestedInventory.itemQuantity < quantity) {
        await t.rollback();
        return res.status(404).json({ success: false, message: 'Not enough inventory items present in this branch' });
      }

      await currentInventory.increment('itemQuantity', { by: quantity, transaction: t });
      await requestedInventory.decrement('itemQuantity', { by: quantity, transaction: t });

      const ledgerType = await LedgerType.findOne({ where: { ledgerTypeName: 'product' } });

      await Ledger.create({
        accountId: productId,
        date: moment().toDate(),
        description: 'stock transfer',
        debit: quantity,
        branchId: addToBranchId,
        ledgerTypeId: ledgerType.ledgerTypeId
      }, {transaction: t});

      await Ledger.create({
        accountId: productId,
        date: moment().toDate(),
        description: 'stock transfer',
        credit: quantity,
        branchId: requestFromBranchId,
        ledgerTypeId: ledgerType.ledgerTypeId
      }, {transaction: t});

      await t.commit();

      return res.status(200).json({ success: true, message: 'Transfer successful' });
    } catch (error) {
      await t.rollback();
      console.error('Error deleting transfer:', error);
      return res.status(500).json({ success: false, message: 'Failed to transfer', error: error.message });
    }
  }

  // Get Branches that have requested items available
  static async getBranchesForTransferById(req, res) {
    try {

      const { productId, quantity } = req.params;
      const inventory = await Inventory.findAll({
        where: {
          itemQuantity: {
            [Op.gte]: quantity,
          },
          productId
        },
        include: [
          {
            model: Branch,
            attributes: ['branchName']
          },
          {
            model: Product,
            attributes: ['productName']
          }
        ]
      });

      const branches = inventory.map(item => {
        const branch = item.Branch;
        const product = item.Product;

        return {
          productId,
          productName: product ? product.productName : null,
          requestedQuantity: quantity,
          availableQuantity: item.itemQuantity,
          branchId: item.branchId,
          branchName: branch ? branch.branchName : null
        }
      })

      return res.status(200).json({ success: true, branches });
    } catch (error) {
      console.error('Error retrieving data:', error);
      return res.status(500).json({ success: false, message: 'Failed to retrieve data', error: error.message });
    }
  }
}

module.exports = TransfersController;
