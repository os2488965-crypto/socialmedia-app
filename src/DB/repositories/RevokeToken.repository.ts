import {  Model } from "mongoose";  
import { DbRepository } from "./db.repository";
import { IRevokeToken } from "../model/revokeToken.model";

export class RevokeTokenRepository extends DbRepository<IRevokeToken> {
  constructor(protected readonly userModel: Model<IRevokeToken>) {
    super(userModel);  
  }
}
