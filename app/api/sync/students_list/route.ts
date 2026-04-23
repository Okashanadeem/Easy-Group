import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { CamsStudent } from "@/models/CamsCache";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session: any = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const students = await CamsStudent.find({}).sort({ name: 1 });
    return NextResponse.json(students);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
