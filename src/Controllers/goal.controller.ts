import { NextFunction, Request, Response } from "express";
import { Goal, Transaction, User } from "../Model";
import { AppError } from "../Utils/error";
import logger from "../Utils/logger";
import { validationResult } from "express-validator/";

interface GoalBody {
  name: string;
  targetAmount: number;
  category: string;
  deadline: string;
  status : string;
}

export const createGoal = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError("Validation failed", 400, errors.array());
    }

    const userId = req.user?.id;
    const { name, targetAmount, category, deadline }: GoalBody = req.body;

    const goal = await Goal.create({
      userId,
      name,
      targetAmount,
      category,
      deadline: new Date(deadline),
    });

    logger.info("Goal created!", {
      goalId: goal.id,
      userId,
    });

    res.status(201).json({
      success: true,
      data: {
        userId,
        name,
        targetAmount,
        category,
        deadline,
      },
    });
  } catch (error: any) {
    logger.error("Create goal failed :", {
      error: error.message,
    });
    next(error);
  }
};

export const getGoals = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const { status } = req.query;

    const where: any = { userId };

    if (status) where.status = status;

    const goals = await Goal.findAll({
      where,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    if (!goals) {
      throw new AppError("No goals created yet", 404);
    }

    res.status(200).json({
      success: true,
      data: {
        userId,
        goals,
      },
    });
  } catch (error: any) {
    logger.error("Get goals failed :", {
      error: error.message,
    });
    next(error);
  }
};

export const getGoal = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const goal = await Goal.findOne({
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
          model: Transaction,
          as: "transactions",
          attributes: ["id", "amount", "date"],
        },
      ],
    });

    if (!goal) {
      throw new AppError("No goal found", 404);
    }

    res.status(200).json({
      success: true,
      data: {
        goalId: goal.id,
        goal,
      },
    });
  } catch (error: any) {
    logger.error("Get goal failed :", {
      error: error.message,
    });
    next(error);
  }
};

export const updateGoal = async (
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

    const { name, targetAmount, category, deadline, status }: GoalBody = req.body;

    const goal = await Goal.findOne({
      where: {
        id: parseInt(id),
        userId,
      },
    });

    if (!goal) {
      throw new AppError("No goal found", 404);
    }

    await goal.update({
      name: name ?? goal.name,
      targetAmount: targetAmount ?? goal.targetAmount,
      category: category ?? goal.category,
      deadline: deadline ? new Date(deadline) : goal.deadline,
      status: status ?? goal.status,
    });

    res.status(200).json({
      success : true,
      data : {
        goalId: goal.id,
        goal
      }
    })
  } catch (error: any) {
    logger.error("Update goal failed :", {
      error: error.message,
    });
    next(error);
  }
};

export const deleteGoal = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const goal = await Goal.findOne({
      where: {
        id: parseInt(id),
        userId,
      },
    });

    if (!goal) {
      throw new AppError("No goal found", 404);
    }

    await Transaction.update(
      {
        goalId: null,
      },
      {
        where: {
          goalId: goal.id,
        },
      }
    );

    await goal.destroy();

    res.status(200).json({
      success: true,
      message: "Goal deleted!",
    });
  } catch (error: any) {
    logger.error("Delete goal failed :", {
      error: error.message,
    });
    next(error);
  }
};
