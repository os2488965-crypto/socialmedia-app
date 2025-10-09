import { AppError } from '../utils/classError';
import userModel from "../DB/model/user.model";
import { UserRepository } from "../DB/repositories/user.repository";
import jwt, { JwtPayload } from "jsonwebtoken"
import { RevokeTokenRepository } from '../DB/repositories/RevokeToken.repository';
import RevokeTokenModel from '../DB/model/revokeToken.model';

const _userModel = new UserRepository(userModel);
const _revokeToken = new RevokeTokenRepository(RevokeTokenModel)


export const GenerateToken = async ({ payload, signature, options }: {
  payload: Object,
  signature: string,
  options?: jwt.SignOptions
}) :Promise<string>=> {
  return jwt.sign(
    payload,
    signature,
    options
  );
}

export enum TokenType {
    access = "access",
    refresh ="refresh"
}

export const VerifyToken = async ({ token, signature } :{
  token: string,
  signature: string
}):Promise<JwtPayload> => {
  return jwt.verify(
    token,
    signature
  ) as JwtPayload;
}

export const Getsignature = async(tokenType:TokenType,prefix:string)=>{

if (tokenType === TokenType.access) {
  if (prefix === process.env.BEARER_USER) {
    return process.env.SIGNATURE_USER_TOKEN;
  } else if (prefix === process.env.BEARER_ADMIN) {
    return process.env.SIGNATURE_ADMIN_TOKEN;
  } 
}

if (tokenType === TokenType.refresh) {
  if (prefix === process.env.BEARER_USER) {
    return process.env.REFRESH_SIGNATURE_USER_TOKEN;
  } else if (prefix === process.env.BEARER_ADMIN) {
    return process.env.REFRESH_SIGNATURE_ADMIN_TOKEN;
  } 
}

}

export const DecodedTokenAndFetchUser = async (token: string, signature: string) => {
  const decoded = await VerifyToken({ token, signature });
  if (!decoded) {
    throw new AppError("InValid Token", 400);
  }

  const user = await _userModel.findOne({ email: decoded?.email });
  if (!user) {
    throw new AppError("user not exist", 404);
  }
  if (!user?.confirmed) {
    throw new AppError("please confirm email first or you are freezed", 400);
  }
  if (await _revokeToken.findOne({ tokenId: decoded?.jti })) {
    throw new AppError("Token has been revoked", 400);
  }

  if (user.changeCredentials?.getTime()! > decoded?.iat! * 1000) {
    throw new AppError("Credentials have been changed, please log in again", 401);
  }

  return { decoded, user };
};
