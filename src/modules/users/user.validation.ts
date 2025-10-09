import z, { email } from "zod"
import { GenderType } from "../../DB/model/user.model"
import { Types } from "mongoose"

export const signInSchema = {
  body: z.object({
    email: z.string().email(),
    password: z.string(),
  }).required()
}

export enum FalgType {
  all = "all",
  current = "current"
}

export const signupSchema = {
  body: signInSchema.body.extend({
    userName: z.string(),
    email:z.string(),
     password: z.string(),
    age: z.number().min(18).max(60),
    phone: z.string(),
    address: z.string(),
    gender: z.enum([GenderType.male, GenderType.female]) 
  }).refine((data) => data.password === data.password, {
    message: "password not match",
    path: ["cpassword"]
  })
}

export const loginWithGmailSchema = {
  body: z.strictObject({
    idToken: z.string(),
  }).required()
}

export const forgetPasswordSchema = {
  body: z.strictObject({
    email: z.string().email(),
  }).required()
}

export const confirmEmailSchema = {
  body: z.object({
    email: z.string().email(),
    otp: z.string()
  })
}

export const resetPasswordSchema = {
  body: z.object({
    email: z.string().email("Invalid email"),
    otp: z.string().length(6, "OTP must be 6 digits"),
    password: z.string().regex(
      /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/,
      "Password must contain at least 8 chars, uppercase, lowercase and number"
    ),
    cPassword: z.string(),
  }).superRefine((value, ctx) => {
    if (value.password !== value.cPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["cPassword"],
        message: "Passwords do not match",
      });
    }
  }),
};
export const freezeSchema = {
    params:z.strictObject({
        userId: z.string().optional(),
    }).required().refine((value) => {
        return value?.userId ? Types.ObjectId.isValid(value.userId) : true;
    }, {
        message: "userId is required",
        path: ["userId"],
    })
}


export const logoutSchema = {
  body: z.object({
    flag: z.enum(FalgType)
  }).required()
}

export type signupSchematype = z.infer<typeof signupSchema.body>
export type signInSchematype = z.infer<typeof signInSchema.body>
export type loginWithGmailSchematype = z.infer<typeof loginWithGmailSchema.body>
export type confirmEmailSchematype = z.infer<typeof confirmEmailSchema.body>
export type forgetPasswordSchematype = z.infer<typeof forgetPasswordSchema.body>
export type resetPasswordSchematype = z.infer<typeof resetPasswordSchema.body>
export type logoutSchematype = z.infer<typeof logoutSchema.body>
export type freezeSchematype = z.infer<typeof freezeSchema.params>
