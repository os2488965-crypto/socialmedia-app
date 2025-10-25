import mongoose, { Schema, Types,model,models } from "mongoose";

export interface IMessage {
  content: string;
  createdBy: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IChat {
  // =========ovo
  participants: Types.ObjectId[];
  createdBy: Types.ObjectId;
  messages: IMessage[];

  // ========ovm
  group?: string;
  groupImage?: string;
  roomId?: string;
  createdAt: Date;
  updatedAt: Date;
}


const messagesSchema = new Schema<IMessage>({
  content: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, {
  timestamps: true
});

const chatSchema = new Schema<IChat>({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  messages: [messagesSchema],
  group: { type: String },
  groupImage: { type: String },
  roomId: { type: String },

},{
    timestamps:true
});

const ChatModel = models.Chat || model<IChat>("Chat", chatSchema);
export default ChatModel;