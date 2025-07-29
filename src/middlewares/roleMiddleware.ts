import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

interface CustomJwtPayload extends JwtPayload {
  role?: string;
}

interface AuthenticatedRequest extends Request {
  user?: CustomJwtPayload;
}

const roleMiddleware = (roles: string[]) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      res.status(401).json({ message: "Authentication token is missing" });
      return;
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as CustomJwtPayload;

      req.user = decoded;

      const userRole = req.user?.role;
      console.log("User Role:", userRole);

      if (!userRole || !roles.includes(userRole)) {
        res
          .status(403)
          .json({ message: "Access denied: Insufficient permissions" });
        return;
      }

      next();
    } catch (error) {
      res.status(403).json({ message: "Invalid or expired token" });
    }
  };
};

export default roleMiddleware;