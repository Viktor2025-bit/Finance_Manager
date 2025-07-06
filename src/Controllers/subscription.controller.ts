import { NextFunction, Request, Response } from "express";
import Stripe from "stripe";
import { Subscription, User } from "../Model";
import logger from "../Utils/logger";
import { AppError } from "../Utils/error";
import { validationResult } from "express-validator/";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

interface SubscriptionBody {
  plan: "basic" | "premium";
}

export const createSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError("Validation failed", 400, errors.array());
    }

    const { plan }: SubscriptionBody = req.body;
    const userId = req.user?.id;

    const user = await User.findByPk(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    let subscription = await Subscription.findOne({
      where: {
        userId,
      },
    });
    if (
      subscription &&
      subscription.status === "active" &&
      subscription.plan === plan
    ) {
      throw new AppError("Subscription already created", 400);
    }

    //Create a stripe customer
    let stripeCustomerId = subscription?.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: userId!.toString(),
        },
      });
      stripeCustomerId = customer.id;
    }

    //Create payment intent for one-time payment
    const paymentIntent = await stripe.paymentIntents.create({
      amount: plan === "premium" ? 999 : 0,
      currency: "usd",
      customer: stripeCustomerId,
      metadata: {
        userId: userId!.toString(),
        plan,
      },
    });
    if (!subscription) {
      subscription = await Subscription.create({
        userId,
        stripeCustomerId,
        plan,
        status: "pending",
      });
    } else {
      await subscription.update({
        plan,
        status: "pending",
      });
    }

    logger.info("Subscription created!", {
      userId,
      plan,
      paymentIntentId: paymentIntent.id,
    });

    res.status(201).json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        subscriptionId: subscription.id,
      },
    });
  } catch (error: any) {
    logger.error("Create subscription error :", {
      error: error.message,
    });
    next(error);
  }
};

export const getSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const subscription = await Subscription.findOne({
      where: {
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

    if (!subscription) {
      throw new AppError("Subscription not found", 404);
    }

    res.status(200).json({
      success: true,
      data: {
        subscription,
      },
    });
  } catch (error: any) {
    logger.error("Get subscription error :", {
      error: error.message,
    });
    next(error);
  }
};

export const updateSubscription = async (
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
      plan,
      status,
    }: SubscriptionBody & { status: "active" | "canceled" | "pending" } =
      req.body;

    const subscription = await Subscription.findOne({
      where: {
        id: parseInt(id),
        userId,
      },
    });
    if (!subscription) {
      throw new AppError("Subscription not found", 404);
    }

    if (status === "canceled" && subscription.stripeSubscriptionId) {
      await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
    }

    await subscription.update({
      plan: plan ?? subscription.plan,
      status: status ?? subscription.status,
    });

    logger.info("Subscription updated", {
      subscriptionId: subscription.id,
      userId,
    });

    res.status(200).json({
      success: true,
      data: {
        subscription,
      },
    });
  } catch (error: any) {
    logger.error("Update subcription error :", {
      error: error.message,
    });
    next(error);
  }
};

export const handleStripeWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const sig = req.headers["stripe-signature"] as string;

    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const userId = parseInt(paymentIntent.metadata.userId);
        const plan = paymentIntent.metadata.plan as "basic" | "premium";

        const subscription = await Subscription.findOne({
          where: {
            userId,
          },
        });
        if (subscription) {
          await subscription.update({
            status: "active",
            plan,
          });
          logger.info("Subscription activated", {
            userId,
            plan,
          });
        }
        break;

      case "payment_intent.payment_failed":
        logger.warn("Payment failed", {
          paymentIntentId: (event.data.object as Stripe.PaymentIntent).id,
        });

        break;

      default:
        logger.info("Unhandled Stripe event", {
          eventType: event.type,
        });
    }
    res.status(200).json({
      recieved: true,
    });
  } catch (error: any) {
    logger.error("Webhook error :", {
      error: error.message,
    });
    res.status(400).json({
      success: false,
      message: "Webhook error",
    });
  }
};