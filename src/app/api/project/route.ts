import { POST as createProjectService, getProjectDetails,  PUT as updateProjectService } from "@/src/services/project.services";
import { NextResponse } from "next/server";
import connectToDatabase from "@/src/utils/db";
import mongoose from "mongoose";
import { middleware } from "@/src/middleware/auth";

// for pdf
export const GET = middleware(async (req: Request) => {
  try {
    await connectToDatabase();
        const url = new URL(req.url);
        const userId = url.searchParams.get("userId");
        const projectId = url.searchParams.get("projectId");
    
        // Fetch project details and generate PDF
        const doc = await getProjectDetails(userId as string, projectId as string);
        if (!doc) {
          return NextResponse.json({ message: "Project not found" }, { status: 404 });
        }
    
        // Send PDF as response to trigger download
        const pdfOutput = doc.output('arraybuffer');
        return new NextResponse(pdfOutput, {
          status: 200,
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="project-details.pdf"',
          },
        });
  } catch (error: unknown) {
    console.error("Error generating PDF:", error);
    return new NextResponse("Error generating PDF", { status: 500 });
  }
});

// for csv
// export async function GET(req: { url: string | URL; }) {
//   try {
//     await connectToDatabase();
//     const url = new URL(req.url);
//     const userId = url.searchParams.get("userId");
//     const projectId = url.searchParams.get("projectId");

//     // Fetch project details and generate CSV
//     const doc = await getProjectDetails(userId as string, projectId as string);console.log("doc",doc);
//     if (!doc) {
//       return NextResponse.json({ message: "Project not found" }, { status: 404 });
//     }

//     // Convert the JSON data to CSV format
//     const json2csvParser = new Parser();
//     const csv = json2csvParser.parse(doc); // doc is the data returned from getProjectDetails

//     // Optionally, save the CSV to a file (this step is optional)
//     fs.writeFileSync('project-details.csv', csv);  // Uncomment if you want to save the CSV file locally

//     // Send CSV as response to trigger download
//     return new NextResponse(csv, {
//       status: 200,
//       headers: {
//         'Content-Type': 'text/csv',
//         'Content-Disposition': 'attachment; filename="project-details.csv"',
//       },
//     });
//   }catch (error: unknown) {
//     if (error instanceof Error) {
//       console.error("Error adding project:", error.message);
//       throwError(error.message || "Error adding project", 500);
//     } else {
//       console.error("An unknown error occurred");
//       throwError("Unknown error", 500);
//     }
//   }
// }

export const POST = middleware(async (req: Request) => {
  try {
    await connectToDatabase();

    const { name, status, createdBy, users, dueDate } = await req.json();

    // Optionally, you can enforce that the authenticated user matches `createdBy`
    // if (req.user?.id !== createdBy) {
    //   return NextResponse.json(
    //     { message: "You are not authorized to create this project" },
    //     { status: 403 }
    //   );
    // }

    const result = await createProjectService(name, status, createdBy, users, dueDate);
    return NextResponse.json({ message: "Project added successfully!", result });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message || "Error adding project" }, { status: 500 });
    } else {
      return NextResponse.json({ message: "Unknown error" }, { status: 500 });
    }
  }
});

export const PUT = middleware(async (req: Request) => {
  try {
    // Connect to the database
    await connectToDatabase();

    // Extract projectId from query parameters
    const url = new URL(req.url, `http://${req.headers.get("host")}`);
    const projectId = url.searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json(
        { message: "Missing projectId query parameter", projects: [] },
        { status: 400 }
      );
    }

    // Validate projectId (ensure it's a valid MongoDB ObjectId)
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return NextResponse.json(
        { message: "Invalid projectId format", projects: [] },
        { status: 400 }
      );
    }

    // Parse the request body
    const { name, status, archived, updatedBy, users, dueDate } = await req.json();

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
      return NextResponse.json(
        { message: "Project not found", projects: [] },
        { status: 404 }
      );
    }

    // Return success response with the updated project data inside an array
    return NextResponse.json({
      message: "Project updated successfully!",
      projects: [updatedProject],
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json(
        { message: error.message || "Error updating project", projects: [] },
        { status: 500 }
      );
    } else {
      return NextResponse.json(
        { message: "Unknown error", projects: [] },
        { status: 500 }
      );
    }
  }
});

