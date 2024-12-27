'use strict';

const Branch = require('../models/branchModel');
const Category = require('../models/categoryModel');
const Inventory = require('../models/inventoryModel');
const Product = require('../models/productModel');
const db = require('../../config/dbConfig');
const Ledger = require('../models/ledgerModel');
const LedgerType = require('../models/ledgerTypeModel');
const moment = require('moment');
const { Op } = require('sequelize');

class InventoryController {
  static async addInventoryItem(req, res) {
    const t = await db.transaction();
    try {
      const {
        itemQuantity,
        branchId,
        productId,
        itemPrice
      } = req.body;


      let inventoryItem = await Inventory.findOne({
        where: {
          branchId: branchId,
          productId: productId
        }
      });

      if (inventoryItem) {
        await inventoryItem.increment('itemQuantity', { by: itemQuantity, transaction: t });
        await inventoryItem.increment('totalQuantity', { by: itemQuantity, transaction: t });
        await inventoryItem.increment('totalAmount', { by: itemQuantity * itemPrice, transaction: t });
      } else {
        inventoryItem = await Inventory.create({
          itemQuantity,
          branchId,
          productId,
          totalQuantity: itemQuantity,
          totalAmount: itemPrice * itemQuantity
        }, { transaction: t });
      }

      const ledgerType = await LedgerType.findOne({ where: { ledgerTypeName: 'product' } });

      await Ledger.create({
        accountId: productId,
        date: moment().toDate(),
        description: 'stock added',
        debit: itemQuantity,
        branchId: branchId,
        ledgerTypeId: ledgerType.ledgerTypeId
      }, { transaction: t });

      await t.commit();
      return res.status(201).json({ success: true, message: 'Inventory item added successfully' });
    } catch (error) {
      console.error('Error adding inventory item:', error);
      await t.rollback();
      return res.status(500).json({ success: false, message: 'Failed to add inventory item', error: error.message });
    }
  }

  static async getAllInventoryItems(req, res) {
    try {
      const inventoryItems = await Inventory.findAll();

      return res.status(200).json({ success: true, inventoryItems });
    } catch (error) {
      console.error('Error retrieving inventory items:', error);
      return res.status(500).json({ success: false, message: 'Failed to retrieve inventory items', error: error.message });
    }
  }

  static async getInventoryByProductId(req, res) {
    try {
      const productId = req.params.productId;

      const productDetails = await Product.findOne({
        where: { productId },
        attributes: ['productName'],
        include: [
          {
            model: Category,
            attributes: ['categoryName']
          }
        ]
      });

      if (!productDetails) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      const totalQuantity = await Inventory.sum('itemQuantity', {
        where: { productId }
      });

      const totAmount = await Inventory.sum('totalAmount', {
        where: { productId }
      });
      const totQuantity = await Inventory.sum('totalQuantity', {
        where: { productId }
      });

      const averagePrice = totQuantity !== 0 ? totAmount / totQuantity : 0;

      const inventoryItems = await Inventory.findAll({
        where: { productId },
        include: [
          {
            model: Branch,
            attributes: ['branchName']
          }
        ]
      });

      const distribution = inventoryItems.map(item => ({
        branchName: item.Branch?.branchName,
        itemQuantity: item.itemQuantity,

      }));

      const result = {
        productName: productDetails.productName ? productDetails.productName : null,
        categoryName: productDetails.Category ? productDetails.Category.categoryName : null,
        totalQuantity,
        averagePrice,
        distribution
      };

      return res.status(200).json({ success: true, inventoryItem: result });
    } catch (error) {
      console.error('Error retrieving inventory items by product ID:', error);
      return res.status(500).json({ success: false, message: 'Failed to retrieve inventory items', error: error.message });
    }
  }

  // static async getCombinedWithDistribution(req, res) {
  //   try {
  //     const productsQuery = `
  //     SELECT 
  //       p.productId, 
  //       p.productName, 
  //       p.productDescription, 
  //       c.categoryName
  //     FROM products p
  //     LEFT JOIN category c ON p.categoryId = c.categoryId
  //   `;
  //     const products = await db.query(productsQuery, { type: 'SELECT' });

  //     const inventoryQuery = `
  //     SELECT 
  //       i.productId, 
  //       SUM(i.itemQuantity) AS totalQuantity, 
  //       SUM(i.totalAmount) AS totalAmount, 
  //       SUM(i.totalQuantity) AS totQuantity, 
  //       b.branchName
  //     FROM inventory i
  //     LEFT JOIN branches b ON i.branchId = b.branchId
  //     GROUP BY i.productId, b.branchName
  //   `;
  //     const inventoryData = await db.query(inventoryQuery, { type: 'SELECT' });

