import { Router } from "express";
import { CartController } from "../../controllers/cart.controller";
import roleMiddleware from "../../middlewares/roleMiddleware";

const router = Router();
const cartController = new CartController();

// All cart routes should be protected for authenticated users
router.use(roleMiddleware(["user", "admin"]));

// Cart routes
router.get("/cart", cartController.getCart);
router.post("/cart/add", cartController.addToCart);
router.put("/cart/update", cartController.updateCartItem);
router.delete("/cart/remove/:productId", cartController.removeFromCart);
router.delete("/cart/clear", cartController.clearCart);

export default router;
