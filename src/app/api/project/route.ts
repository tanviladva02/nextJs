import { POSTproject, GETproject, PUTproject } from "@/src/controller/project.controller";

export async function POST(req: Request) {
  return POSTproject(req);
}

export async function GET() {
  return GETproject();
}

export async function PUT(req: Request) {
  return PUTproject(req);
}
