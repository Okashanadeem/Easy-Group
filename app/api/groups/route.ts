import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Group from "@/models/Group";
import Project from "@/models/Project";
import Notification from "@/models/Notification";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session: any = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    const discovery = searchParams.get("discovery") === "true";

    await dbConnect();
    
    let groups;
    if (session.role === "admin") {
      groups = await Group.find(projectId ? { projectId } : {});
    } else if (discovery && projectId) {
      // Find all groups for this project
      const allGroups = await Group.find({ projectId }).populate("projectId");
      
      const filteredGroups = allGroups.filter(g => {
        const isMember = g.members.some((m: any) => m.studentId === session.studentId);
        const acceptedCount = g.members.filter((m: any) => m.status === "Accepted").length;
        const isFull = acceptedCount >= (g.projectId as any).maxMembers;
        return !isMember && !isFull;
      });

      // Enhance groups with pending counts
      groups = await Promise.all(filteredGroups.map(async (g) => {
        const pendingInvites = await Notification.countDocuments({
          groupId: g._id,
          type: "INVITE",
          status: "UNREAD"
        });
        const pendingRequests = await Notification.countDocuments({
          groupId: g._id,
          type: "JOIN_REQUEST",
          status: "UNREAD"
        });
        
        const groupObj = g.toObject();
        return {
          ...groupObj,
          pendingInvites,
          pendingRequests
        };
      }));
    } else {
      // Students see groups they are part of
      groups = await Group.find({
        "members.studentId": session.studentId
      }).populate("projectId");
    }
    
    return NextResponse.json(groups);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session: any = await getSession();
    if (!session || session.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId, groupName, attributes } = await req.json();
    await dbConnect();

    // 1. Check if project is locked
    const project = await Project.findById(projectId);
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
    if (project.isLocked) return NextResponse.json({ error: "Project is locked by admin" }, { status: 403 });

    // 2. Check if student already in a group for this project
    const existingGroup = await Group.findOne({
      projectId,
      "members.studentId": session.studentId
    });

    if (existingGroup) {
      return NextResponse.json({ error: "You are already in a group for this project" }, { status: 400 });
    }

    // 3. Create group with leader as first member (Accepted status)
    const group = await Group.create({
      projectId,
      groupName,
      leaderId: session.studentId,
      members: [{
        studentId: session.studentId,
        name: session.name,
        status: "Accepted",
        joinedAt: new Date()
      }],
      attributes
    });

    return NextResponse.json(group);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
