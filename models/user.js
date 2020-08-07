'use strict'
const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  class User extends Sequelize.Model {

  }
  User.init({
    //may not need id
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    firstName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    lastName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    emailAddress: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
    }
  },{ sequelize })

  User.associate = (model) => {
    User.hasMany(model.Course, {
      foreignKey: {
        fieldName: 'userId',
        allowNull: false,
      }
    });
  }

  return User;
}
