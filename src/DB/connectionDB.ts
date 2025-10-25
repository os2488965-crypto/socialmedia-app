import mongoose from "mongoose";
import { keyof } from "zod";

const connectionDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URI!);
    console.log(`✅ Success to connect DB ${process.env.DB_URI} ..... ✈️ 😉`);
  } catch (error) {
    console.error("❌ Fail to connect DB 🤦‍♂️🤔", error);
    process.exit(1);
  }
};

export default connectionDB;


