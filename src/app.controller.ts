import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { config } from "dotenv";
import { resolve } from "path";

import connectionDB from "./DB/connectionDB";
import { AppError } from "./utils/classError";

import authRouter from "./modules/auth/auth.router";
import userRouter from "./modules/users/user.controller";
import postRouter from "./modules/posts/post.controller";
import { initializationIo } from "./modules/gatway/gateway";
import chatRouter from "./modules/chat/chat.controller";

config({ path: resolve("./config/.env") });

const app: express.Application = express();
const port: string | number = process.env.PORT || 5000;

// ✅ تفعيل CORS (يسمح من localhost و 127.0.0.1)
app.use(
  cors({
    origin: ["http://localhost:8080", "http://127.0.0.1:8080"],
    credentials: true,
  })
);

// ✅ إعدادات الأمان و اللمت
app.use(helmet());
app.use(
  rateLimit({
    windowMs: 5 * 60 * 1000,
    limit: 10,
    message: { error: "Too many requests 😒🙄" },
    statusCode: 429,
    legacyHeaders: false,
  })
);

app.use(express.json());

// ✅ الراوتات
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ message: "Welcome to my social media app 😎😉" });
});

app.use("/api/v1/auth", authRouter);
app.use("/users", userRouter);
app.use("/posts", postRouter);
app.use("/chat", chatRouter);

// ✅ اتصال قاعدة البيانات
connectionDB();

// ✅ معالجة الأخطاء
// app.use("*", (req: Request, res: Response, next: NextFunction) => {
//   throw new AppError(`Invalid URL ${req.originalUrl}`, 404);
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

// ✅ تشغيل السيرفر مع socket.io
const server = initializationIo(app);

server.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});

export default app;
