import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createAdminClient } from '@/lib/supabase/admin';

// ── Config ────────────────────────────────────────────────────────────────────

export const maxDuration = 300; // 5 min max (requires Vercel Pro). Upgrade to 900 for full 15-min jitter.

const ONLYFANS_ACCOUNT_ID = 'acct_ae1e3f87e19648729a8abbeae19b2ebf';
const MAX_DAILY_POSTS     = 3;
const HISTORY_LIMIT       = 30;
const SIMILARITY_LIMIT    = 0.5; // >50% word overlap = too similar
const MAX_ATTEMPTS        = 5;
const JITTER_MAX_SECONDS  = 270; // Max jitter: 4.5 min (fits within 5-min maxDuration)

// ── Embedded Voice Guide ──────────────────────────────────────────────────────

const VOICE_GUIDE = `# OF Voice Style Guide

Generated: 2026-03-25T11:48:02.932Z
Based on: 42 posts

# Voice Style Guide

**1. Tone: Playful-provocative with a casual, unbothered confidence.** She's flirty but never desperate or try-hard. The energy is "I already know you want this" — teasing, suggestive, and self-assured. She oscillates between girlfriend-next-door warmth (kitchen apron scenario, "good morning" posts) and unapologetically explicit boldness ("Come 👅 this 🐱"). She never over-explains or gets wordy — she drops a line and lets the imagination do the work.

**2. Fan address: "baby," "babes," "beautiful," "darling," and collective "you all/everyone."** She rarely uses "babe" singular or "hun." "Darling" comes out in her more roleplay/fantasy captions. She never uses names. The default is a warm, slightly possessive "you" — as if speaking to one person even when addressing everyone.

**3. Emoji usage is HEAVY and strategic.** Core rotation: 😏 (signature smirk — her #1), 😈, 😜, 🍑, 💦, 👅, 🍆, 🍰, 😉, 💋, ❤️‍🔥, 🖤. She frequently posts emoji-only captions (3-5 emojis as the entire post). Emojis replace explicit words ("I want to 👅 your 🍭"). She uses them at the END of sentences, rarely mid-sentence. Morning posts get ☀️; nighttime gets 🌙 or 🖤.

**4. Sentence structure: Short, punchy, and fragmented.** Most captions are 1-3 sentences max. She loves ellipses (…) to create suspense and implication. Minimal punctuation otherwise — often no periods, occasional deliberate run-on sentences ("Stay close today you'll want to see what drops tonight"). She drops subjects frequently ("Just rolled out of bed," "Woke up thinking about you"). Grammar is intentionally casual — lowercase starts are common, especially in relaxed/morning posts.

**5. Content cadence: Tease → invitation → call to action.** Her selling pattern is: suggestive hook → "DM me" / "tip to find out" / "PPV." She never sounds salesy — CTAs feel like dares or invitations, not transactions. She frames paid content as exclusive access ("something you're not ready for," "a private show," "biggest tipper gets a treat"). She also regularly asks fans what they want to see, making them feel like collaborators.

**6. Energy patterns: Mornings are softer-flirty, evenings are bolder.** Morning = "woke up feeling good," casual check-ins, ☀️ energy, girlfriend vibes. Evening/late night = "wicked little secrets," dares, explicit emoji combos, 😈 energy. Mid-day is when she drops promos, content polls, and personalized offer posts.

**7. Things she NEVER does:**
- Never uses formal language, big vocabulary, or long paragraphs
- Never self-deprecates or sounds insecure
- Never uses explicit *words* in feed captions — she implies with emojis or innuendo (👅🍆🍑 instead of spelling it out)
- Never gets political, negative, or emotionally heavy
- Never begs or pressures ("please subscribe!") — the frame is always *you* wanting *her*
- Never uses hashtags or influencer-speak ("link in bio," "collab," etc.)
- Never breaks the fantasy with logistics or complaints`;

// ── Slot Prompts ──────────────────────────────────────────────────────────────

type Slot = 'morning' | 'afternoon' | 'evening';

function buildPrompt(slot: Slot, recentPosts: string[]): string {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const recentBlock = recentPosts.length > 0
    ? `\n\nRecently posted (DO NOT repeat or closely echo these):\n${recentPosts.map((p, i) => `${i + 1}. ${p}`).join('\n')}`
    : '';

  const slotContext: Record<Slot, string> = {
    morning: `It's morning (8am ET). Write a soft, flirty wake-up post. Girlfriend-next-door energy. ☀️ vibes. She just woke up, feels good, maybe thinking about you. Keep it under 2 sentences or go emoji-only. Lowercase is fine.`,
    afternoon: `It's mid-afternoon (2pm ET). Write a teaser/promo post. This is when she drops polls, personalized offers, or content previews. Hint at something hot dropping today. Could ask fans what they want to see. Tease → CTA ("DM me", "tip to unlock", "only for my top fans").`,
    evening: `It's evening (8pm ET). Write a bold, provocative night post. 😈 energy. This is her wildest slot — dares, explicit emoji combos, hinting at late-night content. Use 🌙 or 🖤. Maximum 2 sentences or emoji-only. She can hint at PPV or a private show.`,
  };

  return `Today is ${today}.

${slotContext[slot]}${recentBlock}

Write ONE post caption only. No explanation, no quotes around it, just the raw caption text.`;
}

// ── Similarity Check ──────────────────────────────────────────────────────────

function wordSet(text: string): Set<string> {
  return new Set(
    text.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(Boolean)
  );
}

function isTooSimilar(newMsg: string, recentMessages: string[]): boolean {
  const newWords = wordSet(newMsg);
  for (const msg of recentMessages) {
    const oldWords = wordSet(msg);
    const smaller  = Math.min(newWords.size, oldWords.size);
    if (smaller === 0) continue;
    let overlap = 0;
    for (const w of newWords) if (oldWords.has(w)) overlap++;
    if (overlap / smaller > SIMILARITY_LIMIT) return true;
  }
  return false;
}

