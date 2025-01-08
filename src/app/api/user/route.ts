import { UserUpdate } from "@/src/interface/userInterface";
import { addUser, getAllUsers, updateUser } from "@/src/services/user.services";
import connectToDatabase from "@/src/utils/db";
// import { Express } from "express";
import { throwError } from "@/src/utils/errorhandler";
// import multer from "multer";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";

// const upload = multer({ 
//   dest: './public/uploads/', // Save files to public/uploads
// });

export async function POST(req: NextRequest): Promise<NextResponse | unknown> {
  try {
    // Connect to the database
    await connectToDatabase();
    console.log("post function is running");
    // First, extract the formData (for handling both JSON fields and file uploads)
    const formData = await req.formData();

    // Extract the user image from formData
    const userImage = formData.get("userImage") as File;
    console.log("userImage ::: ", userImage);

    if (!userImage) {
      throwError("No image file uploaded", 400);
    }

    const filePath = path.join(process.cwd(), 'public', 'uploads', userImage.name);
    const fileBuffer = Buffer.from(await userImage.arrayBuffer());
    fs.writeFileSync(filePath, fileBuffer);

    // Extract other fields from formData (the JSON-like data)
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const mobile = formData.get("mobile") as string;
    const gender = formData.get("gender") as string;
    const birthDate = formData.get("birthDate") as string;
    const role = formData.get("role") as string;

    // Ensure required fields are present
    if (!name || !email || !password || !mobile || !gender || !birthDate || !role) {
      throwError("Missing required fields", 400);
    }

    // Validate gender (ensure it's one of 1, 2, or 3)
    const genderValue = parseInt(gender);
    if (![1, 2, 3].includes(genderValue)) {
      throwError("Invalid gender value", 400);
    }

    // Prepare the data object including the userImage path if provided
    const userData: UserUpdate = {
      name,
      email,
      password,
      mobile,
      gender: genderValue as 1 | 2 | 3, 
      birthDate,
      userImage: `@/public/uploads/${userImage.name}` , 
      role: role as "USER" | "OWNER" | "ADMIN", 
    };

    console.log("UserData :::: ",userData);
    console.log("userImage ::",userImage.name);

    // Call the addUser service to add the user to the database
    const newUser = await addUser(userData, userImage as unknown as Express.Multer.File);
    // const newUser = await addUser(userData);
    
    console.log("newUser ::",newUser);

    // Return the response after successfully adding the user
    return NextResponse.json({ message: "Data added successfully!", user: newUser }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error adding user:", error.message);
      throwError(error.message || "Error adding user", 500);
      return NextResponse.json({ message: error.message || "Error adding user" }, { status: 500 });
    } else {
      console.error("An unknown error occurred");
      throwError("Unknown error", 500);
      return NextResponse.json({ message: "Unknown error" }, { status: 500 });
    }
  }
}

export async function GET(): Promise<Response | undefined> {
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

export async function PUT(req: Request): Promise<Response | undefined> {
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

