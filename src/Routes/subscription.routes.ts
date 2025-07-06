import { Router } from "express";
import { createSubscription, getSubscription, updateSubscription, handleStripeWebhook } from "../Controllers/subscription.controller";
import { authenticate } from "../Middlewares/auth.middleware";
import { subscriptionValidation } from "../Middlewares/validation.middleware";

const subscriptionRouter = Router()

subscriptionRouter.post("/create", authenticate, subscriptionValidation, createSubscription)

subscriptionRouter.get("/:id", authenticate, subscriptionValidation, getSubscription)

subscriptionRouter.patch("/:id", authenticate, subscriptionValidation, updateSubscription)

subscriptionRouter.post("/webhook", handleStripeWebhook)

export default subscriptionRouter