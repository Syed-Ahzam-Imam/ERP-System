'use strict';

const db = require('../../config/dbConfig');
const Product = require('../models/productModel');
const Inventory = require('../models/inventoryModel');
const Branch = require('../models/branchModel');
const Category = require('../models/categoryModel');
const Supplier = require('../models/supplierModel');
const LedgerType = require('../models/ledgerTypeModel');
const PurchaseReturn = require('../models/purchaseReturnModel');
const PurchaseReturnItem = require('../models/purchaseReturnItemModel');
const PurchaseReturnItemDistribution = require('../models/purchaseReturnItemDistributionModel');
const Ledger = require('../models/ledgerModel');
const EntryType = require('../models/entryTypeModel');
const AccountType = require('../models/accountTypeModel');

class PurchaseReturnController {
  static async createPurchaseReturn(req, res) {

    const t = await db.transaction(); // Start a transaction
    try {
      const { purchaseReturnDate, purchaseReturnDescription, purchaseReturnLocation, totalAmount, supplierId, items, branchId } = req.body;
      let description = `${purchaseReturnDescription} \n`;

      const supplier = await Supplier.findByPk(supplierId, { transaction: t });

      if (!supplier) {
        await t.rollback();
        return res.status(400).json({ success: false, message: `Supplier with ID ${supplierId} not found` });
      }

      // Create the purchase
      const purchaseReturn = await PurchaseReturn.create({
        purchaseReturnDate,
        purchaseReturnDescription,
        purchaseReturnLocation,
        totalAmount,
        supplierId,
      }, { transaction: t });

      const purchaseReturnLedgerType = await LedgerType.findOne({ where: { ledgerTypeName: 'purchaseReturn' } });
      const entryType = await EntryType.findOne({ where: { typeName: 'PR' } });
      const accountType = await AccountType.findOne({ where: { typeName: 'supplier' } });

      const productAccountType = await AccountType.findOne({ where: { typeName: 'product' } });
      if (!productAccountType || !accountType || !entryType) {
        await t.rollback();
        return res.status(400).json({ success: false, message: `Account type not found` });
      }

      const purchaseReturnLedger = await Ledger.create({
        accountId: supplierId,
        date: purchaseReturnDate,
        vNo: purchaseReturn.invoiceId,
        description: purchaseReturnDescription,
        credit: totalAmount,
        branchId: branchId,
        ledgerTypeId: purchaseReturnLedgerType.ledgerTypeId,
        entryTypeId: entryType.entryTypeId,
        accountTypeId: accountType.accountTypeId
      }, { transaction: t });

      const supplierLedgerType = await LedgerType.findOne({ where: { ledgerTypeName: 'supplier' } });
      const supplierLedger = await Ledger.create({
        accountId: supplierId,
        date: purchaseReturnDate,
        vNo: purchaseReturn.invoiceId,
        description: purchaseReturnDescription,
        debit: totalAmount,
        branchId: branchId,
        ledgerTypeId: supplierLedgerType.ledgerTypeId,
        entryTypeId: entryType.entryTypeId,
        accountTypeId: accountType.accountTypeId
      }, { transaction: t });

      const productLedgerType = await LedgerType.findOne({ where: { ledgerTypeName: 'product' } });

      let purchaseReturnItems = [];
      let itemAssignments = [];

      // Create the purchase items
      for (const item of items) {

        const purchaseReturnItem = await PurchaseReturnItem.create({
          quantity: item.quantity,
          totalAmount: item.totalAmount,
          productId: item.productId,
          invoiceId: purchaseReturn.invoiceId,
        }, { transaction: t });

        const product = await Product.findByPk(item.productId)
        description += `${product.productName} x ${item.quantity} = ${item.totalAmount} \n`;


        purchaseReturnItems.push(purchaseReturnItem);

        let distributionSum = 0;

        // Create the purchase item distribution
        for (const itemDistribution of item.itemAssignments) {
          distributionSum += itemDistribution.quantity

          const purchaseReturnItemDistribution = await PurchaseReturnItemDistribution.create({
            quantity: itemDistribution.quantity,
            branchId: itemDistribution.branchId,
            purchaseReturnItemId: purchaseReturnItem.purchaseReturnItemId
          }, { transaction: t });

          itemAssignments.push(purchaseReturnItemDistribution);

          //create product ledger
          const productLedger = await Ledger.create({
            accountId: purchaseReturnItem.productId,
            date: purchaseReturnDate,
            vNo: purchaseReturn.invoiceId,
            description: purchaseReturnDescription + ' @' + item.productPrice,
            credit: itemDistribution.quantity,
            branchId: itemDistribution.branchId,
            ledgerTypeId: productLedgerType.ledgerTypeId,
            entryTypeId: entryType.entryTypeId,
            accountTypeId: productAccountType.accountTypeId
          }, { transaction: t });

          // Find the inventory item based on productId and branchId within a transaction
          let inventoryItem = await Inventory.findOne({
            where: {
              productId: item.productId,
              branchId: itemDistribution.branchId
            },
            transaction: t // Pass the transaction object
          });

          if (inventoryItem) {
            // If inventory item already exists, update it
            await inventoryItem.decrement('itemQuantity', { by: itemDistribution.quantity, transaction: t });
          } else {
            await t.rollback(); // Rollback the transaction
            return res.status(400).json({ success: false, message: `product not registered in branch` });
          }
        }

        if (distributionSum != item.quantity) {
          await t.rollback(); // Rollback the transaction
          return res.status(400).json({ success: false, message: `Sum of quantites of product Id ${item.productId} dont match` });
        }
      }
      await purchaseReturn.update({ purchaseReturnDescription: description }, { transaction: t })
      await purchaseReturnLedger.update({ description: description }, { transaction: t })
      await supplierLedger.update({ description: description }, { transaction: t })


      await t.commit(); // Commit the transaction

      return res.status(201).json({ success: true, message: 'Purchase Returned successfully', purchaseReturn, purchaseReturnItems, itemAssignments });
    } catch (error) {
      console.error('Error creating purchase:', error);
      await t.rollback(); // Rollback the transaction
      return res.status(500).json({ success: false, message: 'Failed to return purchase', error: error.message });
    }
  }

