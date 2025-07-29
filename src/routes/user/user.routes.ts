import { Router } from "express";
import {
  loginController,
  userController,
} from "../../controllers/user.controller";

const router = Router();

router.post("/register", async (req, res) => {
  const { username, email, password, confirmPassword, role } = req.body;

  if (!username || !email || !password || !confirmPassword) {
    return res.status(400).json({ error: "All fields are required" });
  }
  console.log(role);
  const result = await userController({
    username,
    email,
    password,
    confirmPassword,
    role, // Default role to 'user' if not provided
  });

  if (result.error) {
    return res.status(400).json({ error: result.error });
  }

  return res.status(201).json({
    message: "User registered successfully",
    token: result.token,
    user: result.user,
  });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const result = await loginController({ email, password });

  if (result.error) {
    return res.status(400).json({ error: result.error });
  }

  return res.status(200).json({
    message: "Login successful",
    token: result.token,
    user: result.user,
  });
});

export default router;
