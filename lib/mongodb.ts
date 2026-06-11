import mongoose from "mongoose";

const MONGODB_URI =
  process.env.MONGODB_URI as string;

export async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);

    console.log("MongoDB Connected");
  } catch (error) {
    console.log(error);
  }
}
export default connectDB;