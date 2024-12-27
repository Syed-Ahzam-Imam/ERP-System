'use strict';

const { DataTypes } = require('sequelize');
const db = require('../../config/dbConfig');
const Customer = require('./customerModel');
const Branch = require('./branchModel');
const Supplier = require('./supplierModel');

const Sale = db.define('Sale', {
  invoiceId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  saleDate: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      notEmpty: true
    },
  },
  saleDescription: {
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
  discount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
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
  tableName: 'sales',
  timestamps: true
});

Sale.belongsTo(Branch, { foreignKey: { name: 'branchId' } });
Sale.belongsTo(Customer, { foreignKey: { name: 'customerId' } });
Sale.belongsTo(Supplier, { foreignKey: { name: 'supplierId' } });

module.exports = Sale;
