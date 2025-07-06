import { Request, Response, NextFunction } from "express";
import {
  RateLimitRequestHandler,
  RateLimitExceededEventHandler,
} from "express-rate-limit";
import rateLimit from "express-rate-limit";
import logger from "../Utils/logger";
import { Subscription } from "../Model";

export const Limiter: RateLimitRequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: async (req: Request) => {
    if (!req.user) return 100;
    const subscription = await Subscription.findOne({
      where: {
        userId: req.user.id,
      },
    });
    return subscription?.plan === "premium" ? 500 : 100;
  },

  keyGenerator: (req: Request) => {
    return (req as any).user ? `user:${(req as any).user.id}` : `ip:${req.ip}`;
  },
  message: {
    success: false,
    message: "Too many requests, please try again later",
  },
  statusCode: 429,
  handler: (
    req: Request,
    res: Response,
    next: NextFunction,
    options: {
      statusCode: number;
      message: any;
      key?: string;
    }
  ) => {
    logger.warn("Rate limit exceeded", {
      key: options.key,
      ip: req.ip,
    });
    res.status(options.statusCode).json(options.message);
  },
});