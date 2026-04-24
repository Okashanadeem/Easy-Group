import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Project from "@/models/Project";
import Group from "@/models/Group";
import { CamsStudent } from "@/models/CamsCache";
import { getSession } from "@/lib/auth";

export async function GET(
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
    
    const project = await Project.findById(id);
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    // 1. Fetch all groups for this project
    const groups = await Group.find({ projectId: id }).sort({ groupName: 1 });

    // 2. Fetch all students enrolled in this course
    const enrolledStudents = await CamsStudent.find({
      "enrolledCourses.courseCode": project.courseCode,
      "enrolledCourses.courseType": project.courseType
    });

    // 3. Find students not in any accepted group for this project
    const acceptedStudentIds = new Set();
    groups.forEach(group => {
      group.members.forEach((m: any) => {
        if (m.status === "Accepted") {
          acceptedStudentIds.add(m.studentId);
        }
      });
    });

    const leftoverStudents = enrolledStudents.filter(s => !acceptedStudentIds.has(s.studentId));

    return NextResponse.json({
      project,
      groups,
      leftoverStudents
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
