// src/app/api/motivation/route.ts

export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { goal, progress } = await req.json();

  //  const prompt = `Give me one short and motivational message (no more than two sentences) for someone whose goal is: "${goal}". They have made this progress: "${progress}". Make it friendly, supportive, and inspiring.`;
  const prompt = `Give me one short and motivational message (no more than two sentences) for someone whose goal is: "${goal}". Make it friendly, supportive, and inspiring.`;


    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-001:generateContent?key=${process.env.GEMINI_API_KEY}`,
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
    // const res = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${process.env.GEMINI_API_KEY}`);
    // const data2 = await res.json();

    // console.log("Available Gemini models:", JSON.stringify(data2, null, 2));
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
