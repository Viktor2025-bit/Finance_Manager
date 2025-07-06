import { DataTypes, Model } from "sequelize";
import sequelize from "../Database/index";

class Transaction extends Model {
  declare id: number;
  declare userId: number;
  declare goalId: number | null;
  declare amount: number;
  declare type: "income" | "expense";
  declare category: string;
  declare description?: string;
  declare date: Date;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Transaction.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id", //id of the user
      },
    },

    goalId : {
      type : DataTypes.INTEGER,
      allowNull : true,
      references : {
        model : "Goals",
        key : "id"
      }
    },

    amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    type: {
      type: DataTypes.ENUM("income", "expense"),
      allowNull: false,
    },

    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Transaction",
    tableName: "Transactions",
    timestamps: true,
    indexes: [{ fields: ["userId"] }, { fields: ["date"] }, { fields : ["goalId"]}],
  }
);

export default Transaction