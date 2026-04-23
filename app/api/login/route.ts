import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { CamsStudent } from "@/models/CamsCache";
import { createToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const { name, studentId } = await req.json();

    if (!name || !studentId) {
      return NextResponse.json({ error: "Name and Student ID are required" }, { status: 400 });
    }

    await dbConnect();

    // Verify against CamsCache
    const student = await CamsStudent.findOne({ 
      studentId: studentId.toUpperCase(),
      name: { $regex: new RegExp(`^${name}$`, "i") }
    });

    if (!student) {
      return NextResponse.json({ error: "Student record not found in CAMS. Please contact admin." }, { status: 404 });
    }

    const token = await createToken({ 
      role: "student", 
      studentId: student.studentId,
      name: student.name 
    });

    const cookieStore = await cookies();
    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 1 day
    });

    return NextResponse.json({ 
      success: true, 
      role: "student", 
      studentId: student.studentId,
      name: student.name 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
