import { NextFunction, request, Request, Response } from "express";
import { AppError } from '../utils/classError';
import {  DecodedTokenAndFetchUser, Getsignature, TokenType } from '../utils/token';
import { HydratedDocument } from 'mongoose';
import { Iuser } from '../DB/model/user.model';
import { JwtPayload } from "jsonwebtoken";

export interface RequestWithUser extends Request {
    user?: HydratedDocument<Iuser>,
    decoded?: JwtPayload
}

export const Authentication = (tokenType: TokenType = TokenType.access) => {
  return async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { authorization } = req.headers;
    const [prefix, token] = authorization?.split(" ") || [];

    if (prefix !== "Bearer" || !token) {
      throw new AppError("Invalid Token", 401);
    }

    const signature = await Getsignature(tokenType, prefix);
    if (!signature) {
      throw new AppError("Invalid signature", 400);
    }

    const decoded = await DecodedTokenAndFetchUser(token, signature);
    if (!decoded) {
      throw new AppError("Invalid token decoded", 400);
    }

    req.user = decoded?.user;
    req.decoded = decoded?.decoded;
    return next();
  }
}
