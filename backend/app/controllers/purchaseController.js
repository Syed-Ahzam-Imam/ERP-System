'use strict';

const db = require('../../config/dbConfig');
const Purchase = require('../models/purchaseModel');
const Product = require('../models/productModel');
const PurchaseItem = require('../models/purchaseItemModel');
const Inventory = require('../models/inventoryModel');
const Branch = require('../models/branchModel');
const PurchaseItemDistribution = require('../models/purchaseItemDistributionModel');
const Category = require('../models/categoryModel');
const Supplier = require('../models/supplierModel');
const LedgerType = require('../models/ledgerTypeModel');
const Ledger = require('../models/ledgerModel');
const Customer = require('../models/customerModel');
const EntryType = require('../models/entryTypeModel');
const AccountType = require('../models/accountTypeModel');

class PurchaseController {
  static async createPurchase(req, res) {
    const t = await db.transaction();
    try {
      const { purchaseDate, purchaseDescription, totalAmount, supplierId, items, discount, branchId, isCustomer, customerId } = req.body;
      let description = `${purchaseDescription} - \nDiscount = (${discount || 0}) \n`;

      if ((supplierId && customerId) || (!isCustomer && customerId)) {
        await t.rollback();
        return res.status(400).json({ success: false, message: `Customer and Supplier ID error` });
      }

      let account;

      if (!isCustomer) {
        account = await Supplier.findByPk(supplierId, { transaction: t });
      } else {
        account = await Customer.findByPk(customerId, { transaction: t });
      }

      if (!account) {
        await t.rollback();
        return res.status(400).json({ success: false, message: `Account not found` });
      }

      // Create the purchase
      const purchase = await Purchase.create({
        purchaseDate,
        purchaseDescription,
        totalAmount,
        isCustomer,
        customerId,
        supplierId,
        discount,
      }, { transaction: t });

      //create ledger entries
      const purchaseLedgerType = await LedgerType.findOne({ where: { ledgerTypeName: 'purchase' } });
      const entryType = await EntryType.findOne({ where: { typeName: 'P' } });
      let accountType;
      if (isCustomer) {
        accountType = await AccountType.findOne({ where: { typeName: 'customer' } });
      } else {
        accountType = await AccountType.findOne({ where: { typeName: 'supplier' } });
      }

      const productAccountType = await AccountType.findOne({ where: { typeName: 'product' } });
      if (!productAccountType || !accountType || !entryType) {
        await t.rollback();
        return res.status(400).json({ success: false, message: `Account type not found` });
      }

      const purchaseLedger = await Ledger.create({
        accountId: isCustomer ? customerId : supplierId,
        date: purchaseDate,
        vNo: purchase.invoiceId,
        description: purchaseDescription,
        debit: totalAmount,
        branchId: branchId,
        ledgerTypeId: purchaseLedgerType.ledgerTypeId,
        entryTypeId: entryType.entryTypeId,
        accountTypeId: accountType.accountTypeId
      }, { transaction: t });

      const ledgerTypeName = !isCustomer ? 'supplier' : 'customer';
      const accountLedgerType = await LedgerType.findOne({ where: { ledgerTypeName: ledgerTypeName } });
      const supplierLedger = await Ledger.create({
        accountId: isCustomer ? customerId : supplierId,
        date: purchaseDate,
        vNo: purchase.invoiceId,
        description: purchaseDescription,
        credit: totalAmount,
        branchId: branchId,
        ledgerTypeId: accountLedgerType.ledgerTypeId,
        entryTypeId: entryType.entryTypeId,
        accountTypeId: accountType.accountTypeId
      }, { transaction: t });

      const productLedgerType = await LedgerType.findOne({ where: { ledgerTypeName: 'product' } });


      let purchaseItems = [];
      let itemAssignments = [];
      let productLedgers = [];

      // Create the purchase items
      for (const item of items) {

        const purchaseItem = await PurchaseItem.create({
          quantity: item.quantity,
          unitPrice: item.productPrice,
          totalAmount: item.totalAmount,
          productId: item.productId,
          invoiceId: purchase.invoiceId,
          discount: item.discount
        }, { transaction: t });

        const product = await Product.findByPk(item.productId)
        description += `${product.productName} -> ${item.productPrice} x ${item.quantity} - ${item.discount} = ${item.totalAmount - item.discount || 0} \n`;

        purchaseItems.push(purchaseItem);

        let distributionSum = 0;

        // Create the purchase item distribution
        for (const itemDistribution of item.itemAssignments) {
          distributionSum += itemDistribution.quantity

          const purchaseItemDistribution = await PurchaseItemDistribution.create({
            quantity: itemDistribution.quantity,
            branchId: itemDistribution.branchId,
            purchaseItemId: purchaseItem.dataValues.purchaseItemId
          }, { transaction: t });

          itemAssignments.push(purchaseItemDistribution);

          //create product ledger
          const productLedger = await Ledger.create({
            accountId: purchaseItem.productId,
            date: purchaseDate,
            vNo: purchase.invoiceId,
            description: purchaseDescription + ' @' + item.productPrice,
            debit: itemDistribution.quantity,
            branchId: itemDistribution.branchId,
            ledgerTypeId: productLedgerType.ledgerTypeId,
            entryTypeId: entryType.entryTypeId,
            accountTypeId: productAccountType.accountTypeId
          }, { transaction: t });

          productLedgers.push(productLedger)
          // Find the inventory item based on productId and branchId within a transaction
          let inventoryItem = await Inventory.findOne({
            where: {
              productId: item.productId,
              branchId: itemDistribution.branchId
            },
            transaction: t
          });

          if (inventoryItem) {
            // If inventory item already exists, update it
            await inventoryItem.increment('itemQuantity', { by: itemDistribution.quantity, transaction: t });
            await inventoryItem.increment('totalQuantity', { by: itemDistribution.quantity, transaction: t });
            await inventoryItem.increment('totalAmount', { by: itemDistribution.quantity * item.productPrice, transaction: t });
          } else {
            // If inventory item doesn't exist, create it
            inventoryItem = await Inventory.create({
              itemQuantity: itemDistribution.quantity,
              branchId: itemDistribution.branchId,
              productId: item.productId,
              totalAmount: itemDistribution.quantity * item.productPrice,
              totalQuantity: itemDistribution.quantity
            }, { transaction: t });
          }
        }

        if (distributionSum != item.quantity) {
          await t.rollback();
          return res.status(400).json({ success: false, message: `Sum of quantites of product Id ${item.productId} dont match` });
        }
      }

      await purchase.update({ purchaseDescription: description }, { transaction: t })
      await purchaseLedger.update({ description: description }, { transaction: t })
      await supplierLedger.update({ description: description }, { transaction: t })


      await t.commit();

      return res.status(201).json({ success: true, message: 'Purchase created successfully', purchase, purchaseItems, itemAssignments, supplierLedger, purchaseLedger, productLedgers });
    } catch (error) {
      console.error('Error creating purchase:', error);
      await t.rollback();
      return res.status(500).json({ success: false, message: 'Failed to create purchase', error: error.message });
    }
  }