  static async getPurchaseReturnById(req, res) {
    try {
      const purchaseReturnId = req.params.id;

      const rawPurchaseReturn = await PurchaseReturn.findByPk(purchaseReturnId, {
        include: [{
          model: Supplier,
          attributes: ['supplierId', 'firstName', 'lastName', 'shopLocation', 'phoneNumber']
        }],
      });

      if (!rawPurchaseReturn) {
        return res.status(404).json({ success: false, message: 'Purchase Return not found' });
      }

      let purchase = null;

      if (rawPurchaseReturn) {
        const supplier = rawPurchaseReturn.Supplier; // Access Supplier directly

        purchase = {
          invoiceId: rawPurchaseReturn.invoiceId,
          purchaseReturnDate: rawPurchaseReturn.purchaseReturnDate,
          purchaseReturnDescription: rawPurchaseReturn.purchaseReturnDescription,
          purchaseReturnLocation: rawPurchaseReturn.purchaseReturnLocation,
          totalAmount: rawPurchaseReturn.totalAmount,
          supplierId: supplier ? supplier.supplierId : null,
          supplierName: supplier ? `${supplier.firstName}` : null,
          shopLocation: supplier ? supplier.shopLocation : null,
          supplierPhoneNumber: supplier ? supplier.phoneNumber : null,
        };
      }

      const itemsNested = await PurchaseReturnItem.findAll({
        where: {
          invoiceId: purchaseReturnId
        },
        include: [
          {
            model: Product,
            attributes: ['productDescription']
          }
        ]
      });
      const items = itemsNested.map(item => {
        return {
          purchaseReturnItemId: item.purchaseReturnItemId,
          quantity: item.quantity,
          totalAmount: item.totalAmount,
          unitPrice: item.totalAmount / item.quantity,
          invoiceId: item.invoiceId,
          productId: item.productId,
          description: item.Product ? item.Product.productDescription : null
        };
      });

      return res.status(200).json({ success: true, purchase, items });

    } catch (error) {
      console.error('Error retrieving purchase return:', error);
      return res.status(500).json({ success: false, message: 'Failed to retrieve purchase return', error: error.message });
    }
  }

