import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Group from "@/models/Group";
import Project from "@/models/Project";
import Notification from "@/models/Notification";
import { CamsStudent } from "@/models/CamsCache";
import { getSession } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session: any = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await dbConnect();

    // 1. Get Group and Project Info
    const group = await Group.findById(id);
    if (!group) return NextResponse.json({ error: "Group not found" }, { status: 404 });

    const project = await Project.findById(group.projectId);
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    // 2. Find all students enrolled in this course
    const students = await CamsStudent.find({
      "enrolledCourses.courseCode": project.courseCode
    });

    // 3. Find students already in an 'Accepted' group for this project
    const acceptedGroups = await Group.find({
      projectId: project._id,
      "members.status": "Accepted"
    });

    const acceptedStudentIds = new Set();
    acceptedGroups.forEach(g => {
      g.members.forEach((m: any) => {
        if (m.status === "Accepted") {
          acceptedStudentIds.add(m.studentId);
        }
      });
    });

    // 4. Find pending notifications from THIS group
    const pendingNotificationsFromThisGroup = await Notification.find({
      groupId: id,
      type: "INVITE",
      status: "UNREAD"
    });
    const pendingInvites = new Set(pendingNotificationsFromThisGroup.map(n => n.recipientId));

    // 4.5 Find all pending INVITE notifications for this project to show badges
    const allPendingInvitesInProject = await Notification.find({
      projectId: project._id,
      type: "INVITE",
      status: "UNREAD"
    });

    const inviteCounts: { [key: string]: number } = {};
    allPendingInvitesInProject.forEach(n => {
      inviteCounts[n.recipientId] = (inviteCounts[n.recipientId] || 0) + 1;
    });

    // 5. Filter and format the list
    const eligibleStudents = students
      .filter(s => !acceptedStudentIds.has(s.studentId))
      .map(s => ({
        studentId: s.studentId,
        name: s.name,
        email: s.email,
        isInvited: pendingInvites.has(s.studentId),
        pendingRequestsCount: inviteCounts[s.studentId] || 0
      }));

    return NextResponse.json({
      students: eligibleStudents,
      pendingCount: pendingInvites.size
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
