import mongoose, { Schema, model, models } from "mongoose";

// Define an interface for the task fields
export interface taskInterface {
  name: string;
  priority: number;
  status: number;
  archived: boolean;
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  dueDate: Date;
  createdAt?: Date;
  updatedAt?: Date;
  users: string[]; // Store userIds as strings
  projectId: mongoose.Types.ObjectId; // Reference to Project
}

export interface TaskData {
  name: string;
  priority: number;
  status: number;
  createdBy: string;
  updatedBy: string;
  users: { userId: string }[];
  dueDate: Date;
  archived : boolean;
  projectId: string;
}

const taskSchema = new Schema<taskInterface,TaskData>(
  {
    name: { type: String, required: true },
    priority: { type: Number, required: true },
    status: { type: Number, required: true },
    archived: { type: Boolean, default: false },
    users: [{ type: String, required: true }], // Store userIds as strings (fixed)
    dueDate: { type: Date, required: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user", // Reference to the User model
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user", // Reference to the User model
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "project", // Reference to the Project model
      required: true,
    },
  },
  { timestamps: true }
);

const Task = models.tasks || model("tasks", taskSchema);

export default Task;
