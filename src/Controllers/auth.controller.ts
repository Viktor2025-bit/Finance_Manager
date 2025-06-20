import { Request, Response, NextFunction } from "express";
import User from "../Model/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AppError } from "../Utils/error";
import logger from "../Utils/logger";

interface RegisterBody {
  name: string;
  email: string;
  password: string;
}

export const Register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, password }: RegisterBody = req.body;

    if (!name || !email || !password) {
      throw new AppError("Missing required fields", 400);
    }

    const existingUser = await User.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new AppError("Email already registered", 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = await jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "1h",
      }
    );

    logger.info("User registered", {
      userId: user.id,
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        token,
      },
    });
  } catch (error: any) {
    logger.error("Registeration error :", {
      error: error.message,
    });
    next(error);
  }
};

interface LoginBody {
  email: string;
  password: string;
}

export const Login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password }: LoginBody = req.body;

    if (!email || !password) {
      throw new AppError("Missing required fields", 400);
    }

    const checkUser = await User.findOne({
      where: { email },
    });

    if (!checkUser) {
      throw new AppError("User not found", 404);
    }

    const checkPassword = await bcrypt.compare(password, checkUser.password);

    if (!checkPassword) {
      throw new AppError("Password is invalid", 400);
    }

    const token = jwt.sign(
      {
        id: checkUser.id,
        email: checkUser.email,
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "1h",
      }
    );

    logger.info("User logged in!", {
      userId: checkUser.id,
    });

    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      data: {
        id: checkUser.id,
        email: checkUser.email,
        token,
      },
    });
  } catch (error: any) {
    logger.error("Login error :", {
      error: error.message,
    });
    next(error);
  }
};
