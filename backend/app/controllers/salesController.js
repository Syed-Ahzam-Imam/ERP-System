'use strict';

const db = require('../../config/dbConfig');
const Sale = require('../models/salesModel');
const Inventory = require('../models/inventoryModel');
const SalesItem = require('../models/salesItemModel');
const Product = require('../models/productModel');
const Customer = require('../models/customerModel');
const Category = require('../models/categoryModel');
const LedgerType = require('../models/ledgerTypeModel');
const Branch = require('../models/branchModel');
const Ledger = require('../models/ledgerModel');
const Supplier = require('../models/supplierModel');
const EntryType = require('../models/entryTypeModel');
const AccountType = require('../models/accountTypeModel');
class SalesController {
  static async createSale(req, res) {
    const t = await db.transaction(); // Start a transaction
    try {
      const { saleDate, saleDescription, totalAmount, customerId, items, discount, branchId, isSupplier, supplierId } = req.body;
      let description = `${saleDescription} - \nDiscount = (${discount || 0}) \n`;

      if ((supplierId && customerId) || (!isSupplier && supplierId)) {
        await t.rollback();
        return res.status(400).json({ success: false, message: `Customer and Supplier ID error` });
      }

      let account;

      if (isSupplier) {
        account = await Supplier.findByPk(supplierId, { transaction: t });
      } else {
        account = await Customer.findByPk(customerId, { transaction: t });
      }

      if (!account) {
        await t.rollback();
        return res.status(400).json({ success: false, message: `Account not found` });
      }

      const sale = await Sale.create({
        saleDate,
        saleDescription,
        totalAmount,
        customerId,
        supplierId,
        isSupplier,
        discount,
        branchId,
      }, { transaction: t });

      const saleLedgerType = await LedgerType.findOne({ where: { ledgerTypeName: 'sales' } });
      const entryType = await EntryType.findOne({ where: { typeName: 'S' } });
      let accountType;
      if (!isSupplier) {
        accountType = await AccountType.findOne({ where: { typeName: 'customer' } });
      } else {
        accountType = await AccountType.findOne({ where: { typeName: 'supplier' } });
      }

      const productAccountType = await AccountType.findOne({ where: { typeName: 'product' } });
      if (!productAccountType || !accountType || !entryType) {
        await t.rollback();
        return res.status(400).json({ success: false, message: `Account type not found` });
      }

      const saleLedger = await Ledger.create({
        accountId: !isSupplier ? customerId : supplierId,
        date: saleDate,
        vNo: sale.invoiceId,
        description: saleDescription,
        credit: totalAmount,
        branchId: branchId,
        ledgerTypeId: saleLedgerType.ledgerTypeId,
        entryTypeId: entryType.entryTypeId,
        accountTypeId: accountType.accountTypeId
      }, { transaction: t });

      const ledgerTypeName = isSupplier ? 'supplier' : 'customer';
      const accountLedgerType = await LedgerType.findOne({ where: { ledgerTypeName: ledgerTypeName } });
      const customerLedger = await Ledger.create({
        accountId: !isSupplier ? customerId : supplierId,
        date: saleDate,
        vNo: sale.invoiceId,
        description: saleDescription,
        debit: totalAmount,
        branchId: branchId,
        ledgerTypeId: accountLedgerType.ledgerTypeId,
        entryTypeId: entryType.entryTypeId,
        accountTypeId: accountType.accountTypeId
      }, { transaction: t });

      const productLedgerType = await LedgerType.findOne({ where: { ledgerTypeName: 'product' } });

      let salesItems = [];

      // Create the sale items
      for (const item of items) {

        const inventory = await Inventory.findOne({
          where: {
            branchId: branchId, // Filter by branchId
            productId: item.productId // Filter by productId (replace 'yourProductIdHere' with the actual productId)
          },
          include: [
            {
              model: Product,
              attributes: ['productName']
            }
          ]
        });

        if (!inventory) {
          await t.rollback(); // Rollback the transaction
          return res.status(400).json({ success: false, message: `Product ${inventory.Product.productName} not registered in branch ${branchId}` });
        } else {
          await inventory.decrement('itemQuantity', { by: item.quantity, transaction: t })
        }

        const salesItem = await SalesItem.create({
          quantity: item.quantity,
          unitPrice: item.productPrice,
          totalAmount: item.totalAmount,
          productId: item.productId,
          invoiceId: sale.invoiceId,
          discount: item.discount
        }, { transaction: t });

        description += `${inventory.Product.productName} -> ${item.productPrice} x ${item.quantity} - ${item.discount} = ${item.totalAmount - item.discount || 0} \n`;

        salesItems.push(salesItem);

        const productLedger = await Ledger.create({
          accountId: salesItem.productId,
          date: saleDate,
          vNo: sale.invoiceId,
          description: saleDescription + ' @' + item.productPrice,
          credit: salesItem.quantity,
          branchId: branchId,
          ledgerTypeId: productLedgerType.ledgerTypeId,
          entryTypeId: entryType.entryTypeId,
          accountTypeId: productAccountType.accountTypeId
        }, { transaction: t });

      }

      await sale.update({ saleDescription: description }, { transaction: t })
      await saleLedger.update({ description: description }, { transaction: t })
      await customerLedger.update({ description: description }, { transaction: t })

      await t.commit(); // Commit the transaction
      return res.status(201).json({ success: true, message: 'sale created successfully', sale, salesItems });

    } catch (error) {
      console.error('Error creating sale:', error);
      await t.rollback();
      return res.status(500).json({ success: false, message: 'Failed to create sale', error: error.message });
    }
  }

