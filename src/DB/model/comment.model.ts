import { Schema, model, models } from "mongoose";


export interface Icomment {
    content?: string;
    attachments?: string[];
    assetFolderId?: string;

    createdBy: Schema.Types.ObjectId;
    postId: Schema.Types.ObjectId;

    tags: Schema.Types.ObjectId[];
    likes: Schema.Types.ObjectId[];


    deleteAt?: Date;
    deletedBy?: Schema.Types.ObjectId;

    restoreAt?: Date;
    restoredBy?: Schema.Types.ObjectId;
}

export const commentSchema = new Schema<Icomment>({
    content: { type: String, minlength: 5, maxlength: 10000, required: function () { return this.attachments?.length === 0 } },
    attachments: [String],
    assetFolderId: String,


    tags: [{ type: Schema.Types.ObjectId, ref: "User" }],
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],

  
    deleteAt: { type: Date },
    deletedBy: { type: Schema.Types.ObjectId, ref: "User" },
    postId: { type: Schema.Types.ObjectId, ref: "Post" },

    restoreAt: { type: Date },
    restoredBy: { type: Schema.Types.ObjectId, ref: "User" }
},{
    timestamps: true,
    strictQuery:true

});
commentSchema.pre(["find", "findOne", "findOneAndDelete", "findOneAndUpdate"], async function (next) {
  const query = this.getQuery();
  const { paranoid, ...rest } = query;

  if (paranoid === false) {
    this.setQuery({ ...rest });
  } else {
    this.setQuery({ ...rest, deletedAt: { $exists: false } });
  }

  next();
});

const commentModel = models.Comment || model("Comment", commentSchema);
export default commentModel;
