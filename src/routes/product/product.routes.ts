import { Router } from "express";
import { ProductController } from "../../controllers/product.controller";
import roleMiddleware from "../../middlewares/roleMiddleware";

const router = Router();
const productController = new ProductController();

// Public routes
router.get("/products", productController.getProducts);
router.get("/products/:id", productController.getProduct);
router.get("/products/categories", productController.getCategories);
router.get("/products/brands", productController.getBrands);

// Protected routes (Admin only)
router.post(
  "/products",
  roleMiddleware(["admin"]),
  productController.createProduct
);
router.put(
  "/products/:id",
  roleMiddleware(["admin"]),
  productController.updateProduct
);
router.delete(
  "/products/:id",
  roleMiddleware(["admin"]),
  productController.deleteProduct
);

export default router;
