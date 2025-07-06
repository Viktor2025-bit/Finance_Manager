"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Budgets", {
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

      amount: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      category: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      month: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      year: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.addIndex("Budgets", ["userId"]);
    await queryInterface.addConstraint("Budgets", {
      fields: ["userId", "category", "month", "year"],
      type: "unique",
      name: "unique_user_category_month_year",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Budgets");
  },
};