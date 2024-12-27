'use strict';

const { DataTypes } = require('sequelize');
const db = require('../../config/dbConfig'); // Import your MySQL database configuration
// const Branch = require('./branchModel');

const Investor = db.define('Investor', {
  investorId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    },
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  shares: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0.0
  },
  isDeleted: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
}, {
  timestamps: false, // Disable timestamps (createdAt, updatedAt)
  tableName: 'investors' // Define the table name if it's different from the model name
});

// Investor.belongsTo(Branch, { foreignKey: { name: 'branchId', allowNull: false } });

module.exports = Investor;
