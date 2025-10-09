import { resolve } from "path";
import { config } from "dotenv";
config({ path: resolve("./config/.env") });

import express, { Request, Response, NextFunction } from "express";
import connectionDB from "./DB/connectionDB";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { AppError } from "./utils/classError";
import userRouter from "./modules/users/user.controller";
import postRouter from "./modules/posts/post.controller";

const app: express.Application = express();

const port: string | number = process.env.PORT || 5000;

const limiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 10,
  message: {
    error: "game over............😒🙄"
  },
  statusCode: 429,
  legacyHeaders: false,
});


export const bootstrap = () => {
  app.use(express.json());
  app.use(cors());
  app.use(helmet());
  app.use(limiter);

  app.get("/", (req: Request, res: Response, next: NextFunction) => {
    return res
      .status(200)
      .json({ message: `welcome on my social media app........😎😉` });
  });

  app.use("/users", userRouter);
  app.use("/posts", postRouter);

  connectionDB();

  // app.use("*", (req: Request, res: Response, next: NextFunction) => {
  //   throw new AppError(`Invalid Url ${req.originalUrl}`, 404);
  // });

  app.use(
    (err: AppError, req: Request, res: Response, next: NextFunction) => {
      const statusCode = err.statusCode || 500;

      res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error",
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
      });
    }
  );

  app.listen(port, () => {
    console.log(`server running on port ${port}.......💙😉`);
  });
};

export default bootstrap;
