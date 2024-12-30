// import { NextResponse } from "next/server";
// import * as taskService from "@/src/services/task.services";
// import { throwError } from "@/src/utils/errorhandler";
// import connectToDatabase from "../utils/db";

// export async function createTask(req: Request) {
//   try {
//     await connectToDatabase();
//     const taskData = await req.json();
//     const result = await taskService.createTask(taskData);
//     return NextResponse.json({ message: "Task added successfully!", result });
//   } catch (error: unknown) {
//     if (error instanceof Error) {
//       console.error("Error adding task:", error.message);
//       throwError(error.message || "Error adding task", 500);
//     } else {
//       // In case the error is not an instance of Error
//       console.error("An unknown error occurred");
//       throwError("Unknown error", 500);
//     }
//   }
// }

// export async function getTasks() {
//   try {
//     await connectToDatabase();
//     const tasks = await taskService.getTasks();
//     return NextResponse.json({ message: "Tasks retrieved successfully", tasks });
//   } catch (error) {
//     if(error instanceof Error) {
//         console.error("Error fetching tasks:", error);
//         throwError(error.message || "Error fetching tasks", 500);
//     } else {
//         // In case the error is not an instance of Error
//         console.error("An unknown error occurred");
//         throwError("Unknown error", 500);
//       }
//   }
// }

// export async function updateTask(req: Request) {
//   try {
//     await connectToDatabase();
//     const url = new URL(req.url);
//     const id = url.searchParams.get("id");
//     if (!id) throwError("Task ID is required", 400);

//     const taskData = await req.json();
//     const updatedTask = await taskService.updateTask(id as string, taskData);
//     return NextResponse.json({ message: "Task updated successfully", updatedTask });
//   } catch (error) {
//     if(error instanceof Error) {
//         console.error("Error updating task:", error);
//         throwError(error.message || "Error updating task", 500);
//     } else {
//         // In case the error is not an instance of Error
//         console.error("An unknown error occurred");
//         throwError("Unknown error", 500);
//       }
//   }
// }
