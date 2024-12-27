'use strict';

const { DataTypes } = require('sequelize');
const db = require('../../config/dbConfig');
const Customer = require('./customerModel');
const Branch = require('./branchModel');
const Supplier = require('./supplierModel');

const SalesReturn = db.define('SalesReturn', {
  invoiceId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  salesReturnDate: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      notEmpty: true
    },
  },
  salesReturnDescription: {
    type: DataTypes.STRING,
    allowNull: true
  },
  salesReturnLocation: {
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
  isSupplier: {
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
  tableName: 'sales_return',
  timestamps: true
});

//if branchhead can make SalesReturns add this line
SalesReturn.belongsTo(Branch, { foreignKey: { name: 'branchId', allowNull: false } });

//supplier page not yet made frontend, change allowNull to false
SalesReturn.belongsTo(Customer, { foreignKey: { name: 'customerId' } });
SalesReturn.belongsTo(Supplier, { foreignKey: { name: 'supplierId' } });

module.exports = SalesReturn;
