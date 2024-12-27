'use strict';

const express = require('express');
require('dotenv').config();
const cors = require('cors');
const path = require('path');

//Routes
const authRoutes = require('./app/routes/authRoutes');
const inventoryRoutes = require('./app/routes/inventoryRoutes');
const productRoutes = require('./app/routes/productRoutes');
const branchRoutes = require('./app/routes/branchRoutes');
const supplierRoutes = require('./app/routes/supplierRoutes');
const categoryRoutes = require('./app/routes/categoryRoutes');
const customerRoutes = require('./app/routes/customerRoutes');
const purchaseRoutes = require('./app/routes/purchaseRoutes');
const purchaseReturnRoutes = require('./app/routes/purchaseReturnRoutes');
const salesRoutes = require('./app/routes/salesRoutes');
const salesReturnRoutes = require('./app/routes/salesReturnRoutes');
const cashbookRoutes = require('./app/routes/cashbookRoutes');
const payablesRoutes = require('./app/routes/payablesRoutes');
const recievablesRoutes = require('./app/routes/recievablesRoutes');
const ledgerRoutes = require('./app/routes/ledgerRoutes');
const ledgerTypeRoutes = require('./app/routes/ledgerTypeRoutes');
const transferRoutes = require('./app/routes/transferRoutes');
const investorRoutes = require('./app/routes/investorRoutes');
const dashboardRoutes = require('./app/routes/dashboardRoutes');
const settingRoutes = require('./app/routes/settingRoutes');
const PaymentMethodRoutes = require('./app/routes/paymentMethodRoutes');

//Models
// require("./app/models/userModel");
require("./app/models/branchModel");
require("./app/models/inventoryModel");
require("./app/models/productModel");
require("./app/models/supplierModel");
require("./app/models/categoryModel");
require("./app/models/customerModel");
require("./app/models/purchaseModel");
require("./app/models/purchaseItemModel");
require("./app/models/purchaseItemDistributionModel");
require("./app/models/purchaseReturnModel");
require("./app/models/purchaseReturnItemModel");
require("./app/models/purchaseReturnItemDistributionModel");
require("./app/models/salesModel");
require("./app/models/salesItemModel");
require("./app/models/salesReturnModel");
require("./app/models/salesReturnItemModel");
require("./app/models/cashBookModel");
require("./app/models/ledgerTypeModel");
require("./app/models/transfersModel");
require("./app/models/investorModel");
require("./app/models/settingsModel");
require("./app/models/entryTypeModel");
require("./app/models/accountTypeModel");
require("./app/models/paymentMethodModel");
//const errorHandler = require('./app/middleware/errorHandler');

const app = express();
const corsOptions = {
  origin: [process.env.URL_FRONTEND, 'https://suriaanddurweshtraders.com', 'http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'], // Set the correct origin of your frontend
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// Set up middleware and other configurations
// Error handler
//app.use(errorHandler);

// Serve static files from the 'uploads' directory
app.use('/uploads/stamp', express.static(path.join(__dirname, 'uploads', 'stamp')));
app.use('/uploads/logo', express.static(path.join(__dirname, 'uploads', 'logo')));

// Set up routes
app.use('/auth', authRoutes);
app.use('/inventory', inventoryRoutes);
app.use('/product', productRoutes);
app.use('/branch', branchRoutes);
app.use('/supplier', supplierRoutes);
app.use('/category', categoryRoutes);
app.use('/customer', customerRoutes);
app.use('/purchase', purchaseRoutes);
app.use('/purchaseReturn', purchaseReturnRoutes);
app.use('/sales', salesRoutes);
app.use('/salesReturn', salesReturnRoutes);
app.use('/cashbook', cashbookRoutes);
app.use('/payables', payablesRoutes);
app.use('/recievables', recievablesRoutes);
app.use('/ledgerType', ledgerTypeRoutes);
app.use('/ledger', ledgerRoutes);
app.use('/transfers', transferRoutes);
app.use('/investor', investorRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/setting', settingRoutes);
app.use('/paymentMethod', PaymentMethodRoutes);

const PORT_BACKEND = process.env.PORT_BACKEND;
app.listen(PORT_BACKEND, () => {
  console.log(`Server is running on ${process.env.URL_BACKEND}`);
  console.log(`Database Name ${process.env.DB_NAME}`);

});