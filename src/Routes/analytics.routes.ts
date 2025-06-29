import { Router } from "express"
import { getSummary, getCategoryBreakdown } from "../Controllers/analytics.controller"
import { authenticate } from "../Middlewares/auth.middleware"
import { AnalyticsValidation } from "../Middlewares/validation.middleware"

const analyticsRouter = Router()

analyticsRouter.get("/summary", authenticate, AnalyticsValidation, getSummary)

analyticsRouter.get("/category", authenticate, AnalyticsValidation, getCategoryBreakdown)

export default analyticsRouter