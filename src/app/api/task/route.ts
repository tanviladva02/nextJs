import { createTask, getTasks, updateTask } from "@/src/controller/task.controller";

export async function POST(req: Request) {
  return await createTask(req);
}

export async function GET() {
  return await getTasks();
}

export async function PUT(req: Request) {
  return await updateTask(req);
}
