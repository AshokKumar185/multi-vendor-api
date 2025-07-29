import express from "express";
import userRoutes from "./routes/user/user.routes";
import connectDB from "./config/Mongodbconfig/dbconfig";
import dotenv from "dotenv";
import pool from "./config/postgresConfig/neonDB";
dotenv.config();
const app = express();

app.use(express.json());
connectDB();
pool
  .connect()
  .then(() => console.log("Connected to PostgreSQL!"))
  .catch((err: Error) =>
    console.error("PostgreSQL connection error", err.stack)
  );

// Routes

app.use("/api/users", userRoutes);

export default app;
