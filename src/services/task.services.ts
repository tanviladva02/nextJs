import Task , {TaskData}  from "@/src/model/model.task";
import Project from "@/src/model/model.project";
import User from "@/src/model/model.user";
import { ObjectId } from "mongodb";
import { throwError } from "@/src/utils/errorhandler";
import mongoose from "mongoose"; 

export async function createTask(taskData: TaskData) {
  const { name, priority, status, createdBy, users, dueDate, projectId } = taskData;

  if (!name || priority == null || status == null || !createdBy || !users || !dueDate || !projectId) {
    throwError("All fields (name, priority, status, createdBy, users, dueDate, projectId) are required!", 400);
  }

  const userIds = users.map((user: { userId: string }) => user.userId);

  const validProject = await Project.findById(projectId);
  if (!validProject) throwError("Invalid projectId.", 400);

  const newTask = new Task({
    name,
    priority,
    status,
    createdBy: new ObjectId(createdBy),
    users: userIds,
    archived: false,
    createdAt: new Date(),
    dueDate,
    projectId: new ObjectId(projectId),
  });

  return await newTask.save();
}

export async function getTasks() {
  const aggregationPipeline : mongoose.PipelineStage[] = [
    { $match: { archived: false } },
    {
      $lookup: {
        from: "projects",
        localField: "projectId",
        foreignField: "_id",
        as: "projectDetails",
      },
    },
    { $unwind: "$projectDetails" },
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
        projectId: 1,
        projectName: "$projectDetails.name",
        projectStatus: "$projectDetails.status",
      },
    },
    { $sort: { createdAt: -1 } },
  ];

  const tasks = await Task.aggregate(aggregationPipeline).exec();
  if (tasks.length === 0) throwError("No tasks found", 404);

  return tasks;
}

export async function updateTask(id: string, taskData: TaskData) {
  const { name, priority, status, archived, updatedBy, users, dueDate, projectId } = taskData;

  if (projectId) {
    const validProject = await Project.findById(projectId);
    if (!validProject) throwError("Invalid projectId.", 400);
  }

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

  return await Task.findOne({ _id: new ObjectId(id) });
}
