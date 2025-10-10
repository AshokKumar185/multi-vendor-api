import { Response } from "express";
import { AuthRequest } from "../interfaces/auth.interface";
import { Wishlist } from "../models/wishlistModel/wishlist.model";
import mongoose from "mongoose";

export class WishlistController {
  // Get user's wishlist
  public async getWishlist(req: AuthRequest, res: Response): Promise<void> {
    try {
      let wishlist = await Wishlist.findOne({ user: req.user._id }).populate(
        "products",
        "name images price stock rating numReviews"
      );

      if (!wishlist) {
        wishlist = await Wishlist.create({
          user: req.user._id,
          products: [],
        });
      }

      res.status(200).json({
        success: true,
        data: wishlist,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Add product to wishlist
  public async addToWishlist(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { productId } = req.body;

      let wishlist = await Wishlist.findOne({ user: req.user._id });

      if (!wishlist) {
        wishlist = await Wishlist.create({
          user: req.user._id,
          products: [new mongoose.Types.ObjectId(productId)],
        });
      } else {
        // Check if product already in wishlist
        if (
          !wishlist.products.includes(new mongoose.Types.ObjectId(productId))
        ) {
          wishlist.products.push(new mongoose.Types.ObjectId(productId));
          await wishlist.save();
        }
      }

      const populatedWishlist = await Wishlist.findById(wishlist._id).populate(
        "products",
        "name images price stock rating numReviews"
      );

      res.status(200).json({
        success: true,
        data: populatedWishlist,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Remove product from wishlist
  public async removeFromWishlist(
    req: AuthRequest,
    res: Response
  ): Promise<void> {
    try {
      const { productId } = req.params;

      const wishlist = await Wishlist.findOne({ user: req.user._id });

      if (!wishlist) {
        res.status(404).json({
          success: false,
          error: "Wishlist not found",
        });
        return;
      }

      wishlist.products = wishlist.products.filter(
        (id) => id && id.toString() !== productId
      ) as mongoose.Types.ObjectId[];

      await wishlist.save();

      const populatedWishlist = await Wishlist.findById(wishlist._id).populate(
        "products",
        "name images price stock rating numReviews"
      );

      res.status(200).json({
        success: true,
        data: populatedWishlist,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Clear wishlist
  public async clearWishlist(req: AuthRequest, res: Response): Promise<void> {
    try {
      const wishlist = await Wishlist.findOne({ user: req.user._id });

      if (!wishlist) {
        res.status(404).json({
          success: false,
          error: "Wishlist not found",
        });
        return;
      }

      wishlist.products = [];
      await wishlist.save();

      res.status(200).json({
        success: true,
        message: "Wishlist cleared successfully",
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Check if product is in wishlist
  public async isInWishlist(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { productId } = req.params;

      const wishlist = await Wishlist.findOne({ user: req.user._id });

      const isInWishlist = wishlist
        ? wishlist.products.some((id) => id && id.toString() === productId)
        : false;

      res.status(200).json({
        success: true,
        data: { isInWishlist },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }
}
