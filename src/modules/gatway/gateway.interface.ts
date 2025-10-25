import { HydratedDocument } from "mongoose";
import { Socket } from "socket.io";
import { Iuser } from "../../DB/model/user.model";
import { JwtPayload } from "jsonwebtoken";




export interface SocketWithUser extends Socket {
  user?: Partial<HydratedDocument<Iuser>>;
  decoded?: JwtPayload;
}
