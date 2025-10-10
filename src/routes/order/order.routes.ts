import { Router } from "express";
import { OrderController } from "../../controllers/order.controller";
import roleMiddleware from "../../middlewares/roleMiddleware";

const router = Router();
const orderController = new OrderController();

// All routes should be protected for authenticated users
router.use(roleMiddleware(["user", "admin"]));

// Public routes (for authenticated users)
router.post("/orders", orderController.createOrder);
router.get("/orders/my-orders", orderController.getUserOrders);
router.get("/orders/:id", orderController.getOrder);
router.put("/orders/:id/pay", orderController.updateOrderPayment);

// Admin only routes
router.get("/orders", roleMiddleware(["admin"]), orderController.getAllOrders);
router.put(
  "/orders/:id/status",
  roleMiddleware(["admin"]),
  orderController.updateOrderStatus
);

export default router;
