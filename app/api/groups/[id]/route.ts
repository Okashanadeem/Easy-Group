import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Group from "@/models/Group";
import Project from "@/models/Project";
import Notification from "@/models/Notification";
import { getSession } from "@/lib/auth";
import { CamsStudent } from "@/models/CamsCache";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session: any = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await dbConnect();
    
    const group = await Group.findById(id).populate("projectId");
    if (!group) return NextResponse.json({ error: "Group not found" }, { status: 404 });
    
    return NextResponse.json(group);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session: any = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const { action, studentId } = body;
    await dbConnect();

    const group = await Group.findById(id);
    if (!group) return NextResponse.json({ error: "Group not found" }, { status: 404 });

    const project = await Project.findById(group.projectId);
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
    if (project.isLocked) return NextResponse.json({ error: "Project is locked" }, { status: 403 });

    // Authorization: Only leader can modify group
    if (session.role !== "admin" && group.leaderId !== session.studentId) {
      return NextResponse.json({ error: "Only group leader can modify group" }, { status: 403 });
    }

    if (action === "UPDATE_INFO") {
      group.groupName = body.groupName || group.groupName;
      group.attributes = body.attributes || group.attributes;
      await group.save();
    } 
    else if (action === "DISBAND") {
      await Group.findByIdAndDelete(id);
      await Notification.deleteMany({ groupId: id });
      return NextResponse.json({ success: true, message: "Squad disbanded" });
    }
    else if (action === "TRANSFER_LEADERSHIP") {
      const isMember = group.members.find((m: any) => m.studentId === studentId && m.status === "Accepted");
      if (!isMember) return NextResponse.json({ error: "New leader must be an accepted member of the squad" }, { status: 400 });
      
      group.leaderId = studentId;
      await group.save();
    }
    else if (action === "INVITE_MEMBER") {
      const pendingInvitesCount = await Notification.countDocuments({
        groupId: group._id,
        status: "UNREAD",
        type: "INVITE"
      });

      const activeMembersCount = group.members.filter((m: any) => 
        m.status === "Accepted" || m.studentId === group.leaderId
      ).length;

      if (activeMembersCount + pendingInvitesCount >= project.maxMembers) {
        return NextResponse.json({ error: "No invitation slots available. Cancel pending invites to free up slots." }, { status: 400 });
      }

      // Check if student is already in an accepted group for this project
      const alreadyAccepted = await Group.findOne({
        projectId: group.projectId,
        "members.studentId": studentId.toUpperCase(),
        "members.status": "Accepted"
      });
      if (alreadyAccepted) return NextResponse.json({ error: "Student is already in a group for this project" }, { status: 400 });

      // Check if an invite is already pending
      const existingInvite = await Notification.findOne({
        recipientId: studentId.toUpperCase(),
        groupId: group._id,
        status: "UNREAD"
      });
      if (existingInvite) return NextResponse.json({ error: "Invite already pending" }, { status: 400 });

      const student = await CamsStudent.findOne({ studentId: studentId.toUpperCase() });
      if (!student) return NextResponse.json({ error: "Student not found in CAMS cache" }, { status: 404 });

      await Notification.create({
        recipientId: student.studentId,
        senderId: session.studentId,
        groupId: group._id,
        projectId: group.projectId,
        type: "INVITE"
      });
    }
    else if (action === "BULK_INVITE") {
      const { studentIds } = body;
      if (!studentIds || !Array.isArray(studentIds)) {
        return NextResponse.json({ error: "Invalid student IDs" }, { status: 400 });
      }

      const pendingInvitesCount = await Notification.countDocuments({
        groupId: group._id,
        status: "UNREAD",
        type: "INVITE"
      });

      const activeMembersCount = group.members.filter((m: any) => 
        m.status === "Accepted" || m.studentId === group.leaderId
      ).length;

      const slotsLeft = project.maxMembers - (activeMembersCount + pendingInvitesCount);
      if (slotsLeft <= 0) {
        return NextResponse.json({ error: "No invitation slots available." }, { status: 400 });
      }

      const toInvite = studentIds.slice(0, slotsLeft);
      const results = [];

      for (const sid of toInvite) {
        const upSid = sid.toUpperCase();
        
        const alreadyAccepted = await Group.findOne({
          projectId: group.projectId,
          "members.studentId": upSid,
          "members.status": "Accepted"
        });
        if (alreadyAccepted) continue;

        const existingInvite = await Notification.findOne({
          recipientId: upSid,
          groupId: group._id,
          status: "UNREAD"
        });
        if (existingInvite) continue;

        const student = await CamsStudent.findOne({ studentId: upSid });
        if (!student) continue;

        await Notification.create({
          recipientId: student.studentId,
          senderId: session.studentId,
          groupId: group._id,
          projectId: group.projectId,
          type: "INVITE"
        });
        results.push(upSid);
      }
      return NextResponse.json({ success: true, invitedCount: results.length });
    }
    else if (action === "CANCEL_INVITE") {
      await Notification.deleteMany({
        recipientId: studentId,
        groupId: group._id,
        status: "UNREAD"
      });
      return NextResponse.json({ success: true, message: "Invitation revoked" });
    }
    else if (action === "REMOVE_MEMBER") {
      if (studentId === group.leaderId) return NextResponse.json({ error: "Cannot remove leader" }, { status: 400 });
      
      group.members = group.members.filter((m: any) => m.studentId !== studentId);
      await group.save();

      // Cancel related notifications
      await Notification.deleteMany({
        recipientId: studentId,
        groupId: group._id,
        status: "UNREAD"
      });
    }

    return NextResponse.json(group);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
