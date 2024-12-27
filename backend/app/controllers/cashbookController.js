'use-strict'

const Branch = require('../models/branchModel');
const Cashbook = require('../models/cashBookModel');
const Customer = require('../models/customerModel');
const LedgerType = require('../models/ledgerTypeModel');
const Supplier = require('../models/supplierModel');
const db = require('../../config/dbConfig');
const Ledger = require('../models/ledgerModel');
const PaymentMethod = require('../models/paymentMethodModel');

class CashbookController {
  static async createCashbookEntry(req, res) {
    const t = await db.transaction();
    try {
      const {
        branchId,
        accountId,
        accountName,
        description,
        receipt,
        payment,
        date,
        ledgerTypeId,
        paymentMethodId
      } = req.body;

      if (!branchId || !paymentMethodId || !ledgerTypeId || (!receipt && !payment)) {
        await t.rollback();
        const errorMessage = `Required fields missing:branchId, paymentMethodId, ledgerTypeId, receipt, payment`;
        console.error(errorMessage);
        return res.status(500).json({
          success: false,
          message: errorMessage,
          error: `fields missing: ${branchId}, ${paymentMethodId}, ${ledgerTypeId}, ${receipt}, ${payment}`
        });
      }

      if ((ledgerTypeId == 1 || ledgerTypeId == 2) && (!accountId || !accountName)) {
        await t.rollback();
        const errorMessage = `Required fields missing for ledgerTypeId ${ledgerTypeId}: accountId, accountName`;
        console.error(errorMessage);
        return res.status(500).json({
          success: false,
          message: errorMessage,
          error: `account ID / name missing: ${accountId}, ${accountName}`
        });
      }

      const ledger = await Ledger.create({
        accountId: accountId,
        date: date,
        description: description,
        debit: payment ? payment : 0,
        credit: receipt ? receipt : 0,
        branchId: branchId,
        ledgerTypeId: ledgerTypeId
      }, { transaction: t });

      const newCashbookEntry = await Cashbook.create({
        branchId,
        accountId,
        accountName,
        description,
        receipt,
        payment,
        date,
        ledgerTypeId,
        paymentMethodId,
        ledgerId: ledger.ledgerId
      }, { transaction: t });

      await ledger.update({ vNo: newCashbookEntry.cashbookId }, { transaction: t })

      await t.commit();

      return res.status(201).json({
        success: true,
        message: 'Cashbook entry created successfully',
        entry: newCashbookEntry
      });
    } catch (error) {
      console.error('Error creating cashbook entry:', error);
      await t.rollback();
      return res.status(500).json({
        success: false,
        message: 'Failed to create cashbook entry',
        error: error.message
      });
    }
  }

