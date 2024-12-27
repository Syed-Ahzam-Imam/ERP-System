'use strict';

const db = require('../../config/dbConfig');
const SalesReturn = require('../models/salesReturnModel');
const Inventory = require('../models/inventoryModel');
const SalesReturnItem = require('../models/salesReturnItemModel');
const Product = require('../models/productModel');
const Customer = require('../models/customerModel');
const Category = require('../models/categoryModel');
const LedgerType = require('../models/ledgerTypeModel');
const Branch = require('../models/branchModel');
const Ledger = require('../models/ledgerModel');
const EntryType = require('../models/entryTypeModel');
const AccountType = require('../models/accountTypeModel');

class SalesReturnController {
  static async createSalesReturn(req, res) {

    const t = await db.transaction();
    try {
      const { salesReturnDate, salesReturnDescription, salesReturnLocation, totalAmount, customerId, branchId, items } = req.body;
      let description = `${salesReturnDescription} \n`;

      const customer = await Customer.findByPk(customerId, { transaction: t });

      if (!customer) {
        await t.rollback();
        return res.status(400).json({ success: false, message: `customer with ID ${customerId} not found` });
      }

      // Create the sales
      const salesReturn = await SalesReturn.create({
        salesReturnDate,
        salesReturnDescription,
        salesReturnLocation,
        totalAmount,
        customerId,
        branchId
      }, { transaction: t });

      const salesreturnLedgerType = await LedgerType.findOne({ where: { ledgerTypeName: 'salesReturn' } });
      const entryType = await EntryType.findOne({ where: { typeName: 'SR' } });
      const accountType = await AccountType.findOne({ where: { typeName: 'customer' } });

      const productAccountType = await AccountType.findOne({ where: { typeName: 'product' } });
      if (!productAccountType || !accountType || !entryType) {
        await t.rollback();
        return res.status(400).json({ success: false, message: `Account type not found` });
      }

      const salesReturnLedger = await Ledger.create({
        accountId: customerId,
        date: salesReturnDate,
        vNo: salesReturn.invoiceId,
        description: salesReturnDescription,
        debit: totalAmount,
        branchId: branchId,
        ledgerTypeId: salesreturnLedgerType.ledgerTypeId,
        entryTypeId: entryType.entryTypeId,
        accountTypeId: accountType.accountTypeId
      }, { transaction: t });

      const customerLedgerType = await LedgerType.findOne({ where: { ledgerTypeName: 'customer' } });
      const customerLedger = await Ledger.create({
        accountId: customerId,
        date: salesReturnDate,
        vNo: salesReturn.invoiceId,
        description: salesReturnDescription,
        credit: totalAmount,
        branchId: branchId,
        ledgerTypeId: customerLedgerType.ledgerTypeId,
        entryTypeId: entryType.entryTypeId,
        accountTypeId: accountType.accountTypeId
      }, { transaction: t });

      const productLedgerType = await LedgerType.findOne({ where: { ledgerTypeName: 'product' } });

      let salesReturnItems = [];

      // Create the sales items
      for (const item of items) {

        const salesReturnItem = await SalesReturnItem.create({
          quantity: item.quantity,
          totalAmount: item.totalAmount,
          productId: item.productId,
          invoiceId: salesReturn.invoiceId,
        }, { transaction: t });

        const product = await Product.findByPk(item.productId)
        description += `${product.productName} x ${item.quantity} = ${item.totalAmount} \n`;


        let inventoryItem = await Inventory.findOne({
          where: {
            productId: item.productId,
            branchId: salesReturn.branchId
          }
        });

        await inventoryItem.increment('itemQuantity', { by: item.quantity, transaction: t });

        const productLedger = await Ledger.create({
          accountId: salesReturnItem.productId,
          date: salesReturnDate,
          vNo: salesReturn.invoiceId,
          description: salesReturnDescription + ' @' + item.productPrice,
          debit: item.quantity,
          branchId: branchId,
          ledgerTypeId: productLedgerType.ledgerTypeId,
          entryTypeId: entryType.entryTypeId,
          accountTypeId: productAccountType.accountTypeId
        }, { transaction: t });

        salesReturnItems.push(salesReturnItem);
      }

      await salesReturn.update({ saleDescription: description }, { transaction: t })
      await salesReturnLedger.update({ description: description }, { transaction: t })
      await customerLedger.update({ description: description }, { transaction: t })


      await t.commit(); // Commit the transaction
      return res.status(201).json({ success: true, message: 'sales Returned successfully', salesReturn, salesReturnItems });

    } catch (error) {
      console.error('Error returning sale:', error);
      await t.rollback();
      return res.status(500).json({ success: false, message: 'Failed to return sale', error: error.message });
    }
  }

