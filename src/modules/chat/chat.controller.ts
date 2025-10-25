

import { Router } from "express";
import { Authentication } from "../../middleware/Authentication";
import { ChatService } from "./chat.service";
import { fileValidation, multerCloud } from "../../middleware/multer.cloud";

const chatRouter = Router({mergeParams:true});
const CS = new ChatService();

chatRouter.get("/", Authentication, CS.getChat);
chatRouter.get("/group/:groupId", Authentication(), CS.getGroupChat)
chatRouter.post("/group",
  Authentication(),
  multerCloud({ fileTypes: fileValidation.image }).single("attachment"),
  CS.createGroupChat
);

export default chatRouter;