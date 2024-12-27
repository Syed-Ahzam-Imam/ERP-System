'use strict';

const { DataTypes } = require('sequelize');
const db = require('../../config/dbConfig'); 
const Branch = require('./branchModel'); 
const Product = require('./productModel'); 

const Inventory = db.define('Inventory', {
  itemId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  itemQuantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  totalQuantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  totalAmount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  }
}, {
  tableName: 'inventory',
  timestamps: false,
});

Inventory.belongsTo(Branch, { foreignKey: { name: 'branchId' } });
Inventory.belongsTo(Product, { foreignKey: { name: 'productId' } });

module.exports = Inventory;
