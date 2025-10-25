import  { Request ,Response,NextFunction} from "express"
import { confirmEmailSchematype, FalgType, forgetPasswordSchematype, loginWithGmailSchematype, logoutSchematype, signupSchematype, resetPasswordSchematype, freezeSchematype } from './user.validation';
import userModel, { Iuser, ProviderType, RoleType } from "../../DB/model/user.model"
import { UserRepository } from "../../DB/repositories/user.repository"
import { Hash } from "../../utils/Hash"
import { generateOTP, sendEmail } from "../../service/sendEmail"
import { eventEmitter } from "../../utils/event"
import { AppError } from '../../utils/classError';
import { v4 as uuidv4 } from "uuid";
import { compare } from 'bcrypt';
import { OAuth2Client, TokenPayload } from "google-auth-library";

import { GenerateToken } from "../../utils/token"


// import userModel from '../../DB/model/user.model';
import { RequestWithUser } from '../../middleware/Authentication';
import RevokeTokenModel from "../../DB/model/revokeToken.model"
import { RevokeTokenRepository } from "../../DB/repositories/RevokeToken.repository"
import { FriendRequestRepository } from "../../DB/repositories/friendRequest.repository";
import { Types } from "mongoose";
import { friendRequestModel } from "../../DB/model/friendRequest.model";
import { threadCpuUsage } from "node:process";
import { populate } from "dotenv";
import path from "node:path";
class UserService {

  // private _userModel:Model<Iuser> = userModel
  private _userModel = new UserRepository(userModel)
  private _revokeToken = new RevokeTokenRepository(RevokeTokenModel)
  private _friendRequestModel = new FriendRequestRepository(friendRequestModel)
  constructor(){
    this._userModel.create
  }
    //==================signUp================
signup = async (req: Request, res: Response, next: NextFunction) => {
  
    let { userName, email, password, age, address, phone, gender } : signupSchematype = req.body 
      
      // if(await this._userModel.findOne({email})){
      //     throw new AppError("email alredy exist",409)
      //   }
     
        const hash = await Hash(password)
     const otp =  await generateOTP()
const hashedOtp = await Hash(otp.toString());
// eventEmitter.emit("confirmEmail",{email,otp})


       const user =  await this._userModel.create({userName,otp:hashedOtp,  email, password:hash, age, address, phone, gender})

       eventEmitter.emit("confirmEmail",{email,otp})

    return res.status(200).json({ message: "success", user })
  
}

// =================confirmEmail ====================
confirmEmail = async (req: Request, res: Response, next: NextFunction) => {
  const { email, otp }: confirmEmailSchematype = req.body;

  const user = await this._userModel.findOne({ email, confirmed: false });
  if (!user) {
    throw new AppError("email not found or email already confirmed", 404);

  }

  
  const isMatch = await compare(otp, user.otp!);
  if (!isMatch) {
    throw new AppError("Invalid otp", 400);
  }

  await this._userModel.updateOne(
    { email: user.email },
    { $set: { confirmed: true }, $unset: { otp: "" } }
  );

  return res.status(201).json({ message: "confirmed",user });
};




//==================signIn================
  signIn =async (req:Request ,res:Response,next:NextFunction)=>{
        const {email,password}:signupSchematype = req.body
          const user = await this._userModel.findOne({ email, confirmed:{$exists:true},provider:ProviderType.system});
  if (!user) {
    throw new AppError("email not found or not confirmed yet ", 404);
  }
  if(!await compare(password,user?.password!)){
    throw new AppError("Invalid password",400)
  }

  const jwtid = uuidv4()
  // create token
const access_token = await GenerateToken({
  payload: { id: user._id, email: user.email },
 signature: user?.role == RoleType.user 
  ? process.env.SIGNATURE_USER_TOKEN! 
  : process.env.SIGNATURE_ADMIN_TOKEN!,

  options: { expiresIn: 60 * 60 ,jwtid}
});

const refresh_token = await GenerateToken({
  payload: { id: user._id, email: user.email },
  signature: user?.role == RoleType.user 
  ? process.env.REFRESH_SIGNATURE_USER_TOKEN! 
  : process.env.REFRESH_SIGNATURE_ADMIN_TOKEN!,

  options: { expiresIn: "1y" ,jwtid}
});


        return res.status(201).json({message:`success`,access_token,refresh_token})
        
    }
//========================logInWithGmail==================
    logInWithGmail = async (req: Request, res: Response, next: NextFunction) => {
  const { idToken }:loginWithGmailSchematype = req.body

  const client = new OAuth2Client();
  async function verify() {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.WEB_CLIENT_ID!,
    });
    const payload = ticket.getPayload();
    return payload;
  }

  const { email, email_verified, picture, name } = await verify() as TokenPayload

  let user = await this._userModel.findOne({ email })
  if (!user) {
    user = await this._userModel.create({
      email:email!,
      image: picture!,
      userName:name!,
      confirmed: email_verified!,
      provider: ProviderType.google,
    })
  }
  if(user?.provider===ProviderType.system){
    throw new AppError("please login in system")
  }
}

    //===================getprofile===========================
