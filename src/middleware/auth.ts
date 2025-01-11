/* eslint-disable @typescript-eslint/no-explicit-any */
// // /* eslint-disable @typescript-eslint/no-explicit-any */
import jwt from "jsonwebtoken";

import { NextRequest, NextResponse } from "next/server";

interface User {
  userId: string,
  email: string,
  iat: number,
  exp: number
}

type AuthorizedRequest = NextRequest & {
    user: User
  };
  type RequestHandler = (
    // eslint-disable-next-line no-unused-vars
    req: AuthorizedRequest,
    // eslint-disable-next-line no-unused-vars
    params: Record<string, string>,
  ) => Response | Promise<Response>;

export const middleware =
  (handler: RequestHandler) =>
  async (req: NextRequest, { params }: { params: Record<string, string> }) => {
    try {
      const authHeader = req.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return NextResponse.json({ message: "Token is missing or invalid" }, { status: 401 });
      }
      const token = authHeader.split(" ")[1]; // Extract the token
      console.log("token",token);
      const JWT_SECRET = process.env.JWT_SECRET || "nextJS123"; 
      const authorizedRequest = req as AuthorizedRequest;
   
       const userDetails = jwt.verify(token, JWT_SECRET) as User;
      authorizedRequest.user = userDetails!;

      return handler(authorizedRequest, params);
    } catch (error) {
      console.error('Error in companyAuth middleware:', error);
      return NextResponse.json({ message: "Token verification failed", error: String(error) }, { status: 401 });
    }
  };
