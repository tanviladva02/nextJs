import Project from "@/src/model/model.project";
import { ObjectId } from "mongodb";
import User from "@/src/model/model.user";
import { throwError } from "@/src/utils/errorhandler";
import mongoose from "mongoose";
// import { NextApiRequest } from "next";
// import { UserRole } from "@/src/model/model.project";
import {  validateProject } from "../utils/validation";
// import { UserUpdate } from "../interface/userInterface";

interface User {
  userId: string;
  role: string;
}

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  role: "USER" | "OWNER" | "ADMIN";
  name?: string;
}


export async function POST(
  name: string,
  status: number,
  createdBy: string,
  users: Array<{ userId: string; role: string }>,
  dueDate: Date,
  archived?: boolean
): Promise<unknown> {
  try {
    console.log("POST function is called");

    const userIds = users.map((user) => user.userId);

    // Validate userIds (check if the users exist)
    const validUsers = await User.find({ _id: { $in: [...userIds, createdBy] } });
    if (validUsers.length !== userIds.length + 1) {
      throwError("One or more userIds are invalid.", 400);
    }

    // Check if createdBy is already part of the users, if not, add it as OWNER
    const userIsAlreadyPresent = users.some((user) => user.userId === createdBy);

    const newUsers = userIsAlreadyPresent?[...users] :[...users,{userId : createdBy,role:"OWNER"}];

    const newProject = new Project({
        name,
        status,
        archived: archived ?? false,
        createdBy: new ObjectId(createdBy),
        users: newUsers.map((user) => ({
            userId: new ObjectId(user.userId),
            role: user.role,
        })),
        // users:newUsers,
        dueDate,
    });

    // Validate the project object before saving
    validateProject(newProject);

    return await newProject.save();
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error adding project:", error.message);
      throwError(error.message || "Error adding project", 500);
    } else {
      console.error("An unknown error occurred");
      throwError("Unknown error", 500);
    }
  }
}

export async function GET(): Promise<unknown[] | undefined> {
  try {
    const aggregationPipeline: mongoose.PipelineStage[] = [
      {
        $lookup: {
          from: "users", // Look up the users collection
          localField: "users.userId",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        // Unwind the userDetails array to merge user data with project data
        $unwind: {
          path: "$userDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        // Project necessary fields to include users and userDetails
        $project: {
          name: 1,
          status: 1,
          dueDate: 1,
          users: 1,
          "userDetails._id": 1,
          "userDetails.name": 1,
          "userDetails.role":1,
          createdBy: 1,
          createdAt: 1,
          updatedAt: 1,
          archived: 1,
        },
      },
      {
        // Group the data back together and reconstruct the users array
        $group: {
          _id: "$_id",
          name: { $first: "$name" },
          status: { $first: "$status" },
          archived: { $first: "$archived" },
          dueDate: { $first: "$dueDate" },
          createdAt: { $first: "$createdAt" },
          updatedAt: { $first: "$updatedAt" },
          createdBy: { $first: "$createdBy" },
          users: {
            $push: {
              userId: "$users.userId",
              role: "$users.role",
              userDetails: "$userDetails",
            },
          },
        },
      },
      {
        // Ensure user details are properly mapped and handle createdBy field
        $addFields: {
          users: {
            $map: {
              input: "$users",
              as: "user",
              in: {
                userId: "$$user.userId",
                role: "$$user.role",
                userDetails: {
                  name: {
                    $cond: {
                      if: { $eq: ["$$user.userId", "$createdBy"] },
                      then: { $ifNull: ["$$user.userDetails.name", "Created By"] },
                      else: "$$user.userDetails.name",
                    },
                  },
                },
              },
            },
          },
        },
      },
    ];

    // Execute the aggregation pipeline
    const projects = await Project.aggregate(aggregationPipeline).exec();
    return projects;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error fetching projects:", error.message);
      throwError(error.message || "Error fetching projects", 500);
    } else {
      console.error("An unknown error occurred");
      throwError("Unknown error", 500);
    }
  }
}

export async function PUT(
  projectId: string,
  name?: string,
  status?: number,
  archived?: boolean,
  updatedBy?: string,
  users?: { userId: string; role: string }[],
  dueDate?: Date
) {
  try {
    // Fetch the project to get the user details
    const project = await Project.findById(projectId).select('users createdBy');
    if (!project) throw new Error('Project not found');

    // Check if updatedBy is either the creator or in the users array
    const isCreator = project.createdBy.toString() === updatedBy;
    const userInProject = project.users.find(
      (user: { userId: mongoose.Types.ObjectId }) =>
        user.userId.toString() === updatedBy
    );

    const role = isCreator ? 'OWNER' : userInProject ? userInProject.role : null;

    if (!role || !['OWNER', 'ADMIN'].includes(role)) {
      throwError("unauthorized user",401);
    }

    // Prepare the fields to update
    const updateFields: Record<string, unknown> = {};
    if (name) updateFields.name = name;
    if (status != null) updateFields.status = status;
    if (typeof archived === 'boolean') updateFields.archived = archived;
    if (dueDate) updateFields.dueDate = dueDate;

    if (users) {
      const userIds = users.map((user) => user.userId);
      const validUsers = await User.find({ _id: { $in: userIds } });
      if (validUsers.length !== userIds.length) throw new Error('Invalid user IDs');

      updateFields.users = users.map((user) => ({
        userId: new mongoose.Types.ObjectId(user.userId),
        role: user.role,
      }));
    }

    // Update the project in the database
    const result = await Project.findByIdAndUpdate(
      projectId,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    return result;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error fetching projects:", error.message);
      throwError(error.message || "Error fetching projects", 500);
    } else {
      console.error("An unknown error occurred");
      throwError("Unknown error", 500);
    }
  }
}