import  { Schema, model, models  } from "mongoose";
import { UserUpdate } from "../interface/userInterface";
export class DateUtils {
  static calculateAge(birthDate: string): number {
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
}

const userSchema = new Schema<UserUpdate>({
  name: { type: String, required: true },
  email: {
    type: String,
    required: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    unique: true, // Ensure email uniqueness
  },
  normEmail: { type: String },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  mobile: {
    type: Number,
    required: true,
    match: /^[0-9]{10}$/,
  },
  gender: {
    type: Number,
    enum: [1, 2, 3], // 1: Male, 2: Female, 3: Other
    required: true,
  },
  birthDate: { type: Date, required: true },
  age: { type: Number },
  userImage:{type:String},
  archived: { type: Boolean, default: false }
}, { timestamps: true });

// Compile the User model or use an existing one
const User = models.User || model("User", userSchema);

export default User;
