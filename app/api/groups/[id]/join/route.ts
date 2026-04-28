import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Group from "@/models/Group";
import Project from "@/models/Project";
import Notification from "@/models/Notification";
import { getSession } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session: any = await getSession();
    if (!session || session.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await dbConnect();

    const group = await Group.findById(id);
    if (!group) return NextResponse.json({ error: "Group not found" }, { status: 404 });

    const project = await Project.findById(group.projectId);
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    if (project.isLocked) {
      return NextResponse.json({ error: "Project is locked" }, { status: 403 });
    }

    // 1. Check if student already in an accepted group for this project
    const alreadyAccepted = await Group.findOne({
      projectId: group.projectId,
      "members.studentId": session.studentId,
      "members.status": "Accepted"
    });
    if (alreadyAccepted) {
      return NextResponse.json({ error: "You are already in a group for this project" }, { status: 400 });
    }

    // 2. Check if group is full
    const activeMembersCount = group.members.filter((m: any) => m.status === "Accepted").length;
    if (activeMembersCount >= project.maxMembers) {
      return NextResponse.json({ error: "Group is already full" }, { status: 400 });
    }

    // 3. Check if a request or invite is already pending
    const existingNotification = await Notification.findOne({
      senderId: session.studentId,
      groupId: group._id,
      status: "UNREAD",
      type: "JOIN_REQUEST"
    });
    if (existingNotification) {
      return NextResponse.json({ error: "Join request already pending" }, { status: 400 });
    }

    const existingInvite = await Notification.findOne({
      recipientId: session.studentId,
      groupId: group._id,
      status: "UNREAD",
      type: "INVITE"
    });
    if (existingInvite) {
      return NextResponse.json({ error: "You already have a pending invitation from this group" }, { status: 400 });
    }

    // 4. Create JOIN_REQUEST notification for the leader
    await Notification.create({
      recipientId: group.leaderId,
      senderId: session.studentId,
      groupId: group._id,
      projectId: group.projectId,
      type: "JOIN_REQUEST"
    });

    return NextResponse.json({ success: true, message: "Join request sent to squad leader" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
