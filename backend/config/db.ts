import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "");
    
  } catch (error) {
    console.log("MongoDB connection error", error);
    throw error;
  }
};

export default connectDB;
