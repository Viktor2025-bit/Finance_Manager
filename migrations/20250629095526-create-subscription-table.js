"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Subscriptions", {
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

      stripeCustomerId: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      stripeSubscriptionId: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      plan: {
        type: Sequelize.ENUM("basic", "premium"),
        allowNull: false,
        defaultValue: "basic",
      },

      status: {
        type: Sequelize.ENUM("active", "canceled", "pending"),
        allowNull: false,
        defaultValue: "pending",
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

    await queryInterface.addIndex("Subscriptions", ["userId"])
    await queryInterface.addIndex("Subscriptions", ["stripeCustomerId"])
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Subscriptions")
  },
};