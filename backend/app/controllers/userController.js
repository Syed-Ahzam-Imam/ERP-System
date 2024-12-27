// 'use strict';

// const User = require('../models/userModel');
// const Branch = require('../models/branchModel');
// const bcrypt = require('bcrypt');
// const db = require('../../config/dbConfig');

// class UserController {
//   static async createUser(userData) {
//     try {
//       const hashedPassword = await bcrypt.hash(userData.password, 10);
//       userData.password = hashedPassword;
  
//       // Check if the email already exists in the user table
//       const existingUser = await User.findOne({ where: { email: userData.email } });
  
//       if (existingUser) {
//         throw new Error('A user with the provided email already exists.');
//       }
  
//       if (userData.role == 'branchHead' && userData.branchId == null) {
//         throw new Error('BranchHead must belong to a branch. Provide BranchId.');
//       }
  
//       let transaction;
  
//       try {
//         // Start a transaction
//         transaction = await db.transaction();
  
//         // Create the user
//         const createdUser = await User.create(userData, { transaction });
  
//         if (userData.branchId) {
//           // If branchId is provided, update the userId foreign key in the branch table
//           await Branch.update(
//             { userId: createdUser.userId },
//             { where: { branchId: userData.branchId }, transaction }
//           );
//         }
  
//         // Commit the transaction
//         await transaction.commit();
  
//         return createdUser;
//       } catch (error) {
//         // Rollback the transaction in case of an error
//         if (transaction) await transaction.rollback();
//         throw error;
//       }
//     } catch (error) {
//       throw error;
//     }
//   }
  

//   static async login(email, password) {
//     try {
//       const user = await User.findOne({ where: { email } });

//       if (!user) {
//         return null;
//       }

//       const isPasswordValid = await bcrypt.compare(password, user.password);

//       if (!isPasswordValid) {
//         throw new Error('Incorrect password.');
//       }

//       return user;
//     } catch (error) {
//       throw error;
//     }
//   }

//   static async getUserByBranchId(req, res) {
//     try {
//       const user = await User.findAll({
//         where: {
//           userId: req.params.userId
//         }
//       });

//       if (!user) {
//         return res.status(404).json({ success: false, message: 'Users not found' });
//       }

//       return res.status(200).json({ success: true, user });
//     } catch (error) {
//       console.error('Error retrieving Users:', error);
//       return res.status(500).json({ success: false, message: 'Failed to retrieve Users', error: error.message });
//     }
//   }
// }

// module.exports = UserController;