  static async getAllPurchasesReturn(req, res) {
    try {
      const rawPurchaseReturns = await PurchaseReturn.findAll({
        attributes: ['invoiceId', 'purchaseReturnDate', 'purchaseReturnDescription', 'purchaseReturnLocation', 'totalAmount', 'supplierId'],
        include: [
          {
            model: Supplier,
            attributes: ['firstName', 'lastName']
          }
        ],
        order: [
          ['invoiceId', 'DESC']
        ]
      });

      const purchases = rawPurchaseReturns.map(item => {
        const supplier = item.Supplier; // Access Supplier directly

        return {
          invoiceId: item.invoiceId,
          purchaseReturnDate: item.purchaseReturnDate,
          purchaseReturnDescription: item.purchaseReturnDescription,
          totalAmount: item.totalAmount,
          supplierId: supplier ? supplier.supplierId : null,
          supplierName: supplier ? `${supplier.firstName}` : null
        };
      });

      return res.status(200).json({ success: true, purchases });
    } catch (error) {

    }
  }

  static async getPurchaseReturnsWithDetailsById(req, res) {
    try {
      const invoiceId = req.params.id;
      const rawPurchaseReturn = await PurchaseReturn.findOne({
        where: {
          invoiceId
        },
        attributes: ['invoiceId', 'purchaseReturnDate', 'purchaseReturnDescription', 'purchaseReturnLocation', 'totalAmount', 'supplierId'],
        include: [
          {
            model: Supplier,
            attributes: ['firstName', 'lastName', 'shopLocation', 'phoneNumber']
          }
        ],
        order: [
          ['invoiceId', 'DESC']
        ]
      });

      let purchaseReturn = null;

      if (rawPurchaseReturn) {
        const supplier = rawPurchaseReturn.Supplier; // Access Supplier directly

        purchaseReturn = {
          invoiceId: rawPurchaseReturn.invoiceId,
          purchaseReturnDate: rawPurchaseReturn.purchaseReturnDate,
          purchaseReturnDescription: rawPurchaseReturn.purchaseReturnDescription,
          purchaseReturnLocation: rawPurchaseReturn.purchaseReturnLocation,
          totalAmount: rawPurchaseReturn.totalAmount,
          supplierId: supplier ? supplier.supplierId : null,
          supplierName: supplier ? `${supplier.firstName}` : null,
          shopLocation: supplier ? supplier.shopLocation : null,
          supplierPhoneNumber: supplier ? supplier.phoneNumber : null
        };
      }


      if (!purchaseReturn) {
        return res.status(404).json({ success: false, message: 'Purchase Return not found' });
      }

      const items = await PurchaseReturnItem.findAll({
        where: {
          invoiceId: purchaseReturn.invoiceId
        }
      });

      const itemsWithAssignments = await Promise.all(items.map(async (item) => {
        const itemAssignmentsWithoutBranchName = await PurchaseReturnItemDistribution.findAll({
          where: {
            purchaseReturnItemId: item.purchaseReturnItemId
          },
          attributes: ['quantity', 'branchId']
        });


        const itemAssignments = await Promise.all(itemAssignmentsWithoutBranchName.map(async (assignment) => {
          const branch = await Branch.findOne({
            where: {
              branchId: assignment.branchId
            },
            attributes: ['branchName']
          });

          return {
            quantity: assignment.quantity,
            branchId: assignment.branchId,
            branchName: branch ? branch.branchName : null
          };
        }));

        const product = await Product.findOne({
          where: {
            productId: item.productId
          }
        })
        let category;

        if (product) {
          category = await Category.findOne({
            where: {
              categoryId: product.categoryId
            }
          })
        }

        const productDetails = {
          quantity: item.quantity,
          totalAmount: item.totalAmount,
          unitPrice: item.totalAmount / item.quantity,
          productName: product ? product.productName : null,
          categoryName: category ? category.categoryName : null
        };

        return { productDetails, itemAssignments };
      }));

      return res.status(200).json({ success: true, purchaseReturn, itemsWithAssignments });
    } catch (error) {
      console.error('Error retrieving purchase returns:', error);
      return res.status(500).json({ success: false, message: 'Failed to retrieve purchase returns', error: error.message });
    }
  }

