import { DataTypes, Model } from "sequelize";
import sequelize from "../Database/index";

class Budget extends Model {
  declare id: number;
  declare userId: number;
  declare amount: number;
  declare category: string;
  declare month: number;
  declare year: number;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Budget.init(
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
        key: "id",
      },
    },

    amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    month: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    year: {
      type: DataTypes.INTEGER,
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
    modelName: "Budget",
    tableName: "Budgets",
    timestamps: true,
    indexes: [
      {
        fields: ["userId"],
      },
      {
        unique: true,
        fields: ["userId", "category", "month", "year"],
      },
    ],
  }
);

export default Budget
