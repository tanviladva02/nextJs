// import { handlePost, handleGet, handlePut } from "@/src/controller/user.controller";

// export const POST = handlePost;
// export const GET = handleGet;
// export const PUT = handlePut;
import { addUser, getAllUsers, updateUser } from "@/src/services/user.services";
import connectToDatabase from "@/src/utils/db";
import { throwError } from "@/src/utils/errorhandler";

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const data = await req.json();
    console.log(data);
    const newUser = await addUser(data);
    return new Response(JSON.stringify({ message: "Data added successfully!", user: newUser }), { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error adding user:", error.message);
      throwError(error.message || "Error adding user", 500);
    } else {
      console.error("An unknown error occurred");
      throwError("Unknown error", 500);
    }
  }
}

export async function GET() {
  try {
    await connectToDatabase();
    const users = await getAllUsers();
    return new Response(JSON.stringify(users), { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error fetching users:", error.message);
      throwError(error.message || "Error fetching users", 500);
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
    if (!id) {
      throwError("User ID is required.", 400);
    }
    const data = await req.json();
    const updatedUser = await updateUser(id as string, data);
    return new Response(JSON.stringify({ message: "User updated successfully", user: updatedUser }), { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error updating user:", error.message);
      throwError(error.message || "Error updating user", 500);
    } else {
      console.error("An unknown error occurred");
      throwError("Unknown error", 500);
    }
  }
}
