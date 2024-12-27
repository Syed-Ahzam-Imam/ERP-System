'use strict';

const { DataTypes } = require('sequelize');
const db = require('../../config/dbConfig');
const Branch = require('./branchModel');
const PurchaseItem = require('./purchaseItemModel');

const PurchaseItemDistribution = db.define('PurchaseItemDistribution', {
  purchaseItemDistributionId: {
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
  tableName: 'purchaseItemDistribution',
  timestamps: false
});

PurchaseItemDistribution.belongsTo(Branch, { foreignKey: 'branchId' });
PurchaseItemDistribution.belongsTo(PurchaseItem, { foreignKey: 'purchaseItemId' });

module.exports = PurchaseItemDistribution;
