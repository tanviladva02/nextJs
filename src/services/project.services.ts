import Project from "@/src/model/model.project";
import { ObjectId } from "mongodb";
import User from "@/src/model/model.user";
import { throwError } from "@/src/utils/errorhandler";
import mongoose from "mongoose";
import {  validateProject } from "../utils/validation";
export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  role: "USER" | "OWNER" | "ADMIN";
  name?: string;
}

// export async function POST(
//   name: string,
//   status: number,
//   createdBy: string,
//   users: Array<{ userId: string; role: string }>,
//   dueDate: Date,
//   archived?: boolean
// ): Promise<unknown> {
//   try {
//     console.log("POST function is called");

//     const userIds = users.map((user) => user.userId);

//     // Validate userIds (check if the users exist)
//     const validUsers = await User.find({ _id: { $in: [...userIds, createdBy] } });
//     if (validUsers.length !== userIds.length + 1) {
//       throwError("One or more userIds are invalid.", 400);
//     }

//     // Check if createdBy is already part of the users, if not, add it as OWNER
//     const userIsAlreadyPresent = users.some((user) => user.userId === createdBy);
//     const newUsers = userIsAlreadyPresent?[...users] :[...users,{userId : createdBy,role:"OWNER"}];

//     const newProject = new Project({
//         name,
//         status,
//         archived: archived ?? false,
//         createdBy: new ObjectId(createdBy),
//         users: newUsers.map((user) => ({
//             userId: new ObjectId(user.userId),
//             role: user.role,
//         })),
//         dueDate,
//     });

//     // Validate the project object before saving
//     validateProject(newProject);

//     return await newProject.save();
//   } catch (error: unknown) {
//     if (error instanceof Error) {
//       console.error("Error adding project:", error.message);
//       throwError(error.message || "Error adding project", 500);
//     } else {
//       console.error("An unknown error occurred");
//       throwError("Unknown error", 500);
//     }
//   }
// }

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

    // Extract user IDs from the users array
    const userIds = users.map((user) => user.userId);

    // Validate if all user IDs, including createdBy, exist in the User collection
    const validUsers = await User.find({ _id: { $in: [...userIds, createdBy] } });
    if (validUsers.length !== userIds.length + 1) {
      throwError("One or more userIds are invalid.", 400);
    }

    // Ensure createdBy is added as OWNER if not already present
    const userIsAlreadyPresent = users.some((user) => user.userId === createdBy);

    // If createdBy is not already in users array, add it as OWNER (first in the list)
    if (!userIsAlreadyPresent) {
      users.unshift({ userId: createdBy, role: "OWNER" }); // Add 'createdBy' at the start
    }

    // Map users to include ObjectId for MongoDB compatibility
    const formattedUsers = users.map((user) => ({
      userId: new ObjectId(user.userId),
      role: user.role,
    }));

    // Create a new project object
    const newProject = new Project({
      name,
      status,
      archived: archived ?? false,
      createdBy: new ObjectId(createdBy),
      users: formattedUsers, // Add all users including createdBy as OWNER
      dueDate,
    });

    // Optional: Validate the project object before saving (if you have validation logic)
    validateProject(newProject);

    // Save the project to the database
    const savedProject = await newProject.save();

    console.log("Project successfully created:", savedProject);

    return savedProject;
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

// export async function GET(userId:string): Promise<unknown[] | undefined> {
//   try {
//     console.time("GET");

