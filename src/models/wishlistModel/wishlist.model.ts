import mongoose, { Schema, Document } from "mongoose";
import { IProduct } from "../productModel/product.model";

export interface IWishlist extends Document {
  user: mongoose.Types.ObjectId;
  products: IProduct["_id"][];
  createdAt: Date;
  updatedAt: Date;
}

const wishlistSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    products: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Wishlist = mongoose.model<IWishlist>("Wishlist", wishlistSchema);
