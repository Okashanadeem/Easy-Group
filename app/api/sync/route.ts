import { NextResponse } from "next/server";
import { syncWithCams } from "@/lib/cams";

export async function POST() {
  try {
    const result = await syncWithCams();
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
