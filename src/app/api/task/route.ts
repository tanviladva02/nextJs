// import { createTask, getTasks, updateTask } from "@/src/controller/task.controller";

// export async function POST(req: Request) {
//   return await createTask(req);
// }

// export async function GET() {
//   return await getTasks();
// }

// export async function PUT(req: Request) {
//   return await updateTask(req);
// }


import { NextResponse } from "next/server";
import * as taskService from "@/src/services/task.services";
import { throwError } from "@/src/utils/errorhandler";
import connectToDatabase from "@/src/utils/db";

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const taskData = await req.json();
    const result = await taskService.createTask(taskData);
    return NextResponse.json({ message: "Task added successfully!", result });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error adding task:", error.message);
      throwError(error.message || "Error adding task", 500);
    } else {
      console.error("An unknown error occurred");
      throwError("Unknown error", 500);
    }
  }
}

export async function GET() {
  try {
    await connectToDatabase();
    const tasks = await taskService.getTasks();
    return NextResponse.json({ message: "Tasks retrieved successfully", tasks });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error fetching tasks:", error.message);
      throwError(error.message || "Error fetching tasks", 500);
    } else {
      console.error("An unknown error occurred");
      throwError("Unknown error", 500);
    }
  }
}

export async function PUT(req: Request) {
  try {
    await connectToDatabase();
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) throwError("Task ID is required", 400);

    const taskData = await req.json();
    const updatedTask = await taskService.updateTask(id as string, taskData);
    return NextResponse.json({ message: "Task updated successfully", updatedTask });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error updating task:", error.message);
      throwError(error.message || "Error updating task", 500);
    } else {
      console.error("An unknown error occurred");
      throwError("Unknown error", 500);
    }
  }
}
