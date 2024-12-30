import User, { calculateAge } from "@/src/model/model.user";
import { UserUpdate } from "../interface/userInterface";
import bcrypt from "bcrypt";
import { throwError } from "@/src/utils/errorhandler";
// import connectToDatabase from "@/src/utils/db";
import {validateUser} from "@/src/utils/validation";

export async function addUser(data: UserUpdate) {
  try {
    // await connectToDatabase();
    const { name, email, password, mobile, gender, birthDate } = data;

    const normEmail = email.toLowerCase();
    const age = await calculateAge(birthDate as string);
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      mobile,
      gender,
      birthDate,
      normEmail,
      age,
      archived: false
    });
  

    validateUser(newUser);

    await newUser.save();
    return newUser;
  }  catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error adding task:", error.message);
      throwError(error.message || "Error adding task", 500);
    } else {
      // In case the error is not an instance of Error
      console.error("An unknown error occurred");
      throwError("Unknown error", 500);
    }
  }
}

export async function getAllUsers() {
  try {
    // await connectToDatabase();
    const users = await User.find({});
    if (users.length === 0) {
      throwError("No users found", 404);
    }
    return users;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error adding task:", error.message);
      throwError(error.message || "Error adding task", 500);
    } else {
      // In case the error is not an instance of Error
      console.error("An unknown error occurred");
      throwError("Unknown error", 500);
    }
  }
}

export async function updateUser(id: string, data: Partial<UserUpdate>) {
  try {
    // await connectToDatabase();
    const updateFields: Partial<UserUpdate> = { ...data };

    if (updateFields.password) {
      updateFields.password = await bcrypt.hash(updateFields.password, 10);
    }

    const result = await User.updateOne({ _id: id }, { $set: updateFields });
    if (result.matchedCount === 0) {
      throwError("User not found.", 404);
    }

    return User.findById(id);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error adding task:", error.message);
      throwError(error.message || "Error adding task", 500);
    } else {
      // In case the error is not an instance of Error
      console.error("An unknown error occurred");
      throwError("Unknown error", 500);
    }
  }
}


