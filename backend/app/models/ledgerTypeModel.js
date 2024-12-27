'use strict';

const { DataTypes } = require('sequelize');
const db = require('../../config/dbConfig');

const LedgerType = db.define('LedgerType', {
  ledgerTypeId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  ledgerTypeName: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      async isUniqueWhenNotDeleted(value) {
        const existingRecord = await LedgerType.findOne({
          where: {
            ledgerTypeName: value,
            isDeleted: false
          }
        });
        if (existingRecord && existingRecord.ledgerTypeName !== this.ledgerTypeName) {
          throw new Error('The ledger type name must be unique when not deleted.');
        }
      }
    }
  },
  isDeleted: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
}, {
  tableName: 'ledger_type',
  timestamps: false
});

// Define afterSync hook to create default ledger types
LedgerType.afterSync(async () => {
  try {
    // Check if 'customer' and 'supplier' ledger types already exist
    const customerLedger = await LedgerType.findOne({ where: { ledgerTypeName: 'customer' } });
    const supplierLedger = await LedgerType.findOne({ where: { ledgerTypeName: 'supplier' } });
    const purchaseLedger = await LedgerType.findOne({ where: { ledgerTypeName: 'purchase' } });
    const purchaseReturnLedger = await LedgerType.findOne({ where: { ledgerTypeName: 'purchaseReturn' } });
    const salesLedger = await LedgerType.findOne({ where: { ledgerTypeName: 'sales' } });
    const salesReturnLedger = await LedgerType.findOne({ where: { ledgerTypeName: 'salesReturn' } });
    const productLedger = await LedgerType.findOne({ where: { ledgerTypeName: 'product' } });
    const advanceLedger = await LedgerType.findOne({ where: { ledgerTypeName: 'advance' } });
    const transferLedger = await LedgerType.findOne({ where: { ledgerTypeName: 'transfer' } });

    if (!customerLedger) {
      await LedgerType.create({ ledgerTypeName: 'customer' });
    }

    if (!advanceLedger) {
      await LedgerType.create({ ledgerTypeName: 'advance' });
    }

    if (!transferLedger) {
      await LedgerType.create({ ledgerTypeName: 'transfer' });
    }

    if (!supplierLedger) {
      await LedgerType.create({ ledgerTypeName: 'supplier' });
    }

    if (!productLedger) {
      await LedgerType.create({ ledgerTypeName: 'product' });
    }

    if (!purchaseLedger) {
      await LedgerType.create({ ledgerTypeName: 'purchase' });
    }

    if (!purchaseReturnLedger) {
      await LedgerType.create({ ledgerTypeName: 'purchaseReturn' });
    }

    if (!salesLedger) {
      await LedgerType.create({ ledgerTypeName: 'sales' });
    }

    if (!salesReturnLedger) {
      await LedgerType.create({ ledgerTypeName: 'salesReturn' });
    }
  } catch (error) {
    console.error('Error creating default ledger types:', error);
  }
});

// Prevent deletion or update of the 'cash' ledger type
LedgerType.beforeUpdate((instance) => {
  if (instance.ledgerTypeName === 'customer' ||
    instance.ledgerTypeName === 'advance' ||
    instance.ledgerTypeName === 'transfer' ||
    instance.ledgerTypeName === 'supplier' ||
    instance.ledgerTypeName === 'product' ||
    instance.ledgerTypeName === 'purchase' ||
    instance.ledgerTypeName === 'purchaseReturn' ||
    instance.ledgerTypeName === 'sales' ||
    instance.ledgerTypeName === 'salesReturn'
  ) {
    throw new Error('This ledger method type be updated.');
  }
});

LedgerType.beforeDestroy((instance) => {
  if (instance.ledgerTypeName === 'customer' ||
    instance.ledgerTypeName === 'advance' ||
    instance.ledgerTypeName === 'transfer' ||
    instance.ledgerTypeName === 'supplier' ||
    instance.ledgerTypeName === 'product' ||
    instance.ledgerTypeName === 'purchase' ||
    instance.ledgerTypeName === 'purchaseReturn' ||
    instance.ledgerTypeName === 'sales' ||
    instance.ledgerTypeName === 'salesReturn'
  ) {
    throw new Error('This ledger method type be deleted.');
  }
});

module.exports = LedgerType;
