import { body, query } from "express-validator/";

const categories = [
  "salary",
  "groceries",
  "rent",
  "utilities",
  "entertainment",
  "other",
];

export const TransactionValidation = [
  body("amount")
    .isFloat({ min: 0.01 })
    .withMessage("Amount must be a positive number"),

  body("type")
    .isIn(["income", "expense"])
    .withMessage("Type must be income or expense"),

  body("category").isIn(categories).withMessage("Invalid category"),

  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string"),

  body("date")
    .isISO8601()
    .toDate()
    .withMessage("Date must be valid ISO8601 date"),

  body("goalId").optional().isInt().withMessage("Goal ID must be an integer"),

  query("goalId").optional().isInt().withMessage("Goal ID must be an integer"),
];

export const BudgetValidation = [
  query("month")
    .optional()
    .isInt({ min: 1, max: 12 })
    .withMessage("Month must be between 1 and 12"),

  query("year")
    .optional()
    .isInt({ min: 2000, max: 2100 })
    .withMessage("Year must be between 2000 and 2100"),

  body("amount")
    .isFloat({ min: 0.01 })
    .withMessage("Amount must be a positive number"),

  body("category").isIn(categories).withMessage("Invalid category"),

  body("month")
    .isInt({ min: 1, max: 12 })
    .withMessage("Month must be between 1 and 12"),

  body("year")
    .isInt({ min: 2000, max: 2100 })
    .withMessage("Year must be between 2000 and 2100"),
];

export const GoalValidation = [
  body("name")
    .isString()
    .notEmpty()
    .withMessage("Name must be a non-empty string"),

  body("targetAmount")
    .isFloat({ min: 0.01 })
    .withMessage("Target amount must be a positive number"),

  body("category").isIn(categories).withMessage("Invalid category"),

  body("deadline")
    .isISO8601()
    .toDate()
    .withMessage("Deadline must be a valid ISO 8601 date"),

  query("status")
    .optional()
    .isIn(["active", "completed", "cancelled"])
    .withMessage("Invalid status"),
];

export const AnalyticsValidation = [
  query("startDate")
    .optional()
    .isISO8601()
    .toDate()
    .withMessage("Start date must be a valid ISO 8601 date"),

  query("endDate")
    .optional()
    .isISO8601()
    .toDate()
    .withMessage("End date must be a valid ISO 8601 date"),
];
