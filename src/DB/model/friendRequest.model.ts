import mongoose, { Schema, model, models, Types } from "mongoose";

export interface IFriendRequest {
  createdBy: Types.ObjectId;
  sendTo: Types.ObjectId;
  acceptedAt?: Date;
}

export const friendRequestSchema = new Schema<IFriendRequest>({
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  sendTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  acceptedAt: { type: Date }
}, {
  timestamps: true,
  strictQuery: true,
});

friendRequestSchema.pre(["findOne", "find", "findOneAndUpdate"], async function (next) {
  const { paramoid, ...rest } = this.getQuery();
  if (paramoid === false) {
    this.setQuery({ ...rest, deletedAt: { $exists: true } });
  } else {
    this.setQuery({ ...rest, deletedAt: { $exists: false } });
  }
});

const friendRequestModel = models.friendRequest || model("FriendRequest", friendRequestSchema);
export { friendRequestModel };
