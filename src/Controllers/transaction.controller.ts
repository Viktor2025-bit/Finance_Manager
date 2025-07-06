import { Request, Response, NextFunction } from "express";
import Transaction from "../Model/Transaction";
import User from "../Model/User";
import { Goal } from "../Model";
import { AppError } from "../Utils/error";
import logger from "../Utils/logger";
import { validationResult } from "express-validator/";

interface TransactionBody {
  amount: number;
  goalId: number;
  type: "income" | "expense";
  category: string;
  description?: string;
  date: string;
}

export const createTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError("Validation failed", 409, errors.array());
    }

    const {
      amount,
      type,
      category,
      description,
      date,
      goalId,
    }: TransactionBody = req.body;

    const userId = req.user?.id;

    if (goalId) {
      const goal = await Goal.findOne({
        where: {
          id: goalId,
          userId,
        },
      });

      if (!goalId) {
        throw new AppError("No Goal found", 404);
      }
    }

    const transaction = await Transaction.create({
      userId,
      amount,
      goalId,
      type,
      category,
      description,
      date: new Date(date),
    });

    if (goalId && type === "income") {
      const goal = await Goal.findByPk(goalId);
      if (goal && goal.status === "active") {
        const newCurrentAmount = Number(goal.currentAmount) + Number(amount);
        await goal.update({
          currentAmount: newCurrentAmount,
          status:
            newCurrentAmount >= goal.targetAmount ? "completed" : "active",
        });
      }
    }

    logger.info("Transaction created", {
      transactionId: transaction.id,
      userId,
    });

    res.status(201).json({
      success: true,
      data: {
        transactionId: transaction.id,
        userId,
        amount,
        type,
        category,
        description,
        date: transaction.date,
      },
    });
  } catch (error: any) {
    logger.error("Failed to create transaction :", {
      error: error.message,
    });
    next(error);
  }
};

export const getTransactions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError("Validation failed", 409, errors.array());
    }

    const { category, startDate, endDate, goalId } = req.query;
    const userId = req.user?.id;

    const where: any = { userId };

    if (category) where.category = category;
    if (goalId) where.goalId = parseInt(goalId as string);
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate as string);
      if (endDate) where.date.lte = new Date(endDate as string);
    }

    const transactions = await Transaction.findAll({
      where,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name"],
        },
      ],
      order: [["date", "DESC"]],
    });

    res.status(200).json({
      success: true,
      data: {
        transactions,
      },
    });
  } catch (error: any) {
    logger.error("Get transactions error", {
      error: error.message,
    });
    next(error);
  }
};

export const getTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const transaction = await Transaction.findOne({
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
        {
          model: Goal,
          as: "goal",
          attributes: ["id", "name"],
        },
      ],
    });

    if (!transaction) {
      throw new AppError("Transaction not found", 404);
    }

    res.status(200).json({
      success: true,
      data: {
        transaction,
      },
    });
  } catch (error: any) {
    logger.error("Get transaction error :", {
      error: error.message,
    });
    next(error);
  }
};

export const updateTransaction = async (
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
    const {
      amount,
      type,
      category,
      description,
      date,
      goalId,
    }: TransactionBody = req.body;

    const transaction = await Transaction.findOne({
      where: {
        id: parseInt(id),
        userId,
      },
    });
    if (!transaction) {
      throw new AppError("Transaction not found", 404);
    }

    if (goalId !== undefined) {
      if (goalId) {
        const goal = await Goal.findOne({
          where: {
            id: goalId,
            userId,
          },
        });
        if (goal) {
          throw new AppError("Goal not found", 404);
        }
      }
    }

    if (goalId !== transaction.goalId && transaction.type === "income") {
      if (transaction.goalId) {
        const oldGoal = await Goal.findByPk(transaction.goalId);
        if (oldGoal && oldGoal.status === "active") {
          await oldGoal.update({
            currentAmount:
              Number(oldGoal.currentAmount) - Number(transaction.amount),
          });
        }
      }

      if (goalId) {
        const newGoal = await Goal.findByPk(goalId);
        if (newGoal && newGoal.status === "active") {
          const newCurrentAmount =
            Number(newGoal.currentAmount) +
            Number(amount ?? transaction.amount);
          await newGoal.update({
            currentAmount: newCurrentAmount,
            status:
              newCurrentAmount >= newGoal.targetAmount ? "completed" : "active",
          });
        }
      }
    }

    await transaction.update({
      amount: amount ?? transaction.amount,
      type: type ?? transaction.type,
      category: category ?? transaction.category,
      description:
        description !== undefined ? description : transaction.description,
      date: date ? new Date(date) : transaction.date,
      goalId: goalId !== undefined ? goalId : transaction.goalId,
    });

    logger.info("Transaction updated!", {
      transactionId: transaction.id,
      userId,
    });

    res.status(200).json({
      success: true,
      data: {
        transaction,
      },
    });
  } catch (error: any) {
    logger.error("Update transaction failed :", {
      error: error.message,
    });
    next(error);
  }
};

export const deleteTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const transaction = await Transaction.findOne({
      where: {
        id: parseInt(id),
        userId,
      },
    });

    if (!transaction) {
      throw new AppError("Transaction not found", 404);
    }

    if (transaction.goalId && transaction.type === "income") {
      const goal = await Goal.findByPk(transaction.goalId);
      if (goal && goal.status === "active") {
        await goal.update({
          currentAmount:
            Number(goal.currentAmount) - Number(transaction.amount),
        });
      }
    }

    await transaction.destroy();
    logger.info("Transaction deleted!", {
      transactionId: transaction.id,
      userId,
    });

    res.status(200).json({
      success: true,
      message: "Transaction deleted!",
    });
  } catch (error: any) {
    logger.error("Delete transaction failed :", {
      error: error.message,
    });
    next(error);
  }
};