Getprofile = async (req: Request, res: Response, next: NextFunction) => {
  const user = await this._userModel.findOne({ _id: req?.user?._id })
    // , undefined, {
  //   populate: [{
  //     path: "friends"
  //   }]
  // });
  // const groups = await this._chatModel.find({
  //   filter: {
  //     participants: { $in: [req?.user?._id] },
  //     group: { $exists: true }
  //   }
  // });

  return res.status(200).json({ message: "success", user, });

}
  logout =async (req:RequestWithUser ,res:Response,next:NextFunction)=>{
    const {flag}:logoutSchematype= req.body
    if(flag===FalgType?.all){
      await this._userModel.updateOne({_id:req.user?._id},{changeCredentials:new Date()})
        return res.status(200).json({message:"success,log out from all devices"})


    }
    await this._revokeToken.create({
      tokenId:req.decoded?.jti!,
      userId:req.user?._id!,
      expireAt:new Date(req.decoded?.exp!*1000)
    })

        return res.status(200).json({message:"success,logged out from all devices"})
        
    }

  refreshToken =async (req:RequestWithUser ,res:Response,next:NextFunction)=>{
      const jwtid = uuidv4()
  // create token
const access_token = await GenerateToken({
  payload: { id: req?.user?._id, email: req?.user?.email },
 signature: req?.user?.role == RoleType.user 
  ? process.env.SIGNATURE_USER_TOKEN! 
  : process.env.SIGNATURE_ADMIN_TOKEN!,

  options: { expiresIn: 60 * 60 ,jwtid}
});

const refresh_token = await GenerateToken({
  payload: { id: req?.user?._id, email: req?.user?.email },
  signature: req?.user?.role == RoleType.user 
  ? process.env.REFRESH_SIGNATURE_USER_TOKEN! 
  : process.env.REFRESH_SIGNATURE_ADMIN_TOKEN!,

  options: { expiresIn: "1y" ,jwtid}
});


   await this._revokeToken.create({
      tokenId:req.decoded?.jti!,
      userId:req.user?._id!,
      expireAt:new Date(req.decoded?.exp!*1000)
    })




        return res.status(200).json({message:`success`,access_token,refresh_token})
        
    }
      forgetPassword =async (req:RequestWithUser ,res:Response,next:NextFunction)=>{
        const {email}:forgetPasswordSchematype= req.body
         const user = await this._userModel.findOne({ email, confirmed: true });
  if (!user) {
    throw new AppError("email not found or not confirmed yet", 404);
  }

     const otp =  await generateOTP()
const hashedOtp = await Hash(otp.toString());
eventEmitter.emit("Forgetpassword",{email,otp})
await this._userModel.updateOne({email:user?.email},{otp:hashedOtp})

        return res.status(200).json({message:"success send Otp"})
        
    }

  resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    const { email, otp, password, cPassword }: resetPasswordSchematype = req.body;

    if (password !== cPassword) {
      throw new AppError("Passwords do not match", 400);
    }

    const user = await this._userModel.findOne({ email });
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const isMatch = await compare(otp, user.otp!);
    if (!isMatch) {
      throw new AppError("Invalid otp", 401);
    }

    const hashedPassword = await Hash(password);

    await this._userModel.updateOne(
      { email: user.email },
      { $set: { password: hashedPassword }, $unset: { otp: "" } }
    );

    return res.status(200).json({ success: true, message: "Password reset successfully" });
  };
  uploadImage = async (req: Request, res: Response, next: NextFunction) => {
  return res.status(200).json({ message: "success", file: req.file });
}

