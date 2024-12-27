'use strict';

const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/dashboardController');


// Get all dashboard data
router.get('/', DashboardController.getDashboardData);


module.exports = router;
