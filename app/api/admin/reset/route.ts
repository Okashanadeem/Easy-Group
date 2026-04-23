import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Project from "@/models/Project";
import Group from "@/models/Group";
import Notification from "@/models/Notification";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session: any = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { password } = await req.json();
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Invalid admin password" }, { status: 403 });
    }

    await dbConnect();
    
    // Clear all collections except CamsCache (we want to keep synced students/courses)
    await Project.deleteMany({});
    await Group.deleteMany({});
    await Notification.deleteMany({});
    
    return NextResponse.json({ success: true, message: "System reset successful. All projects, groups, and notifications cleared." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
