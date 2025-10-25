import mongoose, { HydratedDocument, Types } from "mongoose";
import { Hash } from "../../utils/Hash";
import { generateOTP } from "../../service/sendEmail";
import { eventEmitter } from "../../utils/event";

export enum GenderType {
  male = "male",
  female = "female"
}

export enum RoleType {
  admin = "admin",
  user = "user",
  superAdmin = "superAdmin"
}

export enum ProviderType {
  google = "google",
  system = "system"
}
export interface Iuser {
  _id: Types.ObjectId;
  Fname: string;
  Lname: string;
  userName?: string; // virtual
  email: string;
  password: string;
  age: number;
  phone?: string;
  image?:string;
  provider:ProviderType;
  address?: string;
  gender: GenderType; // required
  otp?: string;
  changeCredentials?:Date;
  confirmed?:boolean,
  role: RoleType;
  deletedAt?:Date;
    deletedBy?: Types.ObjectId,
  restoredAt?: Date,
  restoredBy?: Types.ObjectId,
  friends?:Types.ObjectId[],
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new mongoose.Schema<Iuser>({
  Fname: { type: String, trim: true },
  Lname: { type: String, trim: true },
  email: { type: String, unique: true, trim: true },
  password: { type: String ,trim:true,required:function(){
    return this.provider===ProviderType.google?false:true;
  }
},
  age: { type: Number, min: 18, max: 60,required:function(){
    return this.provider===ProviderType.google?false:true;
  } },
  phone: { type: String },
  image:{type:String},
  address: { type: String },
  otp: { type: String }, // fixed
  provider:{type:String,enum:ProviderType,default:ProviderType.system},
  confirmed: { type: Boolean, default: false },
  changeCredentials:{type:Date},
deletedAt: { type: Date },
friends:{type:Types.ObjectId,ref:"User"},
deletedBy: { type: Types.ObjectId, ref: "User" },
restoredAt: { type: Date },
restoredBy: { type: Types.ObjectId, ref: "User" },

  gender: { type: String, enum: Object.values(GenderType),required:function(){
    return this.provider===ProviderType.google?false:true;
  }},
  role: { type: String, enum: Object.values(RoleType), default: RoleType.user },
}, {
  timestamps: true,
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
});

userSchema.virtual("userName")
  .set(function (value: string) {
    const [Fname, Lname] = value.split(" ");
    this.set({ Fname, Lname });
  })
  .get(function () {
    return this.Fname + " " + this.Lname;
  });

// userSchema.pre("save", async function (this: HydratedDocument<Iuser> & { NEW: boolean }, next) {
//   console.log(`-------------------------pre save hook-------------------------`);
//   console.log({ this: this, changes: this.modifiedPaths(), isNew: this.isNew });

//   this.NEW = this.isNew;

//   if (this.isModified("password")) {
//     this.password = await Hash(this.password);
//   }
// });

// userSchema.post("save", async function () {
  
//   console.log(`-------------------------post save hook-------------------------`);
//   console.log({ this: this, isNew: this.isNew });

//   const that = this as HydratedDocument<Iuser> & { NEW: boolean };

//   if (that.NEW == true) {
//     const otp = await generateOTP();
//     eventEmitter.emit("confirmEmail", { email: this.email, otp });
//   }
// });

// userSchema.pre("updateOne",{document:true,query:false}, async function () {

//   console.log(`-------------------------pre save hook-------------------------`);
//   console.log( {this:this} );


// })
// userSchema.pre(["findOne", "updateOne"], async function () {
//   console.log(`---------------------pre findOne hook---------------------`);
//   console.log({ this: this, query: this.getQuery() });
// });
 




  // })
const userModel = mongoose.models.User || mongoose.model<Iuser>("User", userSchema);

export default userModel;
