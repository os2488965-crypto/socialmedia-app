import { createServer } from "http";
import { Application } from "express";
import { Server } from "socket.io";
import { AppError } from "../../utils/classError";
import { Getsignature, DecodedTokenAndFetchUser, TokenType } from "../../utils/token";
import { SocketWithUser } from "./gateway.interface";
import { ChatGateway } from "../chat/chat.gateway";

const connectionSockets = new Map<string, string[]>();

export const initializationIo = (app: Application) => {
  const httpServer = createServer(app);

  const io = new Server(httpServer, {
    cors: { origin: "*" },
  });

  io.use(async (socket: SocketWithUser, next) => {
    try {
      const { authorization } = socket.handshake.auth;

      if (!authorization) return next(new AppError("Authorization missing", 401));

      const [prefix, token] = authorization.split(" ");
      if (!prefix || !token) return next(new AppError("Token not found", 401));

      const signature = await Getsignature(prefix, TokenType.access);
      if (!signature) return next(new AppError("Invalid Signature", 400));

      const { user, decoded } = await DecodedTokenAndFetchUser(token, signature);
      if (!user) return next(new AppError("User not found", 404));

      const socketIds = connectionSockets.get(user._id.toString()) || [];
      socketIds.push(socket.id);
      connectionSockets.set(user._id.toString(), socketIds);

      socket.user = user;
      socket.decoded = decoded;

      next();
    } catch (error: any) {
      next(error);
    }
  });

  const chatGateway = new ChatGateway();

  io.on("connection", (socket: SocketWithUser) => {
    console.log(`✅ User connected: ${socket.user?._id}`);

    socket.on("disconnect", () => {
      const userId = socket.user?._id?.toString();
      if (!userId) return;

      const remainingTabs = connectionSockets
        .get(userId)
        ?.filter((tab) => tab !== socket.id);

      if (remainingTabs?.length) {
        connectionSockets.set(userId, remainingTabs);
      } else {
        connectionSockets.delete(userId);
      }

      io.emit("userDisconnected", { userId });
      console.log({ after: connectionSockets });
    });
  });

  return httpServer;
};
