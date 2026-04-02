"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/shared/PageTransition";
import { GENRES, PLATFORMS } from "@/lib/constants";
import {
  TrendingUp, Flame, Lightbulb, Hash, Globe, Video, MessageCircle, Star,
  BookOpen, Clock, Copy, CheckCheck, Maximize2, FileVideo, Zap, Target,
  RefreshCw, Sparkles, PlaySquare, ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ─── Types for live sections ───────────────────────────────────────────────
interface TwitterTrendsData {
  hashtags: string[];
  fetchedAt: number;
  source: "live" | "cache" | "fallback";
}

interface ContentIdea {
  title: string;
  hook: string;
  formatTip: string;
}

interface AiIdeasData {
  ideas: ContentIdea[];
}

interface YoutubeTrendingVideo {
  title: string;
  viewCount: string;
  channelTitle: string;
  categoryId: string;
}

interface YoutubeData {
  videos: YoutubeTrendingVideo[];
}

// ─── Platform icons ────────────────────────────────────────────────────────
const platformIcons: Record<string, React.ElementType> = {
  instagram: Star,
  youtube: Video,
  twitter: MessageCircle,
  facebook: Globe,
  tiktok: Flame,
};

// ─── Playbook tips ─────────────────────────────────────────────────────────
type Category = "strategy" | "hook" | "timing" | "growth" | "captions";

const tips: {
  genre: string; platform: string; title: string; content: string;
  isTrending: boolean; category: Category;
}[] = [
  // Music Video
  { genre: "music_video", platform: "instagram", title: "Tease It 3 Days Early", content: "Your music video just dropped — tease it 3 days early with a 15-second Reel. Layer your actual song underneath so fans hear it before they see the full video. The anticipation drives more views on release day.", isTrending: true, category: "strategy" },
  { genre: "music_video", platform: "tiktok", title: "Show the Real Moments", content: "Post a BTS clip from your video shoot — the chaos, the laughs, the in-between moments. Your fans want to see YOU, not just the polished final cut. Authenticity drives 3× more engagement on TikTok.", isTrending: true, category: "strategy" },
  { genre: "music_video", platform: "youtube", title: "Schedule a YouTube Premiere", content: "Set your music video as a YouTube Premiere 48 hours before release. Share the countdown link everywhere. Be in the live chat when it drops — your fans will show up and the algorithm rewards the early momentum.", isTrending: false, category: "strategy" },
  { genre: "music_video", platform: "tiktok", title: "Hook with the Best 3 Seconds", content: "Start your TikTok clip on the most visually striking or emotionally charged moment of your video. Don't fade in, don't open with your name — drop fans directly into the energy and let the song do the work.", isTrending: true, category: "hook" },
  { genre: "music_video", platform: "instagram", title: "Turn Lyrics into Carousels", content: "Pull 5–7 lines from your song and design them as swipeable slides. Fans save and share lyric posts — and every save signals Instagram to push your content further to new listeners.", isTrending: false, category: "growth" },
  { genre: "music_video", platform: "youtube", title: "Pin Your Video Link in Bio on Drop Day", content: "The first 24 hours after your video drops are critical for streaming numbers. Pin the link in your bio across every platform and update it the morning of release — every stream in that window counts.", isTrending: false, category: "strategy" },
  { genre: "music_video", platform: "tiktok", title: "Invite Fans to Duet or Stitch", content: "Post a clip that ends on an open moment — a reaction, a question, an incomplete story — and tell fans to duet or stitch it. Fan participation content multiplies your reach far beyond what you can do alone.", isTrending: true, category: "growth" },
  { genre: "music_video", platform: "instagram", title: "Lead Your Caption with a Hook", content: "Your Instagram caption shows only the first line before 'more'. Make it count — open with your song title, a bold lyric, or a question that makes fans stop. The story goes after.", isTrending: false, category: "captions" },

  // Commercial
  { genre: "commercial", platform: "instagram", title: "Break Your Visual into a Carousel", content: "Turn your brand video into a 5-slide carousel: Hook → The problem you solve → Your product in action → Social proof → CTA. Carousels get 1.4× more reach than a single post.", isTrending: true, category: "strategy" },
  { genre: "commercial", platform: "tiktok", title: "Start in Motion", content: "Your first half-second on TikTok determines everything. Open your video clip with movement, a bold visual, or a direct question to the viewer. Never start with a logo or a slow fade.", isTrending: false, category: "hook" },
  { genre: "commercial", platform: "youtube", title: "Earn Attention in the First 4 Seconds", content: "YouTube pre-roll lets viewers skip at 5 seconds. Put your most compelling message — what you do, why it matters — in the first 4 seconds. The rest rewards the people already interested.", isTrending: false, category: "strategy" },
  { genre: "commercial", platform: "instagram", title: "Add Text for Silent Viewers", content: "85% of Instagram videos are watched without sound. Add bold text overlays to your visual so the story lands even on mute. Captions also reach hearing-impaired audiences and boost algorithmic reach.", isTrending: true, category: "captions" },
  { genre: "commercial", platform: "tiktok", title: "Speak to Camera, Not at It", content: "Polished commercial-style videos underperform on TikTok. Pair your professional visual with a casual, direct-to-camera reaction or commentary from you. Raw feels more trustworthy than perfect.", isTrending: true, category: "strategy" },
  { genre: "commercial", platform: "facebook", title: "Open with the Pain Point", content: "Facebook copy that leads with what your audience struggles with ('Tired of...') stops the scroll. Let your video be the answer. Don't explain it — show it.", isTrending: false, category: "hook" },

  // Wedding
  { genre: "wedding", platform: "instagram", title: "Tag Everyone in Your Day", content: "Tag the venue, your planner, the DJ, florist, and anyone else who made the day happen. They'll reshare to their audiences — your wedding video can reach thousands of new eyes through their networks.", isTrending: false, category: "growth" },
  { genre: "wedding", platform: "tiktok", title: "The First Look Never Gets Old", content: "First look reactions and vow moments are consistently the top-performing wedding content on TikTok. Clip yours to under 30 seconds with an emotional track and let the reaction speak for itself.", isTrending: true, category: "strategy" },
  { genre: "wedding", platform: "instagram", title: "Post Your Highlight Reel Fast", content: "Share a 60-second Reel of your wedding highlights within 24–48 hours of receiving it. Use a trending audio track with emotional pull and tag your partner, venue, and vendors in the caption.", isTrending: true, category: "timing" },
  { genre: "wedding", platform: "youtube", title: "Share the Full Film Privately First", content: "Upload your full wedding video as unlisted on YouTube and share the link with family and close friends. When they share it in their own circles, your story reaches people no algorithm would find.", isTrending: false, category: "strategy" },
  { genre: "wedding", platform: "tiktok", title: "The Getting Ready Montage", content: "String together 8–10 getting-ready moments into a 20-second montage and set it to a trending sound. This format performs consistently well — it's intimate, celebratory, and easy to relate to.", isTrending: false, category: "strategy" },

  // Documentary
  { genre: "documentary", platform: "youtube", title: "Drop a Trailer First", content: "Before releasing your full documentary, post a 2–3 minute trailer to build anticipation. Add chapters to the full film, timestamp the key moments, and write a description rich with the story's keywords.", isTrending: false, category: "strategy" },
  { genre: "documentary", platform: "instagram", title: "Release It as a Series", content: "Break your documentary into 60-second Reels posted as a numbered series. 'Part 1 of 5' creates a return audience — viewers come back for each installment and your profile visits climb between drops.", isTrending: true, category: "growth" },
  { genre: "documentary", platform: "tiktok", title: "Open with the Biggest Moment", content: "Start your TikTok clip with your documentary's most shocking or emotional scene — no context, no setup. Caption it: 'Full story on YouTube.' Cross-platform curiosity drives real traffic.", isTrending: true, category: "hook" },
  { genre: "documentary", platform: "youtube", title: "Keep Subscribers Warm Between Episodes", content: "Use YouTube Community posts to share behind-the-scenes stills, polls ('What do you think happens next?'), and sneak peeks between episode drops. Subscribers who engage between releases are your most loyal audience.", isTrending: false, category: "growth" },

  // Social Content
  { genre: "social_content", platform: "instagram", title: "Post When Your Audience Is Awake", content: "For maximum reach on Instagram, post Reels between 7–9 AM and 7–9 PM on weekdays. Tuesday through Thursday consistently see the highest engagement — use that window for your most important posts.", isTrending: true, category: "timing" },
  { genre: "social_content", platform: "tiktok", title: "Jump on Sounds Within 48 Hours", content: "Use a trending sound within 48 hours of it peaking and TikTok will give your post a lift. Save sounds the moment you spot them gaining traction — waiting even a day can cut your algorithmic boost in half.", isTrending: true, category: "timing" },
  { genre: "social_content", platform: "instagram", title: "Batch Your Content, Post Consistently", content: "Plan one content session per week to create 3–5 posts and schedule them out. Consistency beats volume — showing up 3 times a week reliably outperforms 10 posts one week and nothing the next.", isTrending: false, category: "strategy" },
  { genre: "social_content", platform: "tiktok", title: "Reply to Comments with Video", content: "When a fan asks a great question or leaves a standout comment, reply with a video response. TikTok often gives these posts an algorithmic boost — and it shows your audience you're paying attention.", isTrending: true, category: "growth" },
  { genre: "social_content", platform: "youtube", title: "Use Shorts to Pull People to Your Channel", content: "Post a 30-second teaser of your longer video as a YouTube Short. Caption it: 'Full video on my channel.' Shorts are the fastest-growing subscriber funnel on YouTube right now — use them.", isTrending: true, category: "growth" },

  // Event
  { genre: "event", platform: "instagram", title: "Document the Event in Real Time", content: "Post Stories throughout the day — before, during, and after the event. Use polls, questions, and countdowns to pull your audience in. Archive the best moments to a Highlight so new followers can find them.", isTrending: false, category: "strategy" },
  { genre: "event", platform: "tiktok", title: "Capture the Crowd's Energy", content: "Film short crowd reaction clips throughout the event and stack 4–5 together with punchy music. Energy is contagious — these clips get shared by everyone who was there and watched by everyone who wasn't.", isTrending: true, category: "strategy" },
  { genre: "event", platform: "instagram", title: "Tag Every Brand and Venue", content: "Tag the organizer, venue, and every brand present in your post. Event brands regularly reshare content from artists and attendees — that's free distribution to their established audience.", isTrending: false, category: "growth" },
  { genre: "event", platform: "youtube", title: "Recap Videos Rank for Years", content: "An event recap video optimized with '[Event Name] [Year] — Full Recap' in the title will rank in search long after the event ends. List the performers, speakers, and highlights in your description.", isTrending: false, category: "strategy" },

  // Corporate
  { genre: "corporate", platform: "youtube", title: "Build a Recurring Series", content: "Turn your brand's expertise into a consistent video series — exec interviews, industry insights, or how-it-works breakdowns. Subscribers come back for the next one. Aim for at least twice a month.", isTrending: false, category: "strategy" },
  { genre: "corporate", platform: "linkedin", title: "Upload Directly, Don't Link", content: "Post your brand video as a native LinkedIn upload — not a YouTube link. Native videos get 5× more reach on LinkedIn. Keep them under 2 minutes for the best completion rates.", isTrending: true, category: "strategy" },
  { genre: "corporate", platform: "instagram", title: "Let Your People Be the Brand", content: "Short employee story videos (30–60 seconds) consistently outperform product content for brands on Instagram. A real face and a real voice builds more trust than any polished product shot.", isTrending: true, category: "strategy" },
  { genre: "corporate", platform: "twitter", title: "Thread the Key Takeaways", content: "After posting your brand video, write an X/Twitter thread pulling out 5 key insights or moments from it. Each tweet builds the story — the last one links to the full video.", isTrending: false, category: "captions" },
];

// ─── Platform Specs data ───────────────────────────────────────────────────
const platformSpecs = [
  {
    name: "Instagram Reels", platform: "instagram", color: "#E1306C",
    format: "MP4 / MOV", aspect: "9:16", resolution: "1080 × 1920",
    maxDuration: "90 sec", maxSize: "1 GB",
    notes: ["Auto-generated captions available", "Cover image shows on profile grid", "Add trending audio for bonus reach"],
  },
  {
    name: "Instagram Feed Video", platform: "instagram", color: "#E1306C",
    format: "MP4 / MOV", aspect: "4:5", resolution: "1080 × 1350",
    maxDuration: "60 min", maxSize: "1 GB",
    notes: ["4:5 portrait gets more screen space", "First 125 chars of caption visible", "Good for longer brand films"],
  },
  {
    name: "TikTok", platform: "tiktok", color: "#00f2ea",
    format: "MP4 / MOV", aspect: "9:16", resolution: "1080 × 1920",
    maxDuration: "10 min", maxSize: "287 MB",
    notes: ["Hook must land in first 0.5s", "Captions boost completion rate", "Post 1–4× per day for growth phase"],
  },
  {
    name: "YouTube", platform: "youtube", color: "#FF0000",
    format: "MP4 / MOV", aspect: "16:9", resolution: "1920 × 1080",
    maxDuration: "12 hrs", maxSize: "128 GB",
    notes: ["Add chapters for better SEO", "Custom thumbnail = 40% more clicks", "First 48 hrs are critical for ranking"],
  },
  {
    name: "YouTube Shorts", platform: "youtube", color: "#FF0000",
    format: "MP4 / MOV", aspect: "9:16", resolution: "1080 × 1920",
    maxDuration: "60 sec", maxSize: "—",
    notes: ["Separate algorithm from long-form", "Drives subscribers to your channel", "Use #Shorts in title or description"],
  },
  {
    name: "Twitter / X", platform: "twitter", color: "#1DA1F2",
    format: "MP4", aspect: "16:9 or 1:1", resolution: "1280 × 720",
    maxDuration: "2 min 20 sec", maxSize: "512 MB",
    notes: ["Captions required for reach", "GIF-length clips get high engagement", "Video tweets get 10× more engagement"],
  },
  {
    name: "Facebook Reels", platform: "facebook", color: "#1877F2",
    format: "MP4 / MOV", aspect: "9:16", resolution: "1080 × 1920",
    maxDuration: "90 sec", maxSize: "—",
    notes: ["Cross-post from Instagram Reels", "Older demographics = less competition", "Music licensing included via Meta"],
  },
  {
    name: "Facebook Video", platform: "facebook", color: "#1877F2",
    format: "MP4 / MOV", aspect: "16:9", resolution: "1920 × 1080",
    maxDuration: "240 min", maxSize: "10 GB",
    notes: ["Long-form performs well here", "Supports auto-play in feed", "Live video gets 6× more engagement"],
  },
];

// ─── Best Times data ───────────────────────────────────────────────────────
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const bestTimes = [
  {
    platform: "Instagram", key: "instagram", color: "#E1306C",
    bestDays: ["Tue", "Wed", "Thu"],
    windows: ["7–9 AM EST", "6–9 PM EST"],
    worstTime: "Sunday morning",
    tip: "Reels posted Tuesday–Thursday evenings consistently outperform the rest of the week.",
  },
  {
    platform: "TikTok", key: "tiktok", color: "#00f2ea",
    bestDays: ["Tue", "Thu", "Fri"],
    windows: ["2–6 PM EST", "9–11 PM EST"],
    worstTime: "Monday morning",
    tip: "TikTok's algorithm is less time-sensitive than Instagram's — great content can spike days after posting.",
  },
  {
    platform: "YouTube", key: "youtube", color: "#FF0000",
    bestDays: ["Thu", "Fri", "Sat"],
    windows: ["12–3 PM EST", "8–10 PM EST"],
    worstTime: "Early weekday mornings",
    tip: "Publish Thursday or Friday so the algorithm has the weekend to push your video to new audiences.",
  },
  {
    platform: "Twitter / X", key: "twitter", color: "#1DA1F2",
    bestDays: ["Mon", "Tue", "Wed"],
    windows: ["9 AM–12 PM EST"],
    worstTime: "Weekends",
    tip: "Twitter/X is a weekday platform. Video engagement drops sharply Friday afternoon through Sunday.",
  },
  {
    platform: "Facebook", key: "facebook", color: "#1877F2",
    bestDays: ["Tue", "Wed", "Thu"],
    windows: ["1–4 PM EST", "7–9 PM EST"],
    worstTime: "Early mornings",
    tip: "Facebook's video audience skews 35+. Mid-afternoon posts catch lunch-break scrollers for highest reach.",
  },
];

// ─── Templates data ────────────────────────────────────────────────────────
const templates = [
  {
    genre: "Music Video", key: "music_video",
    hook: "🎬 This took [X] months to make. Worth every second.",
    short: "New music video out now. Link in bio. 🔥",
    long: "We put everything into this one.\n\nFrom the first concept call to the final color grade — [X] months of work, [X] shooting days, and a crew that refused to settle.\n\nThis is [Song/Artist Name].\n\nWatch the full video — link in bio. Tell us what you think in the comments. 🎬",
    hashtags: "#musicvideo #newmusic #indiefilm #videoproduction #behindthescenes #newrelease #filmmaker #videography #cinematography #musicproduction #artistlife #contentcreator #visualart #shortfilm #hiphop",
  },
  {
    genre: "Commercial", key: "commercial",
    hook: "We had [X] seconds to make you care. Did we?",
    short: "New brand film for @[Client]. Shot in [Location]. 🎥",
    long: "Every great brand has a story.\n\nWe had the honor of telling @[Client]'s.\n\n[1 sentence about the brand's mission or the challenge they solve].\n\nThis is what we built together — a [X]-second film that captures [what makes the brand different].\n\nProduced by Solo Films. 🎬",
    hashtags: "#commercialvideography #brandfilm #advertising #videomarketing #contentmarketing #brandstory #videoproduction #filmmaker #commercialvideo #brandingvideo #corporatevideo #marketingvideo #adagency #creativedirector #visualstorytelling",
  },
  {
    genre: "Wedding", key: "wedding",
    hook: "The moment she saw him. No words needed.",
    short: "[Couple Names] · [Venue] · [Date] 🤍\nFilmed by Solo Films.",
    long: "[Couple Names] said yes — and then they said it again in front of everyone who matters.\n\nWe had the privilege of capturing every laugh, every tear, and every look that said everything without a single word.\n\n[Venue] · [City] · [Date]\n\nTo the couple: this is yours forever. 🤍",
    hashtags: "#weddingvideography #weddingfilm #weddingday #brideandgroom #weddingvideo #weddingphotography #weddingcinema #weddingplanner #bridetobe #reelwedding #weddingseason #bridalfilm #weddingmoments #destinationwedding #weddinginspo",
  },
  {
    genre: "Documentary", key: "documentary",
    hook: "No one wanted to talk about this. We asked anyway.",
    short: "New documentary short: '[Title]' — watch now. Link in bio.",
    long: "'[Title]' is a [runtime] documentary about [subject in one sentence].\n\nWe spent [X] months following [subject/person/community]. What we found changed how we see [theme].\n\nThis story needed to be told. We're glad we got to tell it.\n\nFull documentary — link in bio. 🎬",
    hashtags: "#documentary #documentaryfilm #docufilm #filmmaker #shortfilm #truestory #realstory #docuseries #independentfilm #filmmaking #cinematography #videoproduction #storytelling #journalist #docuphotography",
  },
  {
    genre: "Social Content", key: "social_content",
    hook: "Stop scrolling. You need to see this.",
    short: "POV: you finally invested in quality content. 🎬",
    long: "Your content is your first impression.\n\nIn a feed full of noise, [Brand/Creator Name] is choosing clarity, quality, and stories that actually land.\n\nThis is what showing up with intention looks like.\n\n📍 [Location if relevant]\n📎 Link in bio for the full story.",
    hashtags: "#contentcreator #socialmediacontent #videocontent #contentmarketing #contentcreation #reelsinstagram #tiktokmarketing #videography #creativeagency #digitalmarketing #socialmediavideo #brandcontent #ugc #reelsviral #createcontent",
  },
  {
    genre: "Event", key: "event",
    hook: "You had to be there. Now you don't.",
    short: "Recap of [Event Name] — [Date]. 🔥 Full video: link in bio.",
    long: "[Event Name] was something else.\n\n[1–2 sentences about the energy, scale, or significance of the event].\n\nWe captured everything — from the setup to the final moments when no one wanted to leave.\n\nFull recap video: link in bio.\n\nTagging @[Organizer] @[Venue] 📍 [Location]",
    hashtags: "#eventcoverage #eventphotography #eventvideography #eventplanning #eventrecap #liveevents #eventproduction #conference #concert #festivalphotography #eventmarketing #corporateevent #eventfilm #behindthescenes #liveevent",
  },
  {
    genre: "Corporate", key: "corporate",
    hook: "This is what [X years] of work looks like in [X] seconds.",
    short: "Brand film for [Company Name]. Produced by Solo Films. 🎬",
    long: "[Company Name] doesn't just [what they do]. They [what makes them different].\n\nWe partnered with their team to capture the culture, the mission, and the people who make it all happen.\n\nBehind every great company is a story worth telling. This is theirs.\n\nProduced by Solo Films. 📽️",
    hashtags: "#corporatevideo #corporatefilm #brandvideo #businessvideo #companyculture #corporatephotography #b2bmarketing #thoughtleadership #corporatebranding #internalcomms #employeeexperience #workplaceculture #corporatelife #businessmarketing #companyfilm",
  },
];

// ─── Component ─────────────────────────────────────────────────────────────
type Tab = "playbook" | "specs" | "times" | "templates";

const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: "playbook", label: "Release Playbook", icon: BookOpen },
  { key: "specs", label: "Platform Specs", icon: Maximize2 },
  { key: "times", label: "Best Times", icon: Clock },
  { key: "templates", label: "Templates", icon: FileVideo },
];