  static async getAllSalesReturn(req, res) {
    try {
      const rawSalesReturn = await SalesReturn.findAll({
        include: [
          {
            model: Customer,
            attributes: ['firstName', 'lastName']
          },
          {
            model: Branch,
            attributes: ['branchName']
          }
        ],
        order: [
          ['invoiceId', 'DESC']
        ]
      });

      const sales = rawSalesReturn.map(item => {
        const customer = item.Customer; // Access Customer directly
        const branch = item.Branch;
        return {
          invoiceId: item.invoiceId,
          salesReturnDate: item.salesReturnDate,
          salesReturnDescription: item.salesReturnDescription,
          salesReturnLocation: item.salesReturnLocation,
          totalAmount: item.totalAmount,
          customerId: customer ? customer.customerId : null,
          customerName: customer ? `${customer.firstName}` : null,
          branchId: item.branchId,
          branchName: branch ? branch.branchName : null
        };
      });

      return res.status(200).json({ success: true, sales });
    } catch (error) {
      console.error('Error retrieving sales return:', error);
      return res.status(500).json({ success: false, message: 'Failed to retrieve sales return', error: error.message });

    }
  }

  static async getAllSalesReturnByBranch(req, res) {
    try {
      const branchId = req.params.id;
      const rawSalesReturn = await SalesReturn.findAll({
        include: [
          {
            model: Customer,
            attributes: ['firstName', 'lastName']
          },
          {
            model: Branch,
            attributes: ['branchName']
          }
        ],
        order: [
          ['invoiceId', 'DESC']
        ],
        where: {
          branchId: branchId
        }
      });

      const sales = rawSalesReturn.map(item => {
        const customer = item.Customer; // Access Customer directly
        const branch = item.Branch;
        return {
          invoiceId: item.invoiceId,
          salesReturnDate: item.salesReturnDate,
          salesReturnDescription: item.salesReturnDescription,
          salesReturnLocation: item.salesReturnLocation,
          totalAmount: item.totalAmount,
          customerId: customer ? customer.customerId : null,
          customerName: customer ? `${customer.firstName}` : null,
          branchId: item.branchId,
          branchName: branch ? branch.branchName : null
        };
      });

      return res.status(200).json({ success: true, sales });
    } catch (error) {
      console.error('Error retrieving sales return:', error);
      return res.status(500).json({ success: false, message: 'Failed to retrieve sales return', error: error.message });

    }
  }

  static async getSalesReturnById(req, res) {
    try {
      const salesReturnId = req.params.id;

      const rawSalesReturn = await SalesReturn.findByPk(salesReturnId, {
        include: [
          {
            model: Customer,
            attributes: ['customerId', 'firstName', 'lastName', 'address', 'phoneNumber']
          },
          {
            model: Branch,
            attributes: ['branchName']
          }
        ]
      });

      let sale = null;

      if (rawSalesReturn) {
        const customer = rawSalesReturn.Customer;
        const branch = rawSalesReturn.Branch;

        sale = {
          invoiceId: rawSalesReturn.invoiceId,
          salesReturnDate: rawSalesReturn.salesReturnDate,
          salesReturnDescription: rawSalesReturn.salesReturnDescription,
          salesReturnLocation: rawSalesReturn.salesReturnLocation,
          totalAmount: rawSalesReturn.totalAmount,
          customerId: customer ? customer.customerId : null,
          customerName: customer ? `${customer.firstName}` : null,
          customerAddress: customer ? customer.address : null,
          customerPhoneNumber: customer ? customer.phoneNumber : null,
          branchId: rawSalesReturn.branchId,
          branchName: branch ? branch.branchName : null
        };
      }

      if (!sale) {
        return res.status(404).json({ success: false, message: 'sales Return not found' });
      }

      const itemsNested = await SalesReturnItem.findAll({
        where: {
          invoiceId: salesReturnId
        },
        include: [
          {
            model: Product,
            attributes: ['productId', 'productName', 'productDescription'],
            include: [{
              model: Category,
              attributes: ['categoryName'],
            }]
          }
        ]
      });
      const items = itemsNested.map(item => {
        return {
          salesItemId: item.salesReturnItemId,
          quantity: item.quantity,
          totalAmount: item.totalAmount,
          unitPrice: item.totalAmount / item.quantity,
          invoiceId: item.invoiceId,
          productId: item.productId,
          productName: item.Product ? item.Product.productName : null,
          categoryName: item.Product.Category ? item.Product.Category.categoryName : null,
          description: item.Product ? item.Product.productDescription : null
        };
      });

      return res.status(200).json({ success: true, sale, items });
    } catch (error) {
      console.error('Error retrieving sale:', error);
      return res.status(500).json({ success: false, message: 'Failed to retrieve sale', error: error.message });
    }
  }

