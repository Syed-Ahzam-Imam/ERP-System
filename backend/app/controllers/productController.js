'use strict';

const Category = require('../models/categoryModel');
const Product = require('../models/productModel');
const Branch = require('../models/branchModel');
const Inventory = require('../models/inventoryModel');

class ProductController {
  static async createProduct(req, res) {
    try {
      const { productName, brandName, productDescription, categoryId } = req.body;
      const product = await Product.create({ productName, brandName, productDescription, categoryId });

      const branches = await Branch.findAll();
      // Create inventory for each branch
      await Promise.all(branches.map(async branch => {
        await Inventory.create({
          branchId: branch.branchId,
          productId: product.productId,
        });
      }));

      return res.status(201).json({ success: true, message: 'Product created successfully', product });
    } catch (error) {
      console.error('Error creating product:', error);
      return res.status(500).json({ success: false, message: 'Failed to create product', error: error.message });
    }
  }

  static async getAllProducts(req, res) {
    try {
      const rawProducts = await Product.findAll({
        include: [{
          model: Category,
          attributes: ['CategoryName']
        }],
        where: {
          isDeleted: false,
        },
      });
      // console.log(rawProducts)
      const products = rawProducts.map(product => {
        const { productId, productName, brandName, productDescription, Category } = product;

        // Check if Category is available and extract CategoryName
        const CategoryName = Category ? Category.dataValues.CategoryName : null;

        return {
          productId,
          productName,
          brandName,
          productDescription,
          categoryId: product.categoryId, // Assuming categoryId is a direct property of Product
          categoryName: CategoryName,
        };
      });



      return res.status(200).json({ success: true, products });
    } catch (error) {
      console.error('Error retrieving products:', error);
      return res.status(500).json({ success: false, message: 'Failed to retrieve products', error: error.message });
    }
  }


  static async getProductById(req, res) {
    try {
      const product = await Product.findByPk(req.params.id);

      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      return res.status(200).json({ success: true, product });
    } catch (error) {
      console.error('Error retrieving product:', error);
      return res.status(500).json({ success: false, message: 'Failed to retrieve product', error: error.message });
    }
  }

  static async updateProduct(req, res) {
    try {
      const { productName, brandName, productDescription, categoryId } = req.body;
      const product = await Product.findByPk(req.params.id);

      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      await product.update({ productName, brandName, productDescription, categoryId });

      return res.status(200).json({ success: true, message: 'Product updated successfully', product });
    } catch (error) {
      console.error('Error updating product:', error);
      return res.status(500).json({ success: false, message: 'Failed to update product', error: error.message });
    }
  }

  static async deleteProduct(req, res) {
    try {
      const product = await Product.findByPk(req.params.id);

      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      await product.update({ isDeleted: true });

      return res.status(200).json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
      console.error('Error deleting product:', error);
      return res.status(500).json({ success: false, message: 'Failed to delete product', error: error.message });
    }
  }
}

module.exports = ProductController;
