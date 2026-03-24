"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/shared/PageTransition";
import { GENRES, PLATFORMS } from "@/lib/constants";
import {
  TrendingUp, Flame, Lightbulb, Hash, Globe, Video, MessageCircle, Star,
  BookOpen, Clock, Copy, CheckCheck, Maximize2, FileVideo, Zap, Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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
  { genre: "music_video", platform: "instagram", title: "Use Reels for Teasers", content: "Drop 15–30 second teaser clips from your music video as Reels. Use trending audio underneath for double exposure. Post 3–5 days before the full release.", isTrending: true, category: "strategy" },
  { genre: "music_video", platform: "tiktok", title: "Behind-the-Scenes Content", content: "BTS content gets 3× more engagement than polished clips. Show the raw moments — setting up lights, rehearsals, bloopers. Authenticity wins on TikTok.", isTrending: true, category: "strategy" },
  { genre: "music_video", platform: "youtube", title: "Use YouTube Premiere", content: "Schedule a Premiere 48 hours ahead, share the countdown link everywhere, and engage in the live chat during the drop. Premieres boost early algorithmic lift.", isTrending: false, category: "strategy" },
  { genre: "music_video", platform: "tiktok", title: "The 3-Second Rule", content: "Your video's first 3 seconds decide whether people scroll. Start mid-action — don't fade in, don't show your logo, don't open with silence.", isTrending: true, category: "hook" },
  { genre: "music_video", platform: "instagram", title: "Lyric Graphic Carousels", content: "Pull 5–7 standout lyrics and design them as swipeable slides. These get saved and shared — saves signal Instagram to push your content further.", isTrending: false, category: "growth" },
  { genre: "music_video", platform: "youtube", title: "Add Chapters to Every Video", content: "YouTube chapters (using timestamps in the description) boost search visibility and watch time. Label them: Intro, Verse 1, Chorus, Bridge, etc.", isTrending: false, category: "strategy" },
  { genre: "music_video", platform: "tiktok", title: "Stitch Challenge Hook", content: "End your teaser with an open question or incomplete moment — invite people to stitch or duet. Participation content multiplies your reach exponentially.", isTrending: true, category: "growth" },
  { genre: "music_video", platform: "instagram", title: "Caption the First Sentence Only", content: "Your Instagram caption shows the first line before 'more'. Make it the hook — a bold statement, a number, or a question. The rest can be the story.", isTrending: false, category: "captions" },

  // Commercial
  { genre: "commercial", platform: "instagram", title: "Carousel Breakdowns", content: "Turn your commercial into a 5-slide carousel: Hook → Problem → Solution → Social Proof → CTA. Carousels get 1.4× more reach than single images.", isTrending: true, category: "strategy" },
  { genre: "commercial", platform: "tiktok", title: "Hook in 0.5 Seconds", content: "Your first half-second determines everything. Start with motion, a bold visual, or a provocative question. Never open with a logo or slow fade-in.", isTrending: false, category: "hook" },
  { genre: "commercial", platform: "youtube", title: "5-Second Skip Rule", content: "YouTube ads let viewers skip after 5 seconds. Put your brand message and hook in the first 4 seconds — treat the rest as a bonus for engaged viewers.", isTrending: false, category: "strategy" },
  { genre: "commercial", platform: "instagram", title: "Use Text Overlays", content: "85% of Instagram videos are watched without sound. Add bold text overlays that tell the story silently. Captions = free reach with hearing-impaired audiences too.", isTrending: true, category: "captions" },
  { genre: "commercial", platform: "tiktok", title: "UGC-Style Ads Outperform", content: "Ads that look like organic user content outperform polished commercials by 4× on TikTok. Hold your phone, speak directly to camera, be conversational.", isTrending: true, category: "strategy" },
  { genre: "commercial", platform: "facebook", title: "Lead with the Problem", content: "Facebook ad copy that opens with the viewer's pain point ('Tired of...') stops the scroll. The solution is your commercial. Let it sell itself.", isTrending: false, category: "hook" },

  // Wedding
  { genre: "wedding", platform: "instagram", title: "Tag Every Vendor", content: "Always tag the venue, florist, DJ, photographer, and planner. They'll reshare to their audiences — one wedding video can reach 10+ business accounts.", isTrending: false, category: "growth" },
  { genre: "wedding", platform: "tiktok", title: "First Look Reactions", content: "First look and vow reaction clips are the #1 wedding content on TikTok. Keep them under 30 seconds with emotional music. These go viral consistently.", isTrending: true, category: "strategy" },
  { genre: "wedding", platform: "instagram", title: "Reels for the Highlight", content: "Post a 60-second Reel highlight within 24 hours of delivery. Use a trending audio track with emotional pull. Caption: tag the couple and venue.", isTrending: true, category: "timing" },
  { genre: "wedding", platform: "youtube", title: "Full Film as Unlisted", content: "Upload the full wedding film as unlisted and share the link privately with the couple. They'll share it with family — building your referral network organically.", isTrending: false, category: "strategy" },
  { genre: "wedding", platform: "tiktok", title: "Getting Ready Montage", content: "Compile 8–10 getting-ready moments into a 20-second montage. Set to a trending sound. This format is consistently high-performing for wedding content.", isTrending: false, category: "strategy" },

  // Documentary
  { genre: "documentary", platform: "youtube", title: "Long-Form Thrives Here", content: "YouTube rewards watch time. Release a 3-minute trailer, then the full documentary. Add chapters, timestamps, and a keyword-rich description.", isTrending: false, category: "strategy" },
  { genre: "documentary", platform: "instagram", title: "Micro-Clip Series", content: "Break your documentary into 60-second Reels as a numbered series. 'Part 1 of 5' creates a return audience and drives profile visits between releases.", isTrending: true, category: "growth" },
  { genre: "documentary", platform: "tiktok", title: "Pose the Big Question First", content: "Open with the documentary's central question or the most shocking moment. Then cut. 'Full story on YouTube' in the caption drives cross-platform traffic.", isTrending: true, category: "hook" },
  { genre: "documentary", platform: "youtube", title: "Community Posts Between Drops", content: "Use YouTube Community posts between episodes to share behind-the-scenes stills, polls ('What did you think of episode 2?'), and sneak peeks. Keeps subscribers warm.", isTrending: false, category: "growth" },

  // Social Content
  { genre: "social_content", platform: "instagram", title: "Post at Peak Hours", content: "For maximum reach, post Reels between 7–9 AM and 7–9 PM on weekdays. Tuesday through Thursday consistently show the highest engagement rates.", isTrending: true, category: "timing" },
  { genre: "social_content", platform: "tiktok", title: "Trending Sound Strategy", content: "Use trending sounds within 48 hours of them peaking. The algorithm boosts early adopters. Save sounds as soon as you spot them gaining traction.", isTrending: true, category: "timing" },
  { genre: "social_content", platform: "instagram", title: "Batch and Schedule", content: "Film 5–10 pieces of content in one session and schedule them across 2 weeks. Consistency matters more than volume — 3 posts/week outperforms 10 then nothing.", isTrending: false, category: "strategy" },
  { genre: "social_content", platform: "tiktok", title: "Reply to Comments with Video", content: "TikTok's 'Reply with Video' feature is underused. Reply to a top comment with a video response — TikTok often gives these algorithmic boosts.", isTrending: true, category: "growth" },
  { genre: "social_content", platform: "youtube", title: "Shorts Feed Full Videos", content: "Post a YouTube Short teaser of your long-form video. Include 'Full video on my channel' in the caption. Shorts-to-long-form is the best subscriber funnel right now.", isTrending: true, category: "growth" },

  // Event
  { genre: "event", platform: "instagram", title: "Real-Time Stories", content: "Post Stories throughout the event in real-time. Use polls, questions, and countdown stickers. Save the best moments to a Highlight reel after.", isTrending: false, category: "strategy" },
  { genre: "event", platform: "tiktok", title: "Crowd Energy Clips", content: "Shoot 10-second crowd reaction clips throughout the event. Stack 4–5 together with punchy music. Energy is contagious — these get shared by attendees.", isTrending: true, category: "strategy" },
  { genre: "event", platform: "instagram", title: "Tag the Brand and Venue", content: "Tag the event organizer, venue, and any brands present. Branded events often reshare vendor content — free distribution to their established audience.", isTrending: false, category: "growth" },
  { genre: "event", platform: "youtube", title: "Recap Video = Long-Term Traffic", content: "Event recap videos rank in search for years. Optimize the title: '[Event Name] [Year] — Full Recap'. Use the description to list speakers, performers, and highlights.", isTrending: false, category: "strategy" },

  // Corporate
  { genre: "corporate", platform: "youtube", title: "Thought Leadership Series", content: "Create a recurring series with exec interviews or industry insights. Consistency builds subscribers. Aim for bi-weekly uploads minimum.", isTrending: false, category: "strategy" },
  { genre: "corporate", platform: "linkedin", title: "Native Video Outperforms Links", content: "Upload your corporate video directly to LinkedIn — don't share a YouTube link. Native videos get 5× more reach. Keep them under 2 minutes for best completion rates.", isTrending: true, category: "strategy" },
  { genre: "corporate", platform: "instagram", title: "Employee Spotlight Reels", content: "Short employee story videos (30–60 sec) consistently outperform product content for corporate brands. Human faces build trust and boost organic reach.", isTrending: true, category: "strategy" },
  { genre: "corporate", platform: "twitter", title: "Thread the Key Takeaways", content: "After publishing your corporate video, write a Twitter/X thread pulling out 5 key insights from it. Each tweet links back to the full video at the end.", isTrending: false, category: "captions" },
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
  { key: "playbook", label: "Playbook", icon: BookOpen },
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
