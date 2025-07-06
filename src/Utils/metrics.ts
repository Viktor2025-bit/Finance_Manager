import { Request, Response, NextFunction } from "express";
import client from "prom-client";
import logger from "./logger";

export const register = new client.Registry();
client.collectDefaultMetrics({
  register,
});

export const httpRequestDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "code"],
  registers: [register],
});

export const httpRequestsTotal = new client.Counter({
    name : "http_requests_total",
    help : "Total number of HTTP requests",
    labelNames : ["method", "route", "code"],
    registers : [register]
})

export const metricsMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route ? req.route.path : req.path;
    httpRequestDuration
      .labels(req.method, route, res.statusCode.toString())
      .observe(duration);
    httpRequestsTotal
      .labels(req.method, route, res.statusCode.toString())
      .inc();
    logger.info("Request processed", {
      method: req.method,
      path: route,
      status: res.statusCode,
      duration,
    });
    next();
  });
};