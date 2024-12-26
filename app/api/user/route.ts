import { NextResponse } from "next/server";
import  User , { UserUpdate } from "@/model/model.user"; // Import User model
import connectToDatabase from "@/utils/db";
import bcrypt from "bcrypt";

// Helper function to calculate age
function calculateAge(birthDate:string): number {
  console.log("birthDate received:", birthDate);

  if (typeof birthDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
    throw new Error("Invalid birthDate format. Expected 'YYYY-MM-DD'.");
  }

  const [year, month, day] = birthDate.split("-").map(Number);
  const birth = new Date(year, month - 1, day);

  if (isNaN(birth.getTime())) {
    throw new Error("Invalid birthDate. Unable to parse into a valid date.");
  }

  const today = new Date();
  const age = today.getFullYear() - birth.getFullYear();

  const isBeforeBirthday =
    today.getMonth() < birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate());

  return isBeforeBirthday ? age - 1 : age;
}

// POST request to add a new user
export async function POST(req:Request) {
  try {
    await connectToDatabase();
    const { name, email, password, mobile, gender, birthDate, archived , position } : UserUpdate = await req.json();
    console.log("Received Data:", { name, email, password, mobile, gender, birthDate, archived , position });

    if (!name || !email || !password || !mobile || !gender || !birthDate  || !position) {
      return NextResponse.json({ message: "All fields are required!" }, { status: 400 });
    }

    // Validation checks
    if (!/^\d{10}$/.test(mobile)) {
      return NextResponse.json({ message: "Invalid mobile number. It must be a 10-digit string." }, { status: 400 });
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
      return NextResponse.json({ message: "Invalid birthDate format. Expected 'YYYY-MM-DD'." }, { status: 400 });
    }

    const normEmail = email.toLowerCase();

    // Calculate age from birthDate
    const age = calculateAge(birthDate);
    console.log("Calculated Age:", age);

    // Hash the password before storing it
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create a new user and save it in the database
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      mobile,
      gender,
      birthDate,
      normEmail,
      age,
      archived: false,
      position
    });

    await newUser.save();
    console.log("user added successfully");

    return NextResponse.json({ message: "Data added successfully!" });
  } catch (error) {
    console.error("Mongoose Error:", error);
    return NextResponse.json({ message: "Error adding data" }, { status: 500 });
  }
}

// GET request to fetch all users
export async function GET() {
  try {
    await connectToDatabase();
    const users = await User.find({});

    if (users.length === 0) {
      return NextResponse.json({ message: "No users found" }, { status: 404 });
    }

    return NextResponse.json(users);  // Return all users
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ message: "Error fetching users" }, { status: 500 });
  }
}

// PUT request to update user
export async function PUT(req:Request) {
  try {
    await connectToDatabase();
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ message: "User ID is required" }, { status: 400 });
    }

    // Get the fields from the request body
    const { name, email, password, mobile, gender, birthDate, archived , position } : UserUpdate = await req.json();
    console.log("Request body:", { name, email, password, mobile, gender, birthDate, archived , position });

    // Create an update object to hold only the fields that are provided
    const updateFields: Partial<UserUpdate>  = {};

    if (name) updateFields.name = name;
    if (email) updateFields.email = email;
    if (password) updateFields.password = password;
    if (mobile) updateFields.mobile = mobile;
    if (gender) updateFields.gender = gender;
    if (birthDate) updateFields.birthDate = birthDate;
    if(position) updateFields.position = position;

    if (typeof archived === "boolean") {
      updateFields.archived = archived;
    }

    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json({ message: "No fields to update" }, { status: 400 });
    }

    // Update the user by ID
    const result = await User.updateOne({ _id: id }, { $set: updateFields });

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Fetch the updated user data
    const updatedUser = await User.findById(id);

    return NextResponse.json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ message: "Error updating user" }, { status: 500 });
  }
}
