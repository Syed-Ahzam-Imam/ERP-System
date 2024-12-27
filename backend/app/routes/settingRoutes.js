'use strict';
const express = require('express');
const router = express.Router();
const SettingsController = require('../controllers/settingsController');


router.post('/stamp/add', SettingsController.stampUpload);
router.post('/logo/add', SettingsController.logoUpload);
router.get('/:id', SettingsController.getSettingByBranchId);
module.exports = router;