  //     const inventoryItems = {};
  //     inventoryData.forEach(item => {
  //       if (!inventoryItems[item.productId]) {
  //         inventoryItems[item.productId] = {
  //           productId: item.productId,
  //           totalQuantity: 0,
  //           totalAmount: 0,
  //           totQuantity: 0,
  //           distribution: []
  //         };
  //       }
  //       inventoryItems[item.productId].totalQuantity += item.totalQuantity;
  //       inventoryItems[item.productId].totalAmount += item.totalAmount;
  //       inventoryItems[item.productId].totQuantity += item.totQuantity;
  //       inventoryItems[item.productId].distribution.push({
  //         branchName: item.branchName,
  //         itemQuantity: item.totalQuantity
  //       });
  //     });

  //     const filteredInventoryData = Object.values(inventoryItems).map(item => {
  //       const averagePrice = item.totQuantity !== 0 ? item.totalAmount / item.totQuantity : 0;
  //       return {
  //         ...item,
  //         averagePrice,
  //         productName: products.find(p => p.productId === item.productId)?.productName,
  //         productDescription: products.find(p => p.productId === item.productId)?.productDescription,
  //         categoryName: products.find(p => p.productId === item.productId)?.categoryName
  //       };
  //     }).filter(item => item.totalQuantity !== 0);

  //     return res.status(200).json({ success: true, inventoryItem: filteredInventoryData });
  //   } catch (error) {
  //     console.error('Error retrieving inventory data:', error);
  //     return res.status(500).json({
  //       success: false,
  //       message: 'Failed to retrieve inventory data',
  //       error: error.message
  //     });
  //   }
  // }

