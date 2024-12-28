// // utils/validation.ts

// import { TaskData } from "@/src/model/model.task";
// import mongoose from "mongoose";
// // import  ObjectId  from "mongoose";

// /**
//  * Validates the fields of a task before saving to the database.
//  * @param task - The task data to validate.
//  * @returns {boolean} - Returns true if validation passes, otherwise throws an error.
//  */
// export function validateTask(task: TaskData) {
//   if (!task.name || typeof task.name !== "string") {
//     throw new Error("Task name is required and should be a string.");
//   }

//   if (task.priority == null || typeof task.priority !== "number") {
//     throw new Error("Priority is required and should be a number.");
//   }

//   if (task.status == null || typeof task.status !== "number") {
//     throw new Error("Status is required and should be a number.");
//   }

//   if (!task.users || !Array.isArray(task.users) || task.users.length === 0) {
//     throw new Error("Users are required and should be an array of user objects.");
//   }

//   task.users.forEach((user: { userId: unknown }) => {
//     if (typeof user.userId !== 'string' || !mongoose.Types.ObjectId.isValid(user.userId)) {
//       throw new Error("Each user must have a valid userId.");
//     }
//   });

//   if (!task.dueDate || !(task.dueDate instanceof Date)) {
//     throw new Error("Due date is required and should be a valid date.");
//   }

//   if (!task.createdBy || !mongoose.Types.ObjectId.isValid(task.createdBy)) {
//     throw new Error("CreatedBy field must be a valid ObjectId.");
//   }

//   if (task.updatedBy && !!mongoose.Types.ObjectId.isValid(task.updatedBy)) {
//     throw new Error("UpdatedBy field must be a valid ObjectId.");
//   }

//   if (!task.projectId || !!mongoose.Types.ObjectId.isValid(task.projectId)) {
//     throw new Error("ProjectId must be a valid ObjectId.");
//   }

//   return true; // If all validations pass
// }