//     const matchStage: mongoose.PipelineStage = userId
//           ? { $match: { userId: new mongoose.Types.ObjectId(userId), archived: false } }
//           : { $match: { archived: false } };
//     const aggregationPipeline: mongoose.PipelineStage[] = [
//       matchStage,
//       {
//         $lookup: {
//           from: "users",
//           localField: "createdBy",
//           foreignField: "_id",
//           as: "createdByDetails",
//           pipeline: [
//             {
//               $project: {
//                 _id: 1,
//                 name: 1,
//                 email: 1,
//                 role: "OWNER",
//               },
//             },
//           ],
//         },
//       },
//       {
//         $unwind: {
//           path: "$createdByDetails",
//           preserveNullAndEmptyArrays: true,
//         },
//       },
//       {
//         $lookup: {
//           from: "users",
//           localField: "updatedBy",
//           foreignField: "_id",
//           as: "updatedByDetails",
//           pipeline: [
//             {
//               $project: {
//                 _id: 1,
//                 name: 1,
//                 email: 1,
//                 role: 1,
//               },
//             },
//           ],
//         },
//       },
//       {
//         $unwind: {
//           path: "$updatedByDetails",
//           preserveNullAndEmptyArrays: true,
//         },
//       },
//       {
//         $addFields: {
//           "updatedByDetails.role": {
//             $arrayElemAt: [
//               "$users.role",
//               {
//                 $indexOfArray: ["$users.userId", "$updatedBy"],
//               },
//             ],
//           },
//         },
//       },
//       {
//         $unwind: {
//           path: "$users",
//           preserveNullAndEmptyArrays: true,
//         },
//       },
//       {
//         $lookup: {
//           from: "users",
//           localField: "users.userId",
//           foreignField: "_id",
//           as: "userDetails",
//           pipeline: [
//             {
//               $project: {
//                 _id: 1,
//                 name: 1,
//                 email: 1,
//                 role: 1,
//               },
//             },
//           ],
//         },
//       },
//       {
//         $unwind: {
//           path: "$userDetails",
//           preserveNullAndEmptyArrays: true,
//         },
//       },
      
      
//       {
//         $group: {
//           _id: "$_id",
//           name: { $first: "$name" },
//           status: { $first: "$status" },
//           archived: { $first: "$archived" },
//           dueDate: { $first: "$dueDate" },
//           createdAt: { $first: "$createdAt" },
//           updatedAt: { $first: "$updatedAt" },
//           createdByDetails: { $first: "$createdByDetails" },
//           updatedByDetails: { $first: "$updatedByDetails" },
//           users: {
//             $push: {
//               userId: "$userDetails._id",
//               name: "$userDetails.name",
//               email: "$userDetails.email",
//               role: "$users.role",
//             },
//           },
//         },
//       },
//       {
//         $project: {
//           name: 1,
//           status: 1,
//           archived: 1,
//           dueDate: 1,
//           createdAt: 1,
//           updatedAt: 1,
//           users: 1,
//           createdByDetails: 1,
//           updatedByDetails: 1,
//         },
//       },
//       {
//         $sort: { createdAt: -1 }, // Sort projects by creation date (desc)
//       },
//     ];

//     console.timeEnd("GET");

//     const projects = await Project.aggregate(aggregationPipeline).exec();
//     return projects;
//   } catch (error: unknown) {
//     if (error instanceof Error) {
//       console.error("Error fetching projects:", error.message);
//       throwError(error.message || "Error fetching projects", 500);
//     } else {
//       console.error("An unknown error occurred");
//       throwError("Unknown error", 500);
//     }
//   }
// }

export async function GET(userId: string): Promise<unknown[] | undefined> {
  try {
    console.time("GET");

    const matchStage: mongoose.PipelineStage = userId
      ? { $match: { "users.userId": new mongoose.Types.ObjectId(userId), archived: false } }
      : { $match: { archived: false } };

    const aggregationPipeline: mongoose.PipelineStage[] = [
      matchStage,
      // Lookup for createdBy user details
      {
        $lookup: {
          from: "users",
          localField: "createdBy",
          foreignField: "_id",
          as: "createdByDetails",
          pipeline: [
            {
              $project: {
                _id: 1,
                name: 1,
                email: 1,
                role: "OWNER",
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: "$createdByDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      // Lookup for updatedBy user details
      {
        $lookup: {
          from: "users",
          localField: "updatedBy",
          foreignField: "_id",
          as: "updatedByDetails",
          pipeline: [
            {
              $project: {
                _id: 1,
                name: 1,
                email: 1,
                role: 1,
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: "$updatedByDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      // Add role for updatedBy user based on users array
      {
        $addFields: {
          "updatedByDetails.role": {
            $arrayElemAt: [
              "$users.role",
              {
                $indexOfArray: ["$users.userId", "$updatedBy"],
              },
            ],
          },
        },
      },
      // Lookup for task users
      {
        $unwind: {
          path: "$users",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "users.userId",
          foreignField: "_id",
          as: "userDetails",
          pipeline: [
            {
              $project: {
                _id: 1,
                name: 1,
                email: 1,
                role: 1,
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: "$userDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      // Group by task ID and collect user details
      {
        $group: {
          _id: "$_id",
          name: { $first: "$name" },
          status: { $first: "$status" },
          archived: { $first: "$archived" },
          dueDate: { $first: "$dueDate" },
          createdAt: { $first: "$createdAt" },
          updatedAt: { $first: "$updatedAt" },
          createdByDetails: { $first: "$createdByDetails" },
          updatedByDetails: { $first: "$updatedByDetails" },
          users: {
            $push: {
              userId: "$userDetails._id",
              name: "$userDetails.name",
              email: "$userDetails.email",
              role: "$users.role",
            },
          },
        },
      },
      // Project stage to shape the output
      {
        $project: {
          name: 1,
          status: 1,
          archived: 1,
          dueDate: 1,
          createdAt: 1,
          updatedAt: 1,
          users: 1,
          createdByDetails: 1,
          updatedByDetails: 1,
        },
      },
      // Sort by createdAt descending (ensure sorting happens at the end)
      { $sort: { createdAt: -1 } },
    ];

    console.timeEnd("GET");

    // Run aggregation pipeline to fetch tasks
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