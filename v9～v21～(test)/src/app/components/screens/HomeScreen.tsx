import { useState, useEffect, useRef } from "react";
import { AppHeader } from "../AppHeader";
import { useApp } from "../../AppContext";
import { t } from "../../i18n";
import { NOTICES, ASSIGNMENTS, SCHEDULE, CLUBS } from "../../data";
import { AlertCircle, Calendar, ChevronRight, ChevronDown, ChevronUp, QrCode, Clock, Pencil, RefreshCw, ExternalLink, Newspaper, Utensils } from "lucide-react";
import { useUniversityNotices, UniversityNotice } from "../useUniversityNotices";

const OFFICIAL_NEWS_URL = "https://www.asahi-u.ac.jp/topics/category/shirase/";
const DISPLAY_COUNT = 3;

export function HomeScreen() {
  const { lang, setModal, cancellations, setTab, customSchedule, collapsed, toggleCollapsed, setUniversityNoticesBadge } = useApp();
  const { notices, meta, loading: noticesLoading, syncing, error: noticesError, manualRefresh } = useUniversityNotices();

  useEffect(() => {
    if (notices.length > 0) {
      // Only set the badge if it hasn't been cleared by the user yet this session.
      // We detect "cleared" by checking sessionStorage: when the notifications modal
      // opens it calls setUniversityNoticesBadge(0), which writes "0" to storage.
      // If the stored value is already "0" we don't re-set it on remount.
      const stored = sessionStorage.getItem("univ_badge");
      if (stored !== "0") {
        setUniversityNoticesBadge(notices.length);
      }
    }
  }, [notices.length]);

  const upcomingAssignments = ASSIGNMENTS.filter((a) => a.status === "notSubmitted").slice(0, 2);
  const todayCancel = cancellations.filter((c) => c.date === "06/04");

  const toggle = toggleCollapsed;
  const allSchedule = [...SCHEDULE, ...customSchedule].sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="pb-24">
      <AppHeader />

      <div className="px-5 mt-4">
        <button
          onClick={() => setModal({ kind: "qr" })}
          className="w-full bg-gradient-to-r from-[#4338ca] to-[#7c3aed] text-white rounded-2xl px-4 py-3 flex items-center gap-3 active:scale-[0.99] transition"
        >
          <div className="size-10 rounded-xl bg-white/20 flex items-center justify-center">
            <QrCode size={20} />
          </div>
          <div className="flex-1 text-left">
            <div className="text-sm">{t("studentIdQR", lang)}</div>
            <div className="text-xs opacity-80 mt-0.5">{t("qrDesc", lang)}</div>
          </div>
          <ChevronRight size={16} className="opacity-70" />
        </button>
      </div>

      <UniversityNoticesSection
        notices={notices}
        meta={meta}
        loading={noticesLoading}
        syncing={syncing}
        error={noticesError}
        collapsed={collapsed["universityNotices"]}
        onToggle={() => toggle("universityNotices")}
        onRefresh={manualRefresh}
        onOpenConfirm={() => setModal({ kind: "confirmOfficialSite" })}
      />

      <Section id="notices" title={t("importantNotice", lang)} badge={NOTICES.length} color="rose"
        collapsed={collapsed["notices"]} onToggle={() => toggle("notices")} onDetail={() => setModal({ kind: "noticesList" })}>
        <div className="space-y-2">
          {NOTICES.map((n) => (
            <button key={n.id} onClick={() => setModal({ kind: "notice", id: n.id })}
              className="w-full text-left bg-white rounded-2xl p-3.5 border border-slate-100 active:scale-[0.99] transition flex items-start gap-3">
              <span className={`mt-0.5 size-7 rounded-lg flex items-center justify-center shrink-0 ${
                n.tag === "important" ? "bg-rose-50 text-rose-500" : n.tag === "warn" ? "bg-amber-50 text-amber-500" : "bg-sky-50 text-sky-600"}`}>
                <AlertCircle size={15} />
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-slate-800 leading-snug">{n.titleI18n[lang]}</div>
                <div className="text-xs text-slate-400 mt-0.5">{n.date}</div>
              </div>
              <ChevronRight size={15} className="text-slate-300 mt-0.5 shrink-0" />
            </button>
          ))}
        </div>
      </Section>

      {todayCancel.length > 0 && (
        <Section id="cancel" title={t("classCancellation", lang)} badge={todayCancel.length} color="amber"
          collapsed={collapsed["cancel"]} onToggle={() => toggle("cancel")} onDetail={() => setModal({ kind: "cancellations" })}>
          <div className="space-y-2">
            {todayCancel.map((c) => (
              <div key={c.id} className={`bg-white rounded-2xl p-3.5 border border-slate-100 ${c.read ? "opacity-60" : ""}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-50 text-rose-600">{t("cancelled", lang)}</span>
                  <span className="text-xs text-slate-500">{c.date} · {c.period}限</span>
                </div>
                <div className="text-sm text-slate-800">{c.course[lang]}</div>
                <div className="text-xs text-slate-400 mt-0.5">{c.note[lang]}</div>
              </div>
            ))}
          </div>
        </Section>
      )}

      <Section id="moodle" title={t("recentMoodle", lang)} badge={upcomingAssignments.length} color="navy"
        collapsed={collapsed["moodle"]} onToggle={() => toggle("moodle")} onDetail={() => setTab("tasks")}>
        <div className="space-y-2">
          {upcomingAssignments.map((a) => (
            <button key={a.id} onClick={() => setModal({ kind: "moodle", id: a.id })}
              className="w-full text-left bg-white rounded-2xl p-3.5 border border-slate-100 active:scale-[0.99] transition">
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#0b2545] text-white">Moodle</span>
                <span className="text-xs text-slate-500 truncate">{a.course[lang]}</span>
              </div>
              <div className="text-sm text-slate-800">{a.title[lang]}</div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-1 text-xs text-slate-400"><Clock size={11} />{a.due}</div>
                <span className={`text-[11px] px-2 py-0.5 rounded-full ${
                  a.daysLeft <= 1 ? "bg-rose-50 text-rose-600" : a.daysLeft <= 3 ? "bg-amber-50 text-amber-600" : "bg-sky-50 text-sky-700"}`}>
                  {t("daysLeft", lang, { n: a.daysLeft })}
                </span>
              </div>
            </button>
          ))}
        </div>
      </Section>

      <Section id="schedule" title={t("todaySchedule", lang)} color="slate"
        collapsed={collapsed["schedule"]} onToggle={() => toggle("schedule")} onDetail={() => setModal({ kind: "scheduleEdit" })}
        extraAction={
          <button onClick={() => setModal({ kind: "scheduleEdit" })} className="flex items-center gap-1 text-xs text-white/70 active:opacity-50 mr-1">
            <Pencil size={11} />編集
          </button>
        }>
        <div className="bg-white rounded-2xl border border-slate-100 divide-y divide-slate-100">
          {allSchedule.map((s) => (
            <div key={s.id} className="px-3.5 py-3 flex items-center gap-3">
              <div className="text-xs text-slate-400 w-11 shrink-0">{s.time}</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-slate-800 truncate">{typeof s.title === "object" ? s.title[lang] : (s as any).title}</div>
                <div className="text-xs text-slate-400">{s.place}</div>
              </div>
              {"tag" in s && <ScheduleTag tag={(s as any).tag} lang={lang} />}
            </div>
          ))}
          {allSchedule.length === 0 && <div className="px-3.5 py-4 text-center text-sm text-slate-400">予定なし</div>}
        </div>
      </Section>

      <Section id="cafe" title={t("todayCafeteria", lang)} color="teal"
        collapsed={collapsed["cafe"]} onToggle={() => toggle("cafe")}>
        <CafeteriaLinks lang={lang} />
      </Section>

      <Section id="clubs" title={t("clubsInfo", lang)} color="slate"
        collapsed={collapsed["clubs"]} onToggle={() => toggle("clubs")} onDetail={() => setModal({ kind: "clubs" })}>
        <div className="flex gap-2 overflow-x-auto -mx-5 px-5 pb-1">
          {CLUBS.slice(0, 4).map((c) => (
            <button key={c.id} onClick={() => setModal({ kind: "clubs" })}
              className="shrink-0 w-44 bg-white rounded-2xl p-3.5 border border-slate-100 text-left active:scale-[0.99]">
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">{t(c.cat, lang)}</span>
                {c.recruiting && <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-50 text-rose-600">{t("recruiting", lang)}</span>}
              </div>
              <div className="text-sm text-slate-800 truncate">{c.name[lang]}</div>
              <div className="text-xs text-slate-400 mt-1">{c.days} · {c.place}</div>
            </button>
          ))}
        </div>
      </Section>
    </div>
  );
}

function IgIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="ig-g" cx="30%" cy="107%" r="120%">
          <stop offset="0%" stopColor="#ffd87a"/>
          <stop offset="25%" stopColor="#f9a14b"/>
          <stop offset="50%" stopColor="#e1306c"/>
          <stop offset="75%" stopColor="#833ab4"/>
          <stop offset="100%" stopColor="#4f5bd5"/>
        </radialGradient>
      </defs>
      <rect x="2" y="2" width="20" height="20" rx="6" fill="url(#ig-g)"/>
      <circle cx="12" cy="12" r="4.5" stroke="white" strokeWidth="1.8" fill="none"/>
      <circle cx="17.2" cy="6.8" r="1.2" fill="white"/>
    </svg>
  );
}

function CafeteriaLinks({ lang }: { lang: any }) {
  const open = (url: string) => window.open(url, "_blank", "noopener,noreferrer");
  const L = (ja: string, en: string, vi: string, zh: string, es: string) =>
    ({ ja, en, vi, zh, es }[lang as string] ?? ja);

  return (
    <div className="space-y-3">
      {/* 6号館食堂 */}
      <div className="bg-orange-50 rounded-2xl border border-orange-100 overflow-hidden">
        <div className="flex items-center gap-2 px-3 pt-3 pb-2 border-b border-orange-100">
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="size-6 rounded-md bg-orange-500 flex items-center justify-center">
              <span className="text-white text-xs font-bold leading-none">6</span>
            </div>
            <span className="text-xs font-semibold text-orange-700">{L("号館食堂","Bldg.6 Cafeteria","Nhà ăn tòa 6","号楼食堂","Cafetería Ed.6")}</span>
          </div>
        </div>
        <div className="divide-y divide-orange-100">
          <button onClick={() => open("https://asahi6.my.canva.site/")}
            className="w-full flex items-center gap-3 px-3 py-2.5 active:bg-orange-100 transition text-left">
            <div className="size-8 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
              <Utensils size={15} className="text-orange-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-slate-800">{L("今週のメニュー","This week's menu","Thực đơn tuần này","本周菜单","Menú semanal")}</div>
              <div className="text-[10px] text-slate-400">asahi6.my.canva.site</div>
            </div>
            <ExternalLink size={13} className="text-orange-300 shrink-0" />
          </button>
          <button onClick={() => open("https://www.instagram.com/asahi.shokudo_6/")}
            className="w-full flex items-center gap-3 px-3 py-2.5 active:bg-orange-100 transition text-left">
            <div className="size-8 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
              <IgIcon />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-slate-800">{L("Instagramで最新情報","Latest on Instagram","Xem Instagram","Instagram最新动态","Últimas en Instagram")}</div>
              <div className="text-[10px] text-slate-400">@asahi.shokudo_6</div>
            </div>
            <ExternalLink size={13} className="text-orange-300 shrink-0" />
          </button>
        </div>
      </div>

      {/* 10カフェ & 花水木 */}
      <div className="bg-orange-50 rounded-2xl border border-orange-100 overflow-hidden">
        <div className="flex items-center gap-2 px-3 pt-3 pb-2 border-b border-orange-100">
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="size-6 rounded-md bg-orange-500 flex items-center justify-center">
              <span className="text-white text-[9px] font-bold leading-none">10</span>
            </div>
            <span className="text-xs font-semibold text-orange-700">{L("カフェ & 花水木","10 Café & Hanamizuki","10 Café & Hanamizuki","咖啡厅 & 花水木","10 Café & Hanamizuki")}</span>
          </div>
        </div>
        <button onClick={() => open("https://www.instagram.com/asahi.10cafe/")}
          className="w-full flex items-center gap-3 px-3 py-2.5 active:bg-orange-100 transition text-left">
          <div className="size-8 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
            <IgIcon />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm text-slate-800">{L("Instagramで最新情報","Latest on Instagram","Xem Instagram","Instagram最新动态","Últimas en Instagram")}</div>
            <div className="text-[10px] text-slate-400">@asahi.10cafe</div>
          </div>
          <ExternalLink size={13} className="text-orange-300 shrink-0" />
        </button>
      </div>
    </div>
  );
}

type SectionColor = "rose" | "amber" | "navy" | "slate" | "teal";
const sectionStyles: Record<SectionColor, { bg: string }> = {
  rose: { bg: "bg-rose-500" }, amber: { bg: "bg-amber-400" },
  navy: { bg: "bg-[#0b2545]" }, slate: { bg: "bg-slate-500" }, teal: { bg: "bg-[#13b5b1]" },
};

function Section({ id, title, badge, color = "slate", collapsed, onToggle, onDetail, extraAction, children }: {
  id: string; title?: string; badge?: number; color?: SectionColor;
  collapsed?: boolean; onToggle?: () => void; onDetail?: () => void;
  extraAction?: React.ReactNode; children: React.ReactNode;
}) {
  const s = sectionStyles[color];
  return (
    <div className="px-5 mt-5">
      {title && (
        <div className={`${s.bg} rounded-xl px-3.5 py-2.5 flex items-center mb-2.5`}>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-sm text-white truncate">{title}</span>
            {badge !== undefined && badge > 0 && (
              <span className="text-[10px] text-white bg-white/20 rounded-full px-1.5 py-0.5 min-w-[18px] text-center shrink-0">{badge}</span>
            )}
          </div>
          <div className="flex items-center shrink-0">
            {extraAction}
            {onDetail && (
              <button onClick={onDetail} className="text-xs text-white/80 bg-white/15 px-2.5 py-1 rounded-lg active:opacity-60">詳しく</button>
            )}
            {onToggle && (
              <button onClick={onToggle} className="text-white/70 active:opacity-50 ml-3">
                {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
              </button>
            )}
          </div>
        </div>
      )}
      {!collapsed && children}
    </div>
  );
}

function ScheduleTag({ tag, lang }: { tag: "class" | "cancelled" | "roomChange" | "club" | "other"; lang: any }) {
  if (tag === "cancelled") return <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 shrink-0">{t("cancelled", lang)}</span>;
  if (tag === "roomChange") return <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 shrink-0">{t("roomChange", lang)}</span>;
  if (tag === "club") return <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 shrink-0">{t("clubsInfo", lang)}</span>;
  return <Calendar size={14} className="text-slate-300 shrink-0" />;
}

function formatDate(raw: string | null): string {
  if (!raw) return "";
  const m = raw.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return `${m[1]}/${m[2].padStart(2, "0")}/${m[3].padStart(2, "0")}`;
  return raw.slice(0, 10);
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function NoticeCard({ notice, lang, onClick }: { notice: UniversityNotice; lang: any; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="w-full text-left bg-white rounded-2xl border border-slate-100 active:scale-[0.99] transition flex gap-3 p-3.5 items-start">
      <div className="size-16 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
        {notice.thumbnail_url ? (
          <img src={notice.thumbnail_url} alt={notice.title} className="size-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
        ) : (
          <Newspaper size={22} className="text-slate-300" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        {notice.category && (
          <span className="inline-block text-[10px] px-1.5 py-0.5 rounded bg-[#13b5b1]/15 text-[#0b2545] mb-1" translate="yes">{notice.category}</span>
        )}
        {/* translate="yes" enables browser/OS auto-translation for non-Japanese users */}
        <div className="text-sm text-slate-800 leading-snug line-clamp-2" translate={lang === "ja" ? "no" : "yes"}>{notice.title}</div>
        <div className="text-xs text-slate-400 mt-1">{formatDate(notice.published_at)}</div>
      </div>
      <ExternalLink size={13} className="text-slate-300 mt-0.5 shrink-0" />
    </button>
  );
}


function UniversityNoticesSection({ notices, meta, loading, syncing, error, collapsed, onToggle, onRefresh, onOpenConfirm }: {
  notices: UniversityNotice[];
  meta: { last_fetched: string; count: number } | null;
  loading: boolean; syncing: boolean; error: string | null;
  collapsed?: boolean; onToggle?: () => void;
  onRefresh: () => void; onOpenConfirm: () => void;
}) {
  const { lang } = useApp();
  const openArticle = (url: string) => window.open(url, "_blank", "noopener,noreferrer");

  return (
    <div className="px-5 mt-5">
      <div className="bg-[#0b2545] rounded-xl px-3.5 py-2.5 flex items-center mb-2.5">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Newspaper size={14} className="text-white/80 shrink-0" />
          <span className="text-sm text-white truncate">{t("universityNotices", lang)}</span>
          {notices.length > 0 && (
            <span className="text-[10px] text-white bg-white/20 rounded-full px-1.5 py-0.5 min-w-[18px] text-center shrink-0">{notices.length}</span>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={onRefresh} disabled={loading || syncing} className="text-white/70 active:opacity-50 p-1">
            <RefreshCw size={13} className={loading || syncing ? "animate-spin" : ""} />
          </button>
          {onToggle && (
            <button onClick={onToggle} className="text-white/70 active:opacity-50 ml-2">
              {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </button>
          )}
        </div>
      </div>

      {!collapsed && (
        <>
          {loading && notices.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col items-center gap-2">
              <RefreshCw size={20} className="text-slate-300 animate-spin" />
              <div className="text-xs text-slate-400">{t("fetchingNotices", lang)}</div>
            </div>
          ) : error && notices.length === 0 ? (
            <div className="bg-orange-50 rounded-2xl border border-orange-100 p-4 space-y-2">
              <div className="text-xs text-orange-700 font-medium">{t("noticesFetchError", lang)}</div>
              <div className="flex gap-2 flex-wrap mt-1">
                <button onClick={onRefresh} className="inline-flex items-center gap-1 text-xs text-[#0b2545] bg-white px-2 py-1 rounded-lg border border-slate-200">
                  <RefreshCw size={10} /> 再試行
                </button>
                <button onClick={onOpenConfirm} className="inline-flex items-center gap-1 text-xs text-[#0b2545] underline">
                  <ExternalLink size={11} /> {t("noticesViewOfficial", lang)}
                </button>
              </div>
            </div>
          ) : notices.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-4 text-center">
              <div className="text-xs text-slate-400 mb-2">{t("noticesEmpty", lang)}</div>
              <button onClick={onOpenConfirm} className="inline-flex items-center gap-1 text-xs text-[#0b2545] underline">
                <ExternalLink size={11} /> {t("noticesViewOfficial", lang)}
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {notices.slice(0, DISPLAY_COUNT).map((n) => (
                <NoticeCard key={n.id} notice={n} lang={lang} onClick={() => openArticle(n.article_url)} />
              ))}
              <div className="flex items-center justify-between px-1 pt-0.5">
                <span className="text-[10px] text-slate-400">{t("noticesTop3", lang)}</span>
                <button onClick={onOpenConfirm} className="inline-flex items-center gap-1 text-[10px] text-[#0b2545]">
                  <ExternalLink size={10} /> {t("noticesViewMore", lang)}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
