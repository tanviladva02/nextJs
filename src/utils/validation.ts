import { TaskData } from "@/src/interface/taskInterface";
import mongoose from "mongoose";
import { UserUpdate } from "@/src/interface/userInterface";
import { ProjectInterface } from "@/src/interface/projectInterface";
import { throwError } from "./errorhandler";

export function validateTask(task: TaskData) {
  try {
    if (!task.name || typeof task.name !== "string") {
      throw new Error("Task name is required and should be a string.");
    }
  
    if (task.priority === null || typeof task.priority !== "number") {
      throw new Error("Priority is required and should be a number.");
    }
  
    if (task.status === null || typeof task.status !== "number") {
      throw new Error("Status is required and should be a number.");
    }
  
    if (!task.users || !Array.isArray(task.users) || task.users.length === 0) {
      throw new Error("Users are required and should be an array of user objects.");
    }
  
    task.users.forEach((user: { userId: unknown }) => {
      if (typeof user.userId !== 'string' || !mongoose.Types.ObjectId.isValid(user.userId)) {
        throw new Error("Each user must have a valid userId.");
      }
    });
  
    if (!task.dueDate) {
      throw new Error("Due date is required and should be a valid date.");
    }
  
    if (!task.createdBy || !mongoose.Types.ObjectId.isValid(task.createdBy)) {
      throw new Error("CreatedBy field must be a valid ObjectId.");
    }
  
    if (task.updatedBy && !!mongoose.Types.ObjectId.isValid(task.updatedBy)) {
      throw new Error("UpdatedBy field must be a valid ObjectId.");
    }
    
    // if (!task.projectId || !!mongoose.Types.ObjectId.isValid(task.projectId)) {
    if (!task.projectId) {
      throw new Error("ProjectId must be a valid ObjectId.");
    }
  
    return true; // If all validations pass
  } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error adding task:", error.message);
        throwError(error.message || "Error adding task", 500);
      } else {
        // In case the error is not an instance of Error
        console.error("An unknown error occurred");
        throwError("Unknown error", 500);
      }
    }
}

export function validateUser(user: UserUpdate) {
   try {
    if (!user.name || typeof user.name !== "string") {
      throw new Error("User name is required and should be a string.");
    }
  
    if (!user.email || typeof user.email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
      throw new Error("Email is required and should be a valid email format.");
    }
  
    if (!user.password || user.password.length < 6) {
      throw new Error("Password is required and should be at least 6 characters long.");
    }
  
    if (!user.mobile || !/^[0-9]{10}$/.test(user.mobile.toString())) {
      throw new Error("Mobile number is required and should be a valid 10-digit number.");
    }
  
    if (user.gender === undefined || ![1, 2, 3].includes(user.gender)) {
      throw new Error("Gender is required and should be one of [1, 2, 3].");
    }
  
    if (!user.birthDate) {
      throw new Error("Birth date is required and should be a valid date.");
    }
  
    if (user.age === undefined) {
      throw new Error("Age is undefined.");
    }
  
    return true; // If all validations pass
   }catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error adding task:", error.message);
      throwError(error.message || "Error adding task", 500);
    } else {
      // In case the error is not an instance of Error
      console.error("An unknown error occurred");
      throwError("Unknown error", 500);
    }
  }
}

export function validateProject(project: ProjectInterface) {
  try {
    // Validate project name
    if (!project.name || typeof project.name !== "string") {
      throw new Error("Project name is required and should be a string.");
    }

    // Validate project status
    if (project.status === null || typeof project.status !== "number") {
      throw new Error("Project status is required and should be a number.");
    }

    // Validate users array
    // if (!project.users || !Array.isArray(project.users) || project.users.length === 0) {
    if (!project.users) {
      throw new Error("Users are required and should be an array of user objects.");
    }

    // Validate each user object within the users array
    // project.users.forEach((user: { userId: unknown; role: unknown }) => {
    //   if (typeof user.userId !== "string" ) {
    //     throw new Error("Each user must have a valid userId.");
    //   }

    //   if (user.role == null) {
    //     throw new Error("Each user must have a valid role from the UserRole enum.");
    //   }
    // });

    // Validate project dueDate
    if (!project.dueDate || !(project.dueDate instanceof Date)) {
      throw new Error("Due date is required and should be a valid date.");
    }

    // Validate createdBy field
    // if (!project.createdBy || !mongoose.Types.ObjectId.isValid(project.createdBy)) {
    if (!project.createdBy) {
      throw new Error("CreatedBy field must be a valid ObjectId.");
    }

    // Validate updatedBy field if provided
    // if (project.updatedBy && !mongoose.Types.ObjectId.isValid(project.updatedBy)) {
    if (project.updatedBy) {
      throw new Error("UpdatedBy field must be a valid ObjectId.");
    }

    return true; // If all validations pass
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error adding task:", error.message);
      throwError(error.message || "Error adding task", 500);
    } else {
      // In case the error is not an instance of Error
      console.error("An unknown error occurred");
      throwError("Unknown error", 500);
    }
  }
}


// export function canUpdateProject(project: ProjectInterface, userId: string): boolean {
//   // Check if the user is the project owner
//   const isOwner = project.createdBy.toString() === userId;

//   // Check if the user is an admin in the project's users list
//   const isAdmin = project.users.some(
//     (user) => user.userId.toString() === userId && user.role === UserRole.ADMIN
//   );

//   return isOwner || isAdmin;
// }