import mongoose, { Schema, model, models } from "mongoose";
import { ProjectInterface } from "../interface/projectInterface";

// Enum for user roles
export enum UserRole {
  OWNER = 1,
  ADMIN = 2,
  USER = 3,
} // owner , admin ,user

// export function canUpdateTask(userRole: UserRole): boolean {
//   return userRole === UserRole.OWNER || userRole === UserRole.ADMIN;
// }

const projectSchema = new Schema<ProjectInterface>(
  {
    name: { type: String, required: true },
    status: { type: Number, required: true },
    archived: { type: Boolean, default: false }, // Default value for archived
    users: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        role: {
          type: Number,
          enum: Object.values(UserRole).filter((value) => typeof value === "number"),
          required: true,
        },
      },
    ],
    dueDate: { type: Date, required: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true, // Automatically handle createdAt and updatedAt
  }
);

const Project = models.project || model("project", projectSchema);

export default Project; 