const CATEGORIES: { key: string; label: string }[] = [
  { key: "all", label: "All" },
  { key: "strategy", label: "Strategy" },
  { key: "hook", label: "Hooks" },
  { key: "timing", label: "Timing" },
  { key: "growth", label: "Growth" },
  { key: "captions", label: "Captions" },
];

export default function SocialHubPage() {
  const [activeTab, setActiveTab] = useState<Tab>("playbook");
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [copied, setCopied] = useState<string | null>(null);

  // ── Live section state ──────────────────────────────────────────────────
  const [twitterData, setTwitterData] = useState<TwitterTrendsData | null>(null);
  const [twitterLoading, setTwitterLoading] = useState(true);

  const [aiGenre, setAiGenre] = useState("music_video");
  const [aiPlatform, setAiPlatform] = useState("instagram");
  const [aiIdeas, setAiIdeas] = useState<ContentIdea[] | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const [youtubeData, setYoutubeData] = useState<YoutubeData | null>(null);
  const [youtubeLoading, setYoutubeLoading] = useState(true);
  const [youtubeError, setYoutubeError] = useState<string | null>(null);

  const fetchTwitter = useCallback(async () => {
    setTwitterLoading(true);
    try {
      const res = await fetch("/api/trends/twitter");
      if (!res.ok) throw new Error("Failed to fetch");
      const data: TwitterTrendsData = await res.json();
      setTwitterData(data);
    } catch {
      // keep previous data or null
    } finally {
      setTwitterLoading(false);
    }
  }, []);

  const fetchYoutube = useCallback(async () => {
    setYoutubeLoading(true);
    setYoutubeError(null);
    try {
      const res = await fetch("/api/trends/youtube");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to fetch");
      setYoutubeData(data as YoutubeData);
    } catch (err) {
      setYoutubeError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setYoutubeLoading(false);
    }
  }, []);

  const generateAiIdeas = async () => {
    setAiLoading(true);
    setAiIdeas(null);
    try {
      const res = await fetch("/api/trends/ai-ideas", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ genre: aiGenre, platform: aiPlatform }),
      });
      const data: AiIdeasData = await res.json();
      if (!res.ok) throw new Error("Failed to generate ideas");
      setAiIdeas(data.ideas ?? []);
    } catch {
      toast.error("Failed to generate ideas. Check ANTHROPIC_API_KEY.");
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    fetchTwitter();
    fetchYoutube();
  }, [fetchTwitter, fetchYoutube]);

  const filteredTips = tips.filter((tip) => {
    if (selectedGenre !== "all" && tip.genre !== selectedGenre) return false;
    if (selectedPlatform !== "all" && tip.platform !== selectedPlatform) return false;
    if (selectedCategory !== "all" && tip.category !== selectedCategory) return false;
    return true;
  });

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <PageTransition>
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/5 px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-gold">Strategy</span>
          </div>
          <h1 className="font-heading text-3xl font-bold text-cinema-text">
            Release <span className="text-gradient-gold">Playbook.</span>
          </h1>
          <p className="mt-1 text-cinema-subtle">Tactics built for video creatives.</p>
        </div>

        {/* ── SECTION A: What's Trending Now ─────────────────────────── */}
        <motion.div
          className="rounded-2xl border border-cinema-border glass overflow-hidden"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between border-b border-cinema-border/60 px-5 py-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gold/10">
                <Hash className="h-4 w-4 text-gold" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-cinema-text">What&apos;s Trending Now</h2>
                {twitterData && (
                  <p className="text-[11px] text-cinema-subtle">
                    Updated {Math.round((Date.now() - twitterData.fetchedAt) / 60000)} min ago
                    {twitterData.source === "fallback" && " · curated"}
                  </p>
                )}
              </div>
            </div>
            <motion.button
              onClick={fetchTwitter}
              disabled={twitterLoading}
              className="flex items-center gap-1.5 rounded-xl border border-cinema-border px-3 py-1.5 text-xs text-cinema-subtle transition-colors hover:border-gold/30 hover:text-gold disabled:opacity-40"
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw className={cn("h-3.5 w-3.5", twitterLoading && "animate-spin")} />
              Refresh
            </motion.button>
          </div>
          <div className="px-5 py-4">
            {twitterLoading ? (
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-8 animate-pulse rounded-full bg-cinema-surface/60"
                    style={{ width: `${70 + Math.random() * 60}px` }}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {(twitterData?.hashtags ?? []).map((tag) => (
                  <motion.a
                    key={tag}
                    href={`https://x.com/search?q=${encodeURIComponent(tag)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-cinema-border bg-cinema-surface/30 px-3.5 py-1.5 text-sm text-cinema-subtle transition-all hover:border-gold/40 hover:bg-gold/10 hover:text-gold"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {tag}
                  </motion.a>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* ── SECTION B: AI Content Ideas ─────────────────────────────── */}
        <motion.div
          className="rounded-2xl border border-cinema-border glass overflow-hidden"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="flex items-center gap-2.5 border-b border-cinema-border/60 px-5 py-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet/10">
              <Sparkles className="h-4 w-4 text-violet" />
            </div>
            <h2 className="text-sm font-semibold text-cinema-text">AI Content Ideas</h2>
          </div>

          <div className="px-5 py-4 space-y-4">
            {/* Controls */}
            <div className="flex flex-wrap items-end gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-cinema-subtle">Genre</label>
                <div className="relative">
                  <select
                    value={aiGenre}
                    onChange={(e) => setAiGenre(e.target.value)}
                    className="appearance-none rounded-xl border border-cinema-border bg-cinema-surface/40 pl-3 pr-8 py-2 text-sm text-cinema-text focus:border-gold/40 focus:outline-none"
                  >
                    {GENRES.map((g) => (
                      <option key={g.key} value={g.key}>{g.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-cinema-subtle" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-cinema-subtle">Platform</label>
                <div className="relative">
                  <select
                    value={aiPlatform}
                    onChange={(e) => setAiPlatform(e.target.value)}
                    className="appearance-none rounded-xl border border-cinema-border bg-cinema-surface/40 pl-3 pr-8 py-2 text-sm text-cinema-text focus:border-gold/40 focus:outline-none"
                  >
                    {PLATFORMS.map((p) => (
                      <option key={p.key} value={p.key}>{p.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-cinema-subtle" />
                </div>
              </div>
              <motion.button
                onClick={generateAiIdeas}
                disabled={aiLoading}
                className="flex items-center gap-2 rounded-xl bg-gold px-4 py-2 text-sm font-semibold text-cinema-bg shadow-[0_0_20px_rgba(201,144,12,0.25)] transition-all hover:bg-gold/90 disabled:opacity-50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                <Sparkles className="h-4 w-4" />
                {aiLoading ? "Generating" : "Generate Ideas"}
                {aiLoading && (
                  <span className="inline-flex gap-0.5">
                    <span className="animate-bounce" style={{ animationDelay: "0ms" }}>.</span>
                    <span className="animate-bounce" style={{ animationDelay: "150ms" }}>.</span>
                    <span className="animate-bounce" style={{ animationDelay: "300ms" }}>.</span>
                  </span>
                )}
              </motion.button>
            </div>

            {/* Ideas grid */}
            <AnimatePresence mode="wait">
              {aiIdeas && !aiLoading && (
                <motion.div
                  key="ideas"
                  className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  {aiIdeas.map((idea, i) => (
                    <motion.div
                      key={i}
                      className="group relative overflow-hidden rounded-2xl border border-cinema-border glass p-4 hover:border-gold/20 transition-all"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      whileHover={{ y: -2 }}
                    >
                      <div className="pointer-events-none absolute -top-6 -right-6 h-16 w-16 rounded-full bg-gold/0 opacity-0 blur-[40px] transition-all duration-500 group-hover:bg-gold/20 group-hover:opacity-100" />
                      <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-gold">
                        Idea {i + 1}
                      </p>
                      <h3 className="mb-2 text-sm font-semibold text-cinema-text group-hover:text-gold transition-colors leading-snug">
                        {idea.title}
                      </h3>
                      <p className="mb-3 text-xs text-cinema-subtle leading-relaxed italic">
                        &ldquo;{idea.hook}&rdquo;
                      </p>
                      <p className="mb-3 text-xs text-cinema-subtle/70 leading-relaxed border-t border-cinema-border/40 pt-3">
                        <span className="text-cyan font-medium not-italic">Format:</span> {idea.formatTip}
                      </p>
                      <motion.button
                        onClick={() => {
                          navigator.clipboard.writeText(idea.hook);
                          toast.success("Hook copied!");
                        }}
                        className="flex items-center gap-1.5 rounded-lg border border-cinema-border px-2.5 py-1 text-xs text-cinema-subtle transition-all hover:border-gold/30 hover:text-gold"
                        whileTap={{ scale: 0.95 }}
                      >
                        <Copy className="h-3 w-3" />
                        Copy Hook
                      </motion.button>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* ── SECTION C: YouTube Trending ──────────────────────────────── */}
        <motion.div
          className="rounded-2xl border border-cinema-border glass overflow-hidden"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between border-b border-cinema-border/60 px-5 py-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose/10">
                <PlaySquare className="h-4 w-4 text-rose" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-cinema-text">YouTube Trending in Your Space</h2>
                <p className="text-[11px] text-cinema-subtle">Music &amp; Entertainment · US · Updated on page load</p>
              </div>
            </div>
          </div>
          <div className="px-5 py-4">
            {youtubeLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-8 w-8 animate-pulse rounded-lg bg-cinema-surface/60 shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3.5 animate-pulse rounded bg-cinema-surface/60" style={{ width: `${60 + Math.random() * 30}%` }} />
                      <div className="h-2.5 w-24 animate-pulse rounded bg-cinema-surface/40" />
                    </div>
                  </div>
                ))}
              </div>
            ) : youtubeError ? (
              <div className="rounded-xl border border-rose/20 bg-rose/5 px-4 py-3 text-sm text-rose">
                {youtubeError.includes("YOUTUBE_API_KEY") ? "Add YOUTUBE_API_KEY to your environment variables." : youtubeError}
              </div>
            ) : (
              <div className="space-y-2">
                {(youtubeData?.videos ?? []).map((video, i) => (
                  <motion.div
                    key={i}
                    className="group flex items-center gap-3 rounded-xl border border-cinema-border/60 bg-cinema-surface/20 px-4 py-3 transition-all hover:border-gold/20 hover:bg-cinema-surface/40"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ x: 2 }}
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-rose/10 text-xs font-bold text-rose">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-cinema-text group-hover:text-gold transition-colors">
                        {video.title}
                      </p>
                      <p className="text-xs text-cinema-subtle">{video.channelTitle}</p>
                    </div>
                    <span className="shrink-0 rounded-full border border-cinema-border/60 px-2.5 py-0.5 text-[11px] font-medium text-cinema-subtle">
                      {Number(video.viewCount).toLocaleString()} views
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Tab bar */}
        <div className="flex gap-1 rounded-2xl border border-cinema-border bg-cinema-surface/20 p-1">
          {TABS.map((tab) => (
            <motion.button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "relative flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                activeTab === tab.key ? "text-cinema-bg" : "text-cinema-subtle hover:text-cinema-text"
              )}
              whileTap={{ scale: 0.97 }}
            >
              {activeTab === tab.key && (
                <motion.div
                  className="absolute inset-0 rounded-xl bg-gold"
                  layoutId="activeTab"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <tab.icon className="relative z-10 h-4 w-4" />
              <span className="relative z-10 hidden sm:inline">{tab.label}</span>
            </motion.button>
          ))}
        </div>

        {/* ── PLAYBOOK TAB ── */}
        {activeTab === "playbook" && (
          <div className="space-y-6">
            {/* Genre filter */}
            <div className="space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-cinema-subtle">Genre</p>
              <div className="flex flex-wrap gap-2">
                <FilterBtn active={selectedGenre === "all"} onClick={() => setSelectedGenre("all")} color="gold">All</FilterBtn>
                {GENRES.map((g) => (
                  <FilterBtn key={g.key} active={selectedGenre === g.key} onClick={() => setSelectedGenre(g.key)} color="gold">{g.label}</FilterBtn>
                ))}
              </div>
            </div>

            {/* Platform filter */}
            <div className="space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-cinema-subtle">Platform</p>
              <div className="flex flex-wrap gap-2">
                <FilterBtn active={selectedPlatform === "all"} onClick={() => setSelectedPlatform("all")} color="violet">All</FilterBtn>
                {PLATFORMS.map((p) => {
                  const Icon = platformIcons[p.key] || Hash;
                  return (
                    <FilterBtn key={p.key} active={selectedPlatform === p.key} onClick={() => setSelectedPlatform(p.key)} color="violet">
                      <Icon className="h-3.5 w-3.5" />{p.label}
                    </FilterBtn>
                  );
                })}
              </div>
            </div>

            {/* Category filter */}
            <div className="space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-cinema-subtle">Category</p>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                  <FilterBtn key={c.key} active={selectedCategory === c.key} onClick={() => setSelectedCategory(c.key)} color="cyan">{c.label}</FilterBtn>
                ))}
              </div>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-cinema-border to-transparent" />

            {filteredTips.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Lightbulb className="mb-4 h-12 w-12 text-cinema-subtle/20" />
                <p className="text-cinema-subtle">No tips for this combination. Try adjusting the filters.</p>
              </div>
            ) : (
              <StaggerContainer className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredTips.map((tip, i) => {
                  const PlatformIcon = platformIcons[tip.platform] || Hash;
                  const platformData = PLATFORMS.find((p) => p.key === tip.platform);
                  return (
                    <StaggerItem key={i}>
                      <motion.div
                        className="group relative overflow-hidden rounded-2xl border border-cinema-border glass p-6 transition-all hover:border-gold/20"
                        whileHover={{ y: -3 }}
                      >
                        <div
                          className="pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full opacity-0 blur-[50px] transition-opacity duration-500 group-hover:opacity-100"
                          style={{ backgroundColor: `${platformData?.color}30` }}
                        />
                        {tip.isTrending && (
                          <div className="absolute top-4 right-4 flex items-center gap-1 rounded-full bg-rose/10 border border-rose/20 px-2.5 py-1 text-[10px] font-semibold text-rose">
                            <TrendingUp className="h-3 w-3" />Trending
                          </div>
                        )}
                        <div className="mb-4 inline-flex rounded-xl p-2.5 transition-all group-hover:scale-110" style={{ backgroundColor: `${platformData?.color}15` }}>
                          <PlatformIcon className="h-5 w-5" style={{ color: platformData?.color }} />
                        </div>
                        <h3 className="mb-2 text-base font-semibold text-cinema-text group-hover:text-gold transition-colors">{tip.title}</h3>
                        <p className="text-sm leading-relaxed text-cinema-subtle">{tip.content}</p>
                        <div className="mt-4 flex items-center gap-2 flex-wrap">
                          <span className="rounded-full border border-cinema-border bg-cinema-muted/30 px-2 py-0.5 text-xs text-cinema-subtle capitalize">{tip.genre.replace(/_/g, " ")}</span>
                          <span className="rounded-full border border-cinema-border bg-cinema-muted/30 px-2 py-0.5 text-xs text-cinema-subtle capitalize">{tip.category}</span>
                        </div>
                      </motion.div>
                    </StaggerItem>
                  );
                })}
              </StaggerContainer>
            )}
          </div>
        )}

        {/* ── PLATFORM SPECS TAB ── */}
        {activeTab === "specs" && (
          <div className="space-y-6">
            <p className="text-sm text-cinema-subtle">Exact video specs for every major platform — updated for 2025. Export your deliverables to these settings for best quality and reach.</p>
            <div className="grid gap-4 sm:grid-cols-2">
              {platformSpecs.map((spec) => (
                <motion.div
                  key={spec.name}
                  className="group relative overflow-hidden rounded-2xl border border-cinema-border glass p-5 hover:border-gold/20 transition-all"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -2 }}
                >
                  <div className="pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full opacity-0 blur-[50px] transition-opacity duration-500 group-hover:opacity-100" style={{ backgroundColor: `${spec.color}20` }} />
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: `${spec.color}15` }}>
                        {(() => { const Icon = platformIcons[spec.platform] || Video; return <Icon className="h-4.5 w-4.5" style={{ color: spec.color }} />; })()}
                      </div>
                      <h3 className="font-semibold text-cinema-text">{spec.name}</h3>
                    </div>
                    <span className="shrink-0 rounded-lg border px-2.5 py-1 text-xs font-mono font-semibold" style={{ borderColor: `${spec.color}40`, color: spec.color, backgroundColor: `${spec.color}10` }}>{spec.aspect}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[
                      { label: "Format", value: spec.format },
                      { label: "Resolution", value: spec.resolution },
                      { label: "Max Duration", value: spec.maxDuration },
                    ].map((row) => (
                      <div key={row.label} className="rounded-xl bg-cinema-surface/30 px-3 py-2">
                        <p className="text-[10px] text-cinema-subtle uppercase tracking-wider mb-0.5">{row.label}</p>
                        <p className="text-xs font-semibold text-cinema-text">{row.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-1.5">
                    {spec.notes.map((note, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-cinema-subtle">
                        <Zap className="h-3 w-3 shrink-0 mt-0.5" style={{ color: spec.color }} />
                        {note}
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* ── BEST TIMES TAB ── */}
        {activeTab === "times" && (
          <div className="space-y-6">
            <p className="text-sm text-cinema-subtle">Optimal posting windows per platform for video content in 2025. All times in EST — adjust for your audience&apos;s timezone.</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {bestTimes.map((pt) => (
                <motion.div
                  key={pt.key}
                  className="group relative overflow-hidden rounded-2xl border border-cinema-border glass p-5 hover:border-gold/20 transition-all"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -2 }}
                >
                  <div className="pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full opacity-0 blur-[50px] transition-opacity duration-500 group-hover:opacity-100" style={{ backgroundColor: `${pt.color}20` }} />
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: `${pt.color}15` }}>
                      {(() => { const Icon = platformIcons[pt.key] || Globe; return <Icon className="h-4.5 w-4.5" style={{ color: pt.color }} />; })()}
                    </div>
                    <h3 className="font-semibold text-cinema-text">{pt.platform}</h3>
                  </div>

                  {/* Day grid */}
                  <div className="mb-4 flex gap-1">
                    {DAYS.map((day) => {
                      const isActive = pt.bestDays.includes(day);
                      return (
                        <div
                          key={day}
                          className={cn("flex-1 rounded-lg py-1.5 text-center text-[10px] font-semibold transition-all", isActive ? "text-cinema-bg" : "text-cinema-subtle/40 bg-cinema-surface/30")}
                          style={isActive ? { backgroundColor: pt.color } : {}}
                        >
                          {day[0]}
                        </div>
                      );
                    })}
                  </div>

                  {/* Time windows */}
                  <div className="space-y-1.5 mb-3">
                    {pt.windows.map((w) => (
                      <div key={w} className="flex items-center gap-2">
                        <Clock className="h-3 w-3 shrink-0" style={{ color: pt.color }} />
                        <span className="text-xs font-medium text-cinema-text">{w}</span>
                      </div>
                    ))}
                  </div>

                  <p className="text-xs text-cinema-subtle leading-relaxed border-t border-cinema-border/50 pt-3">{pt.tip}</p>
                </motion.div>
              ))}
            </div>

            {/* Notes */}
            <div className="rounded-2xl border border-gold/10 bg-gold/5 p-5">
              <div className="flex items-start gap-3">
                <Target className="h-5 w-5 text-gold shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-cinema-text mb-1">Timing is a starting point, not a rule.</p>
                  <p className="text-sm text-cinema-subtle">The best time for your account is when your specific audience is online. After 30 days of consistent posting, check your analytics to find your personal peak window — it often differs from general benchmarks.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TEMPLATES TAB ── */}
        {activeTab === "templates" && (
          <div className="space-y-6">
            <p className="text-sm text-cinema-subtle">Copy-ready captions, hooks, and hashtag sets by genre. Click any block to copy it instantly.</p>
            <div className="space-y-8">
              {templates.map((tmpl) => (
                <div key={tmpl.key} className="space-y-3">
                  <h2 className="font-heading text-lg font-bold text-cinema-text border-b border-cinema-border/50 pb-2">{tmpl.genre}</h2>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {/* Hook */}
                    <CopyCard
                      label="Scroll-Stop Hook"
                      text={tmpl.hook}
                      id={`${tmpl.key}-hook`}
                      copied={copied}
                      onCopy={copyToClipboard}
                      accent="gold"
                    />
                    {/* Short caption */}
                    <CopyCard
                      label="Short Caption"
                      text={tmpl.short}
                      id={`${tmpl.key}-short`}
                      copied={copied}
                      onCopy={copyToClipboard}
                      accent="cyan"
                    />
                    {/* Long caption - full width */}
                    <div className="sm:col-span-2">
                      <CopyCard
                        label="Long Caption"
                        text={tmpl.long}
                        id={`${tmpl.key}-long`}
                        copied={copied}
                        onCopy={copyToClipboard}
                        accent="violet"
                      />
                    </div>
                    {/* Hashtags - full width */}
                    <div className="sm:col-span-2">
                      <CopyCard
                        label="Hashtag Set (15)"
                        text={tmpl.hashtags}
                        id={`${tmpl.key}-tags`}
                        copied={copied}
                        onCopy={copyToClipboard}
                        accent="rose"
                        mono
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────
function FilterBtn({
  active, onClick, color, children,
}: {
  active: boolean; onClick: () => void; color: "gold" | "violet" | "cyan";
  children: React.ReactNode;
}) {
  const activeStyles = {
    gold: "bg-gold text-cinema-bg shadow-[0_0_15px_rgba(201,144,12,0.3)]",
    violet: "bg-violet text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]",
    cyan: "bg-cyan text-cinema-bg shadow-[0_0_15px_rgba(6,182,212,0.3)]",
  };
  return (
    <motion.button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-all",
        active ? activeStyles[color] : "border border-cinema-border text-cinema-subtle hover:border-gold/30 hover:text-cinema-text"
      )}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
    >
      {children}
    </motion.button>
  );
}

function CopyCard({
  label, text, id, copied, onCopy, accent, mono = false,
}: {
  label: string; text: string; id: string;
  copied: string | null; onCopy: (text: string, id: string) => void;
  accent: "gold" | "violet" | "cyan" | "rose"; mono?: boolean;
}) {
  const accentColor = { gold: "text-gold border-gold/20 bg-gold/5", violet: "text-violet border-violet/20 bg-violet/5", cyan: "text-cyan border-cyan/20 bg-cyan/5", rose: "text-rose border-rose/20 bg-rose/5" }[accent];
  return (
    <motion.div
      className="group relative overflow-hidden rounded-2xl border border-cinema-border glass p-4 cursor-pointer hover:border-gold/20 transition-all"
      onClick={() => onCopy(text, id)}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className={cn("text-[10px] font-semibold uppercase tracking-wider rounded-full border px-2 py-0.5", accentColor)}>{label}</span>
        <div className={cn("flex items-center gap-1 text-xs transition-colors", copied === id ? "text-emerald-400" : "text-cinema-subtle group-hover:text-cinema-text")}>
          {copied === id ? <CheckCheck className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          <span>{copied === id ? "Copied!" : "Copy"}</span>
        </div>
      </div>
      <p className={cn("text-sm text-cinema-subtle leading-relaxed whitespace-pre-line", mono && "font-mono text-xs")}>{text}</p>
    </motion.div>
  );
}
