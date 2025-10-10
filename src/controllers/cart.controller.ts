import { Response } from "express";
import { AuthRequest } from "../interfaces/auth.interface";
import { Cart, ICart, ICartItem } from "../models/cartModel/cart.model";
import { Product } from "../models/productModel/product.model";
import mongoose from "mongoose";

export class CartController {
  // Get cart for a user
  public async getCart(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user._id; // Assuming user is attached by auth middleware
      const cart = await Cart.findOne({ user: userId }).populate(
        "items.product",
        "name images price stock"
      );

      if (!cart) {
        // Create empty cart if it doesn't exist
        const newCart = await Cart.create({
          user: userId,
          items: [],
          totalAmount: 0,
        });
        res.status(200).json({
          success: true,
          data: newCart,
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: cart,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Add item to cart
  public async addToCart(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user._id;
      const { productId, quantity } = req.body;

      // Validate product
      const product = await Product.findById(productId);
      if (!product) {
        res.status(404).json({
          success: false,
          error: "Product not found",
        });
        return;
      }

      // Check stock
      if (product.stock < quantity) {
        res.status(400).json({
          success: false,
          error: "Insufficient stock",
        });
        return;
      }

      // Find or create cart
      let cart = await Cart.findOne({ user: userId });
      if (!cart) {
        cart = new Cart({
          user: userId,
          items: [],
          totalAmount: 0,
        });
      }

      // Check if product already in cart
      const cartItem = (cart as ICart).items.find(
        (item: ICartItem) =>
          (item.product as mongoose.Types.ObjectId).toString() === productId
      );

      if (cartItem) {
        // Update quantity if product exists
        cartItem.quantity = quantity;
        cartItem.price = product.price;
      } else {
        // Add new item if product doesn't exist in cart
        cart.items.push({
          product: productId,
          quantity,
          price: product.price,
        });
      }

      await cart.save();

      // Populate product details before sending response
      const populatedCart = await Cart.findById(cart._id).populate(
        "items.product",
        "name images price stock"
      );

      res.status(200).json({
        success: true,
        data: populatedCart,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Update cart item quantity
  public async updateCartItem(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user._id;
      const { productId, quantity } = req.body;

      if (quantity < 1) {
        res.status(400).json({
          success: false,
          error: "Quantity must be at least 1",
        });
        return;
      }

      // Validate product and check stock
      const product = await Product.findById(productId);
      if (!product) {
        res.status(404).json({
          success: false,
          error: "Product not found",
        });
        return;
      }

      if (product.stock < quantity) {
        res.status(400).json({
          success: false,
          error: "Insufficient stock",
        });
        return;
      }

      const cart = await Cart.findOne({ user: userId });
      if (!cart) {
        res.status(404).json({
          success: false,
          error: "Cart not found",
        });
        return;
      }

      const cartItem = (cart as ICart).items.find(
        (item: ICartItem) =>
          (item.product as mongoose.Types.ObjectId).toString() === productId
      );

      if (!cartItem) {
        res.status(404).json({
          success: false,
          error: "Item not found in cart",
        });
        return;
      }

      cartItem.quantity = quantity;
      cartItem.price = product.price;
      await cart.save();

      const populatedCart = await Cart.findById(cart._id).populate(
        "items.product",
        "name images price stock"
      );

      res.status(200).json({
        success: true,
        data: populatedCart,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Remove item from cart
  public async removeFromCart(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user._id;
      const { productId } = req.params;

      const cart = await Cart.findOne({ user: userId });
      if (!cart) {
        res.status(404).json({
          success: false,
          error: "Cart not found",
        });
        return;
      }

      cart.items = (cart as ICart).items.filter(
        (item: ICartItem) =>
          (item.product as mongoose.Types.ObjectId).toString() !== productId
      );

      await cart.save();

      const populatedCart = await Cart.findById(cart._id).populate(
        "items.product",
        "name images price stock"
      );

      res.status(200).json({
        success: true,
        data: populatedCart,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Clear cart
  public async clearCart(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user._id;

      const cart = await Cart.findOne({ user: userId });
      if (!cart) {
        res.status(404).json({
          success: false,
          error: "Cart not found",
        });
        return;
      }

      cart.items = [];
      await cart.save();

      res.status(200).json({
        success: true,
        message: "Cart cleared successfully",
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }
}
