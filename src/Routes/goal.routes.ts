import { Router } from "express";
import { authenticate } from "../Middlewares/auth.middleware";
import { GoalValidation } from "../Middlewares/validation.middleware";
import { createGoal, getGoals, getGoal, updateGoal, deleteGoal } from "../Controllers/goal.controller";

const goalRouter = Router()

goalRouter.post("/create", authenticate, GoalValidation, createGoal)

goalRouter.get("/", authenticate, GoalValidation, getGoals)

goalRouter.get("/:id", authenticate, getGoal)

goalRouter.put("/:id", authenticate, GoalValidation, updateGoal)

goalRouter.delete("/:id", authenticate, deleteGoal)

export default goalRouter