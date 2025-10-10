import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  categories: string[];
  brand: string;
  stock: number;
  images: string[];
  specifications: {
    [key: string]: string;
  };
  rating: number;
  numReviews: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"],
    },
    salePrice: {
      type: Number,
      min: [0, "Sale price cannot be negative"],
    },
    categories: [
      {
        type: String,
        required: [true, "At least one category is required"],
      },
    ],
    brand: {
      type: String,
      required: [true, "Brand is required"],
    },
    stock: {
      type: Number,
      required: [true, "Stock quantity is required"],
      min: [0, "Stock cannot be negative"],
    },
    images: [
      {
        type: String,
        required: [true, "At least one image is required"],
      },
    ],
    specifications: {
      type: Map,
      of: String,
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, "Rating cannot be less than 0"],
      max: [5, "Rating cannot be more than 5"],
    },
    numReviews: {
      type: Number,
      default: 0,
      min: [0, "Number of reviews cannot be negative"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes for better query performance
productSchema.index({ name: "text", description: "text" });
productSchema.index({ categories: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ price: 1 });

export const Product = mongoose.model<IProduct>("Product", productSchema);
