import { Response } from "express";
import { AuthRequest } from "../interfaces/auth.interface";
import { Order } from "../models/orderModel/order.model";
import { Cart } from "../models/cartModel/cart.model";
import { Product } from "../models/productModel/product.model";

export class OrderController {
  // Create new order
  public async createOrder(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user._id;
      const {
        shippingAddress,
        paymentMethod,
        itemsPrice,
        shippingPrice,
        taxPrice,
      } = req.body;

      // Get user's cart
      const cart = await Cart.findOne({ user: userId });
      if (!cart || cart.items.length === 0) {
        res.status(400).json({
          success: false,
          error: "Cart is empty",
        });
        return;
      }

      // Verify stock for all items
      for (const item of cart.items) {
        const product = await Product.findById(item.product);
        if (!product || product.stock < item.quantity) {
          res.status(400).json({
            success: false,
            error: `Insufficient stock for product ${
              product ? product.name : item.product
            }`,
          });
          return;
        }
      }

      // Calculate total amount
      const totalAmount = itemsPrice + shippingPrice + taxPrice;

      // Create order
      const order = new Order({
        user: userId,
        items: cart.items,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        shippingPrice,
        taxPrice,
        totalAmount,
      });

      const createdOrder = await order.save();

      // Update product stock
      for (const item of cart.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity },
        });
      }

      // Clear cart
      cart.items = [];
      await cart.save();

      // Populate order with product details
      const populatedOrder = await Order.findById(createdOrder._id).populate(
        "items.product",
        "name images price"
      );

      res.status(201).json({
        success: true,
        data: populatedOrder,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Get order by ID
  public async getOrder(req: AuthRequest, res: Response): Promise<void> {
    try {
      const order = await Order.findById(req.params.id)
        .populate("items.product", "name images price")
        .populate("user", "name email");

      if (!order) {
        res.status(404).json({
          success: false,
          error: "Order not found",
        });
        return;
      }

      // Check if the user is authorized to view this order
      if (
        order.user._id.toString() !== req.user._id &&
        req.user.role !== "admin"
      ) {
        res.status(403).json({
          success: false,
          error: "Not authorized to view this order",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: order,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Get user's orders
  public async getUserOrders(req: AuthRequest, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const orders = await Order.find({ user: req.user._id })
        .populate("items.product", "name images price")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      const total = await Order.countDocuments({ user: req.user._id });

      res.status(200).json({
        success: true,
        data: orders,
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

  // Update order status (Admin only)
  public async updateOrderStatus(
    req: AuthRequest,
    res: Response
  ): Promise<void> {
    try {
      const { status } = req.body;

      const order = await Order.findById(req.params.id);
      if (!order) {
        res.status(404).json({
          success: false,
          error: "Order not found",
        });
        return;
      }

      order.status = status;
      if (status === "delivered") {
        order.deliveredAt = new Date();
      }

      const updatedOrder = await order.save();
      const populatedOrder = await Order.findById(updatedOrder._id)
        .populate("items.product", "name images price")
        .populate("user", "name email");

      res.status(200).json({
        success: true,
        data: populatedOrder,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Update order payment status
  public async updateOrderPayment(
    req: AuthRequest,
    res: Response
  ): Promise<void> {
    try {
      const { paymentResult } = req.body;

      const order = await Order.findById(req.params.id);
      if (!order) {
        res.status(404).json({
          success: false,
          error: "Order not found",
        });
        return;
      }

      if (order.user.toString() !== req.user._id && req.user.role !== "admin") {
        res.status(403).json({
          success: false,
          error: "Not authorized to update this order",
        });
        return;
      }

      order.isPaid = true;
      order.paidAt = new Date();
      order.paymentResult = paymentResult;

      const updatedOrder = await order.save();
      const populatedOrder = await Order.findById(updatedOrder._id)
        .populate("items.product", "name images price")
        .populate("user", "name email");

      res.status(200).json({
        success: true,
        data: populatedOrder,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Get all orders (Admin only)
  public async getAllOrders(req: AuthRequest, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as string;

      const query: any = {};
      if (status) {
        query.status = status;
      }

      const orders = await Order.find(query)
        .populate("items.product", "name images price")
        .populate("user", "name email")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      const total = await Order.countDocuments(query);

      res.status(200).json({
        success: true,
        data: orders,
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
}
