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