  static async transferToNoorani(req, res) {
    const t = await db.transaction();

    try {
      const { fromBranchId, toBranchId, amount, date } = req.body;

      if (!fromBranchId || !toBranchId || !amount) {
        await t.rollback();
        const errorMessage = `Required fields missing: fromBranchId, toBranchId, amount`;
        console.error(errorMessage);
        return res.status(500).json({
          success: false,
          message: errorMessage,
          error: `fields missing: ${fromBranchId}, ${toBranchId}, ${amount}`
        });
      }

      // Find necessary ledger types and entities
      const transferLedgerType = await LedgerType.findOne({ where: { ledgerTypeName: 'transfer' } });
      const fromBranch = await Branch.findByPk(fromBranchId);
      const paymentMethod = await PaymentMethod.findOne({ where: { paymentMethodName: 'cash' } });
      const toBranch = await Branch.findByPk(toBranchId);

      // Validation checks
      if (!fromBranch || !paymentMethod || !toBranch) {
        throw new Error('Invalid branch or payment method');
      }

      if (fromBranch.branchId === toBranch.branchId) {
        throw new Error('Cannot transfer to same branch');
      }

      // Transfer cash from branch to Noorani
      const transferDescription = `transferred cash from ${fromBranch.branchName} to ${toBranch.branchName}`;

      const branchLedger = await Ledger.create({
        date,
        description: transferDescription,
        debit: amount,
        fromBranchId,
        ledgerTypeId: transferLedgerType.ledgerTypeId
      }, { transaction: t });

      const branchCashbookEntry = await Cashbook.create({
        branchId: fromBranchId,
        description: transferDescription,
        payment: amount,
        date,
        ledgerTypeId: transferLedgerType.ledgerTypeId,
        paymentMethodId: paymentMethod.paymentMethodId,
        ledgerId: branchLedger.ledgerId
      }, { transaction: t });

      await branchLedger.update({ vNo: branchCashbookEntry.cashbookId }, { transaction: t });

      // Add cash to Branch ( stil called noorani)
      const nooraniLedger = await Ledger.create({
        date,
        description: transferDescription,
        credit: amount,
        branchId: toBranchId,
        ledgerTypeId: transferLedgerType.ledgerTypeId
      }, { transaction: t });

      const nooraniCashbookEntry = await Cashbook.create({
        branchId: toBranchId,
        description: transferDescription,
        receipt: amount,
        date,
        ledgerTypeId: transferLedgerType.ledgerTypeId,
        paymentMethodId: paymentMethod.paymentMethodId,
        ledgerId: nooraniLedger.ledgerId
      }, { transaction: t });

      await nooraniLedger.update({ vNo: nooraniCashbookEntry.cashbookId }, { transaction: t });

      // Commit the transaction
      await t.commit();

      return res.status(201).json({
        success: true,
        message: 'Transferred successfully'
      });
    } catch (error) {
      await t.rollback();
      return res.status(500).json({
        success: false,
        message: 'Transfer failed',
        error: error.message
      });
    }
  }


