'use-strict';
const Sale = require('../models/salesModel');
const Purchase = require('../models/purchaseModel');
const db = require('../../config/dbConfig');
const moment = require('moment');
const { Op } = require('sequelize');
const Customer = require('../models/customerModel');
const Inventory = require('../models/inventoryModel');
const Product = require('../models/productModel');

class DashboardController {
  static async getMonthlySalesData() {
    const currentYear = moment().year();
    const monthlySales = await Sale.findAll({
      where: {
        // Add a condition to filter sales for the current year
        saleDate: {
          [Op.between]: [
            moment(`${currentYear}-01-01`).toDate(), // Start of the current year
            moment(`${currentYear}-12-31`).toDate() // End of the current year
          ]
        }
      },
      attributes: [
        [db.fn('MONTH', db.col('saleDate')), 'month'],
        [db.fn('SUM', db.col('totalAmount')), 'sales']
      ],
      group: [db.fn('MONTH', db.col('saleDate'))],
      raw: true
    });
    // console.log("monthlySales:", monthlySales)

    const chartData = [
      { name: 'Jan', sales: 0 },
      { name: 'Feb', sales: 0 },
      { name: 'Mar', sales: 0 },
      { name: 'Apr', sales: 0 },
      { name: 'May', sales: 0 },
      { name: 'June', sales: 0 },
      { name: 'July', sales: 0 },
      { name: 'Aug', sales: 0 },
      { name: 'Sep', sales: 0 },
      { name: 'Oct', sales: 0 },
      { name: 'Nov', sales: 0 },
      { name: 'Dec', sales: 0 }
    ];

    monthlySales.forEach(month => {
      const index = month.month - 1;
      chartData[index].sales = month.sales;
    });

    const totalSalesRows = await Sale.count();

    return { chartData, totalRows: totalSalesRows };
    // return chartData;
  }

  static async getMonthlyPurchaseData() {
    const currentYear = moment().year();
    const monthlyPurchases = await Purchase.findAll({
      where: {
        // Add a condition to filter Purchase for the current year
        purchaseDate: {
          [Op.between]: [
            moment(`${currentYear}-01-01`).toDate(), // Start of the current year
            moment(`${currentYear}-12-31`).toDate() // End of the current year
          ]
        }
      },
      attributes: [
        [db.fn('MONTH', db.col('purchaseDate')), 'month'],
        [db.fn('SUM', db.col('totalAmount')), 'purchases']
      ],
      group: [db.fn('MONTH', db.col('purchaseDate'))],
      raw: true
    });
    // console.log("monthlyPurchases:", monthlyPurchases)

    const chartData = [
      { name: 'Jan', purchases: 0 },
      { name: 'Feb', purchases: 0 },
      { name: 'Mar', purchases: 0 },
      { name: 'Apr', purchases: 0 },
      { name: 'May', purchases: 0 },
      { name: 'June', purchases: 0 },
      { name: 'July', purchases: 0 },
      { name: 'Aug', purchases: 0 },
      { name: 'Sep', purchases: 0 },
      { name: 'Oct', purchases: 0 },
      { name: 'Nov', purchases: 0 },
      { name: 'Dec', purchases: 0 }
    ];

    monthlyPurchases.forEach(month => {
      const index = month.month - 1;
      chartData[index].purchases = month.purchases;
    });

    // return chartData;
    const totalPurchaseRows = await Purchase.count();

    return { chartData, totalRows: totalPurchaseRows };
  }

  static async getMonthlyCustomerData() {
    const currentYear = moment().year();
    const chartData = Array.from({ length: 12 }, (_, i) => ({
      name: moment().month(i).format('MMM'),
      customers: 0
    }));

    for (let i = 0; i < 12; i++) {
      // const endDate = moment(`${currentYear}-${i + 1}-31`).toDate();
      const endDate = moment({ year: currentYear, month: i }).endOf('month').toDate();
      // console.log("endDate: ", endDate)
      const monthlyCustomers = await Customer.count({
        where: {
          isDeleted: false,
          createdAt: {
            [Op.lte]: endDate
          }
        }
      });

      chartData[i].customers = monthlyCustomers;
    }

    // return chartData;
    const totalCustomerRows = await Customer.count({ where: { isDeleted: false } });

    return { chartData, totalRows: totalCustomerRows };
  }

  static async getInventoryData() {
    const inventoryItems = await Inventory.findAll({
      attributes: [
        [db.fn('SUM', db.col('itemQuantity')), 'total'],
        'productId'
      ],
      include: [
        {
          model: Product,
          attributes: ['productName']
        }
      ],
      group: ['productId']
    });

    let totalInventoryRows = 0;
    const chartData = inventoryItems.map(item => {
      totalInventoryRows += parseInt(item.dataValues?.total);
      return {
        name: item.Product.productName,
        value: item.dataValues?.total,
      };
    });

    // return chartData
    return { chartData, totalRows: totalInventoryRows };
  }

  static async getDashboardData(req, res) {
    try {
      const saleChartData = await DashboardController.getMonthlySalesData();
      const purchaseChartData = await DashboardController.getMonthlyPurchaseData();
      const customerChartData = await DashboardController.getMonthlyCustomerData();
      const inventoryChartData = await DashboardController.getInventoryData();
      const chartData = {
        saleChartData,
        purchaseChartData,
        customerChartData,
        inventoryChartData
      }

      return res.status(200).json({ success: true, chartData });
    } catch (error) {
      console.error('Error retrieving data:', error);
      return res.status(500).json({ success: false, message: 'Failed to retrieve sales data', error: error.message });
    }
  }
}

module.exports = DashboardController;
