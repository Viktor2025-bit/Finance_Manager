import { Request, Response, NextFunction } from "express";
import { Budget, Transaction, User } from "../Model";
import { AppError } from "../Utils/error";
import { validationResult } from "express-validator/";
import { Op } from "sequelize";
import logger from "../Utils/logger";

interface BudgetBody {
  category: string;
  amount: number;
  month: number;
  year: number;
}

export const createBudget = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError("Validation failed", 400, errors.array());
    }

    const { category, amount, month, year }: BudgetBody = req.body;
    const userId = req.user?.id;

    const existingBudget = await Budget.findOne({
      where: {
        userId,
        category,
        amount,
        month,
        year,
      },
    });


    if (existingBudget) {
      throw new AppError(
        `Budget already exists for this ${category}, ${amount}, ${month}, ${year}`,
        400
      );
    }

    const budget = await Budget.create({
      userId,
      category,
      amount,
      month,
      year,
    });

    logger.info("Budget created!", {
      budgetId: budget.id,
      userId,
    });

    res.status(201).json({
      success: true,
      data: {
        budget: budget.id,
        userId,
        category,
        amount,
        month,
        year,
      },
    });
  } catch (error: any) {
    logger.error("Error creating budget :", {
      error: error.message,
    });
    next(error);
  }
};

export const getBudgets = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { month, year } = req.query;
    const userId = req.user?.id;

    const where: any = { userId };
    if (month) where.month = parseInt(month as string);
    if (year) where.year = parseInt(year as string);

    const budgets = await Budget.findAll({
      where,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    const budgetWithSpent = await Promise.all(
      budgets.map(async (budget) => {
        const spent = await Transaction.sum("amount", {
          where: {
            userId,
            category: budget.category,
            type: "expense",
            date: {
              [Op.gte]: new Date(budget.year, budget.month - 1, 1),
              [Op.lt]: new Date(budget.year, budget.month, 1),
            },
          },
        });
        return { ...budget.toJSON(), spent: spent || 0 };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        budgets: budgetWithSpent,
      },
    });
  } catch (error: any) {
    logger.error("Get budgets error :", {
      error: error.message,
    });
    next(error);
  }
};

export const getBudget = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const budget = await Budget.findOne({
      where: {
        id: parseInt(id),
        userId,
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    if (!budget) {
      throw new AppError("Budget not found", 404);
    }

    const spent = await Transaction.sum("amount", {
      where: {
        userId,
        category: budget.category,
        type: "expense",
        date: {
          [Op.gte]: new Date(budget.year, budget.month - 1, 1),
          [Op.lt]: new Date(budget.year, budget.month, 1),
        },
      },
    });

    res.status(200).json({
      success: true,
      data: {
        budget: budget.toJSON(),
        spent: spent || 0,
      },
    });
  } catch (error: any) {
    logger.error("Get budget failed :", {
      error: error.message,
    });
    next(error);
  }
};

export const updateBudget = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError("Validation failed", 400, errors.array());
    }

    const { id } = req.params;
    const userId = req.user?.id;

    const { category, amount, month, year }: BudgetBody = req.body;

    const budget = await Budget.findOne({
      where: {
        id: parseInt(id),
        userId,
      },
    });

    if (!budget) {
      throw new AppError("Budget not found", 404);
    }

    if (category && month && year) {
      const existingBudget = await Budget.findOne({
        where: {
          userId,
          category,
          amount,
          month,
          year,
          id: {
            [Op.ne]: parseInt(id),
          },
        },
      });

      if (existingBudget) {
        throw new AppError(
          `Budget already exists for this ${category}, ${month}, ${year}`,
          400
        );
      }
    }

    await budget.update({
      category: category ?? budget.category,
      amount: amount ?? budget.amount,
      month: month ?? budget.month,
      year: year ?? budget.year,
    });

    const spent = await Transaction.sum("amount", {
      where: {
        userId,
        category: budget.category,
        type: "expense",
        date: {
          [Op.gte]: new Date(budget.year, budget.month - 1, 1),
          [Op.lt]: new Date(budget.year, budget.month, 1),
        },
      },
    });

    logger.info("Budget updated!", {
      budgetId: budget.id,
      userId,
    });

    res.status(200).json({
      success: true,
      data: {
        budget: {
          ...budget.toJSON(),
          spent: spent || 0,
        },
      },
    });
  } catch (error: any) {
    logger.error("Update budget failed :", {
      error: error.message,
    });
    next(error);
  }
};

export const deleteBudget = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const budget = await Budget.findOne({
      where: {
        userId,
        id: parseInt(id),
      },
    });

    if (!budget) {
      throw new AppError("Budget not found", 404);
    }

    await budget.destroy();

    res.status(200).json({
      success: true,
      message: "Budget deleted!",
    });
  } catch (error: any) {
    logger.error("Delete budget failed :", {
      error: error.message,
    });
  }
};