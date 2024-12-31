import Project from "@/src/model/model.project";
import { ObjectId } from "mongodb";
import User from "@/src/model/model.user";
import { throwError } from "@/src/utils/errorhandler";
import mongoose from "mongoose";
import {  validateProject } from "../utils/validation";
// interface User {
//   userId: string;
//   role: string;
// }

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
    console.time("abc");
    const aggregationPipeline: mongoose.PipelineStage[] = [
      {
        $lookup: {
          from: "users", // Lookup users collection for project users
          localField: "users.userId",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $lookup: {
          from: "users", // Lookup users collection for createdBy user
          localField: "createdBy",
          foreignField: "_id",
          as: "createdByDetails",
        },
      },
      {
        $lookup:{
          from:"users",
          localField:"updatedBy",
          foreignField:"_id",
          as:"updatedByDetails",
        }
      },
      {
        $unwind: {
          path: "$createdByDetails", 
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$updatedByDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          name: 1,
          status: 1,
          archived: 1,
          dueDate: 1,
          createdAt: 1,
          updatedAt: 1,
          createdBy: {
            id: "$createdByDetails._id",
            name: "$createdByDetails.name",
            email: "$createdByDetails.email",
            role: "OWNER", 
          },
          updatedBy: {
            id: "$updatedByDetails._id",
            name: "$updatedByDetails.name",
            email: "$updatedByDetails.email",
            role: "OWNER", 
          },
          users: {
            $map: { // iterate over the user's array
              input: "$users", 
              as: "user",
              in: {
                userId: "$$user.userId",
                role: "$$user.role",
                userDetails: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$userDetails", // Filter userDetails to match current userId
                        as: "details",
                        cond: { $eq: ["$$details._id", "$$user.userId"] },
                      },
                    },0,
                  ],
                },
              },
            },
          },
        },
      },
      {
        $unwind: {
          path: "$users", // Unwind users to format the array
          preserveNullAndEmptyArrays: true,
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
          createdBy: { $first: "$createdBy" },
          updatedBy: { $first: "$updatedBy" }, // Include updatedBy in the group stage
          users: {
            $push: {
              userId: "$users.userId",
              role: "$users.role",
              name: "$users.userDetails.name",
              email: "$users.userDetails.email",
            },
          },
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ];
    console.timeEnd("abc");
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
  updatedBy?: string, // Add updatedBy as an optional parameter
  users?: { userId: string; role: string }[],
  dueDate?: Date
) {
  try {
    // Fetch the project to get the user details
    const project = await Project.findById(projectId).select('users createdBy'); // will only give users and createdBy detail
    if (!project) throw new Error('Project not found');

    // Check if updatedBy is either the creator or in the users array
    const isCreator = project.createdBy.toString() === updatedBy;
    const userInProject = project.users.find(
      (user: { userId: mongoose.Types.ObjectId }) =>
        user.userId.toString() === updatedBy
    );

    const role = isCreator ? 'OWNER' : userInProject ? userInProject.role : null;

    if (!role || !['OWNER', 'ADMIN'].includes(role)) {
      throwError("unauthorized user", 401);
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

    // Add updatedBy to the fields to update
    if (updatedBy) {
      updateFields.updatedBy = new mongoose.Types.ObjectId(updatedBy);
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
      console.error("Error updating project:", error.message);
      throwError(error.message || "Error updating project", 500);
    } else {
      console.error("An unknown error occurred");
      throwError("Unknown error", 500);
    }
  }
}


