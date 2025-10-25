import { NextFunction, Request, Response } from "express";
import { Socket, Server } from "socket.io";
import chatModel from "../../DB/model/chat.model";
import { AppError } from "../../utils/classError";
import { ChatRepository } from "../../DB/repositories/chat.repoo";
import { UserRepository } from "../../DB/repositories/user.repository";
import userModel from "../../DB/model/user.model";
import { uuidv4 } from "zod";
import { Types } from "mongoose";
// import { uploadFile } from '../../utils/s3.config';

export class ChatService {
  constructor() { }

  private _chatModel = new ChatRepository(chatModel);
  private _usermodel = new UserRepository(userModel)

  // ===============rest api
 getChat = async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.params;
  let { page, limit } = req.query as unknown as { page: number, limit: number };

  if (page < 0 || !page) page = 1;
  limit = limit * 1 || 5;

  const chat = await this._chatModel.findOne({
    participants: {
      $all: [userId, req.user?._id]
    },
    group: { $exists: false }
  }, {
    messages: {
      $slice: [-(page * limit), limit]
    }
  },
);

  if (!chat) {
    throw new AppError("chat not found", 404);
  }

  return res.status(200).json({ message: "success", chat });
}
getGroupChat = async (req: Request, res: Response, next: NextFunction) => {
  const { groupId } = req.params;
  let { page, limit = 5 } = req.query as unknown as { page: number, limit: number };
  if (page < 0 || !page) page = 1;
  limit = limit * 1 || 5;
  const chat = await this._chatModel.findOne({
    _id: groupId,
    participants: {
      $in: [req?.user?._id]
    },
    group: { $exists: true }
  }, {
    populate: [{
      path: "messages.createdBy"
    }]
  });

  if (!chat) {
    throw new AppError("chat not found", 404);
  }

  return res.status(200).json({ message: "success", chat });
}

createGroupChat = async (req: Request, res: Response, next: NextFunction) => {
  let { group, groupImage, participants } = req.body;
  const createdBy = req.user?._id as Types.ObjectId;

  const dbParticipants = participants.map((participant: string) => Types.ObjectId.createFromHexString(participant));
  const users = await this._usermodel.find({
    filter: {
      _id: {
        $in: dbParticipants
      },
      friends: {
        $in: [createdBy]
      }
    }
  });

  if (users.length !== participants.length) {
    throw new AppError("some users not found", 404);
  }

  const roomId = group?.replaceAll(/\s+/g, "-") + "_" + uuidv4();
  // if (req.file) {
  //   groupImage = await uploadFile({
  //     path: `chat/${roomId}`,
  //     file: req.file as Express.Multer.File,
  //   });
  // }
}
// dbParticipants.push(createdBy);
// const chat = await this._chatModel.create({
//   group,
//   groupImage,
//   participants: dbParticipants,
//   createdBy,
//   roomId,
//   messages: []
// });

// if (!chat) {
//   if (groupImage) {
//     await deleteFile({ path: groupImage });
//   }
//   throw new AppError("chat not created", 404);
// }

// return res.status(200).json({ message: "success", chat });

  // ===============socket io
sayHi = (data: any, socket: Socket, io: Server) => {
  console.log({ data });
  socket.emit("sayHiBack", { message: "hi from be" });
}

join_room = async (data: any, socket: Socket, io: Server) => {
  console.log({ data });
  const { roomId } = data;

  const chat = await this._chatModel.findOne({
    roomId,
    participants: {
      $in: [socket.data.user._id]
    },
    group: { $exists: true }
  });

  if (!chat) {
    throw new AppError("chat not found", 404);
  }

  socket.join(chat?.roomId!);
  console.log({ join: chat?.roomId });
}
sendGroupMessage = async (data: any, socket: Socket, io: Server) => {
  const { content, groupId } = data;
  const createdBy = socket.data.user._id;

  const chat = await this._chatModel.findOneAndUpdate({
    _id: groupId,
    participants: {
      $all: [createdBy]
    },
    group: { $exists: true }
  }, {
    $push: {
      messages: {
        content,
        createdBy,
      }
    }
  });

  if (!chat) {
    throw new AppError("chat not found", 404);
  }

  // io.to(connectionSockets.get(createdBy.toString())!).emit("successMessage", { content });
  io.to(chat?.roomId!).emit("newMessage", { content, from: socket.data.user, groupId });
}
sendMessage = async (data: any, socket: Socket, io: Server) => {
  const { content, sendTo } = data;
  const createdBy = socket?.data?.user?._id;

  const user = await this._usermodel.findOne({
    _id: sendTo,
    friends: { $in: [createdBy] }
  });

  if (!user) {
    throw new AppError("user not found", 404);
  }

  const chat = await this._chatModel.findOneAndUpdate(
    {
      participants: { $all: [createdBy, sendTo] },
      group: { $exists: false }
    },
    {
      $push: {
        messages: {
          content,
          createdBy
        }
      }
    },
    { upsert: true, new: true }
  );

  if (!chat) {
    const newChat = await this._chatModel.create({
      participants: [createdBy, sendTo],
      createdBy,
      messages: [{
        content,
        createdBy
      }]
    });
    if (!newChat) {
  throw new AppError("chat not created", 400);
}

// io.to(connectionSockets.get(createdBy.toString())!).emit("successMessage", { content });
// io.to(connectionSockets.get(sendTo.toString())!).emit("newMessage", { content, from: socket.data.user });
  }
}
}

