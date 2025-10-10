import { Router } from "express";
import { ReviewController } from "../../controllers/review.controller";
import roleMiddleware from "../../middlewares/roleMiddleware";

const router = Router();
const reviewController = new ReviewController();

// Get reviews for a product (public)
router.get("/products/:productId/reviews", reviewController.getProductReviews);

// Protected routes (require authentication)
router.use(roleMiddleware(["user", "admin"]));

router.post("/reviews", reviewController.createReview);
router.get("/reviews/my-reviews", reviewController.getUserReviews);
router.put("/reviews/:id", reviewController.updateReview);
router.delete("/reviews/:id", reviewController.deleteReview);
router.post("/reviews/:id/toggle-like", reviewController.toggleReviewLike);

export default router;
