import { Request, Response, NextFunction } from "express";

export const signup = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  return res.status(201).json({ message: "User signed up successfully", data: { email, password } });
};

export const login = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  return res.status(200).json({ message: "Login successful", data: { email, password } });
};
