import { Schema, model, models  } from "mongoose";

// Define an interface for the user fields
export interface UserUpdate {
  name: string;
  email: string;
  normEmail?:string;
  password: string;
  mobile?: string;
  gender: string;
  birthDate?: string;
  age?:number;
  position: "Owner" | "Creator" | "General Worker";
  archived?: boolean;
  createdAt?: Date; 
  updatedAt?: Date;
}

const userSchema = new Schema<UserUpdate>({
  name: { type: String, required: true },
  email: { type: String, required: true,match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/},
  normEmail : {type: String},
  password : { type: String, required: true,minlength: 6 },
  mobile : { type: Number, required: true ,match: /^[0-9]{10}$/},
  gender : { type: String, enum: ["male","female","other"], required: true }, 
  birthDate : { type: Date, required: true },
  age: { type: Number },
  position: { type: String, enum: ["owner", "creator", "general worker"], required: true }, // Position
  archived : { type: Boolean, default: false },
},{ timestamps: true});

const User = models.User || model("User", userSchema);

export default User;
