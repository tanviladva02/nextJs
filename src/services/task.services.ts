import Task   from "@/src/model/model.task";
import { TaskData } from "../interface/taskInterface";
import Project from "@/src/model/model.project";
import User from "@/src/model/model.user";
import { ObjectId } from "mongodb";
import { throwError } from "@/src/utils/errorhandler";
import mongoose from "mongoose"; 
import { validateTask } from "../utils/validation";
// import {parse} from "url";
// import { useRouter } from 'next/router';
// import { IncomingMessage } from "http";

export async function createTask(taskData: TaskData): Promise<unknown> {
  try {
    const { name, priority, status, createdBy, users, dueDate, projectId } = taskData;
    validateTask(taskData);

    // Extract userIds from users array (which contains objects with userId field)
    const userIds = users.map((user: { userId: string }) => user.userId);

    // Fetch user details based on the extracted userIds
    const userDetails = await User.find({ _id: { $in: userIds.map(userId => new ObjectId(userId)) } });

    const validProject = await Project.findById(projectId);
    if (!validProject) throwError("Invalid projectId.", 400);

    const newTask = new Task({
      name,
      priority,
      status,
      createdBy: new ObjectId(createdBy),
      users: userDetails,  // Store full user objects instead of IDs
      archived: false,
      createdAt: new Date(),
      dueDate,
      projectId: new ObjectId(projectId),
    });

    return await newTask.save();
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error adding task:", error.message);
      throwError(error.message || "Error adding task", 500);
    } else {
      console.error("An unknown error occurred");
      throwError("Unknown error", 500);
    }
  }
}

export async function getTasks(projectId: string): Promise<unknown[] | undefined> {
  try {
    const matchStage: mongoose.PipelineStage = projectId
      ? { $match: { projectId: new mongoose.Types.ObjectId(projectId), archived: false } }
      : { $match: { archived: false } };

    const aggregationPipeline: mongoose.PipelineStage[] = [
      matchStage,
      {
        $lookup: {
          from: 'users',
          localField: 'createdBy',
          foreignField: '_id',
          as: 'createdByUser',
          pipeline: [
            {
              $project: {
                _id: 1,
                name: 1,
                email: 1
              }
            }
          ]
        }
      },
      {
        $unwind: {
          path: '$createdByUser',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'updatedBy',
          foreignField: '_id',
          as: 'updatedByUser',
          pipeline: [
            {
              $project: {
                _id: 1,
                name: 1,
                email: 1
              }
            }
          ]
        }
      },
      {
        $unwind: {
          path: '$updatedByUser',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'users',  // Users is an array of user IDs
          foreignField: '_id',
          as: 'userDetails',
          pipeline: [
            {
              $project: {
                _id: 1,
                name: 1,
                email: 1
              }
            }
          ]
        }
      },
      {
        $unwind: {
          path: '$userDetails',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'projects',
          localField: 'projectId',
          foreignField: '_id',
          as: 'projectDetails',
          pipeline: [
            {
              $project: {
                _id: 1,
                name: 1,
                status: 1,
                dueDate:1,
                users:1
              }
            }
          ]
        }
      },
      {
        $unwind: {
          path: '$projectDetails',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $group: {
          _id: "$_id", // Group by task ID to avoid duplicating
          name: { $first: "$name" },
          priority: { $first: "$priority" },
          status: { $first: "$status" },
          users: { $push: "$userDetails" },  // Push full user details into 'users' array
          dueDate: { $first: "$dueDate" },
          createdAt: { $first: "$createdAt" },
          updatedAt: { $first: "$updatedAt" },
          archived: { $first: "$archived" },
          createdBy: { $first: "$createdByUser" },
          updatedBy: { $first: "$updatedByUser" },
          project: { $push: { id: "$projectDetails._id", name: "$projectDetails.name", status: "$projectDetails.status" , dueDate:"$projectDetails.dueDate", users:"$projectDetails.users" } }
        }
      },
      {
        $project: {
          name: 1,
          priority: 1,
          status: 1,
          users: 1,
          dueDate: 1,
          createdAt: 1,
          updatedAt: 1,
          archived: 1,
          createdBy: 1,
          updatedBy: 1,
          project: 1
        }
      },
      { $sort: { createdAt: -1 } }
    ];

    const tasks = await Task.aggregate(aggregationPipeline).exec();
    if (tasks.length === 0) throwError("No tasks found", 404);

    return tasks;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error fetching tasks:", error.message);
      throwError(error.message || "Error fetching tasks", 500);
    } else {
      console.error("An unknown error occurred");
      throwError("Unknown error", 500);
    }
  }
}

export async function updateTask(id: string, taskData: TaskData): Promise<unknown> {
  try {
    const { name, priority, status, archived, updatedBy, users, dueDate, projectId } = taskData;

    const updateFields: Record<string, unknown> = {};

    if (name) updateFields.name = name;
    if (priority != null) updateFields.priority = priority;
    if (status != null) updateFields.status = status;
    if (typeof archived === "boolean") updateFields.archived = archived;
    if (updatedBy) updateFields.updatedBy = new ObjectId(updatedBy);
    if (dueDate) updateFields.dueDate = dueDate;
    if (projectId) updateFields.projectId = new ObjectId(projectId);

    if (users && Array.isArray(users)) {
      const userIds = users.map((user: { userId: string }) => user.userId);
      const validUsers = await User.find({ _id: { $in: userIds.map((id) => new ObjectId(id)) } });
      if (validUsers.length !== userIds.length) throwError("One or more userIds are invalid.", 400);

      updateFields.users = userIds;
    }

    updateFields.updatedAt = new Date();

    const result = await Task.updateOne({ _id: new ObjectId(id) }, { $set: updateFields });

    if (result.matchedCount === 0) throwError("Task not found", 404);

    return await Task.findOne({ _id: new ObjectId(id) }); // will return updated task data finding through id.
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error adding task:", error.message);
      throwError(error.message || "Error adding task", 500);
    } else {
      // In case the error is not an instance of Error
      console.error("An unknown error occurred");
      throwError("Unknown error", 500);
    }
  }
}

