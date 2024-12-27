'use strict';

const Category = require('../models/categoryModel');

class CategoryController {
  static async createCategory(req, res) {
    try {
      const { categoryName } = req.body;
      const category = await Category.create({ categoryName });

      return res.status(201).json({ success: true, message: 'Category created successfully', category });
    } catch (error) {
      console.error('Error creating category:', error);
      return res.status(500).json({ success: false, message: 'Failed to create category', error: error.message });
    }
  }

  static async getAllCategories(req, res) {
    try {
      const categories = await Category.findAll({
        where: {
          isDeleted: false,
        },
      });

      return res.status(200).json({ success: true, categories });
    } catch (error) {
      console.error('Error retrieving categories:', error);
      return res.status(500).json({ success: false, message: 'Failed to retrieve categories', error: error.message });
    }
  }

  static async getCategoryById(req, res) {
    try {
      const category = await Category.findByPk(req.params.id);

      if (!category) {
        return res.status(404).json({ success: false, message: 'Category not found' });
      }

      return res.status(200).json({ success: true, category });
    } catch (error) {
      console.error('Error retrieving category:', error);
      return res.status(500).json({ success: false, message: 'Failed to retrieve category', error: error.message });
    }
  }

  static async updateCategory(req, res) {
    try {
      const { categoryName } = req.body;
      const category = await Category.findByPk(req.params.id);

      if (!category) {
        return res.status(404).json({ success: false, message: 'Category not found' });
      }

      await category.update({ categoryName });

      return res.status(200).json({ success: true, message: 'Category updated successfully', category });
    } catch (error) {
      console.error('Error updating category:', error);
      return res.status(500).json({ success: false, message: 'Failed to update category', error: error.message });
    }
  }

  static async deleteCategory(req, res) {
    try {
      const category = await Category.findByPk(req.params.id);

      if (!category) {
        return res.status(404).json({ success: false, message: 'Category not found' });
      }

      await category.update({ isDeleted: true });

      return res.status(200).json({ success: true, message: 'Category soft deleted successfully' });
    } catch (error) {
      console.error('Error soft deleting category:', error);
      return res.status(500).json({ success: false, message: 'Failed to soft delete category', error: error.message });
    }
  }
}

module.exports = CategoryController;
