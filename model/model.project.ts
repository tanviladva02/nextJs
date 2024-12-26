import mongoose, { Schema, model, models } from "mongoose";

// Define an interface for the task fields
export interface projectInterface {
  name: string;
  status: number;
  archived?: boolean;
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  dueDate: Date;
  createdAt?: Date;
  updatedAt?: Date;
  users: Array<{ userId: string; role: UserRole }>;
}

enum UserRole {
    CREATOR = "creator",
    OWNER = "owner",
    GENERAL_WORKER = "general_worker",
}
  

const projectSchema = new Schema<projectInterface>(
  {
    name: { type: String, required: true },
    status: { type: Number, required: true },
    archived: { type: Boolean, default: false },
    users: [
        {
          userId: { type: String, required: true }, // User ID stored as a string
          role: {
            type: String,
            enum: Object.values(UserRole), // Enum for roles
            required: true,
          },
        },
      ],
    dueDate: { type: Date, required: true },
  },
  { timestamps: true }
);

const project = models.tasks || model("project", projectSchema);

export default project;
