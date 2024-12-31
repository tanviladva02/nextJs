import mongoose, { Schema, model, models } from "mongoose";
import { ProjectInterface } from "../interface/projectInterface";

// Enum for user roles
export enum UserRole {
  OWNER = "OWNER",
  ADMIN = "ADMIN",
  USER = "USER",
}

// Project schema definition
const projectSchema = new Schema<ProjectInterface>(
  {
    name: { type: String, required: true },
    status: { type: Number, required: true },
    archived: { type: Boolean, default: false },
    users: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        role: {
          type: String,
          enum: Object.values(UserRole), // Explicitly filter numeric values
          required: true,
        },
      },
    ],
    dueDate: { type: Date, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  {
    timestamps: true,
  }
);

// console.log("----",Object.values(UserRole));
const Project = models.project || model("project", projectSchema);

export default Project;