  static async getPurchaseById(req, res) {
    try {
      const purchaseId = req.params.id;

      const rawPurchase = await Purchase.findByPk(purchaseId, {
        include: [{
          model: Supplier,
          attributes: ['supplierId', 'firstName', 'lastName', 'shopLocation', 'phoneNumber']
        },
        {
          model: Customer,
          attributes: ['customerId', 'firstName', 'phoneNumber']
        },
        ],
      });

      if (!rawPurchase) {
        return res.status(404).json({ success: false, message: 'Purchase not found' });
      }

      let purchase = null;

      if (rawPurchase) {
        const supplier = rawPurchase.Supplier; // Access Supplier directly
        const customer = rawPurchase.Customer;

        purchase = {
          invoiceId: rawPurchase.invoiceId,
          purchaseDate: rawPurchase.purchaseDate,
          purchaseDescription: rawPurchase.purchaseDescription,
          totalAmount: rawPurchase.totalAmount,
          isCustomer: rawPurchase.isCustomer,
          supplierId: supplier ? supplier.supplierId : customer.customerId,
          supplierName: supplier ? `${supplier.firstName}` : `${customer.firstName}`,
          shopLocation: supplier ? supplier.shopLocation : null,
          supplierPhoneNumber: supplier ? supplier.phoneNumber : customer?.phoneNumber,
          discount: rawPurchase.discount
        };
      }

      const itemsNested = await PurchaseItem.findAll({
        where: {
          invoiceId: purchaseId
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
          purchaseItemId: item.purchaseItemId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalAmount: item.totalAmount,
          invoiceId: item.invoiceId,
          productId: item.productId,
          discount: item.discount,
          description: item.Product ? item.Product.productDescription : null
        };
      });

      return res.status(200).json({ success: true, purchase, items });
    } catch (error) {
      console.error('Error retrieving purchase:', error);
      return res.status(500).json({ success: false, message: 'Failed to retrieve purchase', error: error.message });
    }
  }


