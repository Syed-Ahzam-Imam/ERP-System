'use strict';

const Branch = require('../models/branchModel');
// const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const db = require('../../config/dbConfig');

class BranchController {
  static async createBranch(branchData) {
    try {

      const existingBranch = await Branch.findOne({
        where: {
          email: branchData.email
        }
      });

      if (existingBranch) {
        throw new Error('A branch with this email already exists.');
      }

      const hashedPassword = await bcrypt.hash(branchData.password, 10);
      branchData.password = hashedPassword;

      const branch = await Branch.create(branchData);

      return branch;
    } catch (error) {
      console.error('Error creating branch:', error);
      throw error;
    }
  }

  static async login(email, password) {
    try {
      const branch = await Branch.findOne({ where: { email } });

      if (!branch) {
        return null;
      }

      const isPasswordValid = await bcrypt.compare(password, branch.password);

      if (!isPasswordValid) {
        throw new Error('Incorrect password.');
      }

      return branch;
    } catch (error) {
      throw error;
    }
  }

  static async getAllBranches(req, res) {
    try {
      const branches = await Branch.findAll({
        where: {
          isDeleted: false,
        },
      });

      const branchesWithUsers = branches.map(branch => {
        return {
          branchId: branch.branchId,
          branchName: branch.branchName,
          branchLocation: branch.branchLocation,
          branchPhoneNumber: branch.branchPhoneNumber,
          contactPerson: branch.contactPerson,
          email: branch.email,
          role: branch.role
        };
      });

      return res.status(200).json({ success: true, branchesWithUsers });
    } catch (error) {
      console.error('Error retrieving branches:', error);
      return res.status(500).json({ success: false, message: 'Failed to retrieve branches', error: error.message });
    }
  }

  static async getBranchById(req, res) {
    try {
      const branch = await Branch.findByPk(req.params.id);

      if (!branch) {
        return res.status(404).json({ success: false, message: 'Branch not found' });
      }

      return res.status(200).json({ success: true, branch });
    } catch (error) {
      console.error('Error retrieving branch:', error);
      return res.status(500).json({ success: false, message: 'Failed to retrieve branch', error: error.message });
    }
  }

  static async updateBranch(req, res) {
    try {
      const { branchName, branchLocation, branchPhoneNumber, contactPerson, email, password } = req.body;
      const branch = await Branch.findByPk(req.params.id);

      if (!branch) {
        return res.status(404).json({ success: false, message: 'Branch not found' });
      }

      let hashedPassword;
      if (password) {
        hashedPassword = await bcrypt.hash(password, 10);
      }

      await branch.update({ branchName, branchLocation, branchPhoneNumber, contactPerson, email, password: hashedPassword });

      return res.status(200).json({ success: true, message: 'Branch updated successfully', branch });
    } catch (error) {
      console.error('Error updating branch:', error);
      return res.status(500).json({ success: false, message: 'Failed to update branch', error: error.message });
    }
  }

  static async deleteBranch(req, res) {
    try {
      const branch = await Branch.findByPk(req.params.id);

      if (!branch) {
        return res.status(404).json({ success: false, message: 'Branch not found' });
      }

      // Soft delete by updating the isDeleted flag
      await branch.update({ isDeleted: true });

      return res.status(200).json({ success: true, message: 'Branch soft deleted successfully' });
    } catch (error) {
      console.error('Error soft deleting branch:', error);
      return res.status(500).json({ success: false, message: 'Failed to soft delete branch', error: error.message });
    }
  }

}

module.exports = BranchController;
