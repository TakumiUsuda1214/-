import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";

const app = new Hono();

app.use('*', logger(console.log));

// Never let any cache layer serve a stale function response.
app.use('*', async (c, next) => {
  await next();
  c.header('Cache-Control', 'no-store, no-cache, must-revalidate');
});

app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

app.get("/make-server-f1e111bc/health", (c) => {
  return c.json({ status: "ok" });
});
app.get("/make-server-f1e111bc/version", (c) => {
  return c.json({
    version: "shirase-rss-feed-2026-06-29",
    newsUrl: NEWS_URL,
  });
});

// ─── Types ───────────────────────────────────────────────────────
type Notice = {
  id: string;
  title: string;
  published_at: string | null;
  category: string | null;
  article_url: string;
  thumbnail_url: string | null;
  excerpt: string | null;
  source_name: string;
  fetched_at: string;
  is_visible: boolean;
};

type NoticesMeta = {
  last_fetched: string;
  count: number;
};

const KV_META_KEY = "asahi_shirase_notices_meta";
const KV_ITEMS_KEY = "asahi_shirase_notices_items";
const NEWS_URL = "https://www.asahi-u.ac.jp/topics/category/shirase/";
const NEWS_BASE = "https://www.asahi-u.ac.jp";
// RSS/Atom feeds are server-rendered (no JS) and ordered newest-first, so
// they are the most reliable source for the latest articles. The HTML page
// often loads most of its list client-side, leaving only a few cards in the
// initial markup. We try these candidate feed URLs in addition to the HTML.
const FEED_URLS = [
  "https://www.asahi-u.ac.jp/topics/category/shirase/feed/",
  "https://www.asahi-u.ac.jp/topics/category/shirase/feed",
  "https://www.asahi-u.ac.jp/feed/",
];

// Placeholder/UI images to skip
const SKIP_IMAGES = [
  "ph-topic_noimg",
  "arw-right-blue-circle",
  "arw-right",
  "1x1",
  "spacer",
  "blank",
];

function simpleHash(str: string): string {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h).toString(36);
}

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
}

function makeAbsolute(src: string): string {
  if (!src) return "";
  src = src.trim();
  if (src.startsWith("http")) return src;
  if (src.startsWith("//")) return "https:" + src;
  if (src.startsWith("/")) return NEWS_BASE + src;
  return NEWS_BASE + "/" + src;
}

function normalizeDate(raw: string): string {
  // "2026.6.16" → "2026-06-16"
  const m = raw.match(/(\d{4})[.\-\/年](\d{1,2})[.\-\/月](\d{1,2})/);
  if (m) return `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`;
  return raw.trim();
}

function getAttr(tag: string, name: string): string {
  const m = tag.match(new RegExp(`\\b${name}=["']([^"']*?)["']`, "i"));
  return m ? m[1] : "";
}

const BROWSER_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "ja,en-US;q=0.9,en;q=0.8",
};

function decodeEntities(s: string): string {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .trim();
}

