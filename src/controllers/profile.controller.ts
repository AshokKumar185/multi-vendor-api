import { Response } from "express";
import { AuthRequest } from "../interfaces/auth.interface";
import User from "../models/UserModel/user.model";
import { Address } from "../models/addressModel/address.model";

export class ProfileController {
  // Get user profile
  public async getProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = await User.findById(req.user._id).select("-password");
      if (!user) {
        res.status(404).json({
          success: false,
          error: "User not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Update user profile
  public async updateProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const updates = req.body;
      delete updates.password; // Password should be updated through a separate endpoint
      delete updates.email; // Email should be updated through a separate endpoint
      delete updates.role; // Role cannot be updated through this endpoint

      const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: updates },
        { new: true, runValidators: true }
      ).select("-password");

      if (!user) {
        res.status(404).json({
          success: false,
          error: "User not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Update user preferences
  public async updatePreferences(
    req: AuthRequest,
    res: Response
  ): Promise<void> {
    try {
      const { language, currency, notifications } = req.body;

      const user = await User.findByIdAndUpdate(
        req.user._id,
        {
          $set: {
            "preferences.language": language,
            "preferences.currency": currency,
            "preferences.notifications": notifications,
          },
        },
        { new: true, runValidators: true }
      ).select("-password");

      if (!user) {
        res.status(404).json({
          success: false,
          error: "User not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Get user addresses
  public async getAddresses(req: AuthRequest, res: Response): Promise<void> {
    try {
      const addresses = await Address.find({ user: req.user._id });

      res.status(200).json({
        success: true,
        data: addresses,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Add new address
  public async addAddress(req: AuthRequest, res: Response): Promise<void> {
    try {
      const addressData = {
        ...req.body,
        user: req.user._id,
      };

      // If this is the first address, make it default
      const addressCount = await Address.countDocuments({ user: req.user._id });
      if (addressCount === 0) {
        addressData.isDefault = true;
      }

      const address = new Address(addressData);
      await address.save();

      res.status(201).json({
        success: true,
        data: address,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Update address
  public async updateAddress(req: AuthRequest, res: Response): Promise<void> {
    try {
      const address = await Address.findOneAndUpdate(
        { _id: req.params.id, user: req.user._id },
        req.body,
        { new: true, runValidators: true }
      );

      if (!address) {
        res.status(404).json({
          success: false,
          error: "Address not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: address,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Delete address
  public async deleteAddress(req: AuthRequest, res: Response): Promise<void> {
    try {
      const address = await Address.findOneAndDelete({
        _id: req.params.id,
        user: req.user._id,
      });

      if (!address) {
        res.status(404).json({
          success: false,
          error: "Address not found",
        });
        return;
      }

      // If the deleted address was default, make another address default
      if (address.isDefault) {
        const anotherAddress = await Address.findOne({ user: req.user._id });
        if (anotherAddress) {
          anotherAddress.isDefault = true;
          await anotherAddress.save();
        }
      }

      res.status(200).json({
        success: true,
        message: "Address deleted successfully",
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Set default address
  public async setDefaultAddress(
    req: AuthRequest,
    res: Response
  ): Promise<void> {
    try {
      // Find the address and ensure it belongs to the user
      const address = await Address.findOne({
        _id: req.params.id,
        user: req.user._id,
      });

      if (!address) {
        res.status(404).json({
          success: false,
          error: "Address not found",
        });
        return;
      }

      // Remove default status from all other addresses
      await Address.updateMany(
        { user: req.user._id },
        { $set: { isDefault: false } }
      );

      // Set the selected address as default
      address.isDefault = true;
      await address.save();

      res.status(200).json({
        success: true,
        data: address,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }
}
