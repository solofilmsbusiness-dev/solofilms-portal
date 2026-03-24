import { NextResponse } from "next/server";

// Simple in-memory cache
let cache: { data: string[]; fetchedAt: number } | null = null;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

// Curated video/film/content hashtags as fallback
const FALLBACK_HASHTAGS = [
  "#FilmMaker",
  "#VideoProduction",
  "#Cinematography",
  "#ContentCreator",
  "#MusicVideo",
  "#BehindTheScenes",
  "#VideoMarketing",
  "#Reels",
  "#CreativeDirection",
  "#VisualStorytelling",
];

export async function GET() {
  // Return cached data if fresh
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL) {
    return NextResponse.json({
      hashtags: cache.data,
      fetchedAt: cache.fetchedAt,
      source: "cache",
    });
  }

  const bearerToken = process.env.TWITTER_BEARER_TOKEN;

  if (!bearerToken) {
    cache = { data: FALLBACK_HASHTAGS, fetchedAt: Date.now() };
    return NextResponse.json({
      hashtags: FALLBACK_HASHTAGS,
      fetchedAt: cache.fetchedAt,
      source: "fallback",
    });
  }

  try {
    // Twitter v2 trends by WOEID (1 = worldwide)
    const res = await fetch("https://api.twitter.com/2/trends/by/woeid/1", {
      headers: { Authorization: `Bearer ${bearerToken}` },
      // Next.js fetch cache: revalidate hourly
      next: { revalidate: 3600 },
    } as RequestInit & { next?: { revalidate?: number } });

    if (!res.ok) {
      throw new Error(`Twitter API error: ${res.status}`);
    }

    const json = await res.json();
    // v2 response: { data: [{ trend_name, tweet_count }] }
    const trends: string[] = (json.data ?? [])
      .slice(0, 10)
      .map((t: { trend_name: string }) =>
        t.trend_name.startsWith("#") ? t.trend_name : `#${t.trend_name}`
      );

    const hashtags = trends.length > 0 ? trends : FALLBACK_HASHTAGS;
    cache = { data: hashtags, fetchedAt: Date.now() };

    return NextResponse.json({
      hashtags,
      fetchedAt: cache.fetchedAt,
      source: "live",
    });
  } catch {
    // Fall back to curated list on any API error
    const hashtags = FALLBACK_HASHTAGS;
    cache = { data: hashtags, fetchedAt: Date.now() };
    return NextResponse.json({
      hashtags,
      fetchedAt: cache.fetchedAt,
      source: "fallback",
    });
  }
}
