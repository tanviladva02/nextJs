import { addUser, getAllUsers, updateUser } from "@/src/services/user.services";
import connectToDatabase from "@/src/utils/db";
import { throwError } from "@/src/utils/errorhandler";

export async function handlePost(req: Request) {
  await connectToDatabase();
  const data = await req.json();
  const newUser = await addUser(data);
  return new Response(JSON.stringify({ message: "Data added successfully!", user: newUser }), { status: 201 });
}

export async function handleGet() {
  await connectToDatabase();
  const users = await getAllUsers();
  return new Response(JSON.stringify(users), { status: 200 });
}

export async function handlePut(req: Request) {
  await connectToDatabase();
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) {
    throwError("User ID is required.", 400);
  }
  const data = await req.json();
  const updatedUser = await updateUser(id as string, data);
  return new Response(JSON.stringify({ message: "User updated successfully", user: updatedUser }), { status: 200 });
}