// Parse an RSS 2.0 / Atom feed into Notices. Returns [] if it doesn't look
// like a feed (e.g. an HTML 404 page was returned for a guessed URL).
function parseFeedXml(xml: string, now: string): Notice[] {
  const out: Notice[] = [];
  if (!/<rss|<feed|<channel|<item|<entry/i.test(xml)) return out;

  // RSS <item> and Atom <entry> both supported.
  const itemRe = /<(item|entry)\b[\s\S]*?<\/\1>/gi;
  let m: RegExpExecArray | null;
  while ((m = itemRe.exec(xml)) !== null) {
    const block = m[0];

    const titleM = block.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
    const title = titleM ? decodeEntities(stripTags(titleM[1])) : "";
    if (!title || title.length < 3) continue;

    // RSS uses <link>url</link>; Atom uses <link href="url"/>
    let link = "";
    const linkText = block.match(/<link\b[^>]*>([\s\S]*?)<\/link>/i);
    if (linkText && linkText[1].trim()) link = decodeEntities(linkText[1]);
    if (!link) {
      const linkHref = block.match(/<link\b[^>]*href=["']([^"']+)["']/i);
      if (linkHref) link = decodeEntities(linkHref[1]);
    }
    const articleUrl = makeAbsolute(link);
    if (!articleUrl.includes("asahi-u.ac.jp")) continue;

    // Date: <pubDate> (RSS, RFC822) or <updated>/<published> (Atom, ISO8601)
    let publishedAt: string | null = null;
    const dateM = block.match(/<(?:pubDate|published|updated|dc:date)\b[^>]*>([\s\S]*?)<\/(?:pubDate|published|updated|dc:date)>/i);
    if (dateM) {
      const t = Date.parse(decodeEntities(dateM[1]));
      if (!Number.isNaN(t)) {
        const d = new Date(t);
        publishedAt = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
      }
    }

    const catM = block.match(/<category\b[^>]*>([\s\S]*?)<\/category>/i);
    const category = catM ? decodeEntities(stripTags(catM[1])) || null : null;

    // Thumbnail from content:encoded or description HTML
    let thumbnailUrl: string | null = null;
    const contentM = block.match(/<(?:content:encoded|content|description)\b[^>]*>([\s\S]*?)<\/(?:content:encoded|content|description)>/i);
    if (contentM) {
      const imgM = decodeEntities(contentM[1]).match(/<img\b[^>]*src=["']([^"']+)["']/i);
      if (imgM && !SKIP_IMAGES.some((s) => imgM[1].includes(s))) thumbnailUrl = makeAbsolute(imgM[1]);
    }

    out.push({
      id: simpleHash(articleUrl),
      title,
      published_at: publishedAt,
      category,
      article_url: articleUrl,
      thumbnail_url: thumbnailUrl,
      excerpt: null,
      source_name: "朝日大学公式サイト",
      fetched_at: now,
      is_visible: true,
    });
  }
  return out;
}

