// 'use strict';

// const { DataTypes } = require('sequelize');
// const db = require('../../config/dbConfig'); // Import your MySQL database configuration
// const Branch = require('./branchModel');

// const User = db.define('User', {
//   userId: {
//     type: DataTypes.INTEGER,
//     primaryKey: true,
//     autoIncrement: true
//   },
//   firstName: {
//     type: DataTypes.STRING,
//     allowNull: false
//   },
//   lastName: {
//     type: DataTypes.STRING,
//     allowNull: false
//   },
//   email: {
//     type: DataTypes.STRING,
//     allowNull: false,
//     unique: true,
//     validate: {
//       isEmail: true
//     }
//   },
//   password: {
//     type: DataTypes.STRING,
//     allowNull: false
//   },
//   phoneNumber: {
//     type: DataTypes.STRING,
//     allowNull: false,
//     unique: true,
//     validate: {
//       isPhoneNumber(value) {
//         if (!/^[0-9]{11}$|^\+92[0-9]{10}$/.test(value)) {
//           throw new Error(
//             'Phone number should be 11 digits without spaces or special characters, or 13 digits if starting with +.'
//           );
//         }
//       }
//     }
//   },
//   role: {
//     type: DataTypes.STRING,
//     allowNull: false,
//     validate: {
//       isIn: [['admin', 'branchHead']]
//     }
//   },
//   address: {
//     type: DataTypes.STRING,
//     allowNull: false
//   }
// }, {
//   timestamps: false, // Disable timestamps (createdAt, updatedAt)
//   tableName: 'users' // Define the table name if it's different from the model name
// });

// User.belongsTo(Branch, { foreignKey: 'branchId' });

// module.exports = User;
