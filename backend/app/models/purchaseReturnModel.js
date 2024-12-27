'use strict';

const { DataTypes } = require('sequelize');
const db = require('../../config/dbConfig');
const Supplier = require('./supplierModel');
const Customer = require('./customerModel');

const PurchaseReturn = db.define('PurchaseReturn', {
  invoiceId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  purchaseReturnDate: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      notEmpty: true
    },
  },
  purchaseReturnDescription: {
    type: DataTypes.STRING,
    allowNull: true
  },
  purchaseReturnLocation: {
    type: DataTypes.STRING,
    allowNull: true
  },
  totalAmount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: true
    },
  },
  isCustomer: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  isLocked: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
}, {
  tableName: 'purchase_return',
  timestamps: true
});

//if branchhead can make purchaseReturns add this line
// PurchaseReturn.belongsTo(Branch, { foreignKey: { name: 'branchId', allowNull: false } });

//supplier page not yet made frontend, change allowNull to false
PurchaseReturn.belongsTo(Supplier, { foreignKey: { name: 'supplierId' } });
PurchaseReturn.belongsTo(Customer, { foreignKey: { name: 'customerId' } });

module.exports = PurchaseReturn;
