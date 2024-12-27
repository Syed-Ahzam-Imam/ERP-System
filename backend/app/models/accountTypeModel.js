'use strict';

const { DataTypes } = require('sequelize');
const db = require('../../config/dbConfig');

const AccountType = db.define('AccountType', {
  accountTypeId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  typeName: {
    type: DataTypes.STRING(20), // Adjusting length for longer names like 'customer' or 'supplier'
    allowNull: false,
    unique: true
  }
}, {
  tableName: 'account_type',
  timestamps: false
});

// Define default account types
const defaultAccountTypes = [
  { typeName: 'supplier' },
  { typeName: 'customer' },
  { typeName: 'product' }
];

// Define afterSync hook to create default account types
AccountType.afterSync(async () => {
  try {
    // Check if default account types already exist
    const existingAccountTypes = await AccountType.findAll({ attributes: ['typeName'] });
    const existingTypeNames = existingAccountTypes.map(accountType => accountType.typeName);

    // Create default account types that do not already exist
    const accountTypesToCreate = defaultAccountTypes.filter(accountType => !existingTypeNames.includes(accountType.typeName));
    await AccountType.bulkCreate(accountTypesToCreate);
  } catch (error) {
    console.error('Error creating default account types:', error);
  }
});

// Prevent deletion or update of default account types
AccountType.beforeUpdate((instance) => {
  if (['supplier', 'customer', 'product'].includes(instance.typeName)) {
    throw new Error('Default account types cannot be updated.');
  }
});

AccountType.beforeDestroy((instance) => {
  if (['supplier', 'customer', 'product'].includes(instance.typeName)) {
    throw new Error('Default account types cannot be deleted.');
  }
});

module.exports = AccountType;
