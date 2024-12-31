import User, { DateUtils } from "@/src/model/model.user";
import { UserUpdate } from "../interface/userInterface";
import bcrypt from "bcrypt";
import { throwError } from "@/src/utils/errorhandler";
import {validateUser} from "@/src/utils/validation";

export async function addUser(data: UserUpdate): Promise<unknown> {
  try {
    const { name, email, password, mobile, gender, birthDate } = data;
    // validateUser(data); - if i will add validation here age will came undefined.

    const normEmail = email.toLowerCase();
    const age = DateUtils.calculateAge(birthDate as string);
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


