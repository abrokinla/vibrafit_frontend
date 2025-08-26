export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const fallbackMessageKeys = [
    'motivation.fallback1',
    'motivation.fallback2',
    'motivation.fallback3',
    'motivation.fallback4',
    'motivation.fallback5',
  ];

  try {
    const { goal, progress } = await req.json();

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

    const generated = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    const message = generated || fallbackMessageKeys[Math.floor(Math.random() * fallbackMessageKeys.length)];

    return NextResponse.json({ message });
  } catch (err) {
    console.error("Motivation generation failed:", err);

    const fallbackKey = fallbackMessageKeys[Math.floor(Math.random() * fallbackMessageKeys.length)];
    return NextResponse.json({ message: fallbackKey }, { status: 200 });
  }
}
