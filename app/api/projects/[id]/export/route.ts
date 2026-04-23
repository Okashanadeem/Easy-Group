import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Project from "@/models/Project";
import Group from "@/models/Group";
import { getSession } from "@/lib/auth";
import * as XLSX from "xlsx";

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
    
    const groups = await Group.find({ projectId: id });
    const attrKeys = project.requiredFields || [];

    // Header updated according to CR requirements
    const rows: any[] = [
      [`COURSE CODE: ${project.courseCode}`],
      ["COURSE GROUP LIST"],
      [`Project: ${project.title}`],
      [`Course Title: ${project.courseTitle}`],
      [`Generated On: ${new Date().toLocaleDateString()}`],
      ["Admin / CR: Okasha Nadeem"],
      [], 
      ["S.No", "Group Name", "Student Name", "Student ID", "Role", "Status", ...attrKeys]
    ];

    const merges: any[] = [];
    let currentRow = 8; // Data starts after 8 rows (0-7)
    let globalSNo = 1;

    groups.forEach((group) => {
      const memberCount = group.members.length;
      const attrs = group.attributes instanceof Map 
        ? Object.fromEntries(group.attributes) 
        : (group.attributes || {});

      // Merging for clean presentation
      if (memberCount > 1) {
        merges.push({
          s: { r: currentRow, c: 1 },
          e: { r: currentRow + memberCount - 1, c: 1 }
        });
        
        attrKeys.forEach((_: string, idx: number) => {
          merges.push({
            s: { r: currentRow, c: 6 + idx },
            e: { r: currentRow + memberCount - 1, c: 6 + idx }
          });
        });
      }

      group.members.forEach((member: any) => {
        const isLeader = member.studentId === group.leaderId;
        rows.push([
          globalSNo++,
          group.groupName,
          member.name,
          member.studentId,
          isLeader ? "Leader" : "Member",
          member.status,
          ...attrKeys.map((key: string) => attrs[key] || "N/A")
        ]);
      });

      currentRow += memberCount;
    });

    const worksheet = XLSX.utils.aoa_to_sheet(rows);
    worksheet["!merges"] = merges;

    // Formatting Column Widths
    worksheet["!cols"] = [
      { wch: 6 },  // S.No
      { wch: 25 }, // Group Name
      { wch: 30 }, // Student Name
      { wch: 15 }, // Student ID
      { wch: 10 }, // Role
      { wch: 12 }, // Status
      ...attrKeys.map(() => ({ wch: 30 })) // Attributes
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Group List");
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
    
    // Updated Filename: {CourseCode}_Group_List.xlsx
    const cleanCourseCode = project.courseCode.replace(/[^a-z0-9]/gi, '_').toUpperCase();
    const filename = `${cleanCourseCode}_Group_List.xlsx`;
    
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error("Export Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
