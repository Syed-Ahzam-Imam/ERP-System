'use strict';

const { DataTypes } = require('sequelize');
const db = require('../../config/dbConfig'); // Import your MySQL database configuration
//const User = require('./userModel');

const Branch = db.define('Branch', {
  branchId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  branchName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      async isUniqueIfNotDeleted(value) {
        const existingBranch = await Branch.findOne({
          where: {
            branchName: value,
            isDeleted: false
          }
        });
        if (existingBranch && existingBranch.branchId !== this.branchId) {
          throw new Error('Branch name must be unique');
        }
      }
    }
  },
  contactPerson: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    },
  },
  branchLocation: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    },
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    },
  },
  branchPhoneNumber: {
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
  role: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['admin', 'branchHead']]
    }
  },
  isDeleted: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
}, {
  timestamps: false, // Disable timestamps (createdAt, updatedAt)
  tableName: 'branches' // Define the table name if it's different from the model name
});

module.exports = Branch;
