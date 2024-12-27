'use strict';

const { DataTypes } = require('sequelize');
const db = require('../../config/dbConfig'); // Import your MySQL database configuration
const Category = require('./categoryModel');

const Product = db.define('Product', {
  productId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  productName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      async isUniqueIfNotDeleted(value) {
        const existingProduct = await Product.findOne({
          where: {
            productName: value,
            isDeleted: false
          }
        });
        if (existingProduct && existingProduct.productId !== this.productId) {
          throw new Error('Product name must be unique');
        }
      }
    }
  },
  brandName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    },
  },
  productDescription: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    },
  },
  isDeleted: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
}, {
  tableName: 'products', // Define the table name if it's different from the model name
  timestamps: false
});

Product.belongsTo(Category, { foreignKey: { name: 'categoryId' } });

module.exports = Product;
