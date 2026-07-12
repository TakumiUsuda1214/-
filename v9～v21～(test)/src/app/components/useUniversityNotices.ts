import { useState, useEffect, useCallback } from "react";
import { projectId, publicAnonKey } from "/utils/supabase/info";

export type UniversityNotice = {
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

export type NoticesMeta = {
  last_fetched: string;
  count: number;
};

const BASE = `https://${projectId}.supabase.co/functions/v1/make-server-f1e111bc`;
const ONE_HOUR_MS = 60 * 60 * 1000;
const SESSION_KEY = "asahi_shirase_notices_session_v3";

interface SessionCache {
  meta: NoticesMeta;
  items: UniversityNotice[];
}

function getSessionCache(): SessionCache | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const cache = JSON.parse(raw) as SessionCache;
    if (Date.now() - new Date(cache.meta.last_fetched).getTime() > ONE_HOUR_MS) return null;
    return cache;
  } catch {
    return null;
  }
}

function setSessionCache(meta: NoticesMeta, items: UniversityNotice[]) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ meta, items }));
  } catch { /* ignore */ }
}

function sortByDate(items: UniversityNotice[]): UniversityNotice[] {
  return [...items].sort((a, b) => {
    const ta = a.published_at ? Date.parse(a.published_at) : NaN;
    const tb = b.published_at ? Date.parse(b.published_at) : NaN;
    const va = !Number.isNaN(ta), vb = !Number.isNaN(tb);
    if (va && vb) return tb - ta;
    if (va) return -1;
    if (vb) return 1;
    return 0;
  });
}

const RSS_URL = "https://www.asahi-u.ac.jp/topics/category/shirase/feed/";
const PROXY = (u: string) => `https://corsproxy.io/?${encodeURIComponent(u)}`;

function hashId(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h).toString(36);
}

function parseRss(xml: string, now: string): UniversityNotice[] {
  const out: UniversityNotice[] = [];
  const itemRe = /<item\b[\s\S]*?<\/item>/gi;
  let m: RegExpExecArray | null;
  while ((m = itemRe.exec(xml)) !== null) {
    const block = m[0];
    const getTag = (tag: string) => {
      const r = block.match(new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`, "i"));
      return r ? r[1].trim() : "";
    };
    const title = getTag("title").replace(/<[^>]+>/g, "").trim();
    if (!title || title.length < 3) continue;
    const link = getTag("link") || getTag("guid");
    if (!link || !link.includes("asahi-u.ac.jp")) continue;
    const pubDate = getTag("pubDate");
    let publishedAt: string | null = null;
    if (pubDate) {
      const t = Date.parse(pubDate);
      if (!Number.isNaN(t)) {
        const d = new Date(t);
        publishedAt = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
      }
    }
    out.push({ id: hashId(link), title, published_at: publishedAt, category: null, article_url: link.trim(), thumbnail_url: null, excerpt: null, source_name: "朝日大学公式サイト", fetched_at: now, is_visible: true });
  }
  return out;
}

async function scrapeViaProxy(): Promise<UniversityNotice[]> {
  const now = new Date().toISOString();
  const bustUrl = `${RSS_URL}?_=${Date.now()}`;
  const res = await fetch(PROXY(bustUrl), { cache: "no-store" });
  if (!res.ok) throw new Error(`proxy HTTP ${res.status}`);
  const xml = await res.text();
  if (!xml || !/<item/i.test(xml)) throw new Error("no RSS items in response");
  const items = parseRss(xml, now);
  if (items.length === 0) throw new Error("0 items parsed from RSS");
  console.log(`RSS: ${items.length} items, newest: ${items[0]?.published_at}`);
  return items;
}

async function apiFetchSafe(path: string, method = "GET") {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { Authorization: `Bearer ${publicAnonKey}` },
    cache: "no-store",
  });
  return res.json().catch(() => ({ error: `HTTP ${res.status} (non-JSON)` }));
}

export function useUniversityNotices() {
  const [notices, setNotices] = useState<UniversityNotice[]>([]);
  const [meta, setMeta] = useState<NoticesMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const applyData = useCallback((items: UniversityNotice[], m: NoticesMeta) => {
    const visible = sortByDate(items.filter((n) => n.is_visible));
    setNotices(visible);
    setMeta(m);
    setSessionCache(m, visible);
  }, []);

  const doSync = useCallback(async (): Promise<boolean> => {
    setSyncing(true);
    try {
      // Primary: browser-side scrape via CORS proxy (always latest code).
      try {
        const items = await scrapeViaProxy();
        if (items.length > 0) {
          applyData(items, { last_fetched: new Date().toISOString(), count: items.length });
          setError(null);
          return true;
        }
      } catch (_) { /* fall through to backend */ }

      // Fallback: backend sync endpoint.
      const result = await apiFetchSafe("/notices/sync", "POST");
      if (result.error) { setError(result.error); return false; }
      if (result.items && result.meta) {
        applyData(result.items, result.meta);
        setError(null);
        return true;
      }
      setError("お知らせを取得できませんでした");
      return false;
    } catch (e) {
      setError(String(e));
      return false;
    } finally {
      setSyncing(false);
    }
  }, [applyData]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        // Show cached items instantly while fresh data loads in background.
        // But never show cache older than 30 minutes — force a fresh scrape.
        const cached = getSessionCache();
        const cacheAge = cached ? Date.now() - new Date(cached.meta.last_fetched).getTime() : Infinity;
        if (cached && cacheAge < 30 * 60 * 1000 && !cancelled) {
          setNotices(cached.items);
          setMeta(cached.meta);
          setLoading(false);
        }
        // Always sync to get latest — overwrites cache on success.
        if (!cancelled) await doSync();
      } catch (e) {
        if (!cancelled) setError(String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  const manualRefresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try { sessionStorage.removeItem(SESSION_KEY); } catch { /* ignore */ }
    await doSync();
    setLoading(false);
  }, [doSync]);

  return { notices, meta, loading, syncing, error, manualRefresh };
}
