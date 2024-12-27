'use strict';

const Branch = require("../models/branchModel");

class AccountsPayablesController {
  static async getAllPayables(req, res) {
    try {
      const rawSupplier = await Supplier.findAll({
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

      const customers = rawSupplier.map(supplier => {
        const branch = supplier.Branch;

        return {
          customerId: supplier.customerId,
          customerName: supplier ? `${supplier.firstName} ${supplier.lastName}` : null,
          email: supplier.email,
          phoneNumber: supplier.phoneNumber,
          address: supplier.address,
          amountDue: supplier.amountDue,
          branchId: supplier.branchId,
          branchName: branch ? branch.branchName : null
        }
      })
      return res.status(200).json({ success: true, customers });

    } catch (error) {
      console.error('Error retrieving customers:', error);
      return res.status(500).json({ success: false, message: 'Failed to retrieve customers', error: error.message });
    }
  }

  static async getPayableBySupplierId(req, res) {
    try {
      const customerId = req.params.id;
      const rawSupplier = await Supplier.findOne({
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

      let supplier = null;
      if (rawSupplier) {
        const branch = rawSupplier.Branch;

        supplier = {
          customerId: rawSupplier.customerId,
          customerName: rawSupplier ? `${rawSupplier.firstName} ${rawSupplier.lastName}` : null,
          email: rawSupplier.email,
          phoneNumber: rawSupplier.phoneNumber,
          address: rawSupplier.address,
          amountDue: rawSupplier.amountDue,
          branchId: rawSupplier.branchId,
          branchName: branch ? branch.branchName : null
        }
      }

      return res.status(200).json({ success: true, supplier });
    } catch (error) {
      console.error('Error retrieving supplier:', error);
      return res.status(500).json({ success: false, message: 'Failed to retrieve supplier', error: error.message });
    }
  }
}

module.exports = AccountsPayablesController;