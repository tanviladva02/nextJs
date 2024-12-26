import { NextResponse } from "next/server";
import project from "@/model/model.project";
import connectToDatabase from "@/utils/db";
import { ObjectId } from "mongodb";

// Define interfaces for request bodies
interface PostRequestBody {
  name: string;
  status: number;
  createdBy: string;
  updatedBy: string;
  users: Array<{ userId: string; role: string }>;
  dueDate: Date;
}

interface PutRequestBody {
  name?: string;
  status?: number;
  archived?: boolean;
  updatedBy: string;
  users?: Array<{ userId: string; role: string }>;
  dueDate?: Date;
}

// POST: Add a new task
export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const { name, status, createdBy, users, dueDate }: PostRequestBody = await req.json();
    console.log(name,status,createdBy,users,dueDate);

    // Validate required fields
    if (!name || status == null || !createdBy  || !users || !dueDate) {
      return NextResponse.json(
        { message: "All fields (name, status, createdBy, users, dueDate) are required!" },
        { status: 400 }
      );
    }

    // Validate users array
    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json({ message: "Users array must be provided." }, { status: 400 });
    }

    // Create the new task
    const newProject = new project({
      name,
      status,
      archived: false,
      createdBy: new ObjectId(createdBy),
      users: users.map((user) => ({
        userId: user.userId,
        role: user.role,
      })),
      dueDate,
      createdAt: new Date(),
    });

    // Save the task to the database
    const result = await newProject.save();

    return NextResponse.json({ message: "Task added successfully!", projectId: result._id });
  } catch (error) {
    console.error("Error adding task:", error);
    return NextResponse.json({ message: "Error adding task" }, { status: 500 });
  }
}

// GET: Fetch all tasks
export async function GET() {
  try {
    await connectToDatabase();

    // Fetch all tasks from the database
    const projects = await project.find();

    if (projects.length === 0) {
      return NextResponse.json({ message: "No tasks found" }, { status: 404 });
    }

    return NextResponse.json(projects);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json({ message: "Error fetching tasks" }, { status: 500 });
  }
}

// PUT: Update an existing task
export async function PUT(req: Request) {
  try {
    await connectToDatabase();
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ message: "Task ID is required" }, { status: 400 });
    }

    const { name, status, archived, updatedBy, users, dueDate }: PutRequestBody = await req.json();

    // Build update fields object
    const updateFields: Record<string, unknown> = {};

    if (name) updateFields.name = name;
    if (status != null) updateFields.status = status;
    if (typeof archived === "boolean") updateFields.archived = archived;
    if (updatedBy) updateFields.updatedBy = new ObjectId(updatedBy);
    if (users && Array.isArray(users)) {
      updateFields.users = users.map((user) => ({
        userId: user.userId,
        role: user.role,
      }));
    }
    if (dueDate) updateFields.dueDate = dueDate;
    updateFields.updatedAt = new Date(); // Add updated timestamp

    const result = await project.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }

    // Fetch the updated task
    const updatedTask = await project.findOne({ _id: new ObjectId(id) });

    return NextResponse.json({ message: "Task updated successfully", task: updatedTask });
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json({ message: "Error updating task" }, { status: 500 });
  }
}
