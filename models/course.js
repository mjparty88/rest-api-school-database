'use strict'
const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  class Course extends Sequelize.Model {

  }
  Course.init({
    //may not need id
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    estimatedTime: {
      type:Sequelize.STRING,
    },
    materialsNeeded: {
      type:Sequelize.STRING,
    }
  },{ sequelize })

  Course.associate = (model) => {
    Course.belongsTo(model.User, {
      foreignKey: {
        fieldName: 'userId',
        allowNull: false,
      }
    });
  }

  return Course;
}
