import { Router } from "express"
import { authenticate } from "../Middlewares/auth.middleware"
import { TransactionValidation } from "../Middlewares/validation.middleware"
import { createTransaction, getTransactions, getTransaction, updateTransaction, deleteTransaction } from "../Controllers/transaction.controller"

const transactionRouter = Router()

transactionRouter.post("/create", authenticate, TransactionValidation, createTransaction )

transactionRouter.get("/", authenticate, TransactionValidation, getTransactions)

transactionRouter.get("/:id", authenticate, getTransaction)

transactionRouter.put("/:id", authenticate, TransactionValidation, updateTransaction)

transactionRouter.delete("/:id", authenticate, deleteTransaction)

export default transactionRouter