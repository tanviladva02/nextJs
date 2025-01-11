import User, { DateUtils } from "@/src/model/model.user";
import { UserUpdate } from "../interface/userInterface";
import bcrypt from "bcrypt";
import { Express } from "express";
import { throwError } from "@/src/utils/errorhandler";
import {validateUser} from "@/src/utils/validation";
import fs from "fs";
import path from "path";


export async function addUser(data: UserUpdate, file: Express.Multer.File): Promise<unknown> {
  try {
    const { name, email, password, mobile, gender, birthDate } = data;

    const normEmail = email.toLowerCase();
    const age = DateUtils.calculateAge(birthDate as string);
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("file::::::::::::",file.name);

    if(!file){
      throwError("file is required ",400);
    }
    
    const userImagePath = `public/uploads/${file.name}`;
    console.log(":::",userImagePath);
    const img = imageToBase64(userImagePath); 
  
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      mobile,
      gender,
      birthDate,
      normEmail,
      age,
      userImage:img,
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

export async function getAllUsers(): Promise<unknown[] | undefined> {
  try {
    const users = await User.find({});
    if (users.length === 0) { // check if user is available in database or not.
      throwError("No users found", 404);
    }
    return users; // if users has in database then return users data.
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

export async function updateUser(id: string, data: Partial<UserUpdate>): Promise<unknown> {
  try { // partial - make sure that all feilds are not required while updating , so it make interface feilds optional. 
    const updateFields: Partial<UserUpdate> = { ...data }; // will make optional feilds while updating.

    if (updateFields.password) {
      updateFields.password = await bcrypt.hash(updateFields.password, 10);
    }

    const result = await User.updateOne({ _id: id }, { $set: updateFields }); // id has to match with existing user's id in database and after finding that $set will update that user's data.
    if (result.matchedCount === 0) {
      throwError("User not found.", 404);
    }

    return User.findById(id); // will returned updated user's data.
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

function imageToBase64(imagePath: string) {
  console.log("Received image path:", imagePath);

  try {
    // Resolve the absolute path
    const resolvedPath = path.resolve(imagePath);
    console.log("Resolved image path:", resolvedPath);

    // Check if the file exists
    if (!fs.existsSync(resolvedPath)) {
      throw new Error(`File does not exist at path: ${resolvedPath}`);
    }

    // Read image as a binary file
    const imageBuffer = fs.readFileSync(resolvedPath);

    // Convert the binary data to Base64 string
    const base64Image = imageBuffer.toString('base64');

    // Prepend the MIME type if needed
    const base64String = `data:image/jpeg;base64,${base64Image}`;
    console.log("Base64 conversion successful");

    return base64String;
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