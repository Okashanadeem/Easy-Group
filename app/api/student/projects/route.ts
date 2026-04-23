import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Project from "@/models/Project";
import Group from "@/models/Group";
import { CamsStudent } from "@/models/CamsCache";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session: any = await getSession();
    if (!session || session.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const student = await CamsStudent.findOne({ studentId: session.studentId });
    if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });
    
    // Normalize student enrollment codes (e.g., "CSC 106" -> "CSC106")
    const enrolledCodes = student.enrolledCourses?.map((c: any) => c.courseCode.replace(/\s+/g, '').toUpperCase()) || [];
    
    if (enrolledCodes.length === 0) return NextResponse.json([]);

    // Get all active projects
    const allActiveProjects = await Project.find({ isActive: true }).sort({ createdAt: -1 });

    // Filter projects where the project's code (normalized) exists in the student's normalized enrollment list
    const projects = allActiveProjects.filter(project => {
      const normalizedProjectCode = project.courseCode.replace(/\s+/g, '').toUpperCase();
      return enrolledCodes.includes(normalizedProjectCode);
    });
    
    return NextResponse.json(projects);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
