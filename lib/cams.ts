import { CamsStudent, CamsCourse } from "@/models/CamsCache";
import dbConnect from "@/lib/db";

const CAMS_URL = process.env.CAMS_URL || "http://localhost:3000";
const CAMS_SYNC_KEY = process.env.CAMS_SYNC_KEY || "cams_sync_8f2d3e4a5b6c7d8e9f0a1b2c3d4e5f6g";

export async function syncWithCams() {
  await dbConnect();

  try {
    const headers = { "x-api-key": CAMS_SYNC_KEY };

    // 1. Sync Students
    console.log("Fetching students from CAMS...");
    const studentRes = await fetch(`${CAMS_URL}/api/sync/registrations`, { headers });
    if (!studentRes.ok) throw new Error(`CAMS Student Sync failed: ${studentRes.statusText}`);
    const students = await studentRes.json();

    if (students.length > 0) {
      const studentOps = students.map((student: any) => ({
        updateOne: {
          filter: { studentId: student.studentId },
          update: {
            name: student.name,
            email: student.email,
            phone: student.phone,
            enrolledCourses: student.enrolledCourses,
            syncedAt: new Date(),
          },
          upsert: true,
        },
      }));
      await CamsStudent.bulkWrite(studentOps);
    }

    // 2. Sync Courses
    console.log("Fetching courses from CAMS...");
    const courseRes = await fetch(`${CAMS_URL}/api/courses`, { headers });
    if (!courseRes.ok) throw new Error(`CAMS Course Sync failed: ${courseRes.statusText}`);
    const courses = await courseRes.json();

    if (courses.length > 0) {
      const courseOps = courses.map((course: any) => ({
        updateOne: {
          filter: { courseCode: course.courseCode, courseType: course.courseType || "Theory" },
          update: {
            courseTitle: course.courseTitle,
            isActive: course.isActive,
            syncedAt: new Date(),
          },
          upsert: true,
        },
      }));
      await CamsCourse.bulkWrite(courseOps);
    }

    return { success: true, studentsCount: students.length, coursesCount: courses.length };
  } catch (error: any) {
    console.error("Sync Error:", error.message);
    throw error;
  }
}
