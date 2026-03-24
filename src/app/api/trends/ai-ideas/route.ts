import { NextResponse } from "next/server";

export interface ContentIdea {
  title: string;
  hook: string;
  formatTip: string;
}

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 });
  }

  let body: { genre?: string; platform?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { genre = "music_video", platform = "instagram" } = body;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system:
        "You are a social media strategist for Solo Films, a premium cinematic production company. Generate 5 specific, actionable content ideas for the given genre and platform. Each idea should have: a title, a hook (first line of caption), and a format tip. Be specific to current 2026 social media trends. Respond ONLY with valid JSON matching this schema: { \"ideas\": [ { \"title\": string, \"hook\": string, \"formatTip\": string } ] }",
      messages: [
        {
          role: "user",
          content: `Genre: ${genre.replace(/_/g, " ")}\nPlatform: ${platform}`,
        },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ error: `Claude API error: ${res.status}`, detail: err }, { status: 500 });
  }

  const json = await res.json();
  const text: string = json.content?.[0]?.text ?? "{}";

  // Strip markdown code fences if present
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();

  try {
    const parsed = JSON.parse(cleaned) as { ideas: ContentIdea[] };
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json({ error: "Failed to parse Claude response", raw: text }, { status: 500 });
  }
}
