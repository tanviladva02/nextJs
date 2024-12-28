// src/controllers/projectController.ts
import { POST as createProjectService, GET as getProjectsService, PUT as updateProjectService } from "@/src/services/project.services";
import { NextResponse } from "next/server";
import { throwError } from "@/src/utils/errorhandler";

export async function POSTproject(req: Request) {
  try {
    const { name, status, createdBy, users, dueDate, archived } = await req.json();
    const result = await createProjectService(name, status, createdBy, users, dueDate, archived);
    return NextResponse.json({ message: "Project added successfully!", result });
  } catch (error) {
    console.error("Error in POST controller:", error);
    throw error;
  }
}

export async function GETproject() {
  try {
    const projects = await getProjectsService();
    if (projects.length === 0) {
      throwError("No projects found", 404);
    }
    return NextResponse.json({ message: "Aggregated projects", projects });
  } catch (error) {
    console.error("Error in GET controller:", error);
    throw error;
  }
}

export async function PUTproject(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) {
      throwError("Project ID is required", 400);
    }
    const { name, status, archived, updatedBy, users, dueDate } = await req.json();
    const result = await updateProjectService(id as string, name, status, archived, updatedBy, users, dueDate);
    return NextResponse.json({ message: "Project updated successfully", result });
  } catch (error) {
    console.error("Error in PUT controller:", error);
    throw error;
  }
}
