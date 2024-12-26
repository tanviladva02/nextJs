import { NextResponse } from "next/server";
import Task from "@/model/model.task";
import connectToDatabase from "@/utils/db";
import { ObjectId } from "mongodb";

// Define a type for the user object inside the users array
interface UserAssignment {
  userId: string;  
}

interface PostRequestBody {
  name: string;
  priority: number;
  status: number;
  createdBy: string;
  updatedBy: string;
  users: UserAssignment[]; 
  dueDate : Date;
}

interface PutRequestBody {
  name?: string;
  priority?: number;
  status?: number;
  archived?: boolean;
  updatedBy: string;
  users?: UserAssignment[];
  dueDate?:Date ;
}


export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const { name, priority, status, createdBy, users, dueDate }: PostRequestBody = await req.json();

    // Validate required fields
    if (!name || priority == null || status == null || !createdBy || !users || !dueDate) {
      return NextResponse.json(
        { message: "All fields (name, priority, status, createdBy, users , dueDate) are required!" },
        { status: 400 }
      );
    }

    // Ensure users array is properly formatted
    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json({ message: "Users array must be provided." }, { status: 400 });
    }

    // Map users to include only userId
    const formattedUsers = users.map((user: UserAssignment) => ({
      userId: new ObjectId(user.userId)
    }));

    // Create new task
    const newTask = new Task({
      name,
      priority,
      status,
      createdBy: new ObjectId(createdBy),
      users: formattedUsers,
      archived: false,
      createdAt: new Date(),
      dueDate
    });

    // Save task to database
    const result = await newTask.save();

    return NextResponse.json({ message: "Task added successfully!", taskId: result._id });
  } catch (error) {
    console.error("Error adding task:", error);
    return NextResponse.json({ message: "Error adding task" }, { status: 500 });
  }
}


export async function GET() {
  try {
    await connectToDatabase();
    // Fetch all tasks from the database
    const tasks = await Task.find();

    if (tasks.length === 0) {
      return NextResponse.json({ message: "No tasks found" }, { status: 404 });
    }

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json({ message: "Error fetching tasks" }, { status: 500 });
  }
}


export async function PUT(req: Request) {
  try {
    await connectToDatabase();
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ message: "Task ID is required" }, { status: 400 });
    }

    const { name, priority, status, archived, updatedBy, users, dueDate }: PutRequestBody = await req.json();

    // Build update fields object
    const updateFields: Record<string, unknown> = {};  // Avoid using any, use Record<string, unknown>

    if (name) updateFields.name = name;
    if (priority != null) updateFields.priority = priority;
    if (status != null) updateFields.status = status;
    if (typeof archived === "boolean") updateFields.archived = archived;
    if (updatedBy) updateFields.updatedBy = new ObjectId(updatedBy);
    if(dueDate) updateFields.dueDate = dueDate;
    
    if (users && Array.isArray(users)) {
      // Map users to include only userId
      updateFields.users = users.map((user: UserAssignment) => ({
        userId: new ObjectId(user.userId)
      }));
    }

    updateFields.updatedAt = new Date(); // Add updated timestamp

    const result = await Task.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }

    // Fetch the updated task
    const updatedTask = await Task.findOne({ _id: new ObjectId(id) });

    return NextResponse.json({ message: "Task updated successfully", task: updatedTask });
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json({ message: "Error updating task" }, { status: 500 });
  }
}
