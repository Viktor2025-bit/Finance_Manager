import { Sequelize } from "sequelize";
import User from "./User";
import Transaction from "./Transaction";
import Budget from "./Budget";
import Goal from "./Goal";
import Subscription from "./Subscription";

const env = process.env.NODE_ENV || "development";
const config = require("../../config/config.json")[env];

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    ...config,
    dialect: "postgres",
  }
);

User.hasMany(Transaction, {
  foreignKey: "userId",
  as: "transactions",
});

Transaction.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

User.hasMany(Budget, {
  foreignKey: "userId",
  as: "budgets",
});

Budget.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

User.hasMany(Goal, {
  foreignKey: "userId",
  as: "goals",
});

Goal.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

Goal.hasMany(Transaction, {
    foreignKey : "goalId",
    as : "transactions"
})

Transaction.belongsTo(Goal, {
    foreignKey : "goalId",
    as : "goal"
})

User.hasOne(Subscription, {
  foreignKey : "userId",
  as : "subscription"
})

Subscription.belongsTo(User, {
  foreignKey : "userId",
  as : "user"
})

export { User, Transaction, Budget, Goal, Subscription, sequelize };
