import { Response } from "express";
import mongoose from "mongoose";
import { AuthRequest } from "../interfaces/auth.interface";
import { Review } from "../models/reviewModel/review.model";
import { Order } from "../models/orderModel/order.model";

export class ReviewController {
  // Create a review
  public async createReview(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { productId, rating, title, comment, images } = req.body;

      // Check if user has already reviewed this product
      const existingReview = await Review.findOne({
        user: req.user._id,
        product: productId,
      });

      if (existingReview) {
        res.status(400).json({
          success: false,
          error: "You have already reviewed this product",
        });
        return;
      }

      // Check if user has purchased the product
      const order = await Order.findOne({
        user: req.user._id,
        "items.product": productId,
        status: "delivered",
      });

      const review = new Review({
        user: req.user._id,
        product: productId,
        rating,
        title,
        comment,
        images,
        isVerifiedPurchase: !!order,
      });

      await review.save();

      const populatedReview = await Review.findById(review._id)
        .populate("user", "username avatar")
        .populate("product", "name images");

      res.status(201).json({
        success: true,
        data: populatedReview,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Get reviews for a product
  public async getProductReviews(
    req: AuthRequest,
    res: Response
  ): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const sortField = (req.query.sortBy as string) || "createdAt";
      const sortOrder = (req.query.sortOrder as string) === "asc" ? 1 : -1;
      const rating = parseInt(req.query.rating as string);

      const query: any = { product: req.params.productId };
      if (rating) {
        query.rating = rating;
      }

      const reviews = await Review.find(query)
        .populate("user", "username avatar")
        .sort({ [sortField]: sortOrder })
        .skip((page - 1) * limit)
        .limit(limit);

      const total = await Review.countDocuments(query);

      res.status(200).json({
        success: true,
        data: reviews,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Get user's reviews
  public async getUserReviews(req: AuthRequest, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const reviews = await Review.find({ user: req.user._id })
        .populate("product", "name images")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      const total = await Review.countDocuments({ user: req.user._id });

      res.status(200).json({
        success: true,
        data: reviews,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Update a review
  public async updateReview(req: AuthRequest, res: Response): Promise<void> {
    try {
      const review = await Review.findOne({
        _id: req.params.id,
        user: req.user._id,
      });

      if (!review) {
        res.status(404).json({
          success: false,
          error: "Review not found",
        });
        return;
      }

      const updates = req.body;
      Object.keys(updates).forEach((key) => {
        if (
          key !== "user" &&
          key !== "product" &&
          key !== "isVerifiedPurchase"
        ) {
          (review as any)[key] = updates[key];
        }
      });

      await review.save();

      const populatedReview = await Review.findById(review._id)
        .populate("user", "username avatar")
        .populate("product", "name images");

      res.status(200).json({
        success: true,
        data: populatedReview,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Delete a review
  public async deleteReview(req: AuthRequest, res: Response): Promise<void> {
    try {
      const review = await Review.findOne({
        _id: req.params.id,
        user: req.user._id,
      });

      if (!review) {
        res.status(404).json({
          success: false,
          error: "Review not found",
        });
        return;
      }

      await review.deleteOne();

      res.status(200).json({
        success: true,
        message: "Review deleted successfully",
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Like/Unlike a review
  public async toggleReviewLike(
    req: AuthRequest,
    res: Response
  ): Promise<void> {
    try {
      const review = await Review.findById(req.params.id);

      if (!review) {
        res.status(404).json({
          success: false,
          error: "Review not found",
        });
        return;
      }

      const userIdString = req.user._id.toString();
      const likeIndex = review.likes.findIndex(
        (userId) => userId.toString() === userIdString
      );

      if (likeIndex === -1) {
        review.likes.push(new mongoose.Types.ObjectId(req.user._id));
      } else {
        review.likes.splice(likeIndex, 1);
      }

      await review.save();

      const populatedReview = await Review.findById(review._id)
        .populate("user", "username avatar")
        .populate("product", "name images");

      res.status(200).json({
        success: true,
        data: populatedReview,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }
}