  static async getAllSales(req, res) {
    try {
      const rawSales = await Sale.findAll({
        include: [
          {
            model: Customer,
            attributes: ['firstName', 'lastName']
          },
          {
            model: Branch,
            attributes: ['branchName']
          },
          {
            model: Supplier,
            attributes: ['firstName']
          }
        ],
        order: [
          ['invoiceId', 'DESC']
        ]
      });

      const sales = rawSales.map(item => {
        const customer = item.Customer;
        const supplier = item.Supplier;
        const branch = item.Branch;
        return {
          invoiceId: item.invoiceId,
          saleDate: item.saleDate,
          saleDescription: item.saleDescription,
          totalAmount: item.totalAmount,
          discount: item.discount,
          customerId: customer ? customer.customerId : supplier.supplierId,
          customerName: customer ? `${customer.firstName}` : `${supplier.firstName}`,
          branchId: item.branchId,
          branchName: branch ? branch.branchName : null
        };
      });


      return res.status(200).json({ success: true, sales });
    } catch (error) {
      console.error('Error retrieving sales:', error);
      return res.status(500).json({ success: false, message: 'Failed to retrieve sales', error: error.message });
    }
  }

  static async getAllSalesByBranch(req, res) {
    try {
      const branchId = req.params.id;
      const rawSales = await Sale.findAll({
        include: [
          {
            model: Customer,
            attributes: ['firstName', 'lastName']
          },
          {
            model: Branch,
            attributes: ['branchName']
          },
          {
            model: Supplier,
            attributes: ['firstName']
          }
        ],
        order: [
          ['invoiceId', 'DESC']
        ],
        where: {
          branchId: branchId
        }
      });

      const sales = rawSales.map(item => {
        const customer = item.Customer;
        const supplier = item.Supplier;
        const branch = item.Branch;
        return {
          invoiceId: item.invoiceId,
          saleDate: item.saleDate,
          saleDescription: item.saleDescription,
          totalAmount: item.totalAmount,
          discount: item.discount,
          customerId: customer ? customer.customerId : supplier.supplierId,
          customerName: customer ? `${customer.firstName}` : `${supplier.firstName}`,
          branchId: item.branchId,
          branchName: branch ? branch.branchName : null
        };
      });


      return res.status(200).json({ success: true, sales });
    } catch (error) {
      console.error('Error retrieving sales:', error);
      return res.status(500).json({ success: false, message: 'Failed to retrieve sales', error: error.message });
    }
  }

