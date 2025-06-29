import { Router } from "express"
import { authenticate } from "../Middlewares/auth.middleware"
import { BudgetValidation } from "../Middlewares/validation.middleware"
import { createBudget, getBudgets, getBudget, updateBudget, deleteBudget } from "../Controllers/budget.controller"

const budgetRouter = Router()

budgetRouter.post("/create", authenticate, BudgetValidation, createBudget)

budgetRouter.get("/", authenticate, BudgetValidation, getBudgets)

budgetRouter.get("/:id", authenticate, getBudget)

budgetRouter.put("/:id", authenticate, BudgetValidation, updateBudget)

budgetRouter.delete("/:id", authenticate, deleteBudget)


export default budgetRouter