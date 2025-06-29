import nodeCron from "node-cron";
import { Budget, Transaction, User, Goal } from "../Model";
import { Op } from "sequelize";
import { sendEmail } from "./email";
import logger from "./logger";

// Types for fetched models including included User info
interface BudgetWithSpent {
  id: number;
  userId: number;
  category: string;
  amount: number;
  month: number;
  year: number;
  spent: number;
  user: {
    id: number;
    email: string;
    name: string;
  };
}

interface GoalWithProgress {
  id: number;
  userId: number;
  name: string;
  targetAmount: number;
  currentAmount: number;
  status: "active" | "completed" | "cancelled";
  milestoneNotified: boolean;
  user: {
    id: number;
    email: string;
    name: string;
  };
}

// -----------------------
// Budget Notification
// -----------------------

export const checkBudgets = async () => {
  try {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    // Fetch all budgets for the current month/year, including User info
    const budgets = await Budget.findAll({
      where: { month, year },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    const budgetsWithSpent: BudgetWithSpent[] = await Promise.all(
      budgets.map(async (budget) => {
        const spent = await Transaction.sum("amount", {
          where: {
            userId: budget.userId,
            category: budget.category,
            type: "expense",
            date: {
              [Op.gte]: new Date(budget.year, budget.month - 1, 1),
              [Op.lt]: new Date(budget.year, budget.month, 1),
            },
          },
        });

        return {
          ...budget.toJSON(),
          spent: spent || 0,
        } as BudgetWithSpent;
      })
    );

    for (const budget of budgetsWithSpent) {
      const spentPercentage = (budget.spent / budget.amount) * 100;

      if (spentPercentage >= 100) {
        await sendEmail({
          to: budget.user.email,
          subject: `Budget Exceeded: ${budget.category}`,
          text: `Dear ${budget.user.name},\n\nYour ${budget.category} budget for ${month}/${year} ($${budget.amount}) has been exceeded. You've spent $${budget.spent}.\n\nPlease review your expenses.\n\nBest,\nFinance Manager`,
        });
      } else if (spentPercentage >= 90) {
        await sendEmail({
          to: budget.user.email,
          subject: `Budget Warning: ${budget.category}`,
          text: `Dear ${budget.user.name},\n\nYou're approaching your ${
            budget.category
          } budget limit for ${month}/${year} ($${
            budget.amount
          }). You've spent $${budget.spent} (${spentPercentage.toFixed(
            2
          )}%).\n\nConsider adjusting your spending.\n\nBest,\nFinance Manager`,
        });
      }
    }

    logger.info("Budget notifications checked", { month, year });
  } catch (error: any) {
    logger.error("Budget notifications error", {
      message: error.message,
      stack: error.stack,
    });
  }
};

export const startBudgetNotifications = () => {
  nodeCron.schedule("0 8 * * *", checkBudgets, {
    timezone: "America/New_York",
  });
  logger.info("Budget notification scheduler started");
};

// -----------------------
// Goal Notification
// -----------------------
export const checkGoals = async () => {
  try {
    const goals = await Goal.findAll({
      where: { status: "active" },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    // Convert Sequelize instances to plain objects for proper typing
    const plainGoals = goals.map((goal) => goal.toJSON()) as GoalWithProgress[];

    for (const goal of plainGoals) {
      if (!goal.user) {
        logger.warn(`No user found for goal ID ${goal.id}`);
        continue;
      }

      const progressPercentage = 
        goal.targetAmount > 0
          ? (goal.currentAmount / goal.targetAmount) * 100
          : 0;

      // Mark completed goal
      if (progressPercentage >= 100 && goal.status === "active") {
        // Find the actual Sequelize instance to update it
        const goalInstance = goals.find((g) => g.id === goal.id);
        if (goalInstance) {
          await goalInstance.update({ status: "completed" });
        }

        try {
          await sendEmail({
            to: goal.user.email,
            subject: `Goal Achieved: ${goal.name}`,
            text: `Dear ${goal.user.name},\n\nCongratulations! You've achieved your goal "${goal.name}" ($${goal.targetAmount}).\n\nKeep up the great work!\n\nBest,\nFinance Manager`,
          });
        } catch (emailErr: any) {
          logger.error("Failed to send goal completion email", {
            goalId: goal.id,
            email: goal.user.email,
            error: emailErr.message,
          });
        }
      }
      // Halfway milestone notification
      else if (
        progressPercentage >= 50 &&
        progressPercentage < 100 &&
        !goal.milestoneNotified
      ) {
        try {
          await sendEmail({
            to: goal.user.email,
            subject: `Goal Milestone: ${goal.name}`,
            text: `Dear ${goal.user.name},\n\nYou're halfway to your goal "${
              goal.name
            }"! You've saved $${goal.currentAmount} of $${
              goal.targetAmount
            } (${progressPercentage.toFixed(
              2
            )}%).\n\nKeep going!\n\nBest,\nFinance Manager`,
          });

          // Update milestoneNotified on the actual instance
          const goalInstance = goals.find((g) => g.id === goal.id);
          if (goalInstance) {
            await goalInstance.update({ milestoneNotified: true });
          }
        } catch (emailErr: any) {
          logger.error("Failed to send milestone email", {
            goalId: goal.id,
            email: goal.user.email,
            error: emailErr.message,
          });
        }
      }
    }

    logger.info("Goal notifications checked", { totalGoals: goals.length });
  } catch (error: any) {
    logger.error("Goal notifications error", {
      message: error.message,
      stack: error.stack,
    });
  }
};

export const startGoalNotification = () => {
   nodeCron.schedule("0 9 * * *", checkGoals, {
    timezone: "America/New_York",
  });
  logger.info("Goals notification scheduler started");
}
