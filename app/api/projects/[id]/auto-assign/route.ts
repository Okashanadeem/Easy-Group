import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Project from "@/models/Project";
import Group from "@/models/Group";
import Notification from "@/models/Notification";
import { CamsStudent } from "@/models/CamsCache";
import { getSession } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session: any = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await dbConnect();

    // 1. Get Project
    const project = await Project.findById(id);
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    // 2. Find all students enrolled in this course
    const allStudents = await CamsStudent.find({
      "enrolledCourses.courseCode": project.courseCode
    });

    // 3. Find students already in an 'Accepted' group for this project
    const existingGroups = await Group.find({ projectId: id });
    const acceptedStudentIds = new Set();
    existingGroups.forEach(group => {
      group.members.forEach((m: any) => {
        if (m.status === "Accepted") {
          acceptedStudentIds.add(m.studentId);
        }
      });
      // Leader is always considered accepted
      acceptedStudentIds.add(group.leaderId);
    });

    // 4. Identify leftover students
    const leftoverStudents = allStudents.filter(s => !acceptedStudentIds.has(s.studentId));
    
    if (leftoverStudents.length === 0) {
      return NextResponse.json({ message: "All students are already assigned to groups.", assignedCount: 0 });
    }

    let studentsToAssign = [...leftoverStudents];
    let groupsUpdated = 0;
    let groupsCreated = 0;

    // 5. Fill existing groups that have slots
    for (const group of existingGroups) {
      const activeMembersCount = group.members.filter((m: any) => 
        m.status === "Accepted" || m.studentId === group.leaderId
      ).length;

      const slotsAvailable = project.maxMembers - activeMembersCount;

      if (slotsAvailable > 0 && studentsToAssign.length > 0) {
        const assignmentSize = Math.min(slotsAvailable, studentsToAssign.length);
        const assigns = studentsToAssign.splice(0, assignmentSize);
        
        const newMembers = assigns.map(s => ({
          studentId: s.studentId,
          name: s.name,
          status: "Accepted",
          joinedAt: new Date()
        }));

        group.members.push(...newMembers);
        await group.save();
        groupsUpdated++;

        // Clear any pending notifications for these students for this project
        const assignedIds = assigns.map(s => s.studentId);
        await Notification.deleteMany({
          projectId: id,
          recipientId: { $in: assignedIds }
        });
      }
    }

    // 6. Create new groups for remaining students
    while (studentsToAssign.length > 0) {
      const groupSize = Math.min(project.maxMembers, studentsToAssign.length);
      const groupStudents = studentsToAssign.splice(0, groupSize);
      
      const leader = groupStudents[0];
      const members = groupStudents.map(s => ({
        studentId: s.studentId,
        name: s.name,
        status: "Accepted",
        joinedAt: new Date()
      }));

      await Group.create({
        projectId: id,
        groupName: `Auto-Squad-${Math.floor(1000 + Math.random() * 9000)}`,
        leaderId: leader.studentId,
        members: members,
        attributes: new Map(),
        isSubmitted: false
      });
      
      groupsCreated++;

      // Clear any pending notifications
      const assignedIds = groupStudents.map(s => s.studentId);
      await Notification.deleteMany({
        projectId: id,
        recipientId: { $in: assignedIds }
      });
    }

    return NextResponse.json({
      success: true,
      message: "Auto-assignment complete.",
      details: {
        totalLeftovers: leftoverStudents.length,
        groupsFilled: groupsUpdated,
        newGroupsCreated: groupsCreated,
        studentsAssigned: leftoverStudents.length - studentsToAssign.length
      }
    });

  } catch (error: any) {
    console.error("Auto-assign error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
