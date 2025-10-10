import { UserDocument } from "../interfaces/auth.interface";
import { Request } from "express";

declare global {
  namespace Express {
    interface Request {
      user: UserDocument;
    }
  }
}
