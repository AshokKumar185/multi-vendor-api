// import express from "express";
// import userRoutes from "./routes/user/user.routes";
// import connectDB from "./config/Mongodbconfig/dbconfig";
// import dotenv from "dotenv";
// import pool from "./config/postgresConfig/neonDB";
// dotenv.config();
// const app = express();

// app.use(express.json());
// connectDB();
// pool
//   .connect()
//   .then(() => console.log("Connected to PostgreSQL!"))
//   .catch((err: Error) =>
//     console.error("PostgreSQL connection error", err.stack)
//   );

// // Routes

// app.use("/api/users", userRoutes);

// export default app;


import express from "express";
import cors from "cors"; // Add this import
import userRoutes from "./routes/user/user.routes";
import connectDB from "./config/Mongodbconfig/dbconfig";
import dotenv from "dotenv";
import pool from "./config/postgresConfig/neonDB";

dotenv.config();
const app = express();

// CORS Configuration - Add this BEFORE other middleware
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:3001', 
    'http://localhost:3004', // Your current frontend port
    'https://your-frontend-domain.com', // Add your production frontend domain
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));

// Alternative: Allow all origins (for development only - NOT recommended for production)
// app.use(cors());

app.use(express.json());

connectDB();
// pool
//   .connect()
//   .then(() => console.log("Connected to PostgreSQL!"))
//   .catch((err: Error) =>
//     console.error("PostgreSQL connection error", err.stack)
//   );

// Routes
app.use("/api/users", userRoutes);

export default app;