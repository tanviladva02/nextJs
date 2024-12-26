import mongoose, { Schema, model, models } from "mongoose";

// Define an interface for the task fields
export interface taskInterface {
  name: string;
  priority: number;
  status: number;
  archived: boolean;
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  dueDate: Date;
  createdAt?: Date;
  updatedAt?: Date;
  users: Array<{ userId: string }>; // Storing userId as a string
}

const taskSchema = new Schema<taskInterface>(
  {
    name: { type: String, required: true },
    priority: { type: Number, required: true },
    status: { type: Number, required: true },
    archived: { type: Boolean, default: false },
    users: [
      {
        userId: { type: String, required: true }, // User ID stored as a string
      },
    ],
    dueDate: { type: Date, required: true },
  },
  { timestamps: true }
);

const Task = models.tasks || model("tasks", taskSchema);

export default Task;
