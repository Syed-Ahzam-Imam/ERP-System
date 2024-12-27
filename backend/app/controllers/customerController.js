'use strict';

const Branch = require('../models/branchModel');
const Customer = require('../models/customerModel');
const Ledger = require('../models/ledgerModel');
const LedgerType = require('../models/ledgerTypeModel');
const moment = require('moment');
const db = require('../../config/dbConfig');
const EntryType = require('../models/entryTypeModel');

class CustomerController {
  static async createCustomer(req, res) {
    const t = await db.transaction();
    try {
      const { firstName, lastName, email, phoneNumber, branchId, address, city, amountDue } = req.body;
      const customer = await Customer.create({ firstName, lastName, email, phoneNumber, branchId, address, city, amountDue }, { transaction: t });

      if (amountDue && amountDue != 0) {
        const ledgerType = await LedgerType.findOne({ where: { ledgerTypeName: 'customer' } });
        const entryType = await EntryType.findOne({ where: { typeName: 'OB' } });

        await Ledger.create({
          accountId: customer.customerId,
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
      return res.status(201).json({ success: true, message: 'Customer created successfully', customer });
    } catch (error) {
      await t.rollback();
      console.error('Error creating customer:', error);
      return res.status(500).json({ success: false, message: 'Failed to create customer', error: error.message });
    }
  }

  static async getAllCustomers(req, res) {
    try {
      const getCustomers = await Customer.findAll({
        include: [{
          model: Branch,
          attributes: ['branchName']
        }],
        order: [
          ['firstName', 'ASC']
        ],
        where: {
          isDeleted: false,
        },
      });


      const customers = getCustomers.map(customer => {
        const { customerId, firstName, lastName, email, phoneNumber, address, city, amountDue, Branch } = customer;
        const branchName = Branch ? Branch.dataValues?.branchName : null;

        return {
          customerId,
          firstName,
          lastName,
          email,
          phoneNumber,
          address,
          city,
          amountDue,
          branchName
        };
      });

      return res.status(200).json({ success: true, customers });
    } catch (error) {
      console.error('Error retrieving customers:', error);
      return res.status(500).json({ success: false, message: 'Failed to retrieve customers', error: error.message });
    }
  }
  static async getAllCustomersByBranch(req, res) {
    try {
      const branchId = req.params.id;
      const getCustomers = await Customer.findAll({
        include: [{
          model: Branch,
          attributes: ['branchName']
        }],
        order: [
          ['firstName', 'ASC']
        ],
        where: {
          isDeleted: false,
          branchId: branchId
        },
      });

      const customers = getCustomers.map(customer => {
        const { customerId, firstName, lastName, email, phoneNumber, address, city, amountDue, Branch } = customer;
        const branchName = Branch ? Branch.dataValues?.branchName : null;

        return {
          customerId,
          firstName,
          lastName,
          email,
          phoneNumber,
          address,
          city,
          amountDue,
          branchName
        };
      });

      return res.status(200).json({ success: true, customers });
    } catch (error) {
      console.error('Error retrieving customers:', error);
      return res.status(500).json({ success: false, message: 'Failed to retrieve customers', error: error.message });
    }
  }

  static async getCustomerById(req, res) {
    try {
      const customer = await Customer.findByPk(req.params.id);

      if (!customer) {
        return res.status(404).json({ success: false, message: 'Customer not found' });
      }

      return res.status(200).json({ success: true, customer });
    } catch (error) {
      console.error('Error retrieving customer:', error);
      return res.status(500).json({ success: false, message: 'Failed to retrieve customer', error: error.message });
    }
  }
  static async getCustomerLedgerById(req, res) {
    try {
      const customerId = req.params.id;
      const ledgerType = await LedgerType.findOne({ where: { ledgerTypeName: 'customer' } });
      const customerLedger = await Ledger.findAll({
        where: {
          ledgerTypeId: ledgerType.ledgerTypeId,
          accountId: customerId
        }
      });

      if (!customerLedger) {
        return res.status(404).json({ success: false, message: 'Customer Ledger not found' });
      }

      return res.status(200).json({ success: true, customerLedger });
    } catch (error) {
      console.error('Error retrieving customer:', error);
      return res.status(500).json({ success: false, message: 'Failed to retrieve customer ledger', error: error.message });
    }
  }

  static async updateCustomer(req, res) {
    const t = await db.transaction();
    try {
      const { firstName, lastName, email, phoneNumber, branchId, address, city, amountDue } = req.body;
      const customer = await Customer.findByPk(req.params.id);

      if (!customer) {
        await t.rollback();
        return res.status(404).json({ success: false, message: 'Customer not found' });
      }

      if (customer.amountDue != amountDue) {

        if (customer.isLocked) {
          await t.rollback();
          return res.status(404).json({ success: false, message: 'Opening balance is locked and cannot be edited' });
        }

        const ledgerType = await LedgerType.findOne({ where: { ledgerTypeName: 'customer' } });
        const entryType = await EntryType.findOne({ where: { typeName: 'OB' } });

        const openingLedger = await Ledger.findOne({
          where: {
            accountId: customer.customerId,
            entryTypeId: entryType.entryTypeId,
            description: 'opening balance',
            ledgerTypeId: ledgerType.ledgerTypeId,
          }
        }, { transaction: t });

        if (openingLedger) {
          await openingLedger.update({
            date: moment().toDate(),
            debit: amountDue > 0 ? amountDue : 0,
            credit: amountDue < 0 ? Math.abs(amountDue) : 0,
          }, { transaction: t }); 
        } else {
          await Ledger.create({
            accountId: customer.customerId,
            date: moment().toDate(),
            description: 'opening balance',
            debit: amountDue > 0 ? amountDue : 0,
            credit: amountDue < 0 ? Math.abs(amountDue) : 0,
            branchId: branchId,
            ledgerTypeId: ledgerType.ledgerTypeId,
            entryTypeId: entryType.entryTypeId,
          }, { transaction: t });
        }

        // await Ledger.create({
        //   accountId: customer.customerId,
        //   date: moment().toDate(),
        //   description: 'opening balance edited',
        //   debit: amountDue - customer.amountDue > 0 ? amountDue - customer.amountDue : 0,
        //   credit: amountDue - customer.amountDue < 0 ? Math.abs(amountDue - customer.amountDue) : 0,
        //   branchId: branchId,
        //   ledgerTypeId: ledgerType.ledgerTypeId
        // }, { transaction: t });
      }

      await customer.update({ firstName, lastName, email, phoneNumber, branchId, address, city, amountDue }, { transaction: t });

      await t.commit();

      return res.status(200).json({ success: true, message: 'Customer updated successfully', customer });
    } catch (error) {
      await t.rollback();
      console.error('Error updating customer:', error);
      return res.status(500).json({ success: false, message: 'Failed to update customer', error: error.message });
    }
  }

  static async deleteCustomer(req, res) {
    try {
      const customer = await Customer.findByPk(req.params.id);

      if (!customer) {
        return res.status(404).json({ success: false, message: 'Customer not found' });
      }

      await customer.update({ isDeleted: true });

      return res.status(200).json({ success: true, message: 'Customer deleted successfully' });
    } catch (error) {
      console.error('Error deleting customer:', error);
      return res.status(500).json({ success: false, message: 'Failed to delete customer', error: error.message });
    }
  }
}

module.exports = CustomerController;
