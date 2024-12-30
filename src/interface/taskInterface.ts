import mongoose from "mongoose";

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