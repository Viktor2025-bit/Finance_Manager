import { Request, Response, NextFunction } from "express";
import { Transaction } from "../Model";
import { AppError } from "../Utils/error";
import logger from "../Utils/logger";
import { validationResult } from "express-validator/";
import { Op } from "sequelize";

export const getSummary = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError("Validation failed", 400, errors.array());
    }

    const { startDate, endDate } = req.query;
    const userId = req.user?.id;

    const where: any = { userId };
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date[Op.gte] = new Date(startDate as string);
      if (endDate) where.date[Op.lte] = new Date(endDate as string);
    }

    const income =
      (await Transaction.sum("amount", {
        where: {
          ...where,
          type: "income",
        },
      })) || 0;

    const expenses =
      (await Transaction.sum("amount", {
        where: {
          ...where,
          type: "expense",
        },
      })) || 0;

    res.status(200).json({
      success: true,
      data: {
        income,
        expenses,
        savings: income - expenses,
      },
    });
  } catch (error: any) {
    logger.error("Get summary error :", {
      error: error.message,
    });
    next(error);
  }
};

export const getCategoryBreakdown = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError("Validation failed", 400, errors.array());
    }

    const { startDate, endDate } = req.query;
    const userId = req.user?.id;

    const where: any = { userId, type: "expense" };
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date[Op.gte] = new Date(startDate as string);
      if (endDate) where.date[Op.lte] = new Date(endDate as string);
    }

    const categories = await Transaction.findAll({
      where,
      attributes: [
        "category",
        [
          Transaction.sequelize!.fn(
            "SUM",
            Transaction.sequelize!.col("amount")
          ),
          "total",
        ],
      ],
      group: ["category"],
      raw: true,
    });

    res.status(200).json({
      success: true,
      data: {
        categories,
      },
    });
  } catch (error: any) {
    logger.error("Get category breakdown error :", {
      error: error.message,
    });
    next(error);
  }
};