// ─── Asahi University scraper ─────────────────────────────────────
// HTML structure (confirmed):
//   <div class="topicCard hoverOpac">
//     <a href="https://www.asahi-u.ac.jp/topics/2026/XXXXX/">
//       <div class="topicImg"><img src="..." alt="タイトル" /></div>
//       <div class="topicTxt font14 whitebg">
//         <p class="font14">タイトル</p>
//         <div class="topicTxtBtm flex justsb">
//           <p class="notoserif font12">2026.6.16</p>
//         </div>
//       </div>
//     </a>
//   </div>
//
// Also: <ul class="news_list"> with <li> rows for older list-style entries
async function scrapeNotices(): Promise<Notice[]> {
  const now = new Date().toISOString();
  const notices: Notice[] = [];
  const seen = new Set<string>();

  // ── Source 1: RSS/Atom feed (newest-first, no JS) ─────────────
  for (const feedUrl of FEED_URLS) {
    try {
      const fres = await fetch(feedUrl, { headers: BROWSER_HEADERS });
      if (!fres.ok) {
        console.log(`Feed ${feedUrl} → HTTP ${fres.status}`);
        continue;
      }
      const xml = await fres.text();
      const feedItems = parseFeedXml(xml, now);
      console.log(`Feed ${feedUrl} → ${feedItems.length} items`);
      for (const n of feedItems) {
        if (seen.has(n.article_url)) continue;
        seen.add(n.article_url);
        notices.push(n);
      }
      // The category-specific feed is authoritative; stop once it yields items.
      if (feedItems.length > 0 && feedUrl.includes("/shirase/")) break;
    } catch (e) {
      console.log(`Feed ${feedUrl} failed: ${String(e)}`);
    }
  }
  console.log(`After feeds: ${notices.length} notices`);

  // ── Source 2: HTML page link scan (supplements the feed) ──────
  console.log("Fetching HTML:", NEWS_URL);
  let html = "";
  try {
    const res = await fetch(NEWS_URL, { headers: BROWSER_HEADERS });
    if (res.ok) {
      html = await res.text();
      console.log(`HTML fetched: ${html.length} bytes`);
    } else {
      console.log(`HTML fetch → HTTP ${res.status}`);
    }
  } catch (e) {
    console.log(`HTML fetch failed: ${String(e)}`);
  }
  // If the feed already gave us articles, the HTML is optional.
  if (!html && notices.length === 0) {
    throw new Error("Could not fetch notices from feed or HTML page");
  }

  // ── Link-based scan (markup-agnostic) ─────────────────────────
  // Instead of depending on a specific wrapper class (topicCard /
  // news_list), find EVERY anchor that points at a dated topic article
  // ("/topics/YYYY/...."). For each anchor we look at a context window
  // (the anchor's inner HTML plus a bit of the markup that follows it,
  // since the date is sometimes a sibling rendered after the <a>).
  // This way newer articles are captured regardless of their wrapper.
  const anchorRe = /<a\b[^>]*href=["']([^"']*\/topics\/[^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let aMatch: RegExpExecArray | null;
  while ((aMatch = anchorRe.exec(html)) !== null) {
    const href = aMatch[1];
    const inner = aMatch[2];
    const articleUrl = makeAbsolute(href);
    if (!articleUrl.includes("asahi-u.ac.jp/topics/")) continue;
    // Skip listing / category / pagination links — keep only article pages.
    if (/\/topics\/category\//i.test(articleUrl)) continue;
    if (/\/topics\/?(\?|#|$)/i.test(articleUrl)) continue;
    if (/[?&]paged?=/i.test(articleUrl)) continue;
    if (seen.has(articleUrl)) continue;

    // Context window: inner HTML + up to 300 chars following the anchor
    // (catches dates rendered as a sibling element after </a>).
    const after = html.slice(anchorRe.lastIndex, anchorRe.lastIndex + 300);
    const ctx = inner + " " + after;

    // Title: <p class="font14"> → img alt → plain link text
    let title = "";
    const pFont14 = inner.match(/<p\b[^>]*class=["'][^"']*font14[^"']*["'][^>]*>([\s\S]*?)<\/p>/i);
    if (pFont14) title = stripTags(pFont14[1]);
    if (!title) {
      const imgMatch = inner.match(/<img\b[^>]*>/i);
      if (imgMatch) title = getAttr(imgMatch[0], "alt");
    }
    if (!title) title = stripTags(inner);
    if (!title || title.length < 3) continue;

    // Date: prefer the date INSIDE the anchor (notoserif <p>, then any
    // YYYY.M.D within the anchor). Only fall back to the trailing window
    // if nothing was found inside, to avoid grabbing the next article's date.
    let publishedAt: string | null = null;
    const dateEl = inner.match(/<p\b[^>]*class=["'][^"']*notoserif[^"']*["'][^>]*>([\s\S]*?)<\/p>/i);
    if (dateEl) {
      const raw = stripTags(dateEl[1]);
      if (raw) publishedAt = normalizeDate(raw);
    }
    if (!publishedAt) {
      const innerDate = inner.match(/(\d{4})[.\-\/年](\d{1,2})[.\-\/月](\d{1,2})/);
      if (innerDate) publishedAt = `${innerDate[1]}-${innerDate[2].padStart(2, "0")}-${innerDate[3].padStart(2, "0")}`;
    }
    if (!publishedAt) {
      const afterDate = after.match(/(\d{4})[.\-\/年](\d{1,2})[.\-\/月](\d{1,2})/);
      if (afterDate) publishedAt = `${afterDate[1]}-${afterDate[2].padStart(2, "0")}-${afterDate[3].padStart(2, "0")}`;
    }

    // Thumbnail: first non-placeholder img inside the anchor
    let thumbnailUrl: string | null = null;
    const imgTags = inner.match(/<img\b[^>]*>/gi) || [];
    for (const imgTag of imgTags) {
      const src = getAttr(imgTag, "src") || getAttr(imgTag, "data-src") || getAttr(imgTag, "data-lazy-src");
      if (!src) continue;
      if (SKIP_IMAGES.some((s) => src.includes(s))) continue;
      thumbnailUrl = makeAbsolute(src);
      break;
    }

    // Category: optional label element
    let category: string | null = null;
    const catMatch = ctx.match(/<(?:span|p|div)\b[^>]*class=["'][^"']*(?:cat|category|tag|label|genre)[^"']*["'][^>]*>([\s\S]*?)<\/(?:span|p|div)>/i);
    if (catMatch) {
      const c = stripTags(catMatch[1]).trim();
      if (c && c.length > 0 && c.length < 30) category = c;
    }

    seen.add(articleUrl);
    notices.push({
      id: simpleHash(articleUrl),
      title,
      published_at: publishedAt,
      category,
      article_url: articleUrl,
      thumbnail_url: thumbnailUrl,
      excerpt: null,
      source_name: "朝日大学公式サイト",
      fetched_at: now,
      is_visible: true,
    });
  }

  console.log(`Link scan: ${notices.length} article anchors captured`);

  // ── Sort by published date, newest first ───────────────────────
  // The page can interleave a "pickup/featured" card with the regular
  // list, so DOM order is not reliable. Sort explicitly by date desc.
  // Notices without a parseable date go last.
  notices.sort((a, b) => {
    const ta = a.published_at ? Date.parse(a.published_at) : NaN;
    const tb = b.published_at ? Date.parse(b.published_at) : NaN;
    const aValid = !Number.isNaN(ta);
    const bValid = !Number.isNaN(tb);
    if (aValid && bValid) return tb - ta;
    if (aValid) return -1;
    if (bValid) return 1;
    return 0;
  });

  console.log(`Total unique notices scraped: ${notices.length} (sorted newest first)`);
  return notices;
}

// ─── GET /notices ─────────────────────────────────────────────────
// Tries KV first; falls back to empty (never returns 500)
app.get("/make-server-f1e111bc/notices", async (c) => {
  try {
    const [meta, items] = await Promise.all([
      kv.get(KV_META_KEY),
      kv.get(KV_ITEMS_KEY),
    ]);
    return c.json({ meta: meta ?? null, items: items ?? [], kvOk: true });
  } catch (e) {
    console.log("KV read unavailable, returning empty:", String(e));
    return c.json({ meta: null, items: [], kvOk: false, kvError: String(e) });
  }
});

// ─── POST /notices/sync ───────────────────────────────────────────
// Scrapes Asahi University site and ALWAYS returns the data in the response body.
// Also attempts to cache in KV (but never fails the request if KV is unavailable).
app.post("/make-server-f1e111bc/notices/sync", async (c) => {
  try {
    const freshNotices = await scrapeNotices();
    console.log(`Scraped ${freshNotices.length} notices`);

    const meta: NoticesMeta = {
      last_fetched: new Date().toISOString(),
      count: freshNotices.length,
    };

    // Try KV write — ignore errors
    let kvSaved = false;
    try {
      let existing: Notice[] = [];
      try { existing = (await kv.get(KV_ITEMS_KEY)) ?? []; } catch (_) { /* ignore */ }

      const existingMap = new Map<string, Notice>(existing.map((n) => [n.article_url, n]));
      for (const n of freshNotices) {
        const prev = existingMap.get(n.article_url);
        existingMap.set(n.article_url, { ...n, is_visible: prev?.is_visible ?? true });
      }
      const merged = freshNotices;
      await kv.mset([KV_META_KEY, KV_ITEMS_KEY], [
        { last_fetched: meta.last_fetched, count: merged.length },
        merged,
      ]);
      kvSaved = true;
      console.log("KV write success");
    } catch (kvErr) {
      console.log("KV write skipped (permission issue):", String(kvErr));
    }

    // Always return scraped data directly in response
    return c.json({
      success: true,
      kvSaved,
      meta,
      items: freshNotices,
    });
  } catch (e) {
    console.log("Sync error:", e);
    // Return 200 with error detail so frontend can display it
    return c.json({ success: false, error: String(e), items: [], meta: null });
  }
});

// ─── GET /notices/debug ───────────────────────────────────────────
app.get("/make-server-f1e111bc/notices/debug", async (c) => {
  try {
    const res = await fetch(NEWS_URL, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "ja,en-US;q=0.9",
      },
    });
    const html = await res.text();
    const sections = html.split(/<div\b[^>]*class=["'][^"']*topicCard[^"']*["'][^>]*>/i);

    // Probe each candidate feed URL.
    const feedProbe: Array<{ url: string; status: number | string; items: number; sample: string }> = [];
    for (const feedUrl of FEED_URLS) {
      try {
        const fr = await fetch(feedUrl, { headers: BROWSER_HEADERS });
        const xml = await fr.text();
        feedProbe.push({
          url: feedUrl,
          status: fr.status,
          items: parseFeedXml(xml, new Date().toISOString()).length,
          sample: xml.slice(0, 200),
        });
      } catch (e) {
        feedProbe.push({ url: feedUrl, status: String(e), items: 0, sample: "" });
      }
    }

    const scraped = await scrapeNotices();
    return c.json({
      version: "shirase-rss-feed-2026-06-29",
      status: res.status,
      htmlLength: html.length,
      topicCardCount: sections.length - 1,
      topicAnchorCount: (html.match(/<a\b[^>]*href=["'][^"']*\/topics\/[^"']*["']/gi) || []).length,
      feedProbe,
      scrapedCount: scraped.length,
      scraped: scraped.slice(0, 10).map((n) => ({
        title: n.title,
        published_at: n.published_at,
        url: n.article_url,
      })),
      firstCard: sections[1]?.slice(0, 800) ?? null,
    });
  } catch (e) {
    return c.json({ error: String(e) }, 500);
  }
});

// ─── GET /diag2 ───────────────────────────────────────────────────
// Brand-new path (never cached) to bypass any path-keyed edge cache and
// prove which code is live. Returns rich structure info about the page.
app.get("/make-server-f1e111bc/diag2", async (c) => {
  try {
    let html = "";
    let httpStatus: number | string = "n/a";
    try {
      const res = await fetch(NEWS_URL, { headers: BROWSER_HEADERS });
      httpStatus = res.status;
      html = await res.text();
    } catch (e) {
      httpStatus = String(e);
    }

    // All /topics/ anchors in the static HTML, with their hrefs.
    const anchorHrefs: string[] = [];
    const aRe = /<a\b[^>]*href=["']([^"']*\/topics\/[^"']*)["'][^>]*>/gi;
    let am: RegExpExecArray | null;
    while ((am = aRe.exec(html)) !== null) anchorHrefs.push(am[1]);

    // All YYYY.M.D / YYYY-M-D date strings found anywhere in the HTML.
    const dates = (html.match(/\d{4}[.\-\/年]\d{1,2}[.\-\/月]\d{1,2}/g) || []).slice(0, 20);

    // Probe feeds.
    const feedProbe: Array<{ url: string; status: number | string; items: number; head: string }> = [];
    for (const feedUrl of FEED_URLS) {
      try {
        const fr = await fetch(feedUrl, { headers: BROWSER_HEADERS });
        const xml = await fr.text();
        feedProbe.push({ url: feedUrl, status: fr.status, items: parseFeedXml(xml, new Date().toISOString()).length, head: xml.slice(0, 120) });
      } catch (e) {
        feedProbe.push({ url: feedUrl, status: String(e), items: 0, head: "" });
      }
    }

    const scraped = await scrapeNotices();

    return c.json({
      version: "shirase-rss-feed-2026-06-29",
      httpStatus,
      htmlLength: html.length,
      topicAnchorCount: anchorHrefs.length,
      anchorHrefsSample: anchorHrefs.slice(0, 25),
      datesSample: dates,
      feedProbe,
      scrapedCount: scraped.length,
      scraped: scraped.slice(0, 12).map((n) => ({ d: n.published_at, t: n.title, u: n.article_url })),
    });
  } catch (e) {
    return c.json({ version: "shirase-rss-feed-2026-06-29", fatal: String(e) }, 200);
  }
});

Deno.serve(app.fetch);
