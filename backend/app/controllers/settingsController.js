// settingsController.js

'use strict';

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Settings = require('../models/settingsModel');
const Branch = require('../models/branchModel');

// Set storeStamp for multer
const storeStamp = multer.diskStorage({
  destination: (req, file, cb) => {
    const directory = 'uploads/stamp';
    cb(null, directory);
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + '-' + path.extname(file.originalname));
  }
});

// Set storeLogo for multer
const storeLogo = multer.diskStorage({
  destination: (req, file, cb) => {
    const directory = 'uploads/logo';
    console.log("logo function working")
    cb(null, directory);
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + '-' + path.extname(file.originalname));
  }
});

// Initialize upload
const uploadStamp = multer({
  storage: storeStamp,
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  }
}).single('stamp'); // 'stamp' is the name attribute of your HTML file input

// Initialize upload
const uploadLogo = multer({
  storage: storeLogo,
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  }
}).single('logo');

// Check file type
function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb('Error: Images only (JPEG/JPG/PNG)');
  }
}

class SettingsController {
  static async stampUpload(req, res) {
    try {
      uploadStamp(req, res, async (err) => {
        if (err) {
          return res.status(400).json({ success: false, message: err });
        } else {
          const { branchId } = req.body;
          const stampName = req.file ? req.file.filename : null;
          console.log("bname: ", branchId)

          const branch = await Branch.findByPk(branchId);
          if (!branch) {
            return res.status(404).json({ success: false, message: 'Branch not found' });
          }

          let existingSetting = await Settings.findOne({ where: { branchId } });

          if (existingSetting) {
            if (existingSetting.stampName) {
              fs.unlink(`./uploads/stamp/${existingSetting.stampName}`, async (unlinkErr) => {
                if (unlinkErr) {
                  console.error('Error deleting file:', unlinkErr);
                }
              });
            }
            await existingSetting.update({ stampName })
          } else {
            existingSetting = await Settings.create({ stampName, branchId });
          }

          return res.status(201).json({ success: true, message: 'stamp added successfully' });
        }
      });
    } catch (error) {
      console.error('Error adding stamp:', error);
      return res.status(500).json({ success: false, message: 'Failed to add stamp', error: error.message });
    }
  }
  static async logoUpload(req, res) {
    try {
      uploadLogo(req, res, async (err) => {
        if (err) {
          return res.status(400).json({ success: false, message: err });
        } else {
          const { branchId } = req.body;
          const logoName = req.file ? req.file.filename : null;
          console.log("bname: ", branchId)

          const branch = await Branch.findByPk(branchId);
          if (!branch) {
            return res.status(404).json({ success: false, message: 'Branch not found' });
          }

          let existingSetting = await Settings.findOne({ where: { branchId } });

          if (existingSetting) {
            if (existingSetting.logoName) {
              fs.unlink(`./uploads/logo/${existingSetting.logoName}`, (unlinkErr) => {
                if (unlinkErr) {
                  console.error('Error deleting file:', unlinkErr);
                }
              });
            }
            await existingSetting.update({ logoName })
          } else {
            existingSetting = await Settings.create({ logoName, branchId });
          }

          return res.status(201).json({ success: true, message: 'logo added successfully', existingSetting });
        }
      });
    } catch (error) {
      console.error('Error adding logo:', error);
      return res.status(500).json({ success: false, message: 'Failed to add logo', error: error.message });
    }
  }

  static async getSettingByBranchId(req, res) {
    try {
      const { id } = req.params;
      const branch = await Branch.findByPk(id)

      if (!branch) {
        return res.status(404).json({ success: false, message: 'branch not found' });
      }

      const setting = await Settings.findOne({
        where: {
          branchId: branch.branchId
        }
      });
      
      const stampFilePath = `uploads/stamp/${setting?.stampName}`;
      let stampImg;
      let stampImage;
      if (fs.existsSync(stampFilePath)) {
        try {
          stampImg = fs.readFileSync(stampFilePath);
          stampImage = Buffer.from(stampImg).toString('base64');
        } catch (err) {
          console.error('Error reading stamp file:', err);
        }
      }

      const logoFilePath = `uploads/logo/${setting?.logoName}`;
      let logoImg;
      let logoImage;
      if (fs.existsSync(logoFilePath)) {
        try {
          logoImg = fs.readFileSync(logoFilePath);
          logoImage = Buffer.from(logoImg).toString('base64');
        } catch (err) {
          console.error('Error reading logo file:', err);
        }
      }

      const settings = {
        logo: setting?.logoName ? setting.logoName : null,
        logoImage: logoImage ? logoImage : null,
        stamp: setting?.stampName ? setting.stampName : null,
        stampImage: stampImage ? stampImage : null,
        branchName: branch.branchName,
        branchLocation: branch.branchLocation,
        branchPhoneNumber: branch.branchPhoneNumber
      }

      return res.status(200).json({ success: true, settings });
    } catch (error) {
      console.error('Error retrieving setting:', error);
      return res.status(500).json({ success: false, message: 'Failed to retrieve setting', error: error.message });
    }
  }

  static async deleteSetting(req, res) {
    try {
      const { id } = req.params;
      const setting = await Settings.findByPk(id);

      if (!setting) {
        return res.status(404).json({ success: false, message: 'Setting not found' });
      }

      if (setting.stampName) {
        // Remove stamp file from uploads
        fs.unlink(`./uploads/${setting.stampName}`);
      }

      await setting.destroy();

      return res.status(200).json({ success: true, message: 'Setting deleted successfully' });
    } catch (error) {
      console.error('Error deleting setting:', error);
      return res.status(500).json({ success: false, message: 'Failed to delete setting', error: error.message });
    }
  }
}

module.exports = SettingsController;
