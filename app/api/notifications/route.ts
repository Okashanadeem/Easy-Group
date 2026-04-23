import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Notification from "@/models/Notification";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session: any = await getSession();
    if (!session || session.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    
    const notifications = await Notification.find({
      recipientId: session.studentId,
      status: "UNREAD"
    }).populate("groupId").populate("projectId").sort({ createdAt: -1 });
    
    return NextResponse.json(notifications);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
