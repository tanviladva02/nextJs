// src/services/projectService.ts
import Project from "@/src/model/model.project";
import { ObjectId } from "mongodb";
import User from "@/src/model/model.user";
import { throwError } from "@/src/utils/errorhandler";
import connectToDatabase from "@/src/utils/db";
import mongoose from "mongoose";

// Create a new project
export async function POST(name: string, status: number, createdBy: string, users: Array<{ userId: string; role: string }>, dueDate: Date, archived?: boolean) {
  try {
    await connectToDatabase();
    const userIds = users.map((user) => user.userId);

    // Validate userIds (check if the users exist)
    const validUsers = await User.find({ _id: { $in: userIds } });
    if (validUsers.length !== userIds.length) {
      throwError("One or more userIds are invalid.", 400);
    }

    const newProject = new Project({
      name,
      status,
      archived: archived ?? false,
      createdBy: new ObjectId(createdBy),
      users: users.map((user) => ({
        userId: new ObjectId(user.userId),
        role: user.role,
      })),
      dueDate,
    });

    return await newProject.save();
  } catch (error) {
    console.error("Error in createProjectService:", error);
    throw error;
  }
}

// Fetch all projects with aggregation
export async function GET() {
  try {
    await connectToDatabase();
    const aggregationPipeline: mongoose.PipelineStage[] = [
      { $unwind: "$users" },
      {
        $lookup: {
          from: "users",
          localField: "users.userId",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      { $unwind: "$userDetails" },
      {
        $project: {
          name: 1,
          status: 1,
          dueDate: 1,
          users: 1,
          "userDetails._id": 1,
          "userDetails.name": 1,
          createdAt: 1,
          updatedAt: 1,
          archived: 1,
        },
      },
      {
        $addFields: {
          archived: { $ifNull: ["$archived", false] },
        },
      },
      {
        $group: {
          _id: "$_id",
          name: { $first: "$name" },
          status: { $first: "$status" },
          archived: { $first: "$archived" },
          dueDate: { $first: "$dueDate" },
          createdAt: { $first: "$createdAt" },
          updatedAt: { $first: "$updatedAt" },
          users: {
            $push: {
              userId: "$users.userId",
              role: "$users.role",
              userDetails: "$userDetails",
            },
          },
        },
      },
    ];

    return await Project.aggregate(aggregationPipeline).exec();
  } catch (error) {
    console.error("Error in getProjectsService:", error);
    throw error;
  }
}

// Update a project
export async function PUT(id: string, name?: string, status?: number, archived?: boolean, updatedBy?: string, users?: Array<{ userId: string; role: string }>, dueDate?: Date) {
  try {
    await connectToDatabase();
    const updateFields: Record<string, unknown> = {};

    if (name) updateFields.name = name;
    if (status != null) updateFields.status = status;
    if (typeof archived === "boolean") updateFields.archived = archived;
    if (updatedBy) updateFields.updatedBy = new ObjectId(updatedBy);
    if (users) {
      const userIds = users.map((user) => user.userId);
      const validUsers = await User.find({ _id: { $in: userIds } });
      if (validUsers.length !== userIds.length) {
        throwError("One or more userIds are invalid.", 400);
      }

      updateFields.users = users.map((user) => ({
        userId: new ObjectId(user.userId),
        role: user.role,
      }));
    }
    if (dueDate) updateFields.dueDate = dueDate;
    updateFields.updatedAt = new Date();

    const result = await Project.updateOne({ _id: new ObjectId(id) }, { $set: updateFields });
    if (result.matchedCount === 0) {
      throwError("Project not found", 404);
    }

    return result;
  } catch (error) {
    console.error("Error in updateProjectService:", error);
    throw error;
  }
}
