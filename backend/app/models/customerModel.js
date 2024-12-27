'use strict';

const { DataTypes } = require('sequelize');
const db = require('../../config/dbConfig');
const Branch = require('./branchModel');

const Customer = db.define('Customer', {
  customerId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      async isUniqueIfNotDeleted(value) {
        const existingCustomer = await Customer.findOne({
          where: {
            firstName: value,
            branchId: this.branchId,
            isDeleted: false
          }
        });
        if (existingCustomer && existingCustomer.customerId !== this.customerId) {
          throw new Error('First name must be unique');
        }
      }
    }
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: ""
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isValidEmail(value) {
        if (value && !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value)) {
          throw new Error('Please provide a valid email address or leave it empty.');
        }
      }
    }
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isPhoneNumber(value) {
        if (value && !/^[0-9]{11}$|^\+92[0-9]{10}$/.test(value)) {
          throw new Error(
            'Please provide a valid phone number or leave it empty.\nPhone number should be 11 digits without spaces or special characters, or 13 digits if starting with +.'
          );
        }
      }
    }
  },
  address: {
    type: DataTypes.STRING,
    allowNull: true
  },
  city: {
    type: DataTypes.STRING,
    allowNull: true
  },
  amountDue: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0 // Default amount due is set to 0
  },
  isDeleted: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  isLocked: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
}, {
  timestamps: true,
  tableName: 'customers'
});

Customer.belongsTo(Branch, { foreignKey: 'branchId' });

module.exports = Customer;
