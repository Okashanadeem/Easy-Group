import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Project from "@/models/Project";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    await dbConnect();
    const session: any = await getSession();
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let projects;
    if (session.role === "admin") {
      projects = await Project.find({}).sort({ createdAt: -1 });
    } else {
      // Filter by student enrollment - this will be handled in a separate endpoint or with enrollment data
      projects = await Project.find({ isActive: true }).sort({ createdAt: -1 });
    }
    
    return NextResponse.json(projects);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session: any = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    await dbConnect();
    
    const project = await Project.create(data);
    return NextResponse.json(project);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
