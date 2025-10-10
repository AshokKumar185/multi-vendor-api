import { Request } from "express";
import { Document } from "mongoose";

interface UserDocument extends Document {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export interface AuthRequest extends Request {
  user: UserDocument;
}
