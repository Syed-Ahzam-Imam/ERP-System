'use strict';

const { DataTypes } = require('sequelize');
const db = require('../../config/dbConfig');
const Purchase = require('./purchaseModel');
const Product = require('./productModel');

const PurchaseItem = db.define('PurchaseItem', {
  purchaseItemId: {
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
  unitPrice: {
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
  },
  discount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
}, {
  tableName: 'purchase_items',
  timestamps: false
});

PurchaseItem.belongsTo(Purchase, { foreignKey: { name: 'invoiceId' } });
PurchaseItem.belongsTo(Product, { foreignKey: { name: 'productId' } });

module.exports = PurchaseItem;
