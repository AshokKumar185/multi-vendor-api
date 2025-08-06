import express from "express";
import { v4 as uuidv4 } from "uuid";
import {
  createRestaurantController,
  getRestaurantsController,
  updateRestaurantController,
} from "../../controllers/restaurants.controller";

const router = express.Router();

router.post("/createRestaurants", async (req, res) => {
  const { name, restaurantData, userId } = req.body;

  const restaurantId = uuidv4(); // Generate a unique ID

  try {
    const result = await createRestaurantController({
      userId,
      restaurantId,
      name,
      restaurantData,
    });
    if (!result.success) {
      return res.status(result.statusCode || 500).json({
        success: false,
        error: result.error || "Internal server error",
      });
    }

    return res.status(200).json({
      Message: "Restaurant created successfully",
      restaurantId: result?.restaurant?.restaurantId,
      restaurantName: result?.restaurant?.name,
    });
  } catch (error) {
    console.error("Error in route:", error);
    return res.status(500).json({
      success: false,
      error: "Something went wrong. Please try again.",
    });
  }
});

router.get("/getRestaurants/:userId", async (req, res) => {
  console.log("Fetching restaurants for user:", req.params.userId);
  if (!req.params.userId) {
    return res.status(400).json({
      success: false,
      error: "User ID is required",
    });
  }
  const { userId } = req.params;
  try {
    const result = await getRestaurantsController(userId);
    if (!result.success) {
      return res.status(result.statusCode || 500).json({
        success: false,
        error: result.error || "Internal server error",
      });
    }

    return res.status(200).json({
      Message: "Restaurants fetched successfully",
      restaurants: result.restaurants,
    });
  } catch (error) {
    console.error("Error in route:", error);
    return res.status(500).json({
      success: false,
      error: "Something went wrong. Please try again.",
    });
  }
});

router.put("/updateRestaurant", async (req, res) => {
  const { restaurantId, userId, name, restaurantData } = req.body;

  try {
    const result = await updateRestaurantController({
      restaurantId,
      userId,
      name,
      restaurantData,
    });
    if (!result.success) {
      return res.status(result.statusCode || 500).json({
        success: false,
        error: result.error || "Internal server error",
      });
    }

    return res.status(200).json({
      Message: "Restaurant updated successfully",
      restaurant: result.restaurant,
    });
  } catch (error) {
    console.error("Error in route:", error);
    return res.status(500).json({
      success: false,
      error: "Something went wrong. Please try again.",
    });
  }
});

export default router;
