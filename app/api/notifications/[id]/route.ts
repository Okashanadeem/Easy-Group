import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Notification from "@/models/Notification";
import Group from "@/models/Group";
import Project from "@/models/Project";
import { getSession } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session: any = await getSession();
    if (!session || session.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { action } = await req.json(); // "ACCEPT" or "DECLINE"
    await dbConnect();

    const notification = await Notification.findById(id);
    if (!notification) return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    if (notification.recipientId !== session.studentId) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const group = await Group.findById(notification.groupId);
    if (!group) {
        notification.status = "RESPONDED";
        await notification.save();
        return NextResponse.json({ error: "Group no longer exists" }, { status: 404 });
    }

    if (action === "ACCEPT") {
      // 1. Check if group is already full
      const project = await Project.findById(group.projectId);
      if (project && group.members.length >= project.maxMembers) {
          return NextResponse.json({ error: "Squad capacity reached. Invite no longer valid." }, { status: 400 });
      }

      // 2. Double check if already in a group for this project
      const alreadyIn = await Group.findOne({
        projectId: notification.projectId,
        "members.studentId": session.studentId,
        "members.status": "Accepted"
      });

      if (alreadyIn) {
        notification.status = "RESPONDED";
        await notification.save();
        return NextResponse.json({ error: "You are already in a group for this project" }, { status: 400 });
      }

      // 3. Add student to group as Accepted
      group.members.push({
          studentId: session.studentId,
          name: session.name,
          status: "Accepted",
          joinedAt: new Date()
      });
      await group.save();

      // 4. Mark notification as responded
      notification.status = "RESPONDED";
      await notification.save();

      // 5. AUTO-CLEANUP: Decline all other pending invites for this project
      await Notification.updateMany(
          { 
              recipientId: session.studentId, 
              projectId: notification.projectId,
              _id: { $ne: notification._id },
              status: "UNREAD"
          },
          { status: "RESPONDED" }
      );
    } else if (action === "DECLINE") {
      // 1. Remove from group members list
      group.members = group.members.filter((m: any) => m.studentId !== session.studentId);
      await group.save();

      // 2. Mark notification as responded
      notification.status = "RESPONDED";
      await notification.save();
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
