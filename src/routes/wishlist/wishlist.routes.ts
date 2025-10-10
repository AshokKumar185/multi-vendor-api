import { Router } from "express";
import { WishlistController } from "../../controllers/wishlist.controller";
import roleMiddleware from "../../middlewares/roleMiddleware";

const router = Router();
const wishlistController = new WishlistController();

// All wishlist routes should be protected for authenticated users
router.use(roleMiddleware(["user", "admin"]));

router.get("/wishlist", wishlistController.getWishlist);
router.post("/wishlist/add", wishlistController.addToWishlist);
router.delete(
  "/wishlist/remove/:productId",
  wishlistController.removeFromWishlist
);
router.delete("/wishlist/clear", wishlistController.clearWishlist);
router.get("/wishlist/check/:productId", wishlistController.isInWishlist);

export default router;
