import { POST as createProjectService, GET as getProjectsService, PUT as updateProjectService } from "@/src/services/project.services";
import { NextResponse } from "next/server";
import { throwError } from "@/src/utils/errorhandler";
import connectToDatabase from "@/src/utils/db";
import mongoose from "mongoose";

export async function POST(req: Request): Promise<NextResponse<{ message: string; result: unknown; }> | undefined> {
  try {
    await connectToDatabase();
    const { name, status, createdBy, users, dueDate } = await req.json();
    const result = await createProjectService(name, status, createdBy, users, dueDate);
    return NextResponse.json({ message: "Project added successfully!", result });
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

export async function GET(req: {url: string | URL; query: { projectId: string; };}): Promise<NextResponse<{ message: string; projects: unknown[] | undefined; }> | undefined>{
  try {
    await connectToDatabase();
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");
    console.log("userId",userId);
    const projects = await getProjectsService(userId as string);
    return NextResponse.json({ message: "Projects fetched successfully!", projects });
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

export async function PUT(req: Request):Promise<NextResponse<{ message: string; projects: unknown[] | undefined; }> | undefined> {
  try {
    // Connect to the database
    await connectToDatabase();

    // Extract projectId from query parameters
    const url = new URL(req.url, `http://${req.headers.get('host')}`); // when sometimes query or url doesn't work properly this thing will help to breakdown url and to get data easily.
    const projectId = url.searchParams.get('projectId');
    
    if (!projectId) {
      return NextResponse.json({ message: 'Missing projectId query parameter', projects: [] }, { status: 400 });
      // throwError("Missing projectId query parameter",400);
    }

    // Parse the request body
    const { name, status, archived, updatedBy, users, dueDate } = await req.json();
    
    // Validate projectId (ensure it's a valid MongoDB ObjectId)
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return NextResponse.json({ message: 'Invalid projectId format', projects: [] }, { status: 400 });
    }

    // Call the service function to handle project update
    const updatedProject = await updateProjectService(
      projectId,
      name,
      status,
      archived,
      updatedBy,
      users,
      dueDate
    );

    if (!updatedProject) {
      return NextResponse.json({ message: 'Project not found', projects: [] }, { status: 404 });
    }

    // Return success response with the updated project data inside an array
    return NextResponse.json({ message: 'Project updated successfully!', projects: [updatedProject] });
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