  static async updatePurchaseReturn(req, res) {
    const t = await db.transaction();

    try {
      const purchaseReturnId = req.params.id;
      const { purchaseReturnDate, purchaseReturnDescription, purchaseReturnLocation, totalAmount, supplierId, branchId, items } = req.body;
      let description = `${purchaseReturnDescription} \n`;

      //delete existing purchase return

      const purchaseReturn = await PurchaseReturn.findByPk(purchaseReturnId);

      if (!purchaseReturn) {
        await t.rollback();
        return res.status(404).json({ success: false, message: 'purchase Return not found' });
      }

      if (purchaseReturn.isLocked) {
        await t.rollback();
        return res.status(404).json({ success: false, message: 'Purchase Return has been locked. Cannot be updated' });
      }

      let supplier = await Supplier.findByPk(purchaseReturn.supplierId);
      if (!supplier) {
        await t.rollback();
        return res.status(400).json({ success: false, message: `Supplier with ID ${supplier.supplierId} not found` });
      }

      const productLedgerType = await LedgerType.findOne({ where: { ledgerTypeName: 'product' } });
      const accountType = await AccountType.findOne({ where: { typeName: 'supplier' } });
      const entryType = await EntryType.findOne({ where: { typeName: 'PR' } });
      const productAccountType = await AccountType.findOne({ where: { typeName: 'product' } });
      if (!productAccountType || !accountType || !entryType) {
        await t.rollback();
        return res.status(400).json({ success: false, message: `Account type not found` });
      }
      const purchaseReturnLedgerType = await LedgerType.findOne({ where: { ledgerTypeName: 'purchaseReturn' } });


      let purchaseReturnItems = await PurchaseReturnItem.findAll({
        where: {
          invoiceId: purchaseReturn.invoiceId,
        },
        transaction: t
      });

      // Delete the purchase items and update product quantities
      for (const purchaseReturnItem of purchaseReturnItems) {
        let itemDistributions = await PurchaseReturnItemDistribution.findAll({
          where: {
            purchaseReturnItemId: purchaseReturnItem.purchaseReturnItemId
          }
        });

        for (const item of itemDistributions) {
          let inventoryItem = await Inventory.findOne({
            where: {
              productId: purchaseReturnItem.productId,
              branchId: item.branchId
            }
          });

          await inventoryItem.increment('itemQuantity', { by: item.quantity, transaction: t });

          const productLedger = await Ledger.findOne({
            where: {
              accountId: purchaseReturnItem.productId,
              vNo: purchaseReturn.invoiceId,
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


          await item.destroy({ transaction: t });
        }

        await purchaseReturnItem.destroy({ transaction: t });
      }

      supplier = await Supplier.findByPk(purchaseReturn.supplierId);
      if (!supplier) {
        await t.rollback();
        return res.status(400).json({ success: false, message: `Supplier with ID ${supplier.supplierId} not found` });
      }


      purchaseReturnItems = [];
      let itemAssignments = [];

      // Create the purchase items
      for (const item of items) {

        const purchaseReturnItem = await PurchaseReturnItem.create({
          quantity: item.quantity,
          totalAmount: item.totalAmount,
          productId: item.productId,
          invoiceId: purchaseReturn.invoiceId,
        }, { transaction: t });

        const product = await Product.findByPk(item.productId)
        description += `${product.productName} x ${item.quantity} = ${item.totalAmount} \n`;


        purchaseReturnItems.push(purchaseReturnItem);

        let distributionSum = 0;

        // Create the purchase item distribution
        for (const itemDistribution of item.itemAssignments) {
          distributionSum += itemDistribution.quantity

          const purchaseReturnItemDistribution = await PurchaseReturnItemDistribution.create({
            quantity: itemDistribution.quantity,
            branchId: itemDistribution.branchId,
            purchaseReturnItemId: purchaseReturnItem.purchaseReturnItemId
          }, { transaction: t });

          itemAssignments.push(purchaseReturnItemDistribution);

          // Find the inventory item based on productId and branchId within a transaction
          let inventoryItem = await Inventory.findOne({
            where: {
              productId: item.productId,
              branchId: itemDistribution.branchId
            },
            transaction: t // Pass the transaction object
          });

          await Ledger.create({
            accountId: purchaseReturnItem.productId,
            date: purchaseReturnDate,
            vNo: purchaseReturn.invoiceId,
            description: purchaseReturnDescription + ' @' + item.productPrice,
            credit: itemDistribution.quantity,
            branchId: itemDistribution.branchId,
            ledgerTypeId: productLedgerType.ledgerTypeId,
            entryTypeId: entryType.entryTypeId,
            accountTypeId: productAccountType.accountTypeId
          }, { transaction: t });

          if (inventoryItem) {
            // If inventory item already exists, update it
            await inventoryItem.decrement('itemQuantity', { by: itemDistribution.quantity, transaction: t });
          } else {
            await t.rollback(); // Rollback the transaction
            return res.status(400).json({ success: false, message: `product not registered in branch` });
          }
        }

        if (distributionSum != item.quantity) {
          await t.rollback(); // Rollback the transaction
          return res.status(400).json({ success: false, message: `Sum of quantites of product Id ${item.productId} dont match` });
        }
      }

      // update the purchase
      await purchaseReturn.update({
        purchaseReturnDate,
        purchaseReturnDescription,
        purchaseReturnLocation,
        totalAmount,
        supplierId,
      }, { transaction: t });

      const purchaseReturnLedger = await Ledger.findOne({
        where: {
          entryTypeId: entryType.entryTypeId,
          vNo: purchaseReturn.invoiceId,
          ledgerTypeId: purchaseReturnLedgerType.ledgerTypeId
        }
      });
      await purchaseReturnLedger.update({
        accountId: supplierId,
        date: purchaseReturnDate,
        vNo: purchaseReturn.invoiceId,
        description: description,
        credit: totalAmount,
        branchId: branchId,
        ledgerTypeId: purchaseReturnLedgerType.ledgerTypeId,
        entryTypeId: entryType.entryTypeId,
        accountTypeId: accountType.accountTypeId
      }, { transaction: t });

      const accountLedgerType = await LedgerType.findOne({ where: { ledgerTypeName: 'supplier' } });
      const supplierLedger = await Ledger.findOne({
        where: {
          entryTypeId: entryType.entryTypeId,
          vNo: purchaseReturn.invoiceId,
          ledgerTypeId: accountLedgerType.ledgerTypeId
        }
      });
      await supplierLedger.update({
        accountId: supplierId,
        date: purchaseReturnDate,
        vNo: purchaseReturn.invoiceId,
        description: description,
        debit: totalAmount,
        branchId: branchId,
        ledgerTypeId: accountLedgerType.ledgerTypeId
      }, { transaction: t });

      await t.commit();

      return res.status(200).json({ success: true, message: 'purchase Return updated successfully' });
    } catch (error) {
      console.error('Error deleting purchase Return:', error);
      await t.rollback(); // Rollback the transaction
      return res.status(500).json({ success: false, message: 'Failed to update purchase Return', error: error.message });
    }
  }

  static async deletePurchaseReturn(req, res) {
    const t = await db.transaction();

    try {
      const purchaseReturnId = req.params.id;
      const purchaseReturn = await PurchaseReturn.findByPk(purchaseReturnId);

      if (!purchaseReturn) {
        await t.rollback();
        return res.status(404).json({ success: false, message: 'purchase Return not found' });
      }

      if (purchaseReturn.isLocked) {
        await t.rollback();
        return res.status(404).json({ success: false, message: 'Purchase Return has been locked. Cannot be deleted' });
      }


      const supplier = await Supplier.findByPk(purchaseReturn.supplierId);
      if (!supplier) {
        await t.rollback();
        return res.status(400).json({ success: false, message: `Supplier with ID ${supplier.supplierId} not found` });
      }

      const supplierLedgerType = await LedgerType.findOne({ where: { ledgerTypeName: 'supplier' } });
      const purchaseReturnLedgerType = await LedgerType.findOne({ where: { ledgerTypeName: 'purchaseReturn' } });
      const productLedgerType = await LedgerType.findOne({ where: { ledgerTypeName: 'product' } });

      const entryType = await EntryType.findOne({ where: { typeName: 'PR' } });
      const productAccountType = await AccountType.findOne({ where: { typeName: 'product' } });
      if (!productAccountType || !entryType) {
        await t.rollback();
        return res.status(400).json({ success: false, message: `Account type not found` });
      }

      const purchaseReturnLedger = await Ledger.findOne({
        where: {
          vNo: purchaseReturn.invoiceId,
          ledgerTypeId: purchaseReturnLedgerType.ledgerTypeId,
          entryTypeId: entryType.entryTypeId,
        }
      });
      await purchaseReturnLedger.destroy({ transaction: t });

      const accountLedger = await Ledger.findOne({
        where: {
          vNo: purchaseReturn.invoiceId,
          ledgerTypeId: supplierLedgerType.ledgerTypeId,
          entryTypeId: entryType.entryTypeId,
        }
      });

      await accountLedger.destroy({ transaction: t });

      let purchaseReturnItems = await PurchaseReturnItem.findAll({
        where: {
          invoiceId: purchaseReturn.invoiceId,
        },
        transaction: t
      });

      // Delete the purchase items and update product quantities
      for (const purchaseReturnItem of purchaseReturnItems) {
        let itemDistributions = await PurchaseReturnItemDistribution.findAll({
          where: {
            purchaseReturnItemId: purchaseReturnItem.purchaseReturnItemId,
          }
        });

        for (const item of itemDistributions) {
          let inventoryItem = await Inventory.findOne({
            where: {
              productId: purchaseReturnItem.productId,
              branchId: item.branchId
            }
          });

          await inventoryItem.increment('itemQuantity', { by: item.quantity, transaction: t });

          const productLedger = await Ledger.findOne({
            where: {
              accountId: purchaseReturnItem.productId,
              vNo: purchaseReturn.invoiceId,
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

          await item.destroy({ transaction: t });
        }

        await purchaseReturnItem.destroy({ transaction: t });
      }

      await purchaseReturn.destroy({ transaction: t });

      await t.commit();

      return res.status(200).json({ success: true, message: 'purchase Return deleted successfully' });
    } catch (error) {
      console.error('Error updating purchase Return:', error);
      await t.rollback(); // Rollback the transaction
      return res.status(500).json({ success: false, message: 'Failed to delete purchase Return', error: error.message });
    }
  }
}

module.exports = PurchaseReturnController;