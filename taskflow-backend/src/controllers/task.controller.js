import prisma from "../lib/prisma.js";

export async function getTasks(req, res) {
  const tasks = await prisma.task.findMany({
    where: {
      userId: req.user.id
    }
  });

  res.json(tasks);
}

export async function createTask(req, res) {
  const { title } = req.body;

  const task = await prisma.task.create({
    data: {
      title,
      userId: req.user.id
    }
  });

  res.status(201).json(task);
}
export async function getTask(req,res){
  const { id } =req.params;
  if (!id) {
    return res.status(400).json({
      message: "Task ID is required"
    });
  }
  const task = await prisma.task.findFirst({
  where: {
    id: Number(id),
    userId: req.user.id
  }
});
  if(!task){
    return res.status(404).json({
      message: "Task not found"
    });
  }
  res.json(task)
}
export async function updateTask(req, res) {
  const id = Number(req.params.id);
  const { title, completed } = req.body;

  if (Number.isNaN(id)) {
    return res.status(400).json({
      message: "Invalid task ID"
    });
  }

  if (
    title !== undefined &&
    (typeof title !== "string" || title.trim() === "")
  ) {
    return res.status(400).json({
      message: "Title must be a non-empty string"
    });
  }

  if (
    completed !== undefined &&
    typeof completed !== "boolean"
  ) {
    return res.status(400).json({
      message: "Completed must be a boolean"
    });
  }

  const existingTask = await prisma.task.findFirst({
    where: {
      id,
      userId: req.user.id
    }
  });

  if (!existingTask) {
    return res.status(404).json({
      message: "Task not found"
    });
  }

  const updatedTask = await prisma.task.update({
    where: {
      id
    },
    data: {
      ...(title !== undefined && { title: title.trim() }),
      ...(completed !== undefined && { completed })
    }
  });

  res.json(updatedTask);
}
export async function deleteTask(req, res) {
  const { id } = req.params;

const task = await prisma.task.findFirst({
  where: {
    id: Number(id),
    userId: req.user.id
  }
});

  if (!task) {
    return res.status(404).json({
      message: "Task not found"
    });
  }

  await prisma.task.delete({
    where: {
      id: Number(id)
    }
  });

  res.json({
    message: "Task deleted successfully"
  });
}