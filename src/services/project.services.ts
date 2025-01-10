/* eslint-disable @typescript-eslint/no-explicit-any */
import Project from "@/src/model/model.project";
import { ObjectId } from "mongodb";
import User from "@/src/model/model.user";
// import task from "@/src/model/model.task";
import { throwError } from "@/src/utils/errorhandler";
import {  validateProject } from "../utils/validation";
// import { jsPDF } from 'jspdf'; // for pdf
import { Parser } from "json2csv"; // for csv
import * as fs from "fs";
import mongoose from "mongoose";

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

// for pdf
// export async function getProjectDetails(userId: string, projectId: string) {
//   try {
//     console.time("GET");

//     const projects = await aggregationPipelineFun(userId, projectId);

//     if (projects.length === 0) {
//       throw new Error("No project found with the provided ID.");
//     }

//     const project = projects[0];

//     // Generate PDF using jsPDF
//     const doc = new jsPDF();

//     doc.setFont("helvetica");
//     doc.setFontSize(14);

//     // Project Details
//     doc.text(`Project: ${project.name}`, 20, 20);
//     doc.text(`Status: ${project.status}`, 20, 30);
//     doc.text(`Archived: ${project.archived}`, 20, 40);
//     doc.text(`Due Date: ${new Date(project.dueDate).toLocaleDateString()}`, 20, 50);
//     doc.text(`Created At: ${new Date(project.createdAt).toLocaleDateString()}`, 20, 60);
//     doc.text(`Updated At: ${new Date(project.updatedAt).toLocaleDateString()}`, 20, 70);

//     // Created By
//     doc.text("Created By:", 20, 80);
//     doc.text(`Name: ${project.createdByDetails.name || "N/A"}`, 20, 90);
//     doc.text(`Email: ${project.createdByDetails.email || "N/A"}`, 20, 100);
//     doc.text(`Role: ${project.createdByDetails.role || "N/A"}`, 20, 110);

//     // Updated By
//     doc.text("Updated By:", 20, 120);
//     doc.text(`Name: ${project.updatedByDetails?.name || "N/A"}`, 20, 130);
//     doc.text(`Email: ${project.updatedByDetails?.email || "N/A"}`, 20, 140);
//     doc.text(`Role: ${project.updatedByDetails?.role || "N/A"}`, 20, 150);

//     // Users
//     doc.text("Users:", 20, 160);
//     project.users.forEach((user: { name: any; email: any; role: any }, index: number) => {
//       doc.text(`${index + 1}. ${user.name || "N/A"} (${user.email || "N/A"}) - Role: ${user.role || "N/A"}`, 20, 170 + index * 10);
//     });

//     // Tasks
//     let taskStartY = 170 + project.users.length * 10 + 10; // Adjust starting Y position
//     doc.text("Tasks:", 20, taskStartY);
//     taskStartY += 10;
    
//     project.tasks.forEach(
//       (task: { id: any; name: any; status: any; userDetails: { name: any }[] }, index: number) => {
//         const assignedUsers = task.userDetails.map((user) => user.name).join(", "); // Map user names
//         // console.log("taskUser", assignedUsers); 
//         if(assignedUsers === ""){
//           return doc.text(
//             `${index + 1}. Task Name: ${task.name || "N/A"}, Status: ${task.status || "N/A"}`,
//             20,
//             taskStartY + index * 10
//           );
//         }
//         else{
//           return doc.text(
//             `${index + 1}. Task Name: ${task.name || "N/A"}, Status: ${task.status || "N/A"}, Users: ${assignedUsers}`,
//             20,
//             taskStartY + index * 10
//           );
//         }
//       }
//     );
    

//     console.timeEnd("GET");
//     return doc;

//   } catch (error: unknown) {
//     if (error instanceof Error) {
//       console.error("Error generating project details:", error.message);
//       throw new Error(error.message || "Error generating project details");
//     } else {
//       console.error("An unknown error occurred");
//       throw new Error("Unknown error");
//     }
//   }
// }

