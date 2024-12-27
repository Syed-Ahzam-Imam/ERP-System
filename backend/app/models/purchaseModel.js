'use strict';

const { DataTypes } = require('sequelize');
const db = require('../../config/dbConfig');
const Supplier = require('./supplierModel');
const Customer = require('./customerModel');

const Purchase = db.define('Purchase', {
  invoiceId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  purchaseDate: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      notEmpty: true
    },
  },
  purchaseDescription: {
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
  tableName: 'purchases',
  timestamps: true
});

//if branchhead can make purchases add this line
// Purchase.belongsTo(Branch, { foreignKey: { name: 'branchId', allowNull: false } });

//supplier page not yet made frontend, change allowNull to false
Purchase.belongsTo(Supplier, { foreignKey: { name: 'supplierId' } });
Purchase.belongsTo(Customer, { foreignKey: { name: 'customerId' } });

module.exports = Purchase;
