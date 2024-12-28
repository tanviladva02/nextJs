import mongoose, { Schema, model, models } from "mongoose";

// Define an interface for the project fields
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

// Enum for user roles
enum UserRole {
  CREATOR = "owner",
  OWNER = "admin",
  GENERAL_WORKER = "user",
} // owner , admin ,user

// Define the project schema
const projectSchema = new Schema<ProjectInterface>(
  {
    name: { type: String, required: true },
    status: { type: Number, required: true },
    archived: { type: Boolean, default: false }, // Default value for archived
    users: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        role: {
          type: String,
          enum: Object.values(UserRole),
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

// Use the model if it already exists, otherwise define it
const Project = models.project || model("project", projectSchema);

export default Project; // model file
