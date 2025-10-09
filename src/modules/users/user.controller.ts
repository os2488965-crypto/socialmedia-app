import { Router } from "express";
import US from "./user.service";
import { signupSchema, confirmEmailSchema, signInSchema, logoutSchema, loginWithGmailSchema, forgetPasswordSchema, resetPasswordSchema } from './user.validation';
import { validation } from "../../middleware/validation";
import { Authentication } from "../../middleware/Authentication";
import { TokenType } from "../../utils/token";

const userRouter = Router();

userRouter.post("/signup", validation(signupSchema), US.signup);
userRouter.patch("/confirmEmail", validation(confirmEmailSchema), US.confirmEmail);
userRouter.post("/signin", validation(signInSchema), US.signIn);
userRouter.post("/loginWithGmail", validation(loginWithGmailSchema), US.logInWithGmail);
userRouter.get("/profile", Authentication(), US.Getprofile);
userRouter.post("/logout", Authentication(), validation(logoutSchema), US.logout);
userRouter.get("/refreshToken", Authentication(TokenType.refresh), US.refreshToken);
userRouter.patch("/forgetPassword", validation(forgetPasswordSchema), US.forgetPassword);
userRouter.patch("/resetPassword", validation(resetPasswordSchema), US.resetPassword);

// freeze / unfreeze account
userRouter.delete("/freezeAccount/:userId", Authentication(TokenType.access), US.freezeAccount);
userRouter.patch("/unfreezeAccount/:userId", Authentication(TokenType.access), US.unfreezeAccount);


export default userRouter;
