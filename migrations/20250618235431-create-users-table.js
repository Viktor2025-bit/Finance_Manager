'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable("Users", {

      id : {
        type : Sequelize.INTEGER,
        primaryKey : true,
        autoIncrement : true
      },

      name : {
        type : Sequelize.STRING,
        allowNull : false
      },

      email : {
        type : Sequelize.STRING,
        allowNull : false,
        unique : true
      },

      password : {
        type : Sequelize.STRING,
        allowNull : false
      },

      isVerified : {
        type : Sequelize.BOOLEAN,
        defaultValue : false
      },

      createdAt : {
        type : Sequelize.DATE,
        allowNull : false,
        defaultValue : Sequelize.literal("CURRENT_TIMESTAMP")
      },

      updatedAt : {
        type : Sequelize.DATE,
        allowNull : false,
        defaultValue : Sequelize.literal("CURRENT_TIMESTAMP")
      }
    })
  },

  async down (queryInterface, Sequelize) {
   await queryInterface.dropTable("Users")
  }
};
