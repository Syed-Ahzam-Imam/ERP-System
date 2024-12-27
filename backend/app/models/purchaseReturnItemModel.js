'use strict';

const { DataTypes } = require('sequelize');
const db = require('../../config/dbConfig');
const PurchaseReturn = require('./purchaseReturnModel');
const Product = require('./productModel');

const PurchaseReturnItem = db.define('PurchaseReturnItem', {
  purchaseReturnItemId: {
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
  tableName: 'purchase_return_items',
  timestamps: false
});

PurchaseReturnItem.belongsTo(PurchaseReturn, { foreignKey: { name: 'invoiceId' } });
PurchaseReturnItem.belongsTo(Product, { foreignKey: { name: 'productId' } });

module.exports = PurchaseReturnItem;
