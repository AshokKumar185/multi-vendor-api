import { Request, Response } from "express";
import { Product, IProduct } from "../models/productModel/product.model";

export class ProductController {
  // Create a new product
  public async createProduct(req: Request, res: Response): Promise<void> {
    try {
      const product = new Product(req.body);
      const savedProduct = await product.save();
      res.status(201).json({
        success: true,
        data: savedProduct,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Get all products with filtering, sorting, and pagination
  public async getProducts(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const sortField = (req.query.sortBy as string) || "createdAt";
      const sortOrder = (req.query.sortOrder as string) === "asc" ? 1 : -1;

      // Build filter object
      const filter: any = {};
      if (req.query.category) filter.categories = req.query.category;
      if (req.query.brand) filter.brand = req.query.brand;
      if (req.query.minPrice || req.query.maxPrice) {
        filter.price = {};
        if (req.query.minPrice)
          filter.price.$gte = parseFloat(req.query.minPrice as string);
        if (req.query.maxPrice)
          filter.price.$lte = parseFloat(req.query.maxPrice as string);
      }
      if (req.query.search) {
        filter.$text = { $search: req.query.search as string };
      }

      const products = await Product.find(filter)
        .sort({ [sortField]: sortOrder })
        .skip((page - 1) * limit)
        .limit(limit);

      const total = await Product.countDocuments(filter);

      res.status(200).json({
        success: true,
        data: products,
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

  // Get a single product by ID
  public async getProduct(req: Request, res: Response): Promise<void> {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) {
        res.status(404).json({
          success: false,
          error: "Product not found",
        });
        return;
      }
      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Update a product
  public async updateProduct(req: Request, res: Response): Promise<void> {
    try {
      const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });

      if (!product) {
        res.status(404).json({
          success: false,
          error: "Product not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Delete a product
  public async deleteProduct(req: Request, res: Response): Promise<void> {
    try {
      const product = await Product.findByIdAndDelete(req.params.id);

      if (!product) {
        res.status(404).json({
          success: false,
          error: "Product not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Product deleted successfully",
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Get product categories
  public async getCategories(req: Request, res: Response): Promise<void> {
    try {
      const categories = await Product.distinct("categories");
      res.status(200).json({
        success: true,
        data: categories,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Get product brands
  public async getBrands(req: Request, res: Response): Promise<void> {
    try {
      const brands = await Product.distinct("brand");
      res.status(200).json({
        success: true,
        data: brands,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }
}
