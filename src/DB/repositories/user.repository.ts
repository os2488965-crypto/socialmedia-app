import { Iuser } from "../model/user.model";
import { HydratedDocument, Model } from "mongoose";  
import { DbRepository } from "./db.repository";

export class UserRepository extends DbRepository<Iuser> {
  constructor(protected readonly userModel: Model<Iuser>) {
    super(userModel);  
  }

  async createUser(data: Partial<Iuser>): Promise<HydratedDocument<Iuser>> {
    return this.Model.create(data);
  }
}