  static async getCombinedWithDistribution(req, res) {
    try {
      const products = await Product.findAll({
        attributes: ['productId', 'productName', 'productDescription'],
        include: [
          {
            model: Category,
            attributes: ['categoryName']
          }
        ]
      });

      const inventoryData = await Promise.all(products.map(async (product) => {
        const { productId, productName, productDescription, Category } = product;

        const inventoryItems = await Inventory.findAll({
          attributes: ['itemQuantity', 'totalAmount', 'totalQuantity'],
          where: { productId },
          include: [{ model: Branch, attributes: ['branchName'] }],
          raw: true,
        });

        const totalQuantity = inventoryItems.reduce((acc, item) => acc + item.itemQuantity, 0);
        const totAmount = inventoryItems.reduce((acc, item) => acc + item.totalAmount, 0);
        const totQuantity = inventoryItems.reduce((acc, item) => acc + item.totalQuantity, 0);
        const averagePrice = totQuantity !== 0 ? totAmount / totQuantity : 0;

        if (totalQuantity === null || totalQuantity === 0) {
          return null;
        }

        const distribution = inventoryItems.map(item => ({
          branchName: item['Branch.branchName'],
          itemQuantity: item.itemQuantity,
        }));

        return {
          productId,
          productName: productName ?? null,
          productDescription,
          categoryName: Category?.categoryName ?? null,
          totalQuantity,
          averagePrice,
          distribution
        };
      }));

      const filteredInventoryData = inventoryData.filter(product => product !== null);

      return res.status(200).json({ success: true, inventoryItem: filteredInventoryData });

      //       const [results, metadata] = await db.query(`
      //   SELECT
      //     p.productId,
      //     p.productName,
      //     p.productDescription,
      //     c.categoryName,
      //     CAST(COALESCE(SUM(i.itemQuantity), 0) AS SIGNED) AS totalQuantity,
      //     CAST(COALESCE(SUM(i.totalAmount), 0) AS SIGNED) AS totAmount,
      //     CAST(COALESCE(SUM(i.totalQuantity), 0) AS SIGNED) AS totQuantity,
      //     b.branchId,
      //     b.branchName,
      //     i.itemQuantity AS branchItemQuantity
      //   FROM
      //     products p
      //   LEFT JOIN
      //     category c ON p.categoryId = c.categoryId
      //   LEFT JOIN
      //     inventory i ON p.productId = i.productId
      //   LEFT JOIN
      //     branches b ON i.branchId = b.branchId
      //   GROUP BY
      //     p.productId, p.productName, p.productDescription, c.categoryName, b.branchId, b.branchName, i.itemQuantity
      // `);

      //       console.log('results: ', results);


      //       const inventoryData = results.reduce((acc, result) => {
      //         const {
      //           productId,
      //           productName,
      //           productDescription,
      //           categoryName,
      //           totalQuantity,
      //           totAmount,
      //           totQuantity,
      //           branchId,
      //           branchName,
      //           branchItemQuantity
      //         } = result;

      //         const averagePrice = totQuantity !== 0 ? totAmount / totQuantity : 0;

      //         if (totalQuantity !== null && totalQuantity !== 0) {
      //           const existingProduct = acc.find(item => item.productId === productId);

      //           if (existingProduct) {
      //             existingProduct.distribution.push({
      //               branchId,
      //               branchName,
      //               itemQuantity: branchItemQuantity
      //             });

      //             existingProduct.totalQuantity += branchItemQuantity

      //           } else {
      //             acc.push({
      //               productId,
      //               productName: productName || null,
      //               productDescription,
      //               categoryName: categoryName || null,
      //               totalQuantity,
      //               averagePrice,
      //               distribution: [{
      //                 branchId,
      //                 branchName,
      //                 itemQuantity: branchItemQuantity
      //               }]
      //             });
      //           }
      //         }

      //         return acc;
      //       }, []);

      //       return res.status(200).json({ success: true, inventoryItem: inventoryData });


      // const products = await Product.findAll({
      //   attributes: ['productId', 'productName', 'productDescription'],
      //   include: [
      //     {
      //       model: Category,
      //       attributes: ['categoryName']
      //     }
      //   ]
      // });

      // const inventoryData = await Promise.all(products.map(async (product) => {
      //   const { productId, productName, productDescription, Category } = product;

      //   const inventoryItems = await Inventory.findAll({
      //     attributes: [
      //       'itemQuantity',
      //       [db.fn('COALESCE', db.fn('SUM', db.col('totalAmount')), 0), 'totAmount'],
      //       [db.fn('COALESCE', db.fn('SUM', db.col('totalQuantity')), 0), 'totQuantity']
      //     ],
      //     where: { productId },
      //     include: [{ model: Branch, attributes: ['branchName'] }],
      //     raw: true,
      //     group: ['Inventory.itemId', 'Branch.branchId']
      //   });

      //   const totalQuantity = inventoryItems.reduce((acc, item) => acc + item.itemQuantity, 0);
      //   const totAmount = inventoryItems.reduce((acc, item) => acc + item.totAmount, 0);
      //   const totQuantity = inventoryItems.reduce((acc, item) => acc + item.totQuantity, 0);
      //   const averagePrice = totQuantity !== 0 ? totAmount / totQuantity : 0;

      //   if (totalQuantity === null || totalQuantity === 0) {
      //     return null;
      //   }

      //   const distribution = inventoryItems.map(item => ({
      //     branchName: item['Branch.branchName'],
      //     itemQuantity: item.itemQuantity,
      //   }));

      //   return {
      //     productId,
      //     productName: productName ?? null,
      //     productDescription,
      //     categoryName: Category?.categoryName ?? null,
      //     totalQuantity,
      //     averagePrice,
      //     distribution
      //   };
      // }));

      // const filteredInventoryData = inventoryData.filter(product => product !== null);

      // return res.status(200).json({ success: true, inventoryItem: filteredInventoryData });


      // const products = await Product.findAll({
      //   attributes: ['productId', 'productName', 'productDescription'],
      //   include: [
      //     {
      //       model: Category,
      //       attributes: ['categoryName']
      //     }
      //   ]
      // });

      // const inventoryData = await Promise.all(products.map(async (product) => {
      //   const { productId, productName, productDescription, Category } = product;

      //   const totalQuantity = await Inventory.sum('itemQuantity', { where: { productId } });
      //   const totAmount = await Inventory.sum('totalAmount', { where: { productId } });
      //   const totQuantity = await Inventory.sum('totalQuantity', { where: { productId } });
      //   const averagePrice = totQuantity !== 0 ? totAmount / totQuantity : 0;

      //   if (totalQuantity === null || totalQuantity === 0) {
      //     return null;
      //   }

      //   const inventoryItems = await Inventory.findAll({
      //     where: { productId },
      //     include: [{ model: Branch, attributes: ['branchName'] }]
      //   });

      //   const distribution = inventoryItems.map(item => ({
      //     branchName: item.Branch?.branchName,
      //     itemQuantity: item.itemQuantity,
      //   }));

      //   return {
      //     productId,
      //     productName: productName ?? null,
      //     productDescription,
      //     categoryName: Category?.categoryName ?? null,
      //     totalQuantity,
      //     averagePrice,
      //     distribution
      //   };
      // }));

      // const filteredInventoryData = inventoryData.filter(product => product !== null);

      // return res.status(200).json({ success: true, inventoryItem: filteredInventoryData });
    } catch (error) {
      console.error('Error retrieving inventory items:', error);
      return res.status(500).json({ success: false, message: 'Failed to retrieve inventory items', error: error.message });
    }
  }

