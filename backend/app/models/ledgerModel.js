'use-strict'

const { DataTypes } = require('sequelize');
const db = require('../../config/dbConfig');
const Branch = require('./branchModel');
const EntryType = require('./entryTypeModel')
const AccountType = require('./accountTypeModel')
const LedgerTypeModel = require('./ledgerTypeModel');

const Ledger = db.define('Ledger', {
  ledgerId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  accountId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      notEmpty: true
    },
  },
  vNo: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true
  },
  debit: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  credit: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
}, {
  tableName: 'ledger',
  timestamps: true
});

Ledger.belongsTo(Branch, { foreignKey: 'branchId' });
Ledger.belongsTo(LedgerTypeModel, { foreignKey: 'ledgerTypeId' });
Ledger.belongsTo(EntryType, { foreignKey: 'entryTypeId' });
Ledger.belongsTo(AccountType, { foreignKey: 'accountTypeId' });

module.exports = Ledger;

