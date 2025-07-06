 "use strict";
 

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Transactions", {
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

      goalId : {
        type :Sequelize.INTEGER,
        allowNull : true,
        references : {
          model : "Goals",
          key : "id"
        }
      },

      amount: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      type: {
        type: Sequelize.ENUM("income", "expense"),
        allowNull: false,
      },

      category: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      description: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      date: {
        type: Sequelize.DATE,
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

    await queryInterface.addIndex("Transactions", ["userId"]);
    await queryInterface.addIndex("Transactions", ["date"]);
    await queryInterface.addIndex("Transactions", ["goalId"])
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Transactions");
  },
};