  static async getAllPurchases(req, res) {
    try {
      const rawPurchases = await Purchase.findAll({
        attributes: ['invoiceId', 'purchaseDate', 'purchaseDescription', 'totalAmount', 'supplierId', 'discount'],
        include: [
          {
            model: Supplier,
            attributes: ['firstName', 'lastName']
          },
          {
            model: Customer,
            attributes: ['customerId', 'firstName', 'phoneNumber']
          }
        ],
        order: [
          ['invoiceId', 'DESC']
        ]
      });

      const purchases = rawPurchases.map(item => {
        const supplier = item.Supplier;
        const customer = item.Customer;

        return {
          invoiceId: item.invoiceId,
          purchaseDate: item.purchaseDate,
          purchaseDescription: item.purchaseDescription,
          totalAmount: item.totalAmount,
          discount: item.discount,
          supplierId: supplier ? supplier.supplierId : customer.customerId,
          supplierName: supplier ? `${supplier.firstName}` : `${customer.firstName}`
        };
      });


      return res.status(200).json({ success: true, purchases });
    } catch (error) {
      console.error('Error retrieving purchases:', error);
      return res.status(500).json({ success: false, message: 'Failed to retrieve purchases', error: error.message });
    }
  }

  static async getPurchasesWithDetailsById(req, res) {
    try {
      const invoiceId = req.params.id;
      const rawPurchase = await Purchase.findOne({
        where: {
          invoiceId
        },
        attributes: ['invoiceId', 'purchaseDate', 'purchaseDescription', 'totalAmount', 'supplierId', 'discount', 'isCustomer', 'customerId'],
        include: [
          {
            model: Supplier,
            attributes: ['supplierId', 'firstName', 'lastName', 'shopLocation', 'phoneNumber']
          },
          {
            model: Customer,
            attributes: ['customerId', 'firstName', 'phoneNumber']
          },
        ],
        order: [
          ['invoiceId', 'DESC']
        ]
      });

      let purchase = null;

      if (rawPurchase) {
        const supplier = rawPurchase.Supplier;
        const customer = rawPurchase.Customer;

        purchase = {
          invoiceId: rawPurchase.invoiceId,
          purchaseDate: rawPurchase.purchaseDate,
          purchaseDescription: rawPurchase.purchaseDescription,
          totalAmount: rawPurchase.totalAmount,
          isCustomer: rawPurchase.isCustomer,
          supplierId: supplier ? supplier.supplierId : customer.customerId,
          supplierName: supplier ? `${supplier.firstName}` : `${customer.firstName}`,
          shopLocation: supplier ? supplier.shopLocation : null,
          supplierPhoneNumber: supplier ? supplier.phoneNumber : customer?.phoneNumber,
          discount: rawPurchase.discount
        };
      }


      if (!purchase) {
        return res.status(404).json({ success: false, message: 'Purchase not found' });
      }

      const items = await PurchaseItem.findAll({
        where: {
          invoiceId: purchase.invoiceId
        }
      });

      const itemsWithAssignments = await Promise.all(items.map(async (item) => {
        const itemAssignmentsWithoutBranchName = await PurchaseItemDistribution.findAll({
          where: {
            purchaseItemId: item.purchaseItemId
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
          unitPrice: item.unitPrice,
          totalAmount: item.totalAmount,
          discount: item.discount,
          productName: product ? product.productName : null,
          categoryName: category ? category.categoryName : null
        };

        return { productDetails, itemAssignments };
      }));

      return res.status(200).json({ success: true, purchase, itemsWithAssignments });
    } catch (error) {
      console.error('Error retrieving purchases:', error);
      return res.status(500).json({ success: false, message: 'Failed to retrieve purchases', error: error.message });
    }
  }

  static async updatePurchase(req, res) {
    const t = await db.transaction();
    try {

      const purchaseId = req.params.id;
      const { purchaseDate, purchaseDescription, totalAmount, supplierId, items, discount, branchId, isCustomer, customerId } = req.body;
      let description = `${purchaseDescription} - \nDiscount = (${discount || 0}) \n`;

      const purchase = await Purchase.findByPk(purchaseId);

      if (!purchase) {
        await t.rollback();
        return res.status(404).json({ success: false, message: 'Purchase not found' });
      }

      if (purchase.isLocked) {
        await t.rollback();
        return res.status(404).json({ success: false, message: 'Purchase has been locked. Cannot be updated' });
      }

      if ((supplierId && customerId) || (!isCustomer && customerId)) {
        await t.rollback();
        return res.status(400).json({ success: false, message: `Customer and Supplier ID error` });
      }

      let account;

      if (!purchase.isCustomer) {
        account = await Supplier.findByPk(purchase.supplierId, { transaction: t });
      } else {
        account = await Customer.findByPk(purchase.customerId, { transaction: t });
      }

      if (!account) {
        await t.rollback();
        return res.status(400).json({ success: false, message: `Account not found` });
      }

      let accountType;
      if (isCustomer) {
        accountType = await AccountType.findOne({ where: { typeName: 'customer' } });
      } else {
        accountType = await AccountType.findOne({ where: { typeName: 'supplier' } });
      }

      //find ledger info
      const productLedgerType = await LedgerType.findOne({ where: { ledgerTypeName: 'product' } });
      const entryType = await EntryType.findOne({ where: { typeName: 'P' } });
      const productAccountType = await AccountType.findOne({ where: { typeName: 'product' } });
      if (!productAccountType || !accountType || !entryType) {
        await t.rollback();
        return res.status(400).json({ success: false, message: `Account type not found` });
      }
      const purchaseLedgerType = await LedgerType.findOne({ where: { ledgerTypeName: 'purchase' } });

      let purchaseItems = await PurchaseItem.findAll({
        where: {
          invoiceId: purchase.invoiceId,
        },
        transaction: t
      });

      // Delete the purchase items and update product quantities
      for (const purchaseItem of purchaseItems) {
        let itemDistributions = await PurchaseItemDistribution.findAll({
          where: {
            purchaseItemId: purchaseItem.purchaseItemId,
          },
          transaction: t
        });

        for (const item of itemDistributions) {
          let inventoryItem = await Inventory.findOne({
            where: {
              productId: purchaseItem.productId,
              branchId: item.branchId
            },
            transaction: t
          });

          if (!inventoryItem) {
            // console.log("item: ", item)
            await t.rollback();
            return res.status(400).json({ success: false, message: `product ${purchaseItem.productId} not registered in branch ${item.branchId}` });
          } else {
            await inventoryItem.decrement('itemQuantity', { by: item.quantity, transaction: t });
            await inventoryItem.decrement('totalQuantity', { by: item.quantity, transaction: t });
            await inventoryItem.decrement('totalAmount', { by: item.quantity * purchaseItem.unitPrice, transaction: t });
          }

          const productLedger = await Ledger.findOne({
            where: {
              accountId: purchaseItem.productId,
              vNo: purchase.invoiceId,
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

        await purchaseItem.destroy({ transaction: t });
      }

      if (!isCustomer) {
        account = await Supplier.findByPk(supplierId, { transaction: t });
      } else {
        account = await Customer.findByPk(customerId, { transaction: t });
      }

      if (!account) {
        await t.rollback();
        return res.status(400).json({ success: false, message: `Account not found` });
      }


      let newPurchaseItems = [];
      let itemAssignments = [];

      // Create the purchase items
      for (const item of items) {

        const purchaseItem = await PurchaseItem.create({
          quantity: item.quantity,
          unitPrice: item.productPrice,
          totalAmount: item.totalAmount,
          productId: item.productId,
          invoiceId: purchase.invoiceId,
          discount: item.discount
        }, { transaction: t });

        const product = await Product.findByPk(item.productId)
        description += `${product.productName} -> ${item.productPrice} x ${item.quantity} - ${item.discount} = ${item.totalAmount - item.discount || 0} \n`;


        newPurchaseItems.push(purchaseItem);

        let distributionSum = 0;

        // Create the purchase item distribution
        for (const itemDistribution of item.itemAssignments) {
          distributionSum += itemDistribution.quantity

          const purchaseItemDistribution = await PurchaseItemDistribution.create({
            quantity: itemDistribution.quantity,
            branchId: itemDistribution.branchId,
            purchaseItemId: purchaseItem.dataValues.purchaseItemId
          }, { transaction: t });

          itemAssignments.push(purchaseItemDistribution);

          await Ledger.create({
            accountId: purchaseItem.productId,
            date: purchaseDate,
            vNo: purchase.invoiceId,
            description: purchaseDescription + ' @' + item.productPrice,
            debit: itemDistribution.quantity,
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
            transaction: t
          });

          if (inventoryItem) {
            // If inventory item already exists, update it
            await inventoryItem.increment('itemQuantity', { by: itemDistribution.quantity, transaction: t });
            await inventoryItem.increment('totalQuantity', { by: itemDistribution.quantity, transaction: t });
            await inventoryItem.increment('totalAmount', { by: itemDistribution.quantity * item.productPrice, transaction: t });
          } else {
            // If inventory item doesn't exist, create it
            inventoryItem = await Inventory.create({
              itemQuantity: itemDistribution.quantity,
              branchId: itemDistribution.branchId,
              productId: item.productId
            }, { transaction: t });
          }

        }

        if (distributionSum != item.quantity) {
          await t.rollback();
          return res.status(400).json({ success: false, message: `Sum of quantites of product Id ${item.productId} dont match` });
        }
      }

      await purchase.update({
        purchaseDate,
        purchaseDescription: description,
        totalAmount,
        supplierId,
        customerId,
        isCustomer,
        discount,
        branchId
      }, { transaction: t });

      const purchaseLedger = await Ledger.findOne({
        where: {
          entryTypeId: entryType.entryTypeId,
          vNo: purchase.invoiceId,
          ledgerTypeId: purchaseLedgerType.ledgerTypeId
        }
      });
      await purchaseLedger.update({
        accountId: isCustomer ? customerId : supplierId,
        date: purchaseDate,
        description: description,
        vNo: purchase.invoiceId,
        debit: totalAmount,
        branchId: branchId,
        ledgerTypeId: purchaseLedgerType.ledgerTypeId,
        entryTypeId: entryType.entryTypeId,
        accountTypeId: accountType.accountTypeId
      }, { transaction: t });

      const ledgerTypeName = !isCustomer ? 'supplier' : 'customer';
      const accountLedgerType = await LedgerType.findOne({ where: { ledgerTypeName: ledgerTypeName } });
      const supplierLedger = await Ledger.findOne({
        where: {
          entryTypeId: entryType.entryTypeId,
          vNo: purchase.invoiceId,
          ledgerTypeId: accountLedgerType.ledgerTypeId
        }
      });
      await supplierLedger.update({
        accountId: isCustomer ? customerId : supplierId,
        date: purchaseDate,
        vNo: purchase.invoiceId,
        description: description,
        credit: totalAmount,
        branchId: branchId,
        ledgerTypeId: accountLedgerType.ledgerTypeId,
        entryTypeId: entryType.entryTypeId,
        accountTypeId: accountType.accountTypeId
      }, { transaction: t });

      // await purchase.update({ purchaseDescription: description }, { transaction: t })
      // await purchaseLedger.update({ description: description }, { transaction: t })
      // await supplierLedger.update({ description: description }, { transaction: t })


      await t.commit();
      return res.status(200).json({ success: true, message: 'Purchase updated successfully', purchase, newPurchaseItems, itemAssignments });
    } catch (error) {
      console.error('Error updating purchase:', error);
      await t.rollback();
      return res.status(500).json({ success: false, message: 'Failed to update purchase', error: error.message });
    }
  }

  static async deletePurchase(req, res) {
    const t = await db.transaction();

    try {
      const purchaseId = req.params.id;

      const purchase = await Purchase.findByPk(purchaseId);

      if (!purchase) {
        await t.rollback();
        return res.status(404).json({ success: false, message: 'Purchase not found' });
      }

      if (purchase.isLocked) {
        await t.rollback();
        return res.status(404).json({ success: false, message: 'Purchase has been locked. Cannot be deleted' });
      }

      let account;

      if (!purchase.isCustomer) {
        account = await Supplier.findByPk(purchase.supplierId, { transaction: t });
      } else {
        account = await Customer.findByPk(purchase.customerId, { transaction: t });
      }

      if (!account) {
        await t.rollback();
        return res.status(400).json({ success: false, message: `Account not found` });
      }



      const ledgerTypeName = !purchase.isCustomer ? 'supplier' : 'customer';
      const accountLedgerType = await LedgerType.findOne({
        where: { ledgerTypeName: ledgerTypeName },
        transaction: t
      });

      const purchaseLedgerType = await LedgerType.findOne({ where: { ledgerTypeName: 'purchase' } });
      const productLedgerType = await LedgerType.findOne({ where: { ledgerTypeName: 'product' } });
      const entryType = await EntryType.findOne({ where: { typeName: 'P' } });
      const productAccountType = await AccountType.findOne({ where: { typeName: 'product' } });
      if (!productAccountType || !entryType) {
        await t.rollback();
        return res.status(400).json({ success: false, message: `Account type not found` });
      }

      const purchaseLedger = await Ledger.findOne({
        where: {
          vNo: purchase.invoiceId,
          ledgerTypeId: purchaseLedgerType.ledgerTypeId,
          entryTypeId: entryType.entryTypeId,
        }
      });

      await purchaseLedger.destroy({ transaction: t });

      const accountLedger = await Ledger.findOne({
        where: {
          vNo: purchase.invoiceId,
          ledgerTypeId: accountLedgerType.ledgerTypeId,
          entryTypeId: entryType.entryTypeId,
        }
      });

      await accountLedger.destroy({ transaction: t });

      let purchaseItems = await PurchaseItem.findAll({
        where: {
          invoiceId: purchase.invoiceId,
        },
        transaction: t
      });

      // Delete the purchase items and update product quantities
      for (const purchaseItem of purchaseItems) {
        let itemDistributions = await PurchaseItemDistribution.findAll({
          where: {
            purchaseItemId: purchaseItem.purchaseItemId,
          }
        });

        for (const item of itemDistributions) {
          let inventoryItem = await Inventory.findOne({
            where: {
              productId: purchaseItem.productId,
              branchId: item.branchId
            }
          });

          if (!inventoryItem) {
            await t.rollback();
            return res.status(400).json({ success: false, message: `product ${item.productId} not regiestered in branch ${item.branchId}` });
          } else {
            await inventoryItem.decrement('itemQuantity', { by: item.quantity, transaction: t });
            await inventoryItem.decrement('totalQuantity', { by: item.quantity, transaction: t });
            await inventoryItem.decrement('totalAmount', { by: item.quantity * purchaseItem.unitPrice, transaction: t });
          }

          const productLedger = await Ledger.findOne({
            where: {
              accountId: purchaseItem.productId,
              vNo: purchase.invoiceId,
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

        await purchaseItem.destroy({ transaction: t });
      }

      await purchase.destroy({ transaction: t });

      await t.commit();

      return res.status(200).json({ success: true, message: 'Purchase deleted successfully' });
    } catch (error) {
      console.error('Error deleting purchase:', error);
      await t.rollback();
      return res.status(500).json({ success: false, message: 'Failed to delete purchase', error: error.message });
    }
  }

  // static async addRecordPayment(req, res) {
  //   const t = await db.transaction();
  //   try {

  //     const { date, amountPaid, description, paymentMode, purchaseId } = req.body;

  //     const purchase = await Purchase.findByPk(purchaseId, { transaction: t });
  //     purchase.increment('amountPaid', { by: amountPaid, transaction: t })
  //     if (purchase.amountPaid >= purchase.totalAmount) {
  //       purchase.update({ paymentStatus: 'paid', transaction: t });
  //     }

  //     const supplier = await Supplier.findByPk(purchase.supplierId, { transaction: t });
  //     await supplier.decrement('amountDue', { by: amountPaid, transaction: t });

  //     const purchaseLedger = await LedgerType.findOne({ where: { ledgerTypeName: 'purchase' } });
  //     await Cashbook.create({
  //       accountId: purchase.supplierId,
  //       invoiceId: purchase.invoiceId,
  //       accountName: supplier ? `${supplier.firstName} ${supplier.lastName}` : null,
  //       description: description,
  //       paymentMethod: paymentMode,
  //       receipt: 0,
  //       payment: amountPaid,
  //       date: date,
  //       ledgerTypeId: purchaseLedger.ledgerTypeId
  //     })
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

  //     const purchaseId = req.params.id;
  //     const rawRecord = await Purchase.findByPk(purchaseId, {
  //       include: [{
  //         model: Supplier,
  //         attributes: ['firstName', 'lastName', 'shopLocation', 'shopName', 'phoneNumber']
  //       }],
  //     });

  //     if (!rawRecord) {
  //       return res.status(404).json({ success: false, message: 'Record not found' });
  //     }

  //     let record = null;
  //     if (rawRecord) {
  //       const supplier = rawRecord.Supplier; // Access Supplier directly

  //       record = {
  //         purchaseId,
  //         supplierId: rawRecord.supplierId,
  //         supplierName: supplier ? `${supplier.firstName} ${supplier.lastName}` : null,
  //         purchaseDate: rawRecord.purchaseDate,
  //         shopLocation: supplier ? supplier.shopLocation : null,
  //         shopName: supplier ? supplier.shopName : null,
  //         phoneNumber: supplier ? supplier.phoneNumber : null,
  //         paymentStatus: rawRecord.paymentStatus,
  //         totalAmount: rawRecord.totalAmount,
  //         amountPaid: rawRecord.amountPaid,
  //         amountRemaining: rawRecord.totalAmount - rawRecord.amountPaid,
  //       };
  //     }

  //     return res.status(200).json({ success: true, record });
  //   } catch (error) {
  //     console.error('Error recording payment:', error);
  //     return res.status(500).json({ success: false, message: 'Failed to record payment', error: error.message });
  //   }
  // }
}

module.exports = PurchaseController;
