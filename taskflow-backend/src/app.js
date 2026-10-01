import express from "express";
import taskRoutes from  "./routes/task.routes.js";
import authRoutes from "./routes/auth.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";
const app= express();
app.use(express.json());
import cors from "cors";

app.use(cors({
  origin: "http://localhost:3000"
}));
app.use("/api/tasks",taskRoutes);
app.use("/api/auth", authRoutes);

app.use(errorHandler);

export default app;