  static async updateSalesReturn(req, res) {
    const t = await db.transaction(); // Start a transaction

    try {
      const salesReturnId = req.params.id;
      const { salesReturnDate, salesReturnDescription, salesReturnLocation, totalAmount, customerId, branchId, items } = req.body;
      let description = `${salesReturnDescription} \n`;

      const salesReturn = await SalesReturn.findByPk(salesReturnId);

      if (!salesReturn) {
        await t.rollback(); // Rollback the transaction
        return res.status(404).json({ success: false, message: 'salesReturn not found' });
      }

      if (salesReturn.isLocked) {
        await t.rollback();
        return res.status(404).json({ success: false, message: 'Sales Return has been locked. Cannot be updated' });
      }

      let customer = await Customer.findByPk(salesReturn.customerId, { transaction: t });

      if (!customer) {
        await t.rollback();
        return res.status(400).json({ success: false, message: `customer with ID ${salesReturn.customerId} not found` });
      }

      const productLedgerType = await LedgerType.findOne({ where: { ledgerTypeName: 'product' } });
      const accountType = await AccountType.findOne({ where: { typeName: 'customer' } });
      const entryType = await EntryType.findOne({ where: { typeName: 'SR' } });
      const productAccountType = await AccountType.findOne({ where: { typeName: 'product' } });
      if (!productAccountType || !accountType || !entryType) {
        await t.rollback();
        return res.status(400).json({ success: false, message: `Account type not found` });
      }
      const salesreturnLedgerType = await LedgerType.findOne({ where: { ledgerTypeName: 'salesReturn' } });

      let saleReturnItems = await SalesReturnItem.findAll({
        where: {
          invoiceId: salesReturn.invoiceId,
        },
        transaction: t
      });

      // Delete the sale items and update product quantities
      for (const saleReturnItem of saleReturnItems) {
        let inventoryItem = await Inventory.findOne({
          where: {
            productId: saleReturnItem.productId,
            branchId: salesReturn.branchId
          },
          transaction: t
        });

        await inventoryItem.decrement('itemQuantity', { by: saleReturnItem.quantity, transaction: t });

        const productLedger = await Ledger.findOne({
          where: {
            accountId: saleReturnItem.productId,
            vNo: salesReturn.invoiceId,
            ledgerTypeId: productLedgerType.ledgerTypeId,
            entryTypeId: entryType.entryTypeId,
            accountTypeId: productAccountType.accountTypeId
          }
        });

        if (!productLedger) {
          await t.rollback();
          return res.status(400).json({ success: false, message: 'product not found in ledger' });
        }

        await productLedger.destroy({ transaction: t });

        await saleReturnItem.destroy({ transaction: t });
      }

      customer = await Customer.findByPk(customerId, { transaction: t });

      if (!customer) {
        await t.rollback();
        return res.status(400).json({ success: false, message: `customer with ID ${customerId} not found` });
      }

      let salesReturnItems = [];

      // Create the sales items
      for (const item of items) {

        const salesReturnItem = await SalesReturnItem.create({
          quantity: item.quantity,
          totalAmount: item.totalAmount,
          productId: item.productId,
          invoiceId: salesReturn.invoiceId,
        }, { transaction: t });

        let inventoryItem = await Inventory.findOne({
          where: {
            productId: item.productId,
            branchId: salesReturn.branchId
          },
          transaction: t
        });

        const product = await Product.findByPk(item.productId)
        description += `${product.productName} x ${item.quantity} = ${item.totalAmount} \n`;


        await inventoryItem.increment('itemQuantity', { by: item.quantity, transaction: t });

        await Ledger.create({
          accountId: salesReturnItem.productId,
          date: salesReturnDate,
          vNo: salesReturn.invoiceId,
          description: salesReturnDescription + ' @' + item.productPrice,
          debit: item.quantity,
          branchId: branchId,
          ledgerTypeId: productLedgerType.ledgerTypeId,
          entryTypeId: entryType.entryTypeId,
          accountTypeId: productAccountType.accountTypeId
        }, { transaction: t });

        salesReturnItems.push(salesReturnItem);
      }

      // Create the sales
      await salesReturn.update({
        salesReturnDate,
        salesReturnDescription,
        salesReturnLocation,
        totalAmount,
        customerId,
        branchId
      }, { transaction: t });

      const salesReturnLedger = await Ledger.findOne({
        where: {
          entryTypeId: entryType.entryTypeId,
          vNo: salesReturn.invoiceId,
          ledgerTypeId: salesreturnLedgerType.ledgerTypeId
        }
      });
      await salesReturnLedger.update({
        accountId: customerId,
        date: salesReturnDate,
        vNo: salesReturn.invoiceId,
        description: description,
        debit: totalAmount,
        branchId: branchId,
        ledgerTypeId: salesreturnLedgerType.ledgerTypeId,
        entryTypeId: entryType.entryTypeId,
        accountTypeId: accountType.accountTypeId
      }, { transaction: t });

      const accountLedgerType = await LedgerType.findOne({ where: { ledgerTypeName: 'customer' } });
      const customerLedger = await Ledger.findOne({
        where: {
          entryTypeId: entryType.entryTypeId,
          vNo: salesReturn.invoiceId,
          ledgerTypeId: accountLedgerType.ledgerTypeId
        }
      });
      await customerLedger.update({
        accountId: customerId,
        date: salesReturnDate,
        vNo: salesReturn.invoiceId,
        description: description,
        credit: totalAmount,
        branchId: branchId,
        ledgerTypeId: accountLedgerType.ledgerTypeId,
        entryTypeId: entryType.entryTypeId,
        accountTypeId: accountType.accountTypeId
      }, { transaction: t });

      await t.commit(); // Commit the transaction

      return res.status(200).json({ success: true, message: 'salesReturn updaated successfully' });
    } catch (error) {
      console.error('Error updating sale:', error);
      await t.rollback(); // Rollback the transaction
      return res.status(500).json({ success: false, message: 'Failed to update salesReturn', error: error.message });
    }
  }

