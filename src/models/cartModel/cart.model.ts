import mongoose, { Schema, Document } from "mongoose";
import { IProduct } from "../productModel/product.model";

export interface ICartItem {
  product: IProduct["_id"];
  quantity: number;
  price: number;
}

export interface ICart extends Document {
  user: mongoose.Types.ObjectId;
  items: ICartItem[];
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

const cartItemSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, "Quantity cannot be less than 1"],
  },
  price: {
    type: Number,
    required: true,
    min: [0, "Price cannot be negative"],
  },
});

const cartSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: [cartItemSchema],
    totalAmount: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate total amount before saving
cartSchema.pre("save", function (next) {
  const cart = this;
  cart.totalAmount = cart.items.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);
  next();
});

export const Cart = mongoose.model<ICart>("Cart", cartSchema);
