import mongoose, { Schema, model, models } from "mongoose";
import { taskInterface } from "../interface/taskInterface";
import { TaskData } from "../interface/taskInterface";

const taskSchema = new Schema<taskInterface,TaskData>(
  {
    name: { type: String, required: true },
    priority: { type: Number, required: true },
    status: { type: Number, required: true },
    archived: { type: Boolean, default: false },
    users: [{ type: String, required: true }], 
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
