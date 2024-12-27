'use strict';

const { DataTypes } = require('sequelize');
const db = require('../../config/dbConfig');
const SalesReturn = require('./salesReturnModel');
const Product = require('./productModel');

const SalesReturnItem = db.define('SalesReturnItem', {
  SalesReturnItemId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: true
    },
  },
  totalAmount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: true
    },
  }
}, {
  tableName: 'sales_return_items',
  timestamps: false
});

SalesReturnItem.belongsTo(SalesReturn, { foreignKey: { name: 'invoiceId' } });
SalesReturnItem.belongsTo(Product, { foreignKey: { name: 'productId' } });

module.exports = SalesReturnItem;