  static async getSaleById(req, res) {
    try {
      const saleId = req.params.id;

      const rawSale = await Sale.findByPk(saleId, {
        include: [
          {
            model: Customer,
            attributes: ['customerId', 'firstName']
          },
          {
            model: Branch,
            attributes: ['branchName']
          },
          {
            model: Supplier,
            attributes: ['supplierId', 'firstName']
          }
        ]
      });

      let sale = null;

      if (rawSale) {
        const customer = rawSale.Customer;
        const supplier = rawSale.Supplier;
        const branch = rawSale.Branch;

        sale = {
          invoiceId: rawSale.invoiceId,
          saleDate: rawSale.saleDate,
          saleDescription: rawSale.saleDescription,
          totalAmount: rawSale.totalAmount,
          isSupplier: rawSale.isSupplier,
          customerId: customer ? customer.customerId : supplier.supplierId,
          customerName: customer ? `${customer.firstName}` : `${supplier.firstName}`,
          // customerAddress: customer ? customer.address : null,
          // customerPhoneNumber: customer ? customer.phoneNumber : null,
          discount: rawSale.discount,
          branchId: rawSale.branchId,
          branchName: branch ? branch.branchName : null
        };
      }

      if (!sale) {
        return res.status(404).json({ success: false, message: 'Sale not found' });
      }

      const itemsNested = await SalesItem.findAll({
        where: {
          invoiceId: saleId
        },
        include: [
          {
            model: Product,
            attributes: ['productName', 'productDescription'],
            include: [{
              model: Category,
              attributes: ['categoryName'],
            }]
          }
        ]
      });


      // const items = itemsNested.map(async item => {

      //   const availableQuantity = await Inventory.findOne({
      //     where: {
      //       productId: item.productId,
      //       branchId: rawSale.branchId
      //     }
      //   });
      //   return {
      //     salesItemId: item.salesItemId,
      //     quantity: item.quantity,
      //     availableQuantity: availableQuantity?.itemQuantity,
      //     unitPrice: item.unitPrice,
      //     totalAmount: item.totalAmount,
      //     invoiceId: item.invoiceId,
      //     productId: item.productId,
      //     productName: item.Product ? item.Product.productName : null,
      //     categoryName: item.Product.Category ? item.Product.Category.categoryName : null,
      //     discount: item.discount,
      //     description: item.Product ? item.Product.productDescription : null
      //   };
      // });

      const items = await Promise.all(itemsNested.map(async item => {

        const availableQuantity = await Inventory.findOne({
          where: {
            productId: item.productId,
            branchId: rawSale.branchId
          }
        });

        return {
          salesItemId: item.salesItemId,
          quantity: item.quantity,
          availableQuantity: availableQuantity?.itemQuantity,
          unitPrice: item.unitPrice,
          totalAmount: item.totalAmount,
          invoiceId: item.invoiceId,
          productId: item.productId,
          productName: item.Product ? item.Product.productName : null,
          categoryName: item.Product.Category ? item.Product.Category.categoryName : null,
          discount: item.discount,
          description: item.Product ? item.Product.productDescription : null
        };
      }));

      return res.status(200).json({ success: true, sale, items });
    } catch (error) {
      console.error('Error retrieving sale:', error);
      return res.status(500).json({ success: false, message: 'Failed to retrieve sale', error: error.message });
    }
  }

