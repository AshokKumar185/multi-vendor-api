import { Router } from "express";
import { ProfileController } from "../../controllers/profile.controller";
import roleMiddleware from "../../middlewares/roleMiddleware";

const router = Router();
const profileController = new ProfileController();

// All routes should be protected for authenticated users
router.use(roleMiddleware(["user", "admin"]));

// Profile routes
router.get("/profile", profileController.getProfile);
router.put("/profile", profileController.updateProfile);
router.put("/profile/preferences", profileController.updatePreferences);

// Address routes
router.get("/addresses", profileController.getAddresses);
router.post("/addresses", profileController.addAddress);
router.put("/addresses/:id", profileController.updateAddress);
router.delete("/addresses/:id", profileController.deleteAddress);
router.put("/addresses/:id/set-default", profileController.setDefaultAddress);

export default router;
