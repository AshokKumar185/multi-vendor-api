import Restaurant from "../models/restaurantsModel/restaurant.Model";

export const createRestaurantController = async ({
  userId,
  restaurantId,
  name,
  restaurantData,
}: {
  userId: string; // Assuming userId is a string, adjust if necessary
  restaurantId: string;
  name: string;
  restaurantData: any; // You can replace 'any' with a specific type/interface if you have one
}) => {
  if (!restaurantId || !name || !restaurantData) {
    return {
      success: false,
      error: "All fields are required",
      statusCode: 400,
    };
  }

  try {
    const newRestaurant = new Restaurant({
      userId,
      restaurantId,
      name,
      restaurantData,
    });

    await newRestaurant.save();

    return {
      success: true,
      message: "Restaurant created successfully",
      restaurant: newRestaurant,
      statusCode: 201,
    };
  } catch (error) {
    console.error("Error creating restaurant:", error);
    return {
      success: false,
      error: "Internal server error",
      statusCode: 500,
    };
  }
};

export const getRestaurantsController = async (userId: string) => {
  try {
    const restaurants = await Restaurant.find({ userId });
    return {
      success: true,
      restaurants,
      statusCode: 200,
    };
  } catch (error) {
    console.error("Error fetching restaurants:", error);
    return {
      success: false,
      error: "Internal server error",
      statusCode: 500,
    };
  }
};


export const updateRestaurantController = async ({
  restaurantId,
  userId,
  name,
  restaurantData,
}: {
  restaurantId: string;
  userId: string;
  name: string;
  restaurantData: any;
}) => {
  

  try {
    const updatedRestaurant = await Restaurant.findOneAndUpdate(
      { restaurantId, userId },
      { name, restaurantData },
      { new: true }
    );

    if (!updatedRestaurant) {
      return {
        success: false,
        error: "Restaurant not found",
        statusCode: 404,
      };
    }

    return {
      success: true,
      message: "Restaurant updated successfully",
      restaurant: updatedRestaurant,
      statusCode: 200,
    };
  } catch (error) {
    console.error("Error updating restaurant:", error);
    return {
      success: false,
      error: "Internal server error",
      statusCode: 500,
    };
  }
};