  static async directTransfer(req, res) {
    const t = await db.transaction();
    try {
      const {
        branchId,
        description,
        date,
        fromId,
        fromLedgerId,
        toId,
        toLedgerId,
        transferAmount,
      } = req.body;

      if (!branchId || !fromId || !fromLedgerId || !toId || !toLedgerId || !transferAmount) {
        await t.rollback();
        const errorMessage = `Required fields missing: branchId, fromId, fromLedgerId, toId, toLedgerId, transferAmount`;
        console.error(errorMessage);
        return res.status(500).json({
          success: false,
          message: errorMessage,
          error: `fields missing: ${branchId}, ${fromId}, ${fromLedgerId}, ${toId}, ${toLedgerId}, ${transferAmount}`
        });
      }

      const paymentMethod = await PaymentMethod.findOne({ where: { paymentMethodName: 'cash' } });
      if (!paymentMethod) {
        await t.rollback();
        return res.status(500).json({
          success: false,
          message: 'Payment Method cash not found'
        });
      }

      const paymentMethodId = paymentMethod.paymentMethodId

      // Fetch ledger types for from and to accounts
      const [fromLedgerType, toLedgerType] = await Promise.all([
        LedgerType.findByPk(fromLedgerId),
        LedgerType.findByPk(toLedgerId)
      ]);

      // Check if ledger types exist
      if (!fromLedgerType || !toLedgerType) {
        await t.rollback();
        return res.status(500).json({
          success: false,
          message: 'Ledger type not found'
        });
      }

      // Fetch from and to accounts based on ledger types
      let fromAccount, toAccount;
      if (fromLedgerType.ledgerTypeName === 'customer') {
        fromAccount = await Customer.findByPk(fromId);
      } else if (fromLedgerType.ledgerTypeName === 'supplier') {
        fromAccount = await Supplier.findByPk(fromId);
      }

      if (toLedgerType.ledgerTypeName === 'customer') {
        toAccount = await Customer.findByPk(toId);
      } else if (toLedgerType.ledgerTypeName === 'supplier') {
        toAccount = await Supplier.findByPk(toId);
      }


      // Check if accounts exist
      if (!fromAccount || !toAccount) {
        await t.rollback();
        return res.status(500).json({
          success: false,
          message: 'Account not found'
        });
      }

      // Create ledger entries for both accounts
      const [fromLedgerEntry, toLedgerEntry] = await Promise.all([
        Ledger.create({
          accountId: fromId,
          date,
          description,
          credit: transferAmount,
          branchId,
          ledgerTypeId: fromLedgerType.ledgerTypeId
        }, { transaction: t }),
        Ledger.create({
          accountId: toId,
          date,
          description,
          debit: transferAmount,
          branchId,
          ledgerTypeId: toLedgerType.ledgerTypeId
        }, { transaction: t })
      ]);

      // Create cashbook entries for both accounts
      const [fromCashbook, toCashbook] = await Promise.all([
        Cashbook.create({
          branchId,
          accountId: fromId,
          accountName: fromAccount.firstName,
          description,
          receipt: transferAmount,
          date,
          ledgerTypeId: fromLedgerType.ledgerTypeId,
          paymentMethodId: paymentMethodId,
          ledgerId: fromLedgerEntry.ledgerId
        }, { transaction: t }),
        Cashbook.create({
          branchId,
          accountId: toId,
          accountName: toAccount.firstName,
          description,
          payment: transferAmount,
          date,
          ledgerTypeId: toLedgerType.ledgerTypeId,
          paymentMethodId: paymentMethodId,
          ledgerId: toLedgerEntry.ledgerId
        }, { transaction: t })
      ]);

      // Update ledger entries with cashbook IDs
      await Promise.all([
        fromLedgerEntry.update({ vNo: fromCashbook.cashbookId }, { transaction: t }),
        toLedgerEntry.update({ vNo: toCashbook.cashbookId }, { transaction: t })
      ]);

      // Commit transaction
      await t.commit();

      return res.status(201).json({
        success: true,
        message: 'Transfer successful'
      });
    } catch (error) {
      await t.rollback();
      console.error('Error creating cashbook entry:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create cashbook entry',
        error: error.message
      });
    }
  }


  static async getCashbookEntries(req, res) {
    try {
      const rawCashbookEntries = await Cashbook.findAll({
        include: [
          {
            model: Branch,
            attributes: ['branchName']
          },
          {
            model: LedgerType,
            attributes: ['ledgerTypeName']
          },
          {
            model: PaymentMethod,
            attributes: ['paymentMethodName']
          }
        ],
        order: [
          ['cashbookId', 'DESC']
        ]
      });

      const paymentMethod = await PaymentMethod.findOne({
        where: {
          paymentMethodName: 'cash'
        }
      })

      // const cashInHand = rawCashbookEntries.reduce((sum, entry) => {
      //   // console.log('sum:', sum, 'entry:', entry.PaymentMethod.paymentMethodName);
      //   const debit = entry.receipt || 0;
      //   const credit = entry.payment || 0;
      //   return entry.PaymentMethod.paymentMethodName == 'cash' ? sum + (debit - credit) : 0;
      // }, 0);

      const cashbookEntries = rawCashbookEntries.map(item => {
        const branch = item.Branch;
        const paymentMethod = item.PaymentMethod;
        const ledgerType = item.LedgerType

        return {
          cashbookId: item.cashbookId,
          accountId: item.accountId,
          invoiceId: item.invoiceId,
          accountName: item.accountName,
          description: item.description,
          paymentMethod: paymentMethod ? paymentMethod.paymentMethodName : null,
          receipt: item.receipt,
          payment: item.payment,
          date: item.date,
          ledgerTypeId: item.ledgerTypeId,
          ledgerTypeName: ledgerType ? ledgerType.ledgerTypeName : null,
          branchId: item.branchId,
          branchName: branch ? branch.branchName : null,
        };
      });

      const resultBoth = await Cashbook.findOne({
        attributes: [
          [
            db.literal('(COALESCE(SUM(receipt), 0) - COALESCE(SUM(payment), 0))'),
            'cashInHand'
          ]
        ],
        where: {
          paymentMethodId: paymentMethod.paymentMethodId
        }
      });

      return res.status(200).json({
        success: true,
        entries: cashbookEntries,
        cashInHand: resultBoth
      });
    } catch (error) {
      console.error('Error retrieving cashbook entries:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve cashbook entries',
        error: error.message
      });
    }
  }

  static async getCashbookEntriesByBranch(req, res) {
    try {
      const branchId = req.params.id;
      const branchStatus = await Branch.findByPk(branchId);
      if (!branchStatus) {
        return res.status(404).json({
          success: false,
          message: 'branch not found'
        });
      }

      const rawCashbookEntries = await Cashbook.findAll({
        include: [
          {
            model: Branch,
            attributes: ['branchName']
          },
          {
            model: LedgerType,
            attributes: ['ledgerTypeName']
          },
          {
            model: PaymentMethod,
            attributes: ['paymentMethodName']
          }
        ],
        order: [
          ['cashbookId', 'DESC']
        ],
        where: {
          branchId: branchId
        }
      });

      const paymentMethod = await PaymentMethod.findOne({
        where: {
          paymentMethodName: 'cash'
        }
      })

      // const cashInHand = rawCashbookEntries.reduce((sum, entry) => {
      //   // console.log('sum:', sum, 'entry:', entry);
      //   const debit = entry.receipt || 0;
      //   const credit = entry.payment || 0;
      //   return entry.PaymentMethod.paymentMethodName == 'cash' ? sum + (debit - credit) : 0;
      // }, 0);

      const cashbookEntries = rawCashbookEntries.map(item => {
        const branch = item.Branch;
        const ledgerType = item.LedgerType
        const paymentMethod = item.PaymentMethod;

        return {
          cashbookId: item.cashbookId,
          accountId: item.accountId,
          invoiceId: item.invoiceId,
          accountName: item.accountName,
          description: item.description,
          paymentMethod: paymentMethod ? paymentMethod.paymentMethodName : null,
          receipt: item.receipt,
          payment: item.payment,
          date: item.createdAt,
          ledgerTypeId: item.ledgerTypeId,
          ledgerTypeName: ledgerType ? ledgerType.ledgerTypeName : null,
          branchId: item.branchId,
          branchName: branch ? branch.branchName : null,
        };
      });

      const resultBoth = await Cashbook.findOne({
        attributes: [
          [
            db.literal('(COALESCE(SUM(receipt), 0) - COALESCE(SUM(payment), 0))'),
            'cashInHand'
          ]
        ],
        where: {
          paymentMethodId: paymentMethod.paymentMethodId,
          branchId: branchId,
        }
      });



      return res.status(200).json({
        success: true,
        entries: cashbookEntries,
        cashInHand: resultBoth
      });
    } catch (error) {
      console.error('Error retrieving cashbook entries:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve cashbook entries',
        error: error.message
      });
    }
  }

  static async getAccounts(req, res) {

    const branchId = req.params.id;

    const branchStatus = await Branch.findByPk(branchId)

    if (!branchStatus) {
      return res.status(404).json({
        success: false,
        message: 'branch not found'
      });
    }

    let Suppliers;
    let Customers;
    if (branchStatus.role == 'admin') {
      Suppliers = await Supplier.findAll({
        attributes: ['supplierId', 'firstName'],
        where: {
          isDeleted: false,
        },
      });

      const rawCustomers = await Customer.findAll({
        attributes: ['customerId', 'firstName', 'branchId'],
        where: {
          isDeleted: false
        },
        include: [
          {
            model: Branch,
            attributes: ['branchName']
          }
        ]
      });

      Customers = rawCustomers.map(customer => {
        const branch = customer.Branch;

        return {
          customerId: customer.customerId,
          firstName: customer ? `${customer.firstName}` : null,
          branchId: customer.branchId,
          branchName: branch ? branch.branchName : null
        }
      })

    } else {
      Suppliers = await Supplier.findAll({
        attributes: ['supplierId', 'firstName'],
        where: {
          isDeleted: false,
        },
      });

      const rawCustomers = await Customer.findAll({
        attributes: ['customerId', 'firstName', 'branchId'],
        where: {
          branchId,
          isDeleted: false
        },
        include: [
          {
            model: Branch,
            attributes: ['branchName']
          }
        ]
      });

      Customers = rawCustomers.map(customer => {
        const branch = customer.Branch;

        return {
          customerId: customer.customerId,
          firstName: customer ? `${customer.firstName}` : null,
          branchId: customer.branchId,
          branchName: branch ? branch.branchName : null
        }
      })
    }


    return res.status(200).json({
      success: true,
      Customers,
      Suppliers
    });
  }

  static async getCashbookEntryById(req, res) {
    try {
      const cashbookId = req.params.id;
      const cashbookEntry = await Cashbook.findByPk(cashbookId, {
        include: [
          {
            model: Branch,
            attributes: ['branchName']
          },
          {
            model: LedgerType,
            attributes: ['ledgerTypeName']
          },
          {
            model: PaymentMethod,
            attributes: ['paymentMethodName']
          }
        ]
      });

      if (!cashbookEntry) {
        return res.status(404).json({
          success: false,
          message: 'Cashbook entry not found'
        });
      }

      return res.status(200).json({
        success: true,
        entry: cashbookEntry
      });
    } catch (error) {
      console.error('Error retrieving cashbook entry:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve cashbook entry',
        error: error.message
      });
    }
  }

  static async updateCashbookEntry(req, res) {
    const t = await db.transaction();
    try {
      const cashbookId = req.params.id;
      const {
        accountId,
        branchId,
        accountName,
        description,
        paymentMethodId,
        receipt,
        payment,
        date,
        ledgerTypeId
      } = req.body;

      // if (!paymentMethodId || !ledgerTypeId || (!receipt && !payment)) {
      //   await t.rollback();
      //   const errorMessage = `Required fields missing: paymentMethodId, ledgerTypeId, receipt, payment`;
      //   console.error(errorMessage);
      //   return res.status(500).json({
      //     success: false,
      //     message: errorMessage,
      //     error: `fields missing: ${paymentMethodId}, ${ledgerTypeId}, ${receipt}, ${payment}`
      //   });
      // }

      // if ((ledgerTypeId == 1 || ledgerTypeId == 2) && (!accountId || !accountName)) {
      //   await t.rollback();
      //   const errorMessage = `Required fields missing for ledgerTypeId ${ledgerTypeId}: accountId, accountName`;
      //   console.log(errorMessage);

      //   return res.status(500).json({
      //     success: false,
      //     message: errorMessage,
      //     error: `account ID / name missing: ${accountId}, ${accountName}`
      //   });
      // }

      const cashbook = await Cashbook.findByPk(cashbookId)
      const ledger = await Ledger.findByPk(cashbook.ledgerId);

      await ledger.update({
        accountId: accountId,
        date: date,
        description: description,
        debit: payment ? payment : 0,
        credit: receipt ? receipt : 0,
        branchId: branchId,
        ledgerTypeId: ledgerTypeId
      }, { transaction: t })

      const updatedCashbookEntry = await cashbook.update({
        accountId,
        branchId,
        accountName,
        description,
        paymentMethodId,
        receipt,
        payment,
        date,
        ledgerTypeId
      }, { transaction: t });

      await t.commit()
      return res.status(200).json({
        success: true,
        message: 'Cashbook entry updated successfully',
        result: updatedCashbookEntry
      });
    } catch (error) {
      await t.rollback()
      console.error('Error updating cashbook entry:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update cashbook entry',
        error: error.message
      });
    }
  }

  static async deleteCashbookEntry(req, res) {
    try {
      const cashbookId = req.params.id;

      const cashbook = await Cashbook.findByPk(cashbookId)
      const ledger = await Ledger.findByPk(cashbook.ledgerId);

      if (!cashbook || !ledger) {
        return res.status(404).json({
          success: false,
          message: 'Entry not found'
        });
      }


      await cashbook.destroy();
      await ledger.destroy();

      return res.status(200).json({
        success: true,
        message: 'Cashbook entry deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting cashbook entry:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete cashbook entry',
        error: error.message
      });
    }
  }
}

module.exports = CashbookController;
