import { DataTypes, Model } from "sequelize";
import sequelize from "../Database/index";

class Subscription extends Model {
  declare id: number;
  declare userId: number;
  declare stripeCustomerId: string;
  declare stripeSubscriptionId: string | null;
  declare plan: "basic" | "premium";
  declare status: "active" | "canceled" | "pending";
  declare createdAt: Date;
  declare updatedAt: Date;
}

Subscription.init(
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

    stripeCustomerId: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    stripeSubscriptionId: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    plan: {
      type: DataTypes.ENUM("basic", "premium"),
      allowNull: false,
      defaultValue: "basic",
    },

    status: {
      type: DataTypes.ENUM("active", "canceled", "pending"),
      allowNull: false,
      defaultValue: "pending",
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
    modelName: "Subscription",
    tableName: "Subscriptions",
    timestamps: true,
    indexes: [
      {
        fields: ["userId"],
      },
      {
        fields: ["stripeCustomerId"],
      },
    ],
  }
);

export default Subscription