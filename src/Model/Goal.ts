import { DataTypes, Model, InferAttributes, InferCreationAttributes } from "sequelize";
import sequelize from "../Database/index";
import type UserType from "../Model/User";


class Goal extends Model {
  declare id: number;
  declare userId: number;
  declare name: number;
  declare targetAmount: number;
  declare currentAmount: number;
  declare category: string;
  declare deadline: Date;
  declare status: "active" | "completed" | "cancelled";
  declare createdAt: Date;
  declare updatedAt: Date;
  declare user : UserType;
}
Goal.init(
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

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    targetAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    currentAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue : 0.0
    },

    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    deadline: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM("active", "completed", "cancelled"),
      allowNull: false,
      defaultValue: "active",
    },

    milestoneNotified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
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
    modelName: "Goal",
    tableName: "Goals",
    timestamps: true,
    indexes: [
      {
        fields: ["userId"],
      },
      {
        fields: ["status"],
      },
    ],
  }
);

export default Goal;
