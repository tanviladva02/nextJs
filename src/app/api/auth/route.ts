import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { throwError } from "@/src/utils/errorhandler";
import User from "@/src/model/model.user";

export async function getUserByEmail(email: string) {
  return await User.findOne({ email });
}

export async function POST(req: NextRequest): Promise<NextResponse | undefined> {
  try {
    // Get the request body (email and password)
    const { email, password } = await req.json();

    // Ensure email and password are provided
    if (!email || !password) {
      throwError("Email and password are required.", 400);
    }

    // Fetch user from the database by email using the service function
    const user = await getUserByEmail(email);

    if (!user) {
      throwError("User not found.", 404);
    }

    // Compare the provided password with the stored hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throwError("Invalid password.", 400);
    }

    // Generate a JWT token if authentication is successful
    const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET || "nextJS", {
      expiresIn: "1h", // Token expires in 1 hour
    });
    console.log("token:- ",token);

    // Return the token in the response
    return NextResponse.json(
      { message: "Login successful", token },
      { status: 200 }
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error during login:", error.message);
      throwError(error.message, 500);
      return NextResponse.json({ message: error.message }, { status: 500 });
    } else {
      console.error("An unknown error occurred during login");
      throwError("Unknown error during login", 500);
      return NextResponse.json({ message: "Unknown error during login" }, { status: 500 });
    }
  }
}
