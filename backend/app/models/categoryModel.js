'use strict';

const { DataTypes } = require('sequelize');
const db = require('../../config/dbConfig'); 

const Category = db.define('Category', {
  categoryId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  categoryName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  isDeleted: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
}, {
  tableName: 'category',
  timestamps: false,
  validate: {
    async uniqueCategoryName() {
      const existingCategory = await Category.findOne({
        where: {
          categoryName: this.categoryName,
          isDeleted: false,
        },
      });
      if (existingCategory && existingCategory.categoryId !== this.categoryId) {
        throw new Error('Category name must be unique for active categories');
      }
    },
  },
});


module.exports = Category;
