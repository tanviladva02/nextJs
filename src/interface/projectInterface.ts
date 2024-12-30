import mongoose from "mongoose";
import { UserRole } from "../model/model.project";

export interface ProjectInterface {
  name: string;
  status: number;
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  dueDate: Date;
  users: Array<{ userId: mongoose.Types.ObjectId; role: UserRole }>;
  createdAt?: Date;
  updatedAt?: Date;
  archived?: boolean;
}
