const Sentry = require("@sentry/node");
const Handlers = Sentry.Handlers;
import { Express } from "express";
import logger from "./logger";

export const initSentry = (app: Express) => {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    environment: process.env.NODE_ENV || "development",
  });

  app.use(Handlers.requestHandler());
  app.use(Handlers.tracingHandler());

  logger.info("Sentry initialized");
};

export const sentryErrorHandler = Handlers.errorHandler();