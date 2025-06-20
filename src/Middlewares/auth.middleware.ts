import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../Model/User";
import { AppError } from "../Utils/error";
import logger from "../Utils/logger";

declare module "express-serve-static-core" {
  interface Request {
    user?: {
      id: number;
      email: string;
    };
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let token;
    if (req.headers.authorization) {
      //check the token
      token = req.headers.authorization?.split(" ")[1]; //Extract the token
    }
    if (!token) {
      throw new AppError("No token provided", 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: number;
      email: string;
    };

    // Check if the user is in the database
    const user = await User.findByPk(decoded.id);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    //Attach to the req.user object
    req.user = {
      id: user.id,
      email: user.email,
    };

    next();
  } catch (error: any) {
    logger.error("Authentication error :", {
      error: error.message,
    });
    next(new AppError(error.message || "invalid token", 401));
  }
};
