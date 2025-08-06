import mongoose from "mongoose";
const restaurantSchema = new mongoose.Schema(
  {
      userId: {
      type: String,
      required: true,
      unique: true,
    },
    restaurantId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    restaurantData: {
      type: mongoose.Schema.Types.Mixed, // Allows any JSON structure
      required: true,
    },
  },
  { timestamps: true }
);

const Restaurant = mongoose.model("Restaurant", restaurantSchema);
export default Restaurant;