freezeAccount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId }:freezeSchematype = req.params as freezeSchematype

    let targetId: string;

    if (req.user?.role === RoleType.admin) {
      if (!userId) {
        throw new AppError("userId is required for admin freeze", 400);
      }
      targetId = userId;
    } else {
      if (userId) {
        throw new AppError("unauthorized", 401);
      
      }
      targetId = req.user?._id!;
    }

    const user = await this._userModel.findOneAndUpdate(
      { _id: targetId },
      {
        deletedAt: new Date(),
        deletedBy: req.user?._id,
        changeCredentials: new Date(),
      },
      { new: true, runValidators: true }
    );

    if (!user) {

      throw new AppError("user not found", 404);
    }

    return res.status(200).json({ message: "account frozen successfully", user });
  } catch (error) {
    next(error);
  }
};
unfreezeAccount = async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.params;

  if (req.user?.role !== RoleType.admin) {
    throw new AppError("unauthorized", 401);
  }

  const user = await this._userModel.findOneAndUpdate(
    {
      _id: userId,
      deletedAt: { $exists: true },
      deletedBy: { $ne: userId },
    },
    {
      $unset: { deletedAt: "", deletedBy: "" },
      restoredAt: new Date(),
      restoredBy: req.user?._id,
    }
  );

  if (!user) {
    throw new AppError("user not found", 404);
  }

  return res.status(200).json({ message: "freezed" });
};
dashBoard = async (req: Request, res: Response, next: NextFunction) => {
  const results = await Promise.allSettled([
    this._userModel.find({ filter: {} }),
    // this._postModel.find({ filter: {} })
  ]);
  return res.status(200).json({ message: "success", results });
}


updateRole = async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.params;
  const { role: newRole } = req.body;

  const denyRoles: RoleType[] = [newRole, RoleType.superAdmin];
  if (req.user?.role === RoleType.admin) {
  denyRoles.push(RoleType.admin);
  if (newRole === RoleType.superAdmin) {
    denyRoles.push(RoleType.user)
    // throw new AppError("unAuthorized", 401);
  }
}

  console.log({ denyRoles });

  const user = await this._userModel.findOneAndUpdate(
    {
      _id: userId,
      role: { $nin: denyRoles }
    },
    {
      role: newRole
    },
    {
      new: true
    }
  );

  if (!user) {
    throw new AppError("user not found", 404);
  }

  return res.status(200).json({ message: "success", user });
}
sendRequest = async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.params;

  const user = await this._userModel.findOne({ _id: userId });
  if (!user) {
    throw new AppError("user not found", 404);
  }

  if(req.user?._id==userId){
    throw new AppError("you can not send request to yourself",400)
  }

  const checkRequest = await this._friendRequestModel.findOne({
    createdBy: { $in: [req.user?._id, userId] },
    sendTo: { $in: [req.user?._id, userId] }
  });

  if (checkRequest) {
    throw new AppError("request already sent", 400);
  }

  const friendRequest = await this._friendRequestModel.create({
    createdBy: req.user?._id as unknown as Types.ObjectId,
    sendTo: userId as unknown as Types.ObjectId
  });

  return res.status(200).json({ message: "success", friendRequest });
}
acceptRequest = async (req: Request, res: Response, next: NextFunction) => {
  const { requestId } = req.params;

  const checkRequest = await this._friendRequestModel.findOneAndUpdate(
    {
      _id: requestId,
      sendTo: req.user?._id,
      acceptedAt: { $exists: false }
    },
    {
      acceptedAt: new Date()
    },
    {
      new: true
    }
  );

  if (!checkRequest) {
    throw new AppError("request not found", 404);
  }

  await Promise.all([
    this._userModel.updateOne(
      { _id: checkRequest.createdBy },
      { $push: { friends: checkRequest.sendTo } }
    ),
    this._userModel.updateOne(
      { _id: checkRequest.sendTo },
      { $push: { friends: checkRequest.createdBy } }
    )
  ]);

  return res.status(200).json({ message: "success" });
}
}

export default new UserService()