// for csv excellsheet
export async function getProjectDetails(userId: string, projectId: string) {
  try {
    console.time("GET");

    const projects = await aggregationPipelineFun(userId, projectId);

    if (projects.length === 0) {
      throw new Error("No project found with the provided ID.");
    }

    const project = projects[0];

    // Prepare Data for CSV
    const projectDetails = {
      "Project Name": project.name || "N/A",
      Status: project.status || "N/A",
      Archived: project.archived || "N/A",
      "Due Date": new Date(project.dueDate).toLocaleDateString() || "N/A",
      "Created At": new Date(project.createdAt).toLocaleDateString() || "N/A",
      "Updated At": new Date(project.updatedAt).toLocaleDateString() || "N/A",
    };

    const createdByDetails = {
      "Created By (Name)": project.createdByDetails?.name || "N/A",
      "Created By (Email)": project.createdByDetails?.email || "N/A",
      "Created By (Role)": project.createdByDetails?.role || "N/A",
    };

    const updatedByDetails = {
      "Updated By (Name)": project.updatedByDetails?.name || "N/A",
      "Updated By (Email)": project.updatedByDetails?.email || "N/A",
      "Updated By (Role)": project.updatedByDetails?.role || "N/A",
    };

    // Flatten Users Data
    const users = project.users.map((user: { name: any; email: any; role: any }) => ({
      "User Name": user.name || "N/A",
      "User Email": user.email || "N/A",
      "User Role": user.role || "N/A",
    }));

    // Flatten Tasks Data
    const tasks = project.tasks.map(
      (task: { name: any; status: any;}) => ({
        "Task Name": task.name || "N/A",
        "Task Status": task.status || "N/A",
        // "Assigned Users": task.userDetails
        //   .map((user) => user.name )
        //   .join(", ") || "N/A",
      })
    );

    // Combine All Sections into CSV Data
    const data = [
      { Section: "Project Details", ...projectDetails },
      { Section: "Created By", ...createdByDetails },
      { Section: "Updated By", ...updatedByDetails },
      ...users.map((user:any, index:any) => ({ Section: `User ${index + 1}`, ...user })),
      ...tasks.map((task:any, index:any) => ({ Section: `Task ${index + 1}`, ...task })),
    ];

    // Convert Data to CSV
    const json2csvParser = new Parser();
    const csv = json2csvParser.parse(data);

    // Save CSV to File (Optional)
    fs.writeFileSync("project-details.csv", csv);

    console.timeEnd("GET");

    return csv; // Return CSV content as a string (for API response or download)

  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error generating project details:", error.message);
      throw new Error(error.message || "Error generating project details");
    } else {
      console.error("An unknown error occurred");
      throw new Error("Unknown error");
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

// common aggregation pipeline
async function aggregationPipelineFun (userId: string, projectId: string){

  const matchStage: mongoose.PipelineStage = userId
  ? { $match: { "users.userId": new mongoose.Types.ObjectId(userId), archived: false } }
  : { $match: { archived: false } };

  if (projectId) {
    matchStage.$match["_id"] = new mongoose.Types.ObjectId(projectId);
  }

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
  // Lookup for tasks
  {
    $lookup: {
      from: "tasks", // Assuming the tasks collection name is "tasks"
      let: { projectId: "$_id" }, // Pass project ID to the pipeline
      pipeline: [
        {
          $match: {
            $expr: { $eq: ["$projectId", "$$projectId"] }, // Match projectId in tasks
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "users",
            foreignField: "_id",
            as: "userDetails",
            pipeline: [
              {
                $project: {
                  _id: 1,
                  name: 1, // User name
                },
              },
            ],
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            status: 1,
            userDetails: 1, // Include user details for tasks
          },
        },
      ],
      as: "tasks", // Save the tasks in the "tasks" field
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
      createdByDetails: 1,
      updatedByDetails: 1,
      users: {
        userId: 1,
        name: 1,
        email: 1,
        role: 1,
      },
      tasks: {
        _id: 1,
        name:1,
        status: 1,
        userDetails: 1,
      }, // Include the tasks in the final output
    },
  },

  // Sort by createdAt descending (ensure sorting happens at the end)
  { $sort: { createdAt: -1 } },
];
  
  const projects = await Project.aggregate(aggregationPipeline).exec();
  return projects;
}