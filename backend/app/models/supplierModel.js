'use strict';

const { DataTypes } = require('sequelize');
const db = require('../../config/dbConfig'); // Import your MySQL database configuration

const Supplier = db.define('Supplier', {
  supplierId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      async isUniqueIfNotDeleted(value) {
        const existingSupplier = await Supplier.findOne({
          where: {
            firstName: value,
            isDeleted: false
          }
        });
        if (existingSupplier && existingSupplier.supplierId !== this.supplierId) {
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
  shopLocation: {
    type: DataTypes.STRING,
    allowNull: true
  },
  city: {
    type: DataTypes.STRING,
    allowNull: true
  },
  shopName: {
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
  timestamps: false, // Disable timestamps (createdAt, updatedAt)
  tableName: 'suppliers' // Define the table name if it's different from the model name
});


module.exports = Supplier;
