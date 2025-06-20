import dotenv from "dotenv";
dotenv.config();

import express, { NextFunction, Request, Response } from "express";
import sequelize from "./Database/index";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";
import logger from "./Utils/logger";
import authRouter from "./Routes/auth.routes";

const app = express();

//Middlewares
app.use(cookieParser());
app.use(helmet());
app.use(cors());
app.use(express.json());


// Routes
app.use("/api/v1/user", authRouter)

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
  } catch (error: any) {
    logger.error("PostgreSQL connection error :", {
      error: error.message,
    });
    process.exit(1);
  }
});
