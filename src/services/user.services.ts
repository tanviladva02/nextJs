import User, { UserUpdate ,calculateAge } from "@/src/model/model.user";
import bcrypt from "bcrypt";
import { throwError } from "@/src/utils/errorhandler";
import connectToDatabase from "@/src/utils/db";



export async function addUser(data: UserUpdate) {
  try {
    await connectToDatabase();
    const { name, email, password, mobile, gender, birthDate, role } = data;

    if (!name || !email || !password || !mobile || !gender || !birthDate || !role) {
      throwError("All fields are required!", 400);
    }

    if (!/^\d{10}$/.test(mobile as string)) {
      throwError("Invalid mobile number. It must be a 10-digit string.", 400);
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate as string)) {
      throwError("Invalid birthDate format. Expected 'YYYY-MM-DD'.", 400);
    }

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
      archived: false,
      role,
    });

    await newUser.save();
    return newUser;
  } catch (error) {
      throw error;
  }
}

export async function getAllUsers() {
  try {
    await connectToDatabase();
    const users = await User.find({});
    if (users.length === 0) {
      throwError("No users found", 404);
    }
    return users;
  } catch (error) {
      throw error;
  }
}

export async function updateUser(id: string, data: Partial<UserUpdate>) {
  try {
    const updateFields: Partial<UserUpdate> = { ...data };

    if (updateFields.password) {
      updateFields.password = await bcrypt.hash(updateFields.password, 10);
    }

    const result = await User.updateOne({ _id: id }, { $set: updateFields });
    if (result.matchedCount === 0) {
      throwError("User not found.", 404);
    }

    return User.findById(id);
  } catch (error) {
      throw error;
  }
}
