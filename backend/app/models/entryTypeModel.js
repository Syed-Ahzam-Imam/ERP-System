'use strict';

const { DataTypes } = require('sequelize');
const db = require('../../config/dbConfig');

const EntryType = db.define('EntryType', {
  entryTypeId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  typeName: {
    type: DataTypes.STRING(2), // Assuming the type name will be a maximum of 2 characters long
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'entry_type',
  timestamps: false
});

// Define default entry types
const defaultEntryTypes = [
  { typeName: 'P', description: 'Purchase' },
  { typeName: 'PR', description: 'Purchase Return' },
  { typeName: 'S', description: 'Sale' },
  { typeName: 'SR', description: 'Sale Return' },
  { typeName: 'CB', description: 'Cashbook' },
  { typeName: 'OB', description: 'Opening Balance' }
];

// Define afterSync hook to create default entry types
EntryType.afterSync(async () => {
  try {
    // Check if default entry types already exist
    const existingEntryTypes = await EntryType.findAll({ attributes: ['typeName'] });
    const existingTypeNames = existingEntryTypes.map(entryType => entryType.typeName);

    // Create default entry types that do not already exist
    const entryTypesToCreate = defaultEntryTypes.filter(entryType => !existingTypeNames.includes(entryType.typeName));
    await EntryType.bulkCreate(entryTypesToCreate);
  } catch (error) {
    console.error('Error creating default entry types:', error);
  }
});

// Prevent deletion or update of default entry types
EntryType.beforeUpdate((instance) => {
  if (['P', 'PR', 'S', 'SR', 'CB', 'OB'].includes(instance.typeName)) {
    throw new Error('Default entry types cannot be updated.');
  }
});

EntryType.beforeDestroy((instance) => {
  if (['P', 'PR', 'S', 'SR', 'CB', 'OB'].includes(instance.typeName)) {
    throw new Error('Default entry types cannot be deleted.');
  }
});

module.exports = EntryType;
