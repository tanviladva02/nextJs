// import mongoose from "mongoose";

export interface UserUpdate {
    name: string;
    email: string;
    normEmail?:string;
    password: string;
    mobile?: string;
    gender: 1 | 2 | 3;
    birthDate?: string;
    age?:number;
    role: "USER" | "OWNER" | "ADMIN";
    userImage: string,
    archived?: boolean;
    createdAt?: Date; 
    updatedAt?: Date;
  }

  // export interface User {
  //   userId: string;
  //   role: string;
  // }
  
  // export interface IUser extends Document {
  //   _id: mongoose.Types.ObjectId;
  //   role: "USER" | "OWNER" | "ADMIN";
  //   name?: string;
  // }