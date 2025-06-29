"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Goals", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
      },

      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      targetAmount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },

      currentAmount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },

      category: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      status: {
        type: Sequelize.ENUM("active", "completed"),
        allowNull: false,
        defaultValue: "active",
      },

      deadline: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.addIndex("Goals", ["userId"]);
    await queryInterface.addIndex("Goals", ["status"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Goals");
  },
};
