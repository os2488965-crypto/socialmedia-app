import * as z from "zod";
import { generalRules } from "../../utils/generalRules";

export const createCommentSchema = {
  params: z.strictObject({
    postId: generalRules.id
  }),
  body: z.strictObject({
    content: z.string().min(1).max(100000).optional(),
    attachments: z.array(generalRules.file).optional(),
    tags: z.array(generalRules.id)
      .refine((data) => new Set(data).size === data.length, {
        message: "duplicated tags",
      })
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.attachments?.length && !data.content) {
      ctx.addIssue({
        code: "custom",
        path: ["content"],
        message: "attachments and content is empty you are must fill one of them",
      });
    }
  }),
};
