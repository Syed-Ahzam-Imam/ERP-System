'use-strict'

const { DataTypes } = require('sequelize');
const db = require('../../config/dbConfig');
const Branch = require('./branchModel');
const LedgerType = require('./ledgerTypeModel')
const PaymentMethodType = require('./paymentMethodModel');
const Ledger = require('./ledgerModel');

const Cashbook = db.define('Cashbook', {
  cashbookId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  accountId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  invoiceId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  accountName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true
  },
  receipt: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  payment: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      notEmpty: true
    },
  }
}, {
  tableName: 'cashbook',
  timestamps: false // Set to true if you want Sequelize to handle timestamps (createdAt, updatedAt)
});

Cashbook.belongsTo(Branch, { foreignKey: 'branchId' });
Cashbook.belongsTo(LedgerType, { foreignKey: 'ledgerTypeId' })
Cashbook.belongsTo(PaymentMethodType, { foreignKey: 'paymentMethodId' })
Cashbook.belongsTo(Ledger, { foreignKey: 'ledgerId' })

module.exports = Cashbook;
