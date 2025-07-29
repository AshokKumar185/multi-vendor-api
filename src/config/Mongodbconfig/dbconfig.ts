import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb+srv://ashokashok12747:VIQVc7RqtG3Cbl9c@cluster0.ilo5r.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
console.log(`Connecting to MongoDB at ${MONGO_URI}`);
const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error(`Error: ${error}`);
    process.exit(1);
  }
};

export default connectDB;
