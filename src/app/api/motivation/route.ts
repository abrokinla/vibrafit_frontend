// src/app/api/motivation/route.ts
export const runtime = "nodejs"; // This is key

import {NextRequest, NextResponse} from "next/server";
import {getDailyMotivation} from "@/ai/flows/daily-motivator";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await getDailyMotivation(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error generating motivation:", error);
    return new NextResponse("Failed to generate motivation", {status: 500});
  }
}
