// import { POST as createProjectService, GET as getProjectsService, PUT as updateProjectService } from "@/src/services/project.services";
// import { NextResponse } from "next/server";
// import { throwError } from "@/src/utils/errorhandler";
// import connectToDatabase from "../utils/db";

// export async function POSTproject(req: Request) {
//   try {
//     await connectToDatabase();
//     const { name, status, createdBy, users, dueDate } = await req.json();
//     const result = await createProjectService(name, status, createdBy, users, dueDate);
//     console.log("result ",result);
//     return NextResponse.json({ message: "Project added successfully!", result });
//   } catch (error) {
//     console.error("Error in POST controller:", error);
//     throw error;
//   }
// }

// export async function GETproject() {
//   try {
//     await connectToDatabase();
//     const projects = await getProjectsService();
//     if (projects.length === 0) {
//       throwError("No projects found", 404);
//     }
//     return NextResponse.json({ message: "Aggregated projects", projects });
//   } catch (error) {
//     console.error("Error in GET controller:", error);
//     throw error;
//   }
// }

// export async function PUTproject(req: Request) {
//   try {
//     await connectToDatabase();
//     const url = new URL(req.url);
//     const id = url.searchParams.get("id");
//     const role = url.searchParams.get("role");
    
//     if (!id) {
//       throwError("Project ID is required", 400);
//     }
//     const { name, status, archived, updatedBy, users, dueDate } = await req.json();
//     const result = await updateProjectService(id as string, name, status, archived, updatedBy, users, dueDate);

//     if(role === "user"){
//       throw new Error("User cannot update project");
//     }

//     return NextResponse.json({ message: "Project updated successfully", result });
//   } catch (error) {
//     console.error("Error in PUT controller:", error);
//     throw error;
//   }
// }
