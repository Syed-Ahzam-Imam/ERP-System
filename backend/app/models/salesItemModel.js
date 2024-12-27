'use strict';

const { DataTypes } = require('sequelize');
const db = require('../../config/dbConfig');
const Sale = require('./salesModel');
const Product = require('./productModel');

const SalesItem = db.define('SalesItem', {
  salesItemId: {
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
  tableName: 'sale_items',
  timestamps: false
});

SalesItem.belongsTo(Sale, { foreignKey: { name: 'invoiceId' } });
SalesItem.belongsTo(Product, { foreignKey: { name: 'productId' } });

module.exports = SalesItem;