// ── Telegram Notify ───────────────────────────────────────────────────────────

async function sendTelegram(message: string): Promise<void> {
  const token  = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'HTML' }),
  }).catch(() => {}); // best-effort
}

// ── Main Handler ──────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  // 1. Verify Vercel cron secret
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  // 2. Validate slot param
  const slot = req.nextUrl.searchParams.get('slot') as Slot | null;
  if (!slot || !['morning', 'afternoon', 'evening'].includes(slot)) {
    return NextResponse.json({ error: 'Invalid slot. Use: morning, afternoon, evening' }, { status: 400 });
  }

  const supabase = createAdminClient();
  const now      = new Date();

  // 3. Anti-spam: count today's successful posts (UTC day)
  const startOfDay = new Date(now);
  startOfDay.setUTCHours(0, 0, 0, 0);

  const { data: todayPosts, error: countError } = await supabase
    .from('of_post_log')
    .select('id')
    .eq('status', 'success')
    .gte('posted_at', startOfDay.toISOString());

  if (countError) {
    console.error('[CRON] Supabase count error:', countError);
    return NextResponse.json({ error: 'Database error checking post count' }, { status: 500 });
  }

  if ((todayPosts?.length ?? 0) >= MAX_DAILY_POSTS) {
    console.log(`[CRON] Daily limit hit (${todayPosts!.length}/${MAX_DAILY_POSTS}). Skipping.`);
    return NextResponse.json({ skipped: true, reason: 'daily_limit', count: todayPosts!.length }, { status: 429 });
  }

  // 4. Fetch last 30 posts for no-repeat check
  const { data: recentLogs } = await supabase
    .from('of_post_log')
    .select('content')
    .eq('status', 'success')
    .order('posted_at', { ascending: false })
    .limit(HISTORY_LIMIT);

  const recentContents = (recentLogs ?? [])
    .map(r => r.content)
    .filter(Boolean) as string[];

  // 5. Time jitter — random delay before posting
  const jitterMs = Math.floor(Math.random() * JITTER_MAX_SECONDS * 1000);
  console.log(`[CRON] Slot: ${slot} | Jitter: ${Math.round(jitterMs / 1000)}s | Posts today: ${todayPosts?.length ?? 0}/${MAX_DAILY_POSTS}`);
  await new Promise(r => setTimeout(r, jitterMs));

  // 6. Generate post with Claude
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  let message: string | null = null;
  let attempts = 0;

  while (attempts < MAX_ATTEMPTS) {
    attempts++;
    const prompt = buildPrompt(slot, recentContents.slice(0, 5));

    const response = await anthropic.messages.create({
      model:      'claude-sonnet-4-6',
      max_tokens: 200,
      system:     `Write in this voice:\n\n${VOICE_GUIDE}`,
      messages:   [{ role: 'user', content: prompt }],
    });

    const candidate = (response.content[0] as { text: string }).text.trim();

    if (isTooSimilar(candidate, recentContents)) {
      console.log(`[CRON] Attempt ${attempts}: too similar to recent post, retrying…`);
      continue;
    }

    message = candidate;
    break;
  }

  if (!message) {
    const errMsg = `Failed to generate unique content after ${MAX_ATTEMPTS} attempts`;
    await supabase.from('of_post_log').insert({ slot, status: 'error', error: errMsg });
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }

  console.log(`[CRON] Generated (attempt ${attempts}): ${message}`);

  // 7. Post to OnlyFans
  const endpoint = `https://app.onlyfansapi.com/api/${ONLYFANS_ACCOUNT_ID}/posts`;
  let ofResponse: Response;
  let ofBody: string;

  try {
    ofResponse = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.ONLYFANS_API_KEY}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({ text: message }),
    });
    ofBody = await ofResponse.text();
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    await supabase.from('of_post_log').insert({ slot, status: 'error', error: errMsg, content: message });
    await sendTelegram(`❌ OF post FAILED (${slot})\nError: ${errMsg}`);
    return NextResponse.json({ error: 'OnlyFans API request failed', detail: errMsg }, { status: 500 });
  }

  // 8. Handle OF response
  if (!ofResponse.ok) {
    const errMsg = `OF API HTTP ${ofResponse.status}: ${ofBody}`;
    console.error(`[CRON] OF post failed: ${errMsg}`);
    await supabase.from('of_post_log').insert({ slot, status: 'error', error: errMsg, content: message });
    await sendTelegram(`❌ OF post FAILED (${slot})\n${errMsg}`);
    return NextResponse.json({ error: 'OnlyFans API returned error', detail: ofBody, status: ofResponse.status }, { status: 500 });
  }

  let postId = '';
  try { postId = JSON.parse(ofBody)?.id ?? ''; } catch {}

  console.log(`[CRON] SUCCESS — Post ID: ${postId} | Message: ${message}`);

  // 9. Log to Supabase
  await supabase.from('of_post_log').insert({
    slot,
    status:    'success',
    content:   message,
    posted_at: new Date().toISOString(),
  });

  // 10. Telegram notification
  const slotEmoji: Record<Slot, string> = { morning: '☀️', afternoon: '🌤️', evening: '🌙' };
  await sendTelegram(
    `${slotEmoji[slot]} <b>OF post live!</b> [${slot}]\n\n<i>${message}</i>\n\nPost ID: ${postId || 'unknown'}`
  );

  return NextResponse.json({
    success: true,
    slot,
    postId,
    message,
    attemptsNeeded: attempts,
    postsToday: (todayPosts?.length ?? 0) + 1,
  });
}
