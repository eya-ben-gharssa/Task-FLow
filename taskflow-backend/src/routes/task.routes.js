import express from "express";
import { getTasks, createTask, getTask, updateTask, deleteTask } from "../controllers/task.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { createTaskSchema } from "../schemas/task.schema.js";



const router =express.Router();

router.use(authenticateToken);

router.get("/",getTasks);
router.post("/", validate(createTaskSchema), createTask);
router.get("/:id",getTask);
router.put("/:id",updateTask);
router.delete("/:id", deleteTask);


export default router;