  static async deleteSalesReturn(req, res) {
    const t = await db.transaction(); // Start a transaction

    try {
      const salesReturnId = req.params.id;

      const salesReturn = await SalesReturn.findByPk(salesReturnId);

      if (!salesReturn) {
        await t.rollback(); // Rollback the transaction
        return res.status(404).json({ success: false, message: 'sales Return not found' });
      }

      if (salesReturn.isLocked) {
        await t.rollback();
        return res.status(404).json({ success: false, message: 'Sales Return has been locked. Cannot be deleted' });
      }

      const customer = await Customer.findByPk(salesReturn.customerId, { transaction: t });

      if (!customer) {
        await t.rollback();
        return res.status(400).json({ success: false, message: `customer with ID ${salesReturn.customerId} not found` });
      }


      const customerLedgerType = await LedgerType.findOne({ where: { ledgerTypeName: 'customer' } });
      const salesReturnLedgerType = await LedgerType.findOne({ where: { ledgerTypeName: 'salesReturn' } });
      const productLedgerType = await LedgerType.findOne({ where: { ledgerTypeName: 'product' } });

      const entryType = await EntryType.findOne({ where: { typeName: 'SR' } });
      const productAccountType = await AccountType.findOne({ where: { typeName: 'product' } });
      if (!productAccountType || !entryType) {
        await t.rollback();
        return res.status(400).json({ success: false, message: `Account type not found` });
      }

      const salesReturnLedger = await Ledger.findOne({
        where: {
          vNo: salesReturn.invoiceId,
          ledgerTypeId: salesReturnLedgerType.ledgerTypeId,
          entryTypeId: entryType.entryTypeId,
        }
      });

      await salesReturnLedger.destroy({ transaction: t });

      const accountLedger = await Ledger.findOne({
        where: {
          vNo: salesReturn.invoiceId,
          ledgerTypeId: customerLedgerType.ledgerTypeId,
          entryTypeId: entryType.entryTypeId,
        }
      });

      await accountLedger.destroy({ transaction: t });


      let saleReturnItems = await SalesReturnItem.findAll({
        where: {
          invoiceId: salesReturn.invoiceId,
        },
        transaction: t
      });

      // Delete the sale items and update product quantities
      for (const saleReturnItem of saleReturnItems) {
        let inventoryItem = await Inventory.findOne({
          where: {
            productId: saleReturnItem.productId,
            branchId: salesReturn.branchId
          }
        });

        await inventoryItem.decrement('itemQuantity', { by: saleReturnItem.quantity, transaction: t });

        const productLedger = await Ledger.findOne({
          where: {
            accountId: saleReturnItem.productId,
            vNo: salesReturn.invoiceId,
            ledgerTypeId: productLedgerType.ledgerTypeId,
            entryTypeId: entryType.entryTypeId,
            accountTypeId: productAccountType.accountTypeId
          }
        });


        if (!productLedger) {
          await t.rollback();
          return res.status(400).json({ success: false, message: `product not found in ledger` });
        }

        await productLedger.destroy({ transaction: t });

        await saleReturnItem.destroy({ transaction: t });
      }

      await salesReturn.destroy({ transaction: t });

      await t.commit(); // Commit the transaction

      return res.status(200).json({ success: true, message: 'salesReturn deleted successfully' });
    } catch (error) {
      console.error('Error deleting sale:', error);
      await t.rollback(); // Rollback the transaction
      return res.status(500).json({ success: false, message: 'Failed to delete salesReturn', error: error.message });
    }
  }
}

module.exports = SalesReturnController;