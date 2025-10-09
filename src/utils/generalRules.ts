import mongoose from "mongoose";
import z from "zod";

export const generalRules = {
    id: z.string().refine((value) => {
        return mongoose.Types.ObjectId.isValid(value);
    }, {
        message: "Invalid user id"
    }),
    email: z.email(),
    password: z.string().regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/),
    otp: z.string().regex(/^[0-9]{6}$/),
    file: z.object({
        filename: z.string(),
        originalname: z.string(),
        encoding: z.string(),
        mimetype: z.string(),
        buffer: z.instanceof(Buffer).optional(),
        path: z.string().optional(),
        size: z.number(),
    })
};