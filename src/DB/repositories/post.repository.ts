import { HydratedDocument, Model } from "mongoose";
import { DbRepository } from './db.repository';
import { IPost } from '../model/post.model';

export class PostRepository extends DbRepository<IPost> {

  constructor(protected override Model: Model<IPost>) {
    super(Model);
  }
}
