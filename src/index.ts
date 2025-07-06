import dotenv from "dotenv";
dotenv.config();

import express, { NextFunction, Request, Response } from "express";
const Sentry = require("@sentry/node")
const Handlers = Sentry.Handlers
import swaggerUi from "swagger-ui-express"
import { swaggerSpec } from "./swagger";
import sequelize from "./Database/index";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";
import logger from "./Utils/logger";
import authRouter from "./Routes/auth.routes";
import analyticsRouter from "./Routes/analytics.routes";
import budgetRouter from "./Routes/budget.routes";
import goalRouter from "./Routes/goal.routes";
import subscriptionRouter from "./Routes/subscription.routes";
import transactionRouter from "./Routes/transaction.routes";


import { startBudgetNotifications, startGoalNotification } from "./Utils/notifications";
import { Limiter } from "./Middlewares/rateLimiter.middleware";
import { metricsMiddleware, register } from "./Utils/metrics";
import { initSentry, sentryErrorHandler } from "./Utils/sentry";

const app = express();

initSentry(app)
app.use(Handlers.requestHandler())
app.use(Handlers.tracingHandler())

//Middlewares
app.use(cookieParser());
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/v1/user", authRouter)
app.use("/api/v1/transactions", transactionRouter);
app.use("/api/v1/budgets", budgetRouter);
app.use("/api/v1/goals", goalRouter);
app.use("/api/v1/analytics", analyticsRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Metrics Endpoint
app.get("/metrics", async (req: Request, res: Response) => {
  try {
    res.set("Content-Type", register.contentType);
    res.end(await register.metrics());
  } catch (error: any) {
    logger.error("Metrics endpoint error:", { error: error.message });
    res.status(500).json({
      success: false,
      message: "Failed to retrieve metrics",
    });
  }
});

// Health check
app.get("/health", async (req: Request, res: Response) => {
  try {
    await sequelize.authenticate();
    res.status(200).json({
      success: true,
      message: "Welcome to the Finance Api",
    });
  } catch (error: any) {
    logger.error("Health check failed :", {
      error: error.message,
    });
    res.status(500).json({
      success: false,
      message: "Database unavailable",
    });
  }
});

app.use(Limiter)
app.use(metricsMiddleware)

app.use(sentryErrorHandler)

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error("Unhandled error :", {
    error: err.message,
    stack: err.stack,
  });
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal server error",
    data: err.data || null,
  });
});

const port: number = parseInt(process.env.PORT || "7000", 10);

app.listen(port, async () => {
  logger.info(`Server is running on http://localhost:${port}`);
  try {
    await sequelize.authenticate();
    logger.info("PostgreSQL connected!");
    await sequelize.sync({
      force: true,
    });
    startBudgetNotifications()
    startGoalNotification()
  } catch (error: any) {
    logger.error("PostgreSQL connection error :", {
      error: error.message,
    });
    process.exit(1);
  }
});
