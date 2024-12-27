'use strict';

const { DataTypes } = require('sequelize');
const db = require('../../config/dbConfig');
const Branch = require('./branchModel');
const Product = require('./productModel');

const Transfers = db.define('Transfers', {
  transferId: {
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
  date: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      notEmpty: true
    },
  }
}, {
  tableName: 'transfers',
  timestamps: true
});

// Set up associations (foreign keys)
Transfers.belongsTo(Branch, { foreignKey: { name: 'branchId', allowNull: false } });
Transfers.belongsTo(Product, { foreignKey: { name: 'productId', allowNull: false } });

module.exports = Transfers;
