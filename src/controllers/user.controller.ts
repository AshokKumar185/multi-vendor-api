import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/UserModel/user.model";

const JWT_SECRET = process.env.JWT_SECRET || "fresh-bite-raven-orders";

export const userController = async (userData: {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  role?: string;
}) => {
  const { username, email, password, confirmPassword, role } = userData;

  // VALIDATION (same as before)
  if (username.length < 3 || username.length > 30) {
    return { error: "Username must be between 3 and 30 characters long" };
  }

  const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
  if (!usernameRegex.test(username)) {
    return {
      error:
        "Username must be 3-30 characters long and can only contain letters, numbers, and underscores",
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { error: "Invalid email format" };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters long" };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match" };
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return { error: "Email already in use" };
  }

  // HASH password
  const hashedPassword = await bcrypt.hash(password, 10);

  // CREATE and SAVE user
  const newUser = new User({ username, email, password: hashedPassword,role });
  await newUser.save();

  // GENERATE TOKEN
  const token = jwt.sign(
    { id: newUser._id, email, role: newUser.role },
    JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );

  return {
    success: true,
    token,
    user: {
      id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
    },
  };
};

export const loginController = async (userData: {
  email: string;
  password: string;
}) => {
  const { email, password } = userData;

  // Validate input
  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  // Check if user exists
  const user = await User.findOne({ email });
  if (!user) {
    return { error: "Invalid email or password" };
  }

  // Compare password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return { error: "Invalid email or password" };
  }

  // Generate JWT token
  const token = jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );

  return {
    success: true,
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
  };
};
