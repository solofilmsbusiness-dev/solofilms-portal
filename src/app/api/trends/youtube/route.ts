import { NextResponse } from "next/server";

export interface YoutubeTrendingVideo {
  title: string;
  viewCount: string;
  channelTitle: string;
  categoryId: string;
}

export async function GET() {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "YOUTUBE_API_KEY not configured" }, { status: 500 });
  }

  // Fetch top trending in Music (10) and Entertainment (24) — 5 each, dedupe by title, return top 5 total
  const fetchCategory = async (categoryId: string): Promise<YoutubeTrendingVideo[]> => {
    const url = new URL("https://www.googleapis.com/youtube/v3/videos");
    url.searchParams.set("part", "snippet,statistics");
    url.searchParams.set("chart", "mostPopular");
    url.searchParams.set("regionCode", "US");
    url.searchParams.set("videoCategoryId", categoryId);
    url.searchParams.set("maxResults", "5");
    url.searchParams.set("key", apiKey);

    const res = await fetch(url.toString(), { next: { revalidate: 3600 } } as RequestInit & { next?: { revalidate?: number } });
    if (!res.ok) throw new Error(`YouTube API error ${res.status}`);

    const json = await res.json();
    return (json.items ?? []).map((item: {
      snippet: { title: string; channelTitle: string; categoryId: string };
      statistics: { viewCount: string };
    }) => ({
      title: item.snippet.title,
      viewCount: item.statistics.viewCount ?? "0",
      channelTitle: item.snippet.channelTitle,
      categoryId: item.snippet.categoryId,
    }));
  };

  try {
    const [music, entertainment] = await Promise.all([
      fetchCategory("10"),
      fetchCategory("24"),
    ]);

    // Interleave and return top 5
    const combined: YoutubeTrendingVideo[] = [];
    const max = Math.max(music.length, entertainment.length);
    for (let i = 0; i < max && combined.length < 5; i++) {
      if (music[i]) combined.push(music[i]);
      if (combined.length < 5 && entertainment[i]) combined.push(entertainment[i]);
    }

    return NextResponse.json({ videos: combined.slice(0, 5) });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
