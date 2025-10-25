import { Model } from "mongoose";
import { IFriendRequest } from "../model/friendRequest.model";
import { DbRepository } from "./db.repository";

export class FriendRequestRepository extends DbRepository<IFriendRequest> {
  constructor(protected override Model: Model<IFriendRequest>) {
    super(Model);
  }
}