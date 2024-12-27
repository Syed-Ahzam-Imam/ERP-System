'use strict';

const Branch = require("../models/branchModel");
const Customer = require("../models/customerModel");

class AccountsRecievablesController {
  static async getAllRecievables(req, res) {
    try {
      const rawCustomers = await Customer.findAll({
        where: {
          amountDue: {
            [Op.gt]: 0,
          },
          isDeleted: false
        },
        include: [
          {
            model: Branch,
            attributes: ['branchName']
          }
        ]
      })

      const customers = rawCustomers.map(customer => {
        const branch = customer.Branch;

        return {
          customerId: customer.customerId,
          customerName: customer ? `${customer.firstName} ${customer.lastName}` : null,
          email: customer.email,
          phoneNumber: customer.phoneNumber,
          address: customer.address,
          amountDue: customer.amountDue,
          branchId: customer.branchId,
          branchName: branch ? branch.branchName : null
        }
      })
      return res.status(200).json({ success: true, customers });

    } catch (error) {
      console.error('Error retrieving customers:', error);
      return res.status(500).json({ success: false, message: 'Failed to retrieve customers', error: error.message });
    }
  }

  static async getRecievableByCustomerId(req, res) {
    try {
      const customerId = req.params.id;
      const rawCustomer = await Customer.findOne({
        where: {
          customerId
        },
        include: [
          {
            model: Branch,
            attributes: ['branchName']
          }
        ]
      })

      let customer = null;
      if (rawCustomer) {
        const branch = rawCustomer.Branch;

        customer = {
          customerId: rawCustomer.customerId,
          customerName: rawCustomer ? `${rawCustomer.firstName} ${rawCustomer.lastName}` : null,
          email: rawCustomer.email,
          phoneNumber: rawCustomer.phoneNumber,
          address: rawCustomer.address,
          amountDue: rawCustomer.amountDue,
          branchId: rawCustomer.branchId,
          branchName: branch ? branch.branchName : null
        }
      }

      return res.status(200).json({ success: true, customer });
    } catch (error) {
      console.error('Error retrieving customer:', error);
      return res.status(500).json({ success: false, message: 'Failed to retrieve customer', error: error.message });
    }
  }
}

module.exports = AccountsRecievablesController;