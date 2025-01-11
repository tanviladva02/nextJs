/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import * as taskService from "@/src/services/task.services";
import connectToDatabase from "@/src/utils/db";
import { middleware } from "@/src/middleware/auth";

export const POST = middleware(async (req: Request) => {
  try {
    await connectToDatabase();
    const taskData = await req.json();

    const result = await taskService.createTask(taskData);
    return NextResponse.json({ message: "Task added successfully!", result });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error adding task:", error.message);
      return NextResponse.json({ message: error.message || "Error adding task" }, { status: 500 });
    } else {
      console.error("An unknown error occurred");
      return NextResponse.json({ message: "Unknown error" }, { status: 500 });
    }
  }
});

export const GET = middleware(async (req) => {
  try {
    await connectToDatabase();
    const url = new URL(req.url);
    const projectId = url.searchParams.get("projectId");
    const tasks = await taskService.getTasks(projectId as string);
    return NextResponse.json({
      message: "Tasks retrieved successfully",
      tasks,
    });
  } catch (err) {
    return NextResponse.json(err);
  }
});

export const PUT = middleware(async (req: Request) => {
  try {
    await connectToDatabase();
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ message: "Task ID is required" }, { status: 400 });
    }

    const taskData = await req.json();

    const updatedTask = await taskService.updateTask(id as string, taskData);
    return NextResponse.json({ message: "Task updated successfully", updatedTask });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error updating task:", error.message);
      return NextResponse.json({ message: error.message || "Error updating task" }, { status: 500 });
    } else {
      console.error("An unknown error occurred");
      return NextResponse.json({ message: "Unknown error" }, { status: 500 });
    }
  }
});