// src/app/api/motivation/route.ts

export const runtime = 'edge'; // This makes it Cloudflare-compatible

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { goal, progress } = await req.json();

    const prompt = `Generate a motivational message for a user with this goal: ${goal}. Progress: ${progress}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );

    const data = await response.json();
    console.log("Gemini API raw response:", JSON.stringify(data, null, 2));

    const message =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Couldn't generate motivation";

    return NextResponse.json({ message });
  } catch (err) {
    console.error(err);
    return new NextResponse('AI generation failed', { status: 500 });
  }
}
