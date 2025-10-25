

import { Model } from "mongoose";
import { IChat } from "../model/chat.model";
import { DbRepository } from "./db.repository";

export class ChatRepository extends DbRepository<IChat> {
  constructor(protected override Model: Model<IChat>) {
    super(Model);
  }
}