'use strict';

const Customer = require('../models/customerModel');
const Ledger = require('../models/ledgerModel');
const LedgerType = require('../models/ledgerTypeModel');
const Supplier = require('../models/supplierModel');
const db = require('../../config/dbConfig');
const Product = require('../models/productModel');
const Branch = require('../models/branchModel');

class LedgerController {

  static async getCustomerLedgerById(req, res) {
    try {
      const customerId = req.params.id;
      const customerData = await Customer.findByPk(customerId, {
        attributes: ['customerId', 'firstName']
      });

      const ledgerType = await LedgerType.findOne({
        where: {
          ledgerTypeName: 'customer'
        }
      })

      const rawLedger = await Ledger.findAll({
        where: {
          ledgerTypeId: ledgerType.ledgerTypeId,
          accountId: customerId
        },
        attributes: ['date', 'vNo', 'description', 'debit', 'credit'],
        order: [
          ['date', 'ASC']
        ]
      })

      let balance = 0;

      const ledger = rawLedger.map(entry => {
        balance += entry.debit - entry.credit;

        return {
          date: entry.date,
          vNo: entry.vNo,
          description: entry.description,
          debit: entry.debit,
          credit: entry.credit,
          balance
        };
      });

      return res.status(200).json({
        success: true,
        customerData,
        entries: ledger
      });

    } catch (error) {

      console.error('Error retrieving ledger entries:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve ledger entries',
        error: error.message
      });

    }
  }

  static async getSupplierLedgerById(req, res) {
    try {
      const supplierId = req.params.id;
      const supplierData = await Supplier.findByPk(supplierId, {
        attributes: ['supplierId', 'firstName']
      });

      const ledgerType = await LedgerType.findOne({
        where: {
          ledgerTypeName: 'supplier'
        }
      })

      const rawLedger = await Ledger.findAll({
        where: {
          ledgerTypeId: ledgerType.ledgerTypeId,
          accountId: supplierId
        },
        attributes: ['date', 'vNo', 'description', 'debit', 'credit'],
        order: [
          ['date', 'ASC']
        ]
      })

      let balance = 0;

      const ledger = rawLedger.map(entry => {
        balance += entry.debit - entry.credit;

        return {
          date: entry.date,
          vNo: entry.vNo,
          description: entry.description,
          debit: entry.debit,
          credit: entry.credit,
          balance
        };
      });

      return res.status(200).json({
        success: true,
        supplierData,
        entries: ledger
      });

    } catch (error) {

      console.error('Error retrieving ledger entries:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve ledger entries',
        error: error.message
      });

    }
  }

  static async getProductLedgerByBranchId(req, res) {
    try {
      const { productId, branchId } = req.params;
      const productData = await Product.findByPk(productId, {
        attributes: ['productId', 'productName']
      });

      const ledgerType = await LedgerType.findOne({
        where: {
          ledgerTypeName: 'product',
        }
      })

      const rawLedger = await Ledger.findAll({
        where: {
          ledgerTypeId: ledgerType.ledgerTypeId,
          accountId: productId,
          branchId: branchId
        },
        attributes: ['date', 'vNo', 'description', 'debit', 'credit'],
        order: [
          ['date', 'ASC']
        ]
      })

      let balance = 0;

      const ledger = rawLedger.map(entry => {
        balance += entry.debit - entry.credit;

        return {
          date: entry.date,
          vNo: entry.vNo,
          description: entry.description,
          debit: entry.debit,
          credit: entry.credit,
          balance
        };
      });

      return res.status(200).json({
        success: true,
        productData,
        entries: ledger
      });

    } catch (error) {

      console.error('Error retrieving ledger entries:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve ledger entries',
        error: error.message
      });

    }
  }

  static async getProductLedgerById(req, res) {
    try {
      const productId = req.params.id;

      // Fetch product data
      const productData = await Product.findByPk(productId, {
        attributes: ['productId', 'productName']
      });

      // Fetch the ledger type for product
      const ledgerType = await LedgerType.findOne({
        where: {
          ledgerTypeName: 'product',
        }
      });

      // Fetch the raw ledger entries
      const rawLedger = await Ledger.findAll({
        where: {
          ledgerTypeId: ledgerType.ledgerTypeId,
          accountId: productId
        },
        attributes: ['date', 'vNo', 'description', 'debit', 'credit', 'branchId', 'accountId'],
        order: [
          ['date', 'ASC']
        ],
        include: [
          { model: Branch, attributes: ['branchName'] },
        ]
      });

      let balance = 0;

      // Map the ledger entries to include the necessary details
      const ledger = rawLedger.map(entry => {
        balance += entry.debit - entry.credit;

        // const accountName = `${entry.Customer.firstName} ${entry.Customer.lastName}`;
        const branchName = entry.Branch.branchName;

        return {
          date: entry.date,
          vNo: entry.vNo,
          description: ` Branch: ${branchName} ${entry.description} `,
          debit: entry.debit,
          credit: entry.credit,
          balance
        };
      });

      // Return the response
      return res.status(200).json({
        success: true,
        productData,
        entries: ledger
      });

    } catch (error) {
      console.error('Error retrieving ledger entries:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve ledger entries',
        error: error.message
      });
    }
  }


  // static async getCustomerTrialBalance(req, res) {
  //   try {
  //     const customers = await Customer.findAll({
  //       attributes: ['customerId', 'firstName'],
  //       where: {
  //         isDeleted: false
  //       }
  //     });

  //     const ledgerType = await LedgerType.findOne({
  //       where: {
  //         ledgerTypeName: 'customer'
  //       }
  //     })

  //     const customerList = await Promise.all(customers.map(async customer => {
  //       const ledgerEntries = await Ledger.findAll({
  //         where: {
  //           accountId: customer.customerId,
  //           ledgerTypeId: ledgerType.ledgerTypeId,
  //         },
  //         attributes: ['debit', 'credit']
  //       });

  //       const balance = ledgerEntries.reduce((acc, entry) => acc + entry.debit - entry.credit, 0);

  //       return {
  //         customerId: customer.customerId,
  //         firstName: customer.firstName,
  //         balance
  //       };
  //     }));

  //     return res.status(200).json({
  //       success: true,
  //       customers: customerList
  //     });
  //   } catch (error) {
  //     console.error('Error retrieving customers with balance:', error);
  //     return res.status(500).json({
  //       success: false,
  //       message: 'Failed to retrieve customers with balance',
  //       error: error.message
  //     });
  //   }
  // }

  static async getCustomerTrialBalance(req, res) {
    try {

      const ledgerType = await LedgerType.findOne({
        where: {
          ledgerTypeName: 'customer'
        }
      })

      const ledgerTypeId = ledgerType.ledgerTypeId;

      const customerListQuery = `
      SELECT 
    c.customerId, 
    c.firstName, 
    COALESCE(SUM(l.debit), 0) - COALESCE(SUM(l.credit), 0) AS balance,
    b.branchName
FROM customers c
LEFT JOIN ledger l ON c.customerId = l.accountId AND l.ledgerTypeId =${ledgerTypeId}
LEFT JOIN branches b ON l.branchId = b.branchId
WHERE c.isDeleted = 0
GROUP BY c.customerId, c.firstName;
    `;
      const customerList = await db.query(customerListQuery, { type: 'SELECT' });

      return res.status(200).json({
        success: true,
        customers: customerList
      });
    } catch (error) {
      console.error('Error retrieving customers with balance:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve customers with balance',
        error: error.message
      });
    }
  }

  static async getSupplierTrialBalance(req, res) {
    try {
      const ledgerType = await LedgerType.findOne({
        where: {
          ledgerTypeName: 'supplier'
        }
      })

      const ledgerTypeId = ledgerType.ledgerTypeId;

      const supplierListQuery = `
     SELECT 
    s.supplierId, 
    s.firstName, 
    COALESCE(SUM(l.debit), 0) - COALESCE(SUM(l.credit), 0) AS balance,
    b.branchName
FROM suppliers s
LEFT JOIN ledger l ON s.supplierId = l.accountId AND l.ledgerTypeId = ${ledgerTypeId}
LEFT JOIN branches b ON l.branchId = b.branchId
WHERE s.isDeleted = 0
GROUP BY s.supplierId, s.firstName;
    `;
      const supplierList = await db.query(supplierListQuery, { type: 'SELECT' });

      return res.status(200).json({
        success: true,
        suppliers: supplierList
      });
    } catch (error) {
      console.error('Error retrieving suppliers with balance:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve suppliers with balance',
        error: error.message
      });
    }
  }
  static async getCustomerTrialBalanceByBranch(req, res) {
    try {

      const branchId = req.params.id;

      if (!branchId) {
        return res.status(404).json({ success: false, message: 'Branch not found' });
      }

      const ledgerType = await LedgerType.findOne({
        where: {
          ledgerTypeName: 'customer'
        }
      })

      const ledgerTypeId = ledgerType.ledgerTypeId;

      const customerListQuery = `
      SELECT 
        c.customerId, 
        c.firstName, 
        COALESCE(SUM(l.debit), 0) - COALESCE(SUM(l.credit), 0) AS balance
      FROM customers c
      LEFT JOIN ledger l ON c.customerId = l.accountId AND l.ledgerTypeId = ${ledgerTypeId}
      WHERE c.isDeleted = 0 AND c.branchId = ${branchId}
      GROUP BY c.customerId, c.firstName
    `;
      const customerList = await db.query(customerListQuery, { type: 'SELECT' });

      return res.status(200).json({
        success: true,
        customers: customerList
      });
    } catch (error) {
      console.error('Error retrieving customers with balance:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve customers with balance',
        error: error.message
      });
    }
  }

  static async getSupplierTrialBalanceByBranch(req, res) {
    try {

      const branchId = req.params.id;

      if (!branchId) {
        return res.status(404).json({ success: false, message: 'Branch not found' });
      }

      const ledgerType = await LedgerType.findOne({
        where: {
          ledgerTypeName: 'supplier'
        }
      })

      const ledgerTypeId = ledgerType.ledgerTypeId;

      const supplierListQuery = `
      SELECT 
        s.supplierId, 
        s.firstName, 
        COALESCE(SUM(l.debit), 0) - COALESCE(SUM(l.credit), 0) AS balance
      FROM suppliers s
      LEFT JOIN ledger l ON s.supplierId = l.accountId AND l.ledgerTypeId = ${ledgerTypeId}
      WHERE s.isDeleted = 0 AND s.branchId = ${branchId}
      GROUP BY s.supplierId, s.firstName
    `;
      const supplierList = await db.query(supplierListQuery, { type: 'SELECT' });

      return res.status(200).json({
        success: true,
        suppliers: supplierList
      });
    } catch (error) {
      console.error('Error retrieving suppliers with balance:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve suppliers with balance',
        error: error.message
      });
    }
  }

  // static async getSupplierTrialBalance(req, res) {
  //   try {
  //     const suppliers = await Supplier.findAll({
  //       attributes: ['supplierId', 'firstName'],
  //       where: {
  //         isDeleted: false
  //       }
  //     });

  //     const ledgerType = await LedgerType.findOne({
  //       where: {
  //         ledgerTypeName: 'supplier'
  //       }
  //     })

  //     const supplierList = await Promise.all(suppliers.map(async supplier => {
  //       const ledgerEntries = await Ledger.findAll({
  //         where: {
  //           accountId: supplier.supplierId,
  //           ledgerTypeId: ledgerType.ledgerTypeId,
  //         },
  //         attributes: ['debit', 'credit']
  //       });

  //       const balance = ledgerEntries.reduce((acc, entry) => acc + entry.debit - entry.credit, 0);

  //       return {
  //         supplierId: supplier.supplierId,
  //         firstName: supplier.firstName,
  //         balance
  //       };
  //     }));

  //     return res.status(200).json({
  //       success: true,
  //       supplier: supplierList
  //     });
  //   } catch (error) {
  //     console.error('Error retrieving suppliers with balance:', error);
  //     return res.status(500).json({
  //       success: false,
  //       message: 'Failed to retrieve suppliers with balance',
  //       error: error.message
  //     });
  //   }
  // }

}

module.exports = LedgerController;