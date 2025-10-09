import {  NextFunction, Request, Response } from "express";
import { UserRepository } from "../../DB/repositories/user.repository";
import { PostRepository } from "../../DB/repositories/post.repository";
import userModel from "../../DB/model/user.model";
import postModel, { AllowCommentEnum, AvailabilityEnum, IPost } from "../../DB/model/post.model";
import { AppError } from "../../utils/classError";
// import { uploadFile } from '../../utils/s3.config';

import { uuidv4 } from "zod";
import commentModel from "../../DB/model/comment.model";
import { CommentRepository } from "../../DB/repositories/comment.repository";

class commentService {
    private _userModel = new UserRepository(userModel);
    private _postModel = new PostRepository(postModel);
    private _commentModel = new CommentRepository(commentModel);

    constructor() {}

//     createcomment = async (req: Request, res: Response, next: NextFunction) => {
//       const {postId} = req.params 
//       let{content ,tags,attachments} = req.body
//       const post = await this._postModel.findOne({
//   _id: postId,
//   allowComment: AllowCommentEnum.allow,
//   $or: AvailabilityPost(req)
// });
// if(!post){
//   return next(new AppError("post not found or you are not outhorized",401))
// }
// if (
//     req?.body?.tags?.length &&
//     (await this._userModel.find({ _id: { $in: req?.body?.tags } })).length !== req?.body?.tags?.length
// ) {
//     throw new AppError("Invalid user id", 400);
// }

// const assetFolderId = uuidv4();
// if (attachments?.length) {
//   attachments = await uploadFiles({
//     files: req.files as Express.Multer.File[],
//     path: `users/${post?.createdBy}/posts/${post?.assetFolderId}/comments/${assetFolderId}`
//   });
// }

// const comment = await this._commentModel.create({
//   content,
//   tags,
//   attachments,
//   assetFolderId,
//   postId: postId as unknown as Types.ObjectId,
//   createdBy: req?.user?._id as unknown as Types.ObjectId,
// });


// return res.status(201).json({ message: "created", comment });
// // const post = await this._postModel.create({
// //     ...req.body,
// //     attachments,
// //     assetFolderId,
// //     createdBy: req.user?._id
// // });

// // if (!post) {
// //     await deletefile({ urls: attachments || [] });
// //     throw new AppError("failed to create post", 500);
// // }

// return res.status(201).json({ message: "created success",params:req.params });
   

//     }
}

export default new commentService();
