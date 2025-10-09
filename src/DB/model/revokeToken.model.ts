import mongoose, { Types } from "mongoose";

export interface IRevokeToken {
  userId: Types.ObjectId,
  tokenId: string,
  expireAt: Date,
}

const RevokeTokenSchema = new mongoose.Schema<IRevokeToken>({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  tokenId: { type: String, required: true },
  expireAt: { type: Date, required: true }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

const RevokeTokenModel = mongoose.models.RevokeToken || mongoose.model<IRevokeToken>("RevokeToken", RevokeTokenSchema);

export default RevokeTokenModel;
