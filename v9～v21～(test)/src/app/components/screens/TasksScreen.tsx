import { useState } from "react";
import { useApp } from "../../AppContext";
import { t } from "../../i18n";
import { ASSIGNMENTS } from "../../data";
import { RefreshCw, CheckCircle2, Clock, MessageSquare, ListTodo, Calendar as CalIcon, Plus, AlertCircle } from "lucide-react";

const FILTERS = ["all", "notSubmitted", "submitted", "thisWeek", "feedbackAvailable", "important"] as const;
type Filter = typeof FILTERS[number];

export function TasksScreen() {
  const { lang, setModal, cancellations } = useApp();
  const [filter, setFilter] = useState<Filter>("all");
  const [view, setView] = useState<"list" | "calendar">("list");
  const [syncState, setSyncState] = useState<"idle" | "syncing" | "done">("idle");
  const [lastSync, setLastSync] = useState("5分前");

  const sync = () => {
    setSyncState("syncing");
    setTimeout(() => {
      setSyncState("done");
      setLastSync("たった今");
      setTimeout(() => setSyncState("idle"), 1200);
    }, 1300);
  };

  const filtered = ASSIGNMENTS.filter((a) => {
    if (filter === "all") return true;
    if (filter === "thisWeek") return a.daysLeft >= 0 && a.daysLeft <= 7;
    if (filter === "important") return a.priority === "high";
    return a.status === filter;
  });

  const todayCancel = cancellations.filter((c) => c.date === "06/04");

  return (
    <div className="pb-24">
      <div className="px-5 pt-12 pb-4 bg-gradient-to-br from-[#0b2545] to-[#13b5b1] text-white rounded-b-3xl">
        <div className="text-xl">{t("navTasks", lang)}</div>
        <div className="mt-3 bg-white/15 backdrop-blur rounded-2xl p-3 flex items-center gap-3">
          <div className="size-9 rounded-lg bg-white/20 flex items-center justify-center">
            <RefreshCw size={16} className={syncState === "syncing" ? "animate-spin" : ""} />
          </div>
          <div className="flex-1">
            <div className="text-xs">
              {syncState === "syncing" ? t("syncing", lang) : syncState === "done" ? t("syncDone", lang) : t("moodleConnected", lang)}
            </div>
            <div className="text-[11px] opacity-90">{t("lastSync", lang)}: {lastSync}</div>
          </div>
          <button onClick={sync} disabled={syncState !== "idle"} className="text-xs px-3 py-1.5 rounded-full bg-white text-[#0b2545] disabled:opacity-60">
            {t("syncNow", lang)}
          </button>
        </div>
      </div>

      {/* View toggle */}
      <div className="px-5 mt-4 flex items-center justify-between">
        <div className="inline-flex bg-slate-100 rounded-full p-1">
          <button onClick={() => setView("list")} className={`px-4 py-1.5 rounded-full text-xs flex items-center gap-1 ${view === "list" ? "bg-white text-[#0b2545] shadow-sm" : "text-slate-500"}`}>
            <ListTodo size={14} /> {t("list", lang)}
          </button>
          <button onClick={() => setView("calendar")} className={`px-4 py-1.5 rounded-full text-xs flex items-center gap-1 ${view === "calendar" ? "bg-white text-[#0b2545] shadow-sm" : "text-slate-500"}`}>
            <CalIcon size={14} /> {t("calendar", lang)}
          </button>
        </div>
        <button className="text-xs text-[#0b2545] flex items-center gap-1">
          <Plus size={14} /> {t("addNote", lang)}
        </button>
      </div>

      {/* Today's class changes */}
      {todayCancel.length > 0 && (
        <div className="px-5 mt-4">
          <div className="text-xs text-slate-500 mb-2">{t("todayClassChanges", lang)}</div>
          <div className="bg-rose-50 border border-rose-100 rounded-2xl p-3 flex gap-3 items-start">
            <AlertCircle size={18} className="text-rose-600 mt-0.5" />
            <div className="flex-1">
              {todayCancel.map((c) => (
                <div key={c.id} className="text-sm text-slate-800">
                  {c.course[lang]} · {c.period}限 · <span className="text-rose-600">{t("cancelled", lang)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {view === "list" ? (
        <>
          {/* Filters */}
          <div className="mt-4 flex gap-2 overflow-x-auto px-5 pb-1">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`shrink-0 text-xs px-3 py-1.5 rounded-full transition ${filter === f ? "bg-[#0b2545] text-white" : "bg-white border border-slate-200 text-slate-600"}`}
              >
                {t(f, lang)}
              </button>
            ))}
          </div>

          <div className="px-5 mt-4 space-y-2.5">
            {filtered.map((a) => (
              <button key={a.id} onClick={() => setModal({ kind: "moodle", id: a.id })} className="w-full text-left bg-white rounded-2xl p-4 border border-slate-100 active:scale-[0.99] transition">
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#0b2545] text-white">Moodle</span>
                  <span className="text-xs text-slate-500">{a.course[lang]}</span>
                  {a.priority === "high" && <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-rose-50 text-rose-600">{t("important", lang)}</span>}
                </div>
                <div className="text-sm text-slate-800">{a.title[lang]}</div>
                <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                  <Clock size={13} />{a.due}
                </div>
                <div className="flex items-center justify-between mt-3">
                  <StatusBadge status={a.status} lang={lang} />
                  <span className={`text-[11px] ${a.daysLeft <= 1 ? "text-rose-600" : a.daysLeft <= 3 ? "text-amber-600" : "text-slate-500"}`}>
                    {a.daysLeft >= 0 ? t("daysLeft", lang, { n: a.daysLeft }) : `+${-a.daysLeft}d`}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </>
      ) : (
        <CalendarView lang={lang} />
      )}
    </div>
  );
}

function StatusBadge({ status, lang }: { status: any; lang: any }) {
  const map: Record<string, { cls: string; icon: any }> = {
    notSubmitted: { cls: "bg-rose-50 text-rose-600", icon: Clock },
    submitted: { cls: "bg-emerald-50 text-emerald-600", icon: CheckCircle2 },
    grading: { cls: "bg-amber-50 text-amber-600", icon: Clock },
    feedbackAvailable: { cls: "bg-sky-50 text-sky-700", icon: MessageSquare },
  };
  const m = map[status];
  const Icon = m.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full ${m.cls}`}>
      <Icon size={12} />{t(status, lang)}
    </span>
  );
}

function CalendarView({ lang }: { lang: any }) {
  const today = 4;
  const events = new Set([7, 10, 12, 15, 20]);
  return (
    <div className="px-5 mt-4">
      <div className="bg-white rounded-2xl border border-slate-100 p-4">
        <div className="text-center text-sm text-slate-700 mb-3">2026年6月</div>
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-slate-400 mb-1">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => <div key={i}>{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 30 }).map((_, i) => {
            const day = i + 1;
            const isToday = day === today;
            const hasEvent = events.has(day);
            return (
              <button key={day} className={`aspect-square rounded-lg text-xs flex flex-col items-center justify-center relative ${isToday ? "bg-[#0b2545] text-white" : "text-slate-700 hover:bg-slate-50"}`}>
                {day}
                {hasEvent && <span className={`absolute bottom-1 size-1 rounded-full ${isToday ? "bg-white" : "bg-[#13b5b1]"}`} />}
              </button>
            );
          })}
        </div>
      </div>
      <div className="text-xs text-slate-500 mt-3">{t("daysLeft", lang, { n: 3 })}: {ASSIGNMENTS[0].title[lang]}</div>
    </div>
  );
}
