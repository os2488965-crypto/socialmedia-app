import { Model } from "mongoose";
import { DbRepository } from './db.repository';
import { Icomment } from "../model/comment.model";

export class CommentRepository extends DbRepository<Icomment> {
  constructor(protected override Model: Model<Icomment>) {
    super(Model);
  }
}
