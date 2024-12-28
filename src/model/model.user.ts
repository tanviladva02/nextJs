import  { Schema, model, models  } from "mongoose";
import { throwError } from "@/src/utils/errorhandler";

// Define an interface for the user fields
export interface UserUpdate {
  name: string;
  email: string;
  normEmail?:string;
  password: string;
  mobile?: string;
  gender: 1 | 2 | 3;
  birthDate?: string;
  age?:number;
  role: 1 | 2 | 3;
  archived?: boolean;
  createdAt?: Date; 
  updatedAt?: Date;
}

export async function calculateAge(birthDate: string): Promise<number> {
  if (typeof birthDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
    throwError("Invalid birthDate format. Expected 'YYYY-MM-DD'.", 400);
  }

  const [year, month, day] = birthDate.split("-").map(Number);
  const birth = new Date(year, month - 1, day); // Create a Date object

  if (isNaN(birth.getTime())) {
    throwError("Invalid birthDate. Unable to parse into a valid date.", 400);
  }

  const today = new Date();
  const age = today.getFullYear() - birth.getFullYear();
  const isBeforeBirthday =
    today.getMonth() < birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate());

  return isBeforeBirthday ? age - 1 : age;
}


const userSchema = new Schema<UserUpdate>({
  name: { type: String, required: true },
  email: { type: String, required: true,match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/},
  normEmail : {type: String},
  password : { type: String, required: true,minlength: 6 },
  mobile : { type: Number, required: true ,match: /^[0-9]{10}$/},
  gender : { type: Number, enum: [1,2,3], required: true }, 
  birthDate : { type: Date, required: true },
  age: { type: Number },
  role: { type: Number, enum: [1,2,3], required: true }, // Position - owner , admin ,user
  archived : { type: Boolean, default: false },
},{ timestamps: true});

const User = models.User || model("User", userSchema);

export default User;
