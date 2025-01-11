import User from "@/src/model/model.user"; // Path to your User model

// Service to get user by email
export async function getUserByEmail(email: string) {
  try {
    // Find a user by their email
    const user = await User.findOne({ email });
    return user;
  } catch (error) {
    console.error("Error fetching user by email:", error);
    throw new Error("Error fetching user by email");
  }
}