  static async getCombinedInventoryByBranch(req, res) {
    try {
      const inventoryItems = await Inventory.findAll({
        attributes: [
          [db.fn('SUM', db.col('totalQuantity')), 'tQuantity'],
          [db.fn('SUM', db.col('totalAmount')), 'tAmount'],
          [db.fn('SUM', db.col('itemQuantity')), 'total'],
          'productId'
        ],
        include: [
          {
            model: Product,
            attributes: ['productName', 'productDescription'],
            include: [
              {
                model: Category,
                attributes: ['categoryName']
              }
            ]
          }
        ],
        group: ['productId']
      });

      const flattenedInventoryItems = await Promise.all(
        inventoryItems.map(async item => {
          const average = item.dataValues?.tQuantity !== 0 ? item.dataValues?.tAmount / item.dataValues?.tQuantity : 0;

          return {
            productId: item.productId,
            productName: item.Product.productName,
            productDescription: item.Product.productDescription,
            totalQuantity: item.dataValues?.total ? item.dataValues?.total : 0,
            averagePrice: average ? average : 0,
            categoryName: item.Product?.Category?.categoryName
          };
        })
      );

      return res.status(200).json({ success: true, inventoryItems: flattenedInventoryItems });
    } catch (error) {
      console.error('Error retrieving inventory items:', error);
      return res.status(500).json({ success: false, message: 'Failed to retrieve inventory items', error: error.message });
    }
  }

  static async getInventoryItemById(req, res) {
    try {
      const inventoryItem = await Inventory.findByPk(req.params.id);

      if (!inventoryItem) {
        return res.status(404).json({ success: false, message: 'Inventory item not found' });
      }

      return res.status(200).json({ success: true, inventoryItem });
    } catch (error) {
      console.error('Error retrieving inventory item:', error);
      return res.status(500).json({ success: false, message: 'Failed to retrieve inventory item', error: error.message });
    }
  }

  static async getInventoryItemByBranchId(req, res) {
    try {
      const branchId = req.params.branchId;
      const inventoryItem = await Inventory.findAll({
        where: {
          branchId
        },
        include: [
          {
            model: Product,
            attributes: ['productName', 'productDescription'],
            include: [
              {
                model: Category,
                attributes: ['categoryName']
              }
            ]
          },
          {
            model: Branch,
            attributes: ['branchName', 'branchLocation', 'branchPhoneNumber', 'contactPerson'],
          }
        ],
      });

      const flattenedInventoryItems = inventoryItem.map(item => {
        return {
          branchId,
          location: item.Branch.branchLocation,
          contactNumber: item.Branch.branchPhoneNumber,
          contactPerson: item.Branch.contactPerson,
          branchName: item.Branch.branchName,
          productId: item.productId,
          productName: item.Product.productName,
          productDescription: item.Product.productDescription,
          itemQuantity: item.dataValues?.itemQuantity,
          categoryName: item.Product?.Category?.categoryName
        };
      });

      if (!inventoryItem) {
        return res.status(404).json({ success: false, message: 'Inventory items not found' });
      }

      return res.status(200).json({ success: true, inventoryItems: flattenedInventoryItems });
    } catch (error) {
      console.error('Error retrieving inventory items:', error);
      return res.status(500).json({ success: false, message: 'Failed to retrieve inventory items', error: error.message });
    }
  }

  // static async updateInventoryItem(req, res) {
  //   try {
  //     const {
  //       itemQuantity,
  //       branchId,
  //       productId
  //     } = req.body;

  //     const inventoryItem = await Inventory.findByPk(req.params.id);

  //     if (!inventoryItem) {
  //       return res.status(404).json({ success: false, message: 'Inventory item not found' });
  //     }

  //     await inventoryItem.update({
  //       itemQuantity,
  //       branchId,
  //       productId
  //     });

  //     return res.status(200).json({ success: true, message: 'Inventory item updated successfully', inventoryItem });
  //   } catch (error) {
  //     console.error('Error updating inventory item:', error);
  //     return res.status(500).json({ success: false, message: 'Failed to update inventory item', error: error.message });
  //   }
  // }

  // static async deleteInventoryItem(req, res) {
  //   try {
  //     const inventoryItem = await Inventory.findByPk(req.params.id);

  //     if (!inventoryItem) {
  //       return res.status(404).json({ success: false, message: 'Inventory item not found' });
  //     }

  //     await inventoryItem.destroy();

  //     return res.status(200).json({ success: true, message: 'Inventory item deleted successfully' });
  //   } catch (error) {
  //     console.error('Error deleting inventory item:', error);
  //     return res.status(500).json({ success: false, message: 'Failed to delete inventory item', error: error.message });
  //   }
  // }
}

module.exports = InventoryController;
