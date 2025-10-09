import { NextFunction, Request, Response } from "express";
import { UserRepository } from "../../DB/repositories/user.repository";
import { PostRepository } from "../../DB/repositories/post.repository";
import userModel from "../../DB/model/user.model";
import postModel, { AvailabilityEnum, IPost } from "../../DB/model/post.model";
import { AppError } from "../../utils/classError";
import { ActionEnum, likePostDto, likePostQueryDto } from "./post.validation";
import { UpdateQuery } from "mongoose";
import { v4 as uuidv4 } from "uuid";

class PostService {
  private _userModel = new UserRepository(userModel);
  private _postModel = new PostRepository(postModel);

  constructor() {}

  createPost = async (req: Request, res: Response, next: NextFunction) => {
    const { content, tags } = req.body;

    if (tags?.length) {
      const validTags = await this._userModel.find({ _id: { $in: tags } });
      if (validTags.length !== tags.length) {
        throw new AppError("Invalid user id in tags", 400);
      }
    }

    const assetFolderId = uuidv4();
    let attachments: string[] = [];

    if (req.files?.length) {
      attachments = (req.files as Express.Multer.File[]).map((f) => f.path);
    }

    const post = await this._postModel.create({
      ...req.body,
      attachments,
      assetFolderId,
      createdBy: req.user?._id,
    });

    if (!post) throw new AppError("Failed to create post", 500);

    return res.status(201).json({ message: "Created successfully", post });
  };

  likePost = async (req: Request, res: Response, next: NextFunction) => {
    const { postId }: likePostDto = req.params as likePostDto;
    const { action }: likePostQueryDto = req.query as likePostQueryDto;

    let updateQuery: UpdateQuery<IPost> = { $addToSet: { likes: req.user?._id } };

    if (action === ActionEnum.unlike) {
      updateQuery = { $pull: { likes: req.user?._id } };
    }

    const post = await this._postModel.findOneAndUpdate(
      {
        _id: postId,
        $or: [
          { availability: AvailabilityEnum.public },
          { availability: AvailabilityEnum.private, createdBy: req.user?._id },
          {
            availability: AvailabilityEnum.friends,
            createdBy: { $in: [...(req.user?.friends || []), req.user?._id] },
          },
        ],
      },
      updateQuery,
      { new: true }
    );

    if (!post) throw new AppError("Failed to like/unlike post", 404);

    return res.status(200).json({ message: `${action}`, post });
  };

  updatePost = async (req: Request, res: Response, next: NextFunction) => {
    const { postId } = req.params;

    const post = await this._postModel.findOne({
      _id: postId,
      createdBy: req.user?._id,
    });

    if (!post) throw new AppError("Unauthorized or post not found", 404);

    const { content, availability, allowComment, tags } = req.body;

    if (content) post.content = content;
    if (availability) post.availability = availability;
    if (allowComment) post.allowComment = allowComment;

    if (req.files?.length) {
      post.attachments = (req.files as Express.Multer.File[]).map((f) => f.path);
    }

    if (tags?.length) {
      const validTags = await this._userModel.find({ _id: { $in: tags } });
      if (validTags.length !== tags.length) {
        throw new AppError("Invalid user id in tags", 400);
      }
      post.tags = tags;
    }

    await post.save();

    return res.status(200).json({ message: "Updated successfully", post });
  };

  getPosts = async (req: Request, res: Response, next: NextFunction) => {
    const { page = 1, limit = 5 } = req.query as any;
    const skip = (Number(page) - 1) * Number(limit);

    const posts = await this._postModel.find({
      filter: {},
      options: {
        skip,
        limit: Number(limit),
        sort: { createdAt: -1 },
        populate: [
          {
            path: "comments",
            match: { commentId: { $exists: false } },
            populate: {
              path: "replies",
              match: { commentId: { $exists: true } }, 
            },
          },
          { path: "createdBy", select: "userName email" },
        ],
      },
    });

    return res.status(200).json({
      message: "success",
      page: Number(page),
      limit: Number(limit),
      count: posts.length,
      posts,
    });
  };
}

export default new PostService();
