'use strict';

const jwtUtils = require('../utils/jwtUtils');
const BranchController = require('./branchController');
const Settings = require('../models/settingsModel');

class AuthController {
  static async login(req, res) {
    const { email, password } = req.body;
    try {
      let branch = await BranchController.login(email, password);

      if (!branch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const authToken = jwtUtils.generateToken({
        id: branch.branchId,
        email: branch.email,
        role: branch.role,
      });

      const setting = await Settings.findOne({
        where: {
          branchId: branch.branchId
        }
      });

      const logo = setting?.logoName ? setting?.logoName : ''; 

      return res.status(200).json({ success: true, message: 'Login successful', branch, authToken, logo });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({ success: false, message: 'Login failed', error: error.message });
    }
  }


  static async signup(req, res) {
    try {

      let branch = await BranchController.createBranch(req.body);

      if (!branch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const authToken = jwtUtils.generateToken({
        id: branch.branchId,
        email: branch.email,
        role: branch.role,
      });

      return res.status(200).json({ success: true, message: 'SignUp successful', branch, authToken });
    } catch (error) {
      console.error('SignUp error:', error);
      return res.status(500).json({ success: false, message: 'SignUp failed', error: error.message });
    }
  }

  static async logout(req, res) {
    const authToken = req.header('Authorization');

    if (!authToken) {
      return res.status(401).json({ success: false, message: 'Access denied. Missing authentication token.' });
    }

    try {
      const token = authToken.split(' ')[1]; // Splitting the token
      jwtUtils.addToBlacklist(token); // Add the token to the blacklist

      // Respond with a success message
      res.status(200).json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
      console.error('Logout error:', error);
      return res.status(500).json({ success: false, message: 'Failed to log out', error: error.message });
    }
  }
}

module.exports = AuthController;
