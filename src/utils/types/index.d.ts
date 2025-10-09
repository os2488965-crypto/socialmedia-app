import { IUserPayload } from "../../types/userPayload";
import { IUser } from "../../DB/model/user.model";

declare global {
  namespace Express {
    interface Request {
      user?: IUserPayload;
    }
  }
}


// types/express/index.d.ts
import "express";

declare module "express-serve-static-core" {
  interface Request {
    user?: IUser;
  }
}