  static async updateSale(req, res) {
    const t = await db.transaction(); // Start a transaction

    try {
      const saleId = req.params.id;
      const { saleDate, saleDescription, totalAmount, customerId, items, discount, branchId, isSupplier, supplierId } = req.body;

      const sale = await Sale.findByPk(saleId);

      if (!sale) {
        await t.rollback(); // Rollback the transaction
        return res.status(404).json({ success: false, message: 'sale not found' });
      }

      if (sale.isLocked) {
        await t.rollback();
        return res.status(404).json({ success: false, message: 'Sale has been locked. Cannot be updated' });
      }

      if ((supplierId && customerId) || (!isSupplier && supplierId)) {
        await t.rollback();
        return res.status(400).json({ success: false, message: `Customer and Supplier ID error` });
      }

      let account;

      if (sale.isSupplier) {
        account = await Supplier.findByPk(sale.supplierId, { transaction: t });
      } else {
        account = await Customer.findByPk(sale.customerId, { transaction: t });
      }

      if (!account) {
        await t.rollback();
        return res.status(400).json({ success: false, message: `Account not found` });
      }

      let accountType;
      if (!isSupplier) {
        accountType = await AccountType.findOne({ where: { typeName: 'customer' } });
      } else {
        accountType = await AccountType.findOne({ where: { typeName: 'supplier' } });
      }

      //find ledger info
      const productLedgerType = await LedgerType.findOne({
        where: { ledgerTypeName: 'product' },
        transaction: t
      });
      const entryType = await EntryType.findOne({ where: { typeName: 'S' } });
      const productAccountType = await AccountType.findOne({ where: { typeName: 'product' } });
      if (!productAccountType || !accountType || !entryType) {
        await t.rollback();
        return res.status(400).json({ success: false, message: `Account type not found` });
      }
      const saleLedgerType = await LedgerType.findOne({ where: { ledgerTypeName: 'sales' } });


      let saleItems = await SalesItem.findAll({
        where: {
          invoiceId: sale.invoiceId,
        },
        transaction: t
      });

      // Delete the sale items and update product quantities
      for (const saleItem of saleItems) {
        let inventoryItem = await Inventory.findOne({
          where: {
            productId: saleItem.productId,
            branchId: sale.branchId
          },
          transaction: t
        });

        await inventoryItem.increment('itemQuantity', { by: saleItem.quantity, transaction: t });

        const productLedger = await Ledger.findOne({
          where: {
            accountId: saleItem.productId,
            vNo: sale.invoiceId,
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


        await saleItem.destroy({ transaction: t });
      }


      if (isSupplier) {
        account = await Supplier.findByPk(supplierId, { transaction: t });
      } else {
        account = await Customer.findByPk(customerId, { transaction: t });
      }

      if (!account) {
        await t.rollback();
        return res.status(400).json({ success: false, message: `Account not found` });
      }

      let description = `${saleDescription} - \nDiscount = (${discount || 0}) \n`;

      let salesItems = [];

      // Create the sale items
      for (const item of items) {

        const inventory = await Inventory.findOne({
          where: {
            branchId: branchId, // Filter by branchId
            productId: item.productId // Filter by productId (replace 'yourProductIdHere' with the actual productId)
          },
          include: [
            {
              model: Product,
              attributes: ['productName']
            }
          ],
          transaction: t
        });

        if (!inventory) {
          await t.rollback(); // Rollback the transaction
          return res.status(400).json({ success: false, message: `Product ${inventory?.Product?.productName} not registered in branch ${branchId}` });
        } else {
          await inventory.decrement('itemQuantity', { by: item.quantity, transaction: t })
        }

        const salesItem = await SalesItem.create({
          quantity: item.quantity,
          unitPrice: item.productPrice,
          totalAmount: item.totalAmount,
          productId: item.productId,
          invoiceId: sale.invoiceId,
          discount: item.discount
        }, { transaction: t });

        description += `${inventory.Product.productName} -> ${item.productPrice} x ${item.quantity} - ${item.discount} = ${item.totalAmount - item.discount || 0} \n`;

        await Ledger.create({
          accountId: salesItem.productId,
          date: saleDate,
          vNo: sale.invoiceId,
          description: saleDescription + ' @' + item.productPrice,
          credit: salesItem.quantity,
          branchId: branchId,
          ledgerTypeId: productLedgerType.ledgerTypeId,
          entryTypeId: entryType.entryTypeId,
          accountTypeId: productAccountType.accountTypeId
        }, { transaction: t });

        salesItems.push(salesItem);
      }

      await sale.update({
        saleDate,
        saleDescription,
        totalAmount,
        customerId,
        isSupplier,
        supplierId,
        discount,
        branchId,
      }, { transaction: t });

      const saleLedger = await Ledger.findOne({
        where: {
          entryTypeId: entryType.entryTypeId,
          vNo: sale.invoiceId,
          ledgerTypeId: saleLedgerType.ledgerTypeId
        }
      });

      await saleLedger.update({
        accountId: !isSupplier ? customerId : supplierId,
        date: saleDate,
        vNo: sale.invoiceId,
        description: description,
        credit: totalAmount,
        branchId: branchId,
        ledgerTypeId: saleLedgerType.ledgerTypeId,
        entryTypeId: entryType.entryTypeId,
        accountTypeId: accountType.accountTypeId
      }, { transaction: t });

      const newledgerTypeName = isSupplier ? 'supplier' : 'customer';
      const newaccountLedgerType = await LedgerType.findOne({ where: { ledgerTypeName: newledgerTypeName } });

      const accountLedger = await Ledger.findOne({
        where: {
          entryTypeId: entryType.entryTypeId,
          vNo: sale.invoiceId,
          ledgerTypeId: newaccountLedgerType.ledgerTypeId
        }
      });

      await accountLedger.update({
        accountId: !isSupplier ? customerId : supplierId,
        date: saleDate,
        vNo: sale.invoiceId,
        description: description,
        debit: totalAmount,
        branchId: branchId,
        ledgerTypeId: newaccountLedgerType.ledgerTypeId,
        entryTypeId: entryType.entryTypeId,
        accountTypeId: accountType.accountTypeId
      }, { transaction: t });


      await t.commit();

      return res.status(200).json({ success: true, message: 'sale updated successfully' });
    } catch (error) {
      console.error('Error updating sale:', error);
      await t.rollback(); // Rollback the transaction
      return res.status(500).json({ success: false, message: 'Failed to update sale', error: error.message });
    }
  }

  static async deletesale(req, res) {
    const t = await db.transaction(); // Start a transaction

    try {
      const saleId = req.params.id;

      const sale = await Sale.findByPk(saleId);

      if (!sale) {
        await t.rollback(); // Rollback the transaction
        return res.status(404).json({ success: false, message: 'sale not found' });
      }

      if (sale.isLocked) {
        await t.rollback();
        return res.status(404).json({ success: false, message: 'Sale has been locked. Cannot be deleted' });
      }

      let account;

      if (sale.isSupplier) {
        account = await Supplier.findByPk(sale.supplierId, { transaction: t });
      } else {
        account = await Customer.findByPk(sale.customerId, { transaction: t });
      }

      if (!account) {
        await t.rollback();
        return res.status(400).json({ success: false, message: `Account not found` });
      }


      const ledgerTypeName = sale.isSupplier ? 'supplier' : 'customer';
      const accountLedgerType = await LedgerType.findOne({
        where: { ledgerTypeName: ledgerTypeName },
        transaction: t
      });

      const saleLedgerType = await LedgerType.findOne({ where: { ledgerTypeName: 'sales' } });
      const productLedgerType = await LedgerType.findOne({ where: { ledgerTypeName: 'product' } });

      const entryType = await EntryType.findOne({ where: { typeName: 'S' } });
      const productAccountType = await AccountType.findOne({ where: { typeName: 'product' } });
      if (!productAccountType || !entryType) {
        await t.rollback();
        return res.status(400).json({ success: false, message: `Account type not found` });
      }

      const saleLedger = await Ledger.findOne({
        where: {
          vNo: sale.invoiceId,
          ledgerTypeId: saleLedgerType.ledgerTypeId,
          entryTypeId: entryType.entryTypeId,
        }
      });

      await saleLedger.destroy({ transaction: t });

      const accountLedger = await Ledger.findOne({
        where: {
          vNo: sale.invoiceId,
          ledgerTypeId: accountLedgerType.ledgerTypeId,
          entryTypeId: entryType.entryTypeId,
        }
      });

      await accountLedger.destroy({ transaction: t });


      let saleItems = await SalesItem.findAll({
        where: {
          invoiceId: sale.invoiceId,
        },
        transaction: t
      });

      // Delete the sale items and update product quantities
      for (const saleItem of saleItems) {
        let inventoryItem = await Inventory.findOne({
          where: {
            productId: saleItem.productId,
            branchId: sale.branchId
          }
        });

        await inventoryItem.increment('itemQuantity', { by: saleItem.quantity, transaction: t });

        const productLedger = await Ledger.findOne({
          where: {
            accountId: saleItem.productId,
            vNo: sale.invoiceId,
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


        await saleItem.destroy({ transaction: t });
      }

      await sale.destroy({ transaction: t });

      await t.commit(); // Commit the transaction

      return res.status(200).json({ success: true, message: 'sale deleted successfully' });
    } catch (error) {
      console.error('Error deleting sale:', error);
      await t.rollback(); // Rollback the transaction
      return res.status(500).json({ success: false, message: 'Failed to delete sale', error: error.message });
    }
  }

  // static async addRecordPayment(req, res) {
  //   const t = await db.transaction();
  //   try {

  //     const { date, amountRecieved, description, paymentMode, salesId } = req.body;

  //     const sales = await Sale.findByPk(salesId, { transaction: t });
  //     await sales.increment('amountRecieved', { by: amountRecieved, transaction: t })
  //     if (sales.amountRecieved >= sales.totalAmount) {
  //       await sales.update({ paymentStatus: 'paid', transaction: t });
  //     }

  //     const customer = await Customer.findByPk(sales.customerId, { transaction: t });
  //     await customer.decrement('amountDue', { by: amountRecieved, transaction: t });

  //     const salesLedger = await LedgerType.findOne({ where: { ledgerTypeName: 'sales' } });
  //     await Cashbook.create({
  //       accountId: sales.customerId,
  //       invoiceId: sales.invoiceId,
  //       accountName: customer ? `${customer.firstName} ${customer.lastName}` : null,
  //       description: description,
  //       paymentMethod: paymentMode,
  //       receipt: amountRecieved,
  //       payment: 0,
  //       date: date,
  //       ledgerTypeId: salesLedger.ledgerTypeId
  //     }, { transaction: t })
  //     await t.commit();
  //     return res.status(200).json({ success: true, message: 'Successfully recorded payment' });
  //   } catch (error) {
  //     console.error('Error recording payment:', error);
  //     await t.rollback();
  //     return res.status(500).json({ success: false, message: 'Failed to record payment', error: error.message });
  //   }
  // }

  // static async getRecordPayment(req, res) {
  //   try {

  //     const salesId = req.params.id;
  //     const rawRecord = await Sale.findByPk(salesId, {
  //       include: [{
  //         model: Customer,
  //         attributes: ['firstName', 'lastName', 'address', 'phoneNumber']
  //       }],
  //     });

  //     if (!rawRecord) {
  //       return res.status(404).json({ success: false, message: 'Record not found' });
  //     }

  //     let record = null;
  //     if (rawRecord) {
  //       const customer = rawRecord.Customer; // Access customer directly

  //       record = {
  //         salesId,
  //         customerId: rawRecord.customerId,
  //         customerName: customer ? `${customer.firstName} ${customer.lastName}` : null,
  //         salesDate: rawRecord.salesDate,
  //         address: customer ? customer.address : null,
  //         phoneNumber: customer ? customer.phoneNumber : null,
  //         paymentStatus: rawRecord.paymentStatus,
  //         totalAmount: rawRecord.totalAmount,
  //         amountRecieved: rawRecord.amountRecieved,
  //         amountRemaining: rawRecord.totalAmount - rawRecord.amountRecieved,
  //       };
  //     }

  //     return res.status(200).json({ success: true, record });
  //   } catch (error) {
  //     console.error('Error recording payment:', error);
  //     return res.status(500).json({ success: false, message: 'Failed to record payment', error: error.message });
  //   }
  // }

}

module.exports = SalesController;
