import { RoleType } from "../DB/model/user.model";
import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/classError";

export const Authorization = ({ accessRoles = [] }: { accessRoles: RoleType[] }) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!accessRoles.includes(req.user?.role!)) {
      throw new AppError("unauthorized", 401);
    }
    next();
  };
}