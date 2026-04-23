import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { CamsCourse } from "@/models/CamsCache";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session: any = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const courses = await CamsCourse.find({ isActive: true }).sort({ courseCode: 1 });
    return NextResponse.json(courses);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
