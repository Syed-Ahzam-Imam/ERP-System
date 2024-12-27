'use strict';

const { DataTypes } = require('sequelize');
const db = require('../../config/dbConfig');
const Branch = require('./branchModel');
const PurchaseReturnItem = require('./purchaseReturnItemModel');

const PurchaseReturnItemDistribution = db.define('PurchaseReturnItemDistribution', {
  purchaseReturnItemDistributionId: {
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
  }
}, {
  tableName: 'purchaseReturnItemDistribution',
  timestamps: false
});

PurchaseReturnItemDistribution.belongsTo(Branch, { foreignKey: 'branchId' });
PurchaseReturnItemDistribution.belongsTo(PurchaseReturnItem, { foreignKey: 'purchaseReturnItemId' });

module.exports = PurchaseReturnItemDistribution;
