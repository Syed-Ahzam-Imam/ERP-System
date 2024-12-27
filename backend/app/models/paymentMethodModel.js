'use strict';

const { DataTypes } = require('sequelize');
const db = require('../../config/dbConfig');

const PaymentMethod = db.define('PaymentMethod', {
  paymentMethodId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  paymentMethodName: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      async isUniqueWhenNotDeleted(value) {
        const existingRecord = await PaymentMethod.findOne({
          where: {
            PaymentMethodName: value,
            isDeleted: false
          }
        });
        if (existingRecord && existingRecord.paymentMethodName !== this.paymentMethodName) {
          throw new Error('The payment method name must be unique.');
        }
      }
    }
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isDeleted: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
}, {
  tableName: 'payment_method',
  timestamps: false
});

// Define afterSync hook to create default ledger types
// Inside the afterSync hook in your PaymentMethod model
PaymentMethod.afterSync(async () => {
  try {
    // Check if 'cash' method already exists
    const cashType = await PaymentMethod.findOne({ where: { paymentMethodName: 'cash' } });

    if (!cashType) {
      await PaymentMethod.create({ paymentMethodName: 'cash' }); // Ensure to explicitly set the paymentMethodName here
    }
  } catch (error) {
    console.error('Error creating default ledger types:', error);
  }
});


// Prevent deletion or update of the 'cash' payment method
PaymentMethod.beforeUpdate((instance) => {
  if (instance.paymentMethodName === 'cash') {
    throw new Error('The "cash" payment method cannot be updated.');
  }
});

PaymentMethod.beforeDestroy((instance) => {
  if (instance.paymentMethodName === 'cash') {
    throw new Error('The "cash" payment method cannot be deleted.');
  }
});

module.exports = PaymentMethod;
