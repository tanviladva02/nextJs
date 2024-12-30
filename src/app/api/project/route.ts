// import { POSTproject, GETproject, PUTproject } from "@/src/controller/project.controller";

// export async function POST(req: Request) {
//   return POSTproject(req);
// }

// export async function GET() {
//   return GETproject();
// }

// export async function PUT(req: Request) {
//   return PUTproject(req);
// }

import { POST as createProjectService, GET as getProjectsService, PUT as updateProjectService } from "@/src/services/project.services";
import { NextResponse } from "next/server";
import { throwError } from "@/src/utils/errorhandler";
import connectToDatabase from "@/src/utils/db";

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const { name, status, createdBy, users, dueDate } = await req.json();
    const result = await createProjectService(name, status, createdBy, users, dueDate);
    console.log("result ", result);
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

export async function GET() {
  try {
    await connectToDatabase();
    const projects = await getProjectsService();

    if (!projects) {
      throw new Error("Projects are required!");
    }

    if (projects.length === 0) {
      throwError("No projects found", 404);
    }
    return NextResponse.json({ message: "Aggregated projects", projects });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error retrieving projects:", error.message);
      throwError(error.message || "Error retrieving projects", 500);
    } else {
      console.error("An unknown error occurred");
      throwError("Unknown error", 500);
    }
  }
}

export async function PUT(req: Request) {
  try {
    await connectToDatabase();
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    const role = url.searchParams.get("role");

    if (!id) {
      throwError("Project ID is required", 400);
    }
    const { name, status, archived, updatedBy, users, dueDate } = await req.json();
    const result = await updateProjectService(id as string, name, status, archived, updatedBy, users, dueDate);

    if (role === "user") {
      throw new Error("User cannot update project");
    }

    return NextResponse.json({ message: "Project updated successfully", result });
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

