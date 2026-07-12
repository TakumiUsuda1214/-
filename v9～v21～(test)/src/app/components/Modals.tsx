import { useState, useEffect } from "react";
import { useApp, Modal } from "../AppContext";
import { t, LANGUAGES, Lang } from "../i18n";
import { STUDENT, CAFE, ASSIGNMENTS, CLUBS, NOTICES, SCHEDULE } from "../data";
import { QRPlaceholder } from "./QRPlaceholder";
import { X, Sun, Check, Clock, ExternalLink, AlertCircle, ChevronRight, ChevronDown, ChevronUp, Bell, Plus, Trash2, Lock, RefreshCw, Newspaper } from "lucide-react";
import { useUniversityNotices, UniversityNotice } from "./useUniversityNotices";

const COMPACT_MODALS: Modal["kind"][] = ["confirmOfficialSite", "confirmLogout", "confirmLink"];

export function Modals() {
  const { modal } = useApp();
  if (modal.kind === "none") return null;
  const compact = COMPACT_MODALS.includes(modal.kind);
  return (
    <div className="absolute inset-0 z-50">
      <Backdrop />
      {compact ? (
        // 小型ボトムシート — 高さは内容に合わせて自動
        <div className="absolute inset-x-0 bottom-0 bg-white rounded-t-3xl shadow-2xl animate-[slideUp_0.2s_ease-out]">
          {modal.kind === "confirmOfficialSite" && <ConfirmOfficialSiteModal />}
          {modal.kind === "confirmLogout" && <ConfirmLogoutModal />}
          {modal.kind === "confirmLink" && <ConfirmLinkModal url={modal.url} label={modal.label} />}
        </div>
      ) : (
        // 通常の大型モーダル
        <div className="absolute inset-x-0 bottom-0 top-8 bg-white rounded-t-3xl overflow-hidden flex flex-col animate-[slideUp_0.25s_ease-out] min-h-0">
          {modal.kind === "qr" && <QRModal />}
          {modal.kind === "cafeteria" && <CafeteriaModal />}
          {modal.kind === "cancellations" && <CancellationsModal />}
          {modal.kind === "moodle" && <MoodleModal id={modal.id} />}
          {modal.kind === "clubs" && <ClubsModal />}
          {modal.kind === "settings" && <SettingsModal />}
          {modal.kind === "notifications" && <NotificationsModal />}
          {modal.kind === "language" && <LanguageModal />}
          {modal.kind === "notice" && <NoticeModal id={modal.id} />}
          {modal.kind === "noticesList" && <NoticesListModal />}
          {modal.kind === "scheduleEdit" && <ScheduleEditModal />}
          {modal.kind === "universityNotices" && <UniversityNoticesModal />}
        </div>
      )}
    </div>
  );
}

function Backdrop() {
  const { setModal } = useApp();
  return <div onClick={() => setModal({ kind: "none" })} className="absolute inset-0 bg-black/40" />;
}

function ModalHeader({ title }: { title: string }) {
  const { setModal } = useApp();
  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
      <div className="text-base text-slate-800">{title}</div>
      <button onClick={() => setModal({ kind: "none" })} className="size-8 rounded-full bg-slate-100 flex items-center justify-center active:scale-95">
        <X size={16} className="text-slate-600" />
      </button>
    </div>
  );
}

/* ---------- QR ---------- */
function QRModal() {
  const { lang, username } = useApp();
  const [bright, setBright] = useState(false);
  return (
    <div className={`flex-1 flex flex-col ${bright ? "bg-white" : "bg-slate-50"}`}>
      <ModalHeader title={t("studentIdQR", lang)} />
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 w-full max-w-xs">
          <div className="flex items-center gap-3 mb-4">
            <div className="size-12 rounded-full bg-gradient-to-br from-[#0b2545] to-[#13b5b1] text-white flex items-center justify-center">
              {username.slice(0, 1).toUpperCase()}
            </div>
            <div>
              <div className="text-sm text-slate-800">{username}</div>
              <div className="text-xs text-slate-500">{STUDENT.id}</div>
              <div className="text-xs text-slate-500">{STUDENT.year[lang]} · {STUDENT.faculty[lang]}</div>
            </div>
          </div>
          <div className="flex justify-center my-3"><QRPlaceholder size={200} /></div>
          <div className="text-center text-[11px] text-slate-500 mt-2">{t("qrDesc", lang)}</div>
          <div className="text-center text-[10px] text-slate-400 mt-1">{t("validUntil", lang)}: 2027/03/31</div>
        </div>
        <button onClick={() => setBright(!bright)} className="mt-5 inline-flex items-center gap-2 text-sm px-4 py-2 rounded-full bg-[#0b2545] text-white">
          <Sun size={16} /> {t("brightness", lang)}
        </button>
      </div>
    </div>
  );
}

/* ---------- Cafeteria ---------- */
type CafLang = "ja" | "en" | "vi" | "zh" | "es";
const CAF_LABEL: Record<CafLang, string> = { ja: "食堂メニュー", en: "Cafeteria Menu", vi: "Thực đơn", zh: "食堂菜单", es: "Menú cafetería" };
const CAF_WEEKLY: Record<CafLang, string> = { ja: "今週のメニュー", en: "This week's menu", vi: "Thực đơn tuần này", zh: "本周菜单", es: "Menú de esta semana" };
const CAF_INSTA: Record<CafLang, string> = { ja: "Instagramで最新情報", en: "Latest on Instagram", vi: "Xem Instagram", zh: "Instagram最新动态", es: "Últimas en Instagram" };
const CAF_HINT: Record<CafLang, string> = { ja: "タップして外部サイトで開きます", en: "Tap to open in browser", vi: "Nhấn để mở trình duyệt", zh: "点击在浏览器中打开", es: "Toca para abrir en el navegador" };

function CafeteriaModal() {
  const { lang } = useApp();
  const l = lang as CafLang;

  const openLink = (url: string) => window.open(url, "_blank", "noopener,noreferrer");

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <ModalHeader title={CAF_LABEL[l]} />
      <div className="overflow-y-auto flex-1 pb-8">

        {/* ── 6号館食堂 ── */}
        <div className="px-5 pt-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="size-7 rounded-lg bg-[#0b2545] flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold">6</span>
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-800">
                {{ ja: "6号館食堂", en: "Bldg.6 Cafeteria", vi: "Nhà ăn tòa 6", zh: "6号楼食堂", es: "Cafetería Ed.6" }[l]}
              </div>
              <div className="text-[10px] text-slate-400">{CAF_HINT[l]}</div>
            </div>
          </div>

          {/* Canva weekly menu */}
          <button
            onClick={() => openLink("https://asahi6.my.canva.site/")}
            className="w-full flex items-center gap-4 bg-gradient-to-r from-[#0b2545] to-[#13b5b1] rounded-2xl p-4 active:scale-[0.98] transition mb-3"
          >
            <div className="size-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0 text-xl">🗓️</div>
            <div className="flex-1 text-left">
              <div className="text-white text-sm font-medium">{CAF_WEEKLY[l]}</div>
              <div className="text-white/70 text-[11px] mt-0.5">asahi6.my.canva.site</div>
            </div>
            <ExternalLink size={16} className="text-white/60 shrink-0" />
          </button>

          {/* Instagram */}
          <button
            onClick={() => openLink("https://www.instagram.com/asahi.shokudo_6/")}
            className="w-full flex items-center gap-4 bg-gradient-to-r from-[#833ab4] via-[#e1306c] to-[#f77737] rounded-2xl p-4 active:scale-[0.98] transition"
          >
            <div className="size-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0 text-xl">📸</div>
            <div className="flex-1 text-left">
              <div className="text-white text-sm font-medium">{CAF_INSTA[l]}</div>
              <div className="text-white/70 text-[11px] mt-0.5">@asahi.shokudo_6</div>
            </div>
            <ExternalLink size={16} className="text-white/60 shrink-0" />
          </button>
        </div>

        {/* ── 10カフェ & 花水木 ── */}
        <div className="px-5 pt-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="size-7 rounded-lg bg-[#13b5b1] flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold">10</span>
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-800">
                {{ ja: "10カフェ & 花水木", en: "10 Café & Hanamizuki", vi: "10 Café & Hanamizuki", zh: "10咖啡厅 & 花水木", es: "10 Café & Hanamizuki" }[l]}
              </div>
              <div className="text-[10px] text-slate-400">{CAF_HINT[l]}</div>
            </div>
          </div>

          <button
            onClick={() => openLink("https://www.instagram.com/asahi.10cafe/")}
            className="w-full flex items-center gap-4 bg-gradient-to-r from-[#833ab4] via-[#e1306c] to-[#f77737] rounded-2xl p-4 active:scale-[0.98] transition"
          >
            <div className="size-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0 text-xl">📸</div>
            <div className="flex-1 text-left">
              <div className="text-white text-sm font-medium">{CAF_INSTA[l]}</div>
              <div className="text-white/70 text-[11px] mt-0.5">@asahi.10cafe</div>
            </div>
            <ExternalLink size={16} className="text-white/60 shrink-0" />
          </button>
        </div>

      </div>
    </div>
  );
}

/* ---------- Cancellations ---------- */
function CancellationsModal() {
  const { lang, cancellations, markCancellationRead } = useApp();
  const [filter, setFilter] = useState<"all" | "cancelled" | "makeup" | "roomChange">("all");
  const filtered = cancellations.filter((c) => filter === "all" || c.type === filter);
  const colorMap: Record<string, string> = {
    cancelled: "bg-rose-50 text-rose-600",
    makeup: "bg-[#13b5b1]/15 text-[#0b2545]",
    roomChange: "bg-sky-50 text-sky-700",
    online: "bg-violet-50 text-violet-700",
  };
  return (
    <div className="flex-1 flex flex-col">
      <ModalHeader title={t("classCancellation", lang)} />
      <div className="overflow-y-auto pb-6">
        <div className="px-5 pt-3 flex gap-2 overflow-x-auto pb-2">
          {(["all", "cancelled", "makeup", "roomChange"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`shrink-0 text-xs px-3 py-1.5 rounded-full ${filter === f ? "bg-[#0b2545] text-white" : "bg-white border border-slate-200 text-slate-600"}`}>
              {f === "all" ? t("all", lang) : t(f, lang)}
            </button>
          ))}
        </div>
        <div className="px-5 mt-2 space-y-2.5">
          {filtered.map((c) => (
            <div key={c.id} className={`bg-white rounded-2xl border border-slate-100 p-4 ${c.read ? "opacity-50" : ""}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${colorMap[c.type]}`}>{t(c.type, lang)}</span>
                <span className="text-xs text-slate-500">{c.date} · {c.period}限</span>
              </div>
              <div className="text-sm text-slate-800">{c.course[lang]}</div>
              <div className="text-xs text-slate-500 mt-0.5">{c.teacher} · {c.note[lang]}</div>
              {!c.read && (
                <button onClick={() => markCancellationRead(c.id)} className="mt-3 text-xs px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 inline-flex items-center gap-1">
                  <Check size={12} /> {t("markRead", lang)}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- Moodle assignment ---------- */
function MoodleModal({ id }: { id: string }) {
  const { lang } = useApp();
  const a = ASSIGNMENTS.find((x) => x.id === id);
  if (!a) return null;
  return (
    <div className="flex-1 flex flex-col">
      <ModalHeader title={a.title[lang]} />
      <div className="overflow-y-auto pb-6 px-5 pt-4 space-y-3">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#0b2545] text-white">Moodle</span>
          <span className="text-xs text-slate-500">{a.course[lang]}</span>
        </div>
        <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
          <Row label={t("daysLeft", lang, { n: Math.max(0, a.daysLeft) })} value={a.due} icon={Clock} />
          <Row label={t("notSubmitted", lang)} value={t(a.status, lang)} />
          <Row label={t("important", lang)} value={a.priority === "high" ? "★" : a.priority === "mid" ? "◆" : "・"} />
        </div>
        <div className="text-sm text-slate-700">
          {{ ja: "課題説明：指定された範囲についてレポートを作成し、Moodle上で提出してください。", en: "Description: Write a report on the assigned topic and submit on Moodle.", vi: "Mô tả: Viết báo cáo và nộp lên Moodle.", zh: "说明：撰写指定范围的报告并在Moodle提交。", es: "Descripción: Escribe el informe y entrégalo en Moodle." }[lang]}
        </div>
        <button className="w-full bg-[#0b2545] text-white rounded-2xl py-3 text-sm flex items-center justify-center gap-2">
          <ExternalLink size={16} /> {t("openInMoodle", lang)}
        </button>
        <button className="w-full bg-white border border-slate-200 rounded-2xl py-3 text-sm text-slate-700">{t("addNote", lang)}</button>
      </div>
    </div>
  );
}
function Row({ label, value, icon: Icon }: { label: string; value: string; icon?: any }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-slate-500 inline-flex items-center gap-1">{Icon && <Icon size={12} />}{label}</span>
      <span className="text-slate-800">{value}</span>
    </div>
  );
}

/* ---------- Clubs ---------- */
function ClubsModal() {
  const { lang } = useApp();
  const cats = ["all", "sports", "academic", "culture", "intl", "volunteer"] as const;
  const [cat, setCat] = useState<typeof cats[number]>("all");
  const items = CLUBS.filter((c) => cat === "all" || c.cat === cat);
  return (
    <div className="flex-1 flex flex-col">
      <ModalHeader title={t("clubsInfo", lang)} />
      <div className="overflow-y-auto pb-6">
        <div className="px-5 pt-3 flex gap-2 overflow-x-auto pb-2">
          {cats.map((c) => (
            <button key={c} onClick={() => setCat(c)} className={`shrink-0 text-xs px-3 py-1.5 rounded-full ${cat === c ? "bg-[#0b2545] text-white" : "bg-white border border-slate-200 text-slate-600"}`}>
              {c === "all" ? t("all", lang) : t(c, lang)}
            </button>
          ))}
        </div>
        <div className="px-5 mt-2 space-y-2.5">
          {items.map((c) => (
            <div key={c.id} className="bg-white rounded-2xl border border-slate-100 p-4">
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#13b5b1]/15 text-[#0b2545]">{t(c.cat, lang)}</span>
                {c.recruiting && <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-50 text-rose-600">{t("recruiting", lang)}</span>}
              </div>
              <div className="text-sm text-slate-800">{c.name[lang]}</div>
              <div className="text-xs text-slate-500 mt-1">{c.days} · {c.place}</div>
              {c.event && <div className="text-xs text-[#0b2545] mt-1.5">📅 {c.event[lang]}</div>}
              <button className="mt-3 text-xs text-[#0b2545] inline-flex items-center gap-1">
                {t("viewDetails", lang)} <ChevronRight size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- Settings ---------- */
function SettingsModal() {
  const { lang, setLang, theme, setTheme, notif, setNotif, moodleSync, setMoodleSync } = useApp();
  const [langExpanded, setLangExpanded] = useState(false);
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <ModalHeader title={t("settings", lang)} />
      <div className="flex-1 overflow-y-auto pb-8">
        <Group title={t("language", lang)}>
          <button
            onClick={() => setLangExpanded((v) => !v)}
            className="w-full flex items-center justify-between p-3.5 active:bg-slate-50"
          >
            <span className="text-sm text-slate-700">{t("language", lang)}</span>
            <span className="text-xs text-slate-500 flex items-center gap-1">
              {LANGUAGES.find((l) => l.code === lang)?.native}
              <ChevronRight size={14} className={`transition-transform ${langExpanded ? "rotate-90" : ""}`} />
            </span>
          </button>
          {langExpanded && (
            <div className="border-t border-slate-100 px-3 py-2 space-y-1">
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => { setLang(l.code); setLangExpanded(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition active:scale-[0.99] ${lang === l.code ? "bg-[#13b5b1]/15 text-[#0b2545]" : "text-slate-700 active:bg-slate-50"}`}
                >
                  <span>{l.native} <span className="text-xs text-slate-500 ml-1">{l.label}</span></span>
                  {lang === l.code && <Check size={14} className="text-[#0b2545]" />}
                </button>
              ))}
            </div>
          )}
        </Group>
        <Group title={t("notifications", lang)}>
          <Toggle label={t("notifications", lang)} on={notif} onChange={setNotif} />
        </Group>
        <Group title={{ ja: "表示テーマ", en: "Theme", vi: "Giao diện", zh: "主题", es: "Tema" }[lang]}>
          <div className="px-3 py-2 grid grid-cols-2 gap-2">
            <button onClick={() => setTheme("light")} className={`text-xs py-2 rounded-xl border transition ${theme === "light" ? "border-[#0b2545] bg-[#0b2545] text-white" : "border-slate-200 text-slate-600"}`}>{t("themeLight", lang)}</button>
            <button onClick={() => setTheme("dark")} className={`text-xs py-2 rounded-xl border transition ${theme === "dark" ? "border-[#0b2545] bg-[#0b2545] text-white" : "border-slate-200 text-slate-600"}`}>{t("themeDark", lang)}</button>
          </div>
        </Group>
        <Group title={{ ja: "Moodle連携設定", en: "Moodle settings", vi: "Cài Moodle", zh: "Moodle设置", es: "Ajustes Moodle" }[lang]}>
          <Row2 label={t("moodleConnected", lang)} value="●" />
          <Row2 label={t("lastSync", lang)} value="5分前" />
          <div className="px-3.5 py-2 text-xs text-slate-500">{t("syncItems", lang)}</div>
          <Toggle label={t("assignments", lang)} on={moodleSync.assignments} onChange={(v) => setMoodleSync({ ...moodleSync, assignments: v })} />
          <Toggle label={t("feedback", lang)} on={moodleSync.feedback} onChange={(v) => setMoodleSync({ ...moodleSync, feedback: v })} />
          <Toggle label={t("grades", lang)} on={moodleSync.grades} onChange={(v) => setMoodleSync({ ...moodleSync, grades: v })} />
          <button className="w-full text-left p-3.5 text-sm text-rose-600 active:bg-slate-50">{t("disconnect", lang)}</button>
        </Group>
        <Group title={t("account", lang)}>
          <Row2 label={t("account", lang)} value={STUDENT.id} />
          <Row2 label={t("help", lang)} value="→" />
          <Row2 label={t("contact", lang)} value="→" />
        </Group>
      </div>
    </div>
  );
}
function Group({ title, children }: any) {
  return (
    <div className="px-5 mt-4">
      <div className="text-xs text-slate-500 mb-1.5">{title}</div>
      <div className="bg-white rounded-2xl border border-slate-100 divide-y divide-slate-100 overflow-hidden">{children}</div>
    </div>
  );
}
function Row2({ label, value }: any) {
  return (
    <div className="flex items-center justify-between p-3.5">
      <span className="text-sm text-slate-700">{label}</span>
      <span className="text-xs text-slate-500">{value}</span>
    </div>
  );
}
function Toggle({ label, on, onChange }: { label: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!on)} className="w-full flex items-center justify-between p-3.5 active:bg-slate-50">
      <span className="text-sm text-slate-700">{label}</span>
      <span className={`w-10 h-6 rounded-full p-0.5 transition ${on ? "bg-[#13b5b1]" : "bg-slate-300"}`}>
        <span className={`block size-5 rounded-full bg-white shadow transition ${on ? "translate-x-4" : ""}`} />
      </span>
    </button>
  );
}

/* ---------- Notifications ---------- */
const NOTIF_INITIAL = 5;
const NOTIF_MAX = 30;

function NotificationsModal() {
  const { lang, setUniversityNoticesBadge } = useApp();
  const { notices } = useUniversityNotices();
  const [expanded, setExpanded] = useState(false);
  const [confirmLink, setConfirmLink] = useState<{ url: string; label: string } | null>(null);

  useEffect(() => {
    setUniversityNoticesBadge(0);
  }, []);

  const allItems = notices.slice(0, NOTIF_MAX);
  const visibleItems = expanded ? allItems : allItems.slice(0, NOTIF_INITIAL);
  const hasMore = allItems.length > NOTIF_INITIAL;

  const formatDate = (raw: string | null) => {
    if (!raw) return "";
    const m = raw.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (m) return `${m[1]}/${m[2].padStart(2, "0")}/${m[3].padStart(2, "0")}`;
    return raw.slice(0, 10);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 relative">
      <ModalHeader title={t("notifications", lang)} />
      <div className="overflow-y-auto flex-1 pb-6">
        {allItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="size-14 rounded-full bg-slate-100 flex items-center justify-center">
              <Bell size={24} className="text-slate-300" />
            </div>
            <div className="text-sm text-slate-400">
              {{ ja: "通知はありません", en: "No notifications", vi: "Không có thông báo", zh: "暂无通知", es: "Sin notificaciones" }[lang]}
            </div>
          </div>
        ) : (
          <>
            <div className="px-5 space-y-2 pt-3">
              {visibleItems.map((n) => (
                <button
                  key={n.id}
                  onClick={() => setConfirmLink({ url: n.article_url, label: n.title })}
                  className="w-full text-left rounded-2xl border border-slate-100 bg-white p-3.5 flex gap-3 active:scale-[0.99] transition"
                >
                  <div className="size-9 rounded-xl bg-[#0b2545]/10 flex items-center justify-center shrink-0">
                    <Newspaper size={16} className="text-[#0b2545]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-slate-800 leading-snug line-clamp-2">{n.title}</div>
                    <div className="flex items-center gap-2 mt-1">
                      {n.category && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#13b5b1]/15 text-[#0b2545]">{n.category}</span>
                      )}
                      <span className="text-xs text-slate-400">{formatDate(n.published_at)}</span>
                    </div>
                  </div>
                  <ExternalLink size={13} className="text-slate-300 mt-0.5 shrink-0" />
                </button>
              ))}
            </div>

            {hasMore && (
              <div className="px-5 mt-3">
                <button
                  onClick={() => setExpanded((v) => !v)}
                  className="w-full py-3 rounded-2xl border border-slate-200 text-xs text-slate-600 flex items-center justify-center gap-1.5 active:scale-[0.99] transition bg-white"
                >
                  {expanded ? (
                    <><ChevronUp size={14} /> 折りたたむ</>
                  ) : (
                    <><ChevronDown size={14} /> すべて表示（{allItems.length}件）</>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* リンク確認 — 通知モーダルの中に重ねて表示 */}
      {confirmLink && (
        <div className="absolute inset-0 z-10 flex flex-col justify-end rounded-t-3xl overflow-hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setConfirmLink(null)} />
          <div className="relative bg-white px-5 pt-5 pb-8">
            <div className="text-sm font-medium text-slate-800 mb-1">{t("openLink", lang)}</div>
            <div className="text-xs text-slate-500 mb-5 line-clamp-2">{confirmLink.label}</div>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmLink(null)}
                className="flex-1 py-3 rounded-2xl border border-slate-200 text-sm text-slate-600 active:scale-[0.98] transition"
              >
                {t("cancel", lang)}
              </button>
              <button
                onClick={() => { window.open(confirmLink.url, "_blank", "noopener,noreferrer"); setConfirmLink(null); }}
                className="flex-1 py-3 rounded-2xl bg-[#0b2545] text-sm text-white active:scale-[0.98] transition"
              >
                {t("open", lang)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Language ---------- */
function LanguageModal() {
  const { lang, setLang } = useApp();
  return (
    <div className="flex-1 flex flex-col">
      <ModalHeader title={t("language", lang)} />
      <div className="px-5 pt-3 space-y-2">
        {LANGUAGES.map((l) => (
          <button key={l.code} onClick={() => setLang(l.code)} className={`w-full p-3.5 rounded-2xl border flex items-center justify-between active:scale-[0.99] transition ${lang === l.code ? "border-[#0b2545] bg-[#13b5b1]/10" : "border-slate-200 bg-white"}`}>
            <div className="text-left">
              <div className="text-sm text-slate-800">{l.native}</div>
              <div className="text-xs text-slate-500">{l.label}</div>
            </div>
            {lang === l.code && <div className="size-6 rounded-full bg-[#0b2545] text-white flex items-center justify-center"><Check size={14} /></div>}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------- Notice ---------- */
function NoticeModal({ id }: { id: string }) {
  const { lang } = useApp();
  const n = NOTICES.find((x) => x.id === id);
  if (!n) return null;
  return (
    <div className="flex-1 flex flex-col">
      <ModalHeader title={t("importantNotice", lang)} />
      <div className="px-5 pt-4">
        <div className="text-xs text-slate-400">{n.date}</div>
        <div className="text-base text-slate-800 mt-1">{n.titleI18n[lang]}</div>
        <div className="mt-4 text-sm text-slate-600 leading-relaxed">
          {{ ja: "学生のみなさまへお知らせいたします。詳細は大学公式サイトまたは関連ページをご確認ください。", en: "Notice to all students. See the official university site for details.", vi: "Thông báo tới sinh viên. Xem trang chính thức.", zh: "致全体学生通知，详见官网。", es: "Aviso a estudiantes. Ver web oficial." }[lang]}
        </div>
      </div>
    </div>
  );
}

/* ---------- Notices List ---------- */
function NoticesListModal() {
  const { lang, setModal } = useApp();
  const tagColors: Record<string, string> = {
    important: "bg-rose-50 text-rose-600",
    warn: "bg-amber-50 text-amber-600",
    info: "bg-sky-50 text-sky-700",
  };
  return (
    <div className="flex-1 flex flex-col">
      <ModalHeader title={t("importantNotice", lang)} />
      <div className="overflow-y-auto pb-6 px-5 pt-3 space-y-2.5">
        {NOTICES.map((n) => (
          <button
            key={n.id}
            onClick={() => setModal({ kind: "notice", id: n.id })}
            className="w-full text-left bg-white rounded-2xl p-4 border border-slate-100 active:scale-[0.99] transition flex items-start gap-3"
          >
            <span className={`mt-0.5 size-8 rounded-xl flex items-center justify-center shrink-0 ${tagColors[n.tag]}`}>
              <AlertCircle size={16} />
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-slate-800 leading-snug">{n.titleI18n[lang]}</div>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${tagColors[n.tag]}`}>
                  {n.tag === "important"
                    ? { ja: "重要", en: "Important", vi: "Quan trọng", zh: "重要", es: "Importante" }[lang]
                    : n.tag === "warn"
                    ? { ja: "注意", en: "Caution", vi: "Cảnh báo", zh: "注意", es: "Atención" }[lang]
                    : { ja: "お知らせ", en: "Info", vi: "Thông tin", zh: "通知", es: "Info" }[lang]}
                </span>
                <span className="text-xs text-slate-400">{n.date}</span>
              </div>
            </div>
            <ChevronRight size={15} className="text-slate-300 mt-0.5 shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------- Schedule Edit ---------- */
function ScheduleEditModal() {
  const { lang, setModal, customSchedule, addScheduleItem, removeScheduleItem } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ time: "", title: "", place: "", tag: "class" as "class" | "club" | "other" });
  const [error, setError] = useState("");

  const handleAdd = () => {
    if (!form.time.trim() || !form.title.trim()) {
      setError({ ja: "時刻と予定名を入力してください", en: "Enter time and title", vi: "Nhập giờ và tiêu đề", zh: "请输入时间和标题", es: "Ingrese hora y título" }[lang]);
      return;
    }
    addScheduleItem({ time: form.time.trim(), title: form.title.trim(), place: form.place.trim(), tag: form.tag });
    setForm({ time: "", title: "", place: "", tag: "class" });
    setError("");
    setShowForm(false);
  };

  const tagLabel: Record<string, Record<string, string>> = {
    class: { ja: "授業", en: "Class", vi: "Lớp", zh: "课程", es: "Clase" },
    club: { ja: "クラブ", en: "Club", vi: "CLB", zh: "社团", es: "Club" },
    other: { ja: "その他", en: "Other", vi: "Khác", zh: "其他", es: "Otro" },
  };

  const allSchedule = [...SCHEDULE, ...customSchedule].sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="flex-1 flex flex-col">
      <ModalHeader title={{ ja: "今日の予定を編集", en: "Edit Today's Schedule", vi: "Chỉnh lịch hôm nay", zh: "编辑今日日程", es: "Editar horario hoy" }[lang]} />
      <div className="overflow-y-auto pb-6">
        {/* Existing items */}
        <div className="px-5 pt-3 space-y-2">
          {allSchedule.map((item) => {
            const isCustom = "tag" in item && customSchedule.some((c) => c.id === item.id);
            const isMoodle = !isCustom;
            const title = typeof item.title === "object" ? item.title[lang] : item.title;
            const tag = (item as any).tag as string;
            return (
              <div key={item.id} className={`bg-white rounded-2xl border p-3.5 flex items-center gap-3 ${isMoodle ? "border-slate-200" : "border-[#13b5b1]/30"}`}>
                <div className="text-xs text-slate-400 w-12 shrink-0">{item.time}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-slate-800 truncate">{title}</div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-xs text-slate-400">{item.place}</span>
                    {tag && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                        tag === "cancelled" ? "bg-rose-50 text-rose-600" :
                        tag === "club" ? "bg-slate-100 text-slate-600" :
                        "bg-sky-50 text-sky-700"
                      }`}>{tagLabel[tag]?.[lang] ?? tag}</span>
                    )}
                    {isMoodle && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#0b2545]/10 text-[#0b2545] flex items-center gap-0.5">
                        <Lock size={8} /> Moodle
                      </span>
                    )}
                  </div>
                </div>
                {isCustom ? (
                  <button
                    onClick={() => removeScheduleItem(item.id)}
                    className="size-8 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center active:scale-90 shrink-0"
                  >
                    <Trash2 size={14} />
                  </button>
                ) : (
                  <div className="size-8 rounded-full bg-slate-50 text-slate-300 flex items-center justify-center shrink-0">
                    <Lock size={13} />
                  </div>
                )}
              </div>
            );
          })}
          {allSchedule.length === 0 && (
            <div className="text-center text-sm text-slate-400 py-6">
              {{ ja: "予定がありません", en: "No schedule", vi: "Không có lịch", zh: "暂无日程", es: "Sin horario" }[lang]}
            </div>
          )}
        </div>

        {/* Add form */}
        {showForm ? (
          <div className="mx-5 mt-4 bg-slate-50 rounded-2xl p-4 space-y-3">
            <div className="text-sm text-slate-700 mb-1">
              {{ ja: "新しい予定を追加", en: "Add new item", vi: "Thêm lịch mới", zh: "添加新日程", es: "Agregar elemento" }[lang]}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-xs text-slate-500 mb-1">{{ ja: "時刻", en: "Time", vi: "Giờ", zh: "时间", es: "Hora" }[lang]}</div>
                <input
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                  placeholder="09:00"
                  className="w-full text-sm bg-white border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#13b5b1]"
                />
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">{{ ja: "場所", en: "Place", vi: "Địa điểm", zh: "地点", es: "Lugar" }[lang]}</div>
                <input
                  value={form.place}
                  onChange={(e) => setForm({ ...form, place: e.target.value })}
                  placeholder="A-101"
                  className="w-full text-sm bg-white border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#13b5b1]"
                />
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-1">{{ ja: "予定名", en: "Title", vi: "Tiêu đề", zh: "名称", es: "Título" }[lang]}</div>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder={{ ja: "例：図書館で自習", en: "e.g. Self-study at library", vi: "VD: Tự học ở thư viện", zh: "例：图书馆自习", es: "Ej: Estudio en biblioteca" }[lang]}
                className="w-full text-sm bg-white border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#13b5b1]"
              />
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-1">{{ ja: "種類", en: "Type", vi: "Loại", zh: "类型", es: "Tipo" }[lang]}</div>
              <div className="flex gap-2">
                {(["class", "club", "other"] as const).map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setForm({ ...form, tag })}
                    className={`text-xs px-3 py-1.5 rounded-full transition ${form.tag === tag ? "bg-[#0b2545] text-white" : "bg-white border border-slate-200 text-slate-600"}`}
                  >
                    {tagLabel[tag][lang]}
                  </button>
                ))}
              </div>
            </div>
            {error && <div className="text-xs text-rose-500">{error}</div>}
            <div className="flex gap-2">
              <button onClick={() => { setShowForm(false); setError(""); }} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600">
                {{ ja: "キャンセル", en: "Cancel", vi: "Hủy", zh: "取消", es: "Cancelar" }[lang]}
              </button>
              <button onClick={handleAdd} className="flex-1 py-2.5 rounded-xl bg-[#0b2545] text-sm text-white">
                {{ ja: "追加", en: "Add", vi: "Thêm", zh: "添加", es: "Agregar" }[lang]}
              </button>
            </div>
          </div>
        ) : (
          <div className="px-5 mt-4">
            <button
              onClick={() => setShowForm(true)}
              className="w-full py-3 rounded-2xl border-2 border-dashed border-slate-200 text-sm text-slate-500 flex items-center justify-center gap-2 active:bg-slate-50"
            >
              <Plus size={16} />
              {{ ja: "予定を追加", en: "Add item", vi: "Thêm lịch", zh: "添加日程", es: "Agregar" }[lang]}
            </button>
          </div>
        )}

        <div className="px-5 mt-4">
          <p className="text-xs text-slate-400 text-center">
            {{ ja: "Moodle連携の予定はロックされており削除できません", en: "Moodle-synced items are locked and cannot be deleted", vi: "Lịch từ Moodle bị khóa, không thể xóa", zh: "Moodle同步的日程已锁定，无法删除", es: "Los elementos de Moodle están bloqueados" }[lang]}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ---------- University Notices Modal ---------- */
function formatNoticeDate(raw: string | null): string {
  if (!raw) return "";
  const m = raw.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return `${m[1]}/${m[2].padStart(2, "0")}/${m[3].padStart(2, "0")}`;
  return raw.slice(0, 10);
}

function formatNoticeDateTime(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${y}/${mo}/${day} ${h}:${min}`;
}

function UniversityNoticesModal() {
  const { setModal } = useApp();
  const { notices, meta, loading, syncing, error, manualRefresh } = useUniversityNotices();
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const categories = ["all", ...Array.from(new Set(notices.map((n) => n.category).filter(Boolean) as string[]))];
  const filtered = categoryFilter === "all" ? notices : notices.filter((n) => n.category === categoryFilter);

  const openArticle = (url: string) => window.open(url, "_blank", "noopener,noreferrer");

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Newspaper size={16} className="text-[#0b2545]" />
          <div className="text-base text-slate-800">大学からのお知らせ</div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={manualRefresh}
            disabled={loading || syncing}
            className="size-8 rounded-full bg-slate-100 flex items-center justify-center active:scale-95"
          >
            <RefreshCw size={14} className={`text-slate-600 ${loading || syncing ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setModal({ kind: "none" })}
            className="size-8 rounded-full bg-slate-100 flex items-center justify-center active:scale-95"
          >
            <X size={16} className="text-slate-600" />
          </button>
        </div>
      </div>

      <div className="overflow-y-auto flex-1 pb-6">
        <div className="px-5 pt-3 pb-1 flex items-center justify-between">
          <span className="text-[10px] text-slate-400">お知らせは1時間ごとに自動更新されます</span>
          {meta && <span className="text-[10px] text-slate-400">最終更新: {formatNoticeDateTime(meta.last_fetched)}</span>}
        </div>

        {categories.length > 1 && (
          <div className="px-5 pt-1 flex gap-2 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`shrink-0 text-xs px-3 py-1.5 rounded-full transition ${
                  categoryFilter === cat ? "bg-[#0b2545] text-white" : "bg-white border border-slate-200 text-slate-600"
                }`}
              >
                {cat === "all" ? "すべて" : cat}
              </button>
            ))}
          </div>
        )}

        <div className="px-5 mt-2 space-y-2.5">
          {loading && notices.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-10">
              <RefreshCw size={24} className="text-slate-300 animate-spin" />
              <div className="text-sm text-slate-400">公式サイトからお知らせを取得中...</div>
            </div>
          ) : error && notices.length === 0 ? (
            <div className="bg-rose-50 rounded-2xl border border-rose-100 p-4 space-y-2">
              <div className="text-sm text-rose-700">お知らせを取得できませんでした。公式サイトをご確認ください。</div>
              <a href="https://www.asahi-u.ac.jp/topics/category/shirase/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-[#0b2545] underline">
                <ExternalLink size={11} /> 朝日大学公式サイトへ
              </a>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center text-sm text-slate-400 py-8">お知らせがありません</div>
          ) : (
            filtered.map((n) => (
              <button
                key={n.id}
                onClick={() => openArticle(n.article_url)}
                className="w-full text-left bg-white rounded-2xl border border-slate-100 p-3.5 flex gap-3 items-start active:scale-[0.99] transition"
              >
                <div className="size-14 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
                  {n.thumbnail_url ? (
                    <img src={n.thumbnail_url} alt={n.title} className="size-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  ) : (
                    <Newspaper size={18} className="text-slate-300" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  {n.category && (
                    <span className="inline-block text-[10px] px-1.5 py-0.5 rounded bg-[#13b5b1]/15 text-[#0b2545] mb-1">{n.category}</span>
                  )}
                  <div className="text-sm text-slate-800 leading-snug line-clamp-2">{n.title}</div>
                  {n.excerpt && <div className="text-xs text-slate-500 mt-0.5 line-clamp-1">{n.excerpt}</div>}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-400">{formatNoticeDate(n.published_at)}</span>
                    <span className="text-[10px] text-slate-300">{n.source_name}</span>
                  </div>
                </div>
                <ExternalLink size={13} className="text-slate-300 mt-0.5 shrink-0" />
              </button>
            ))
          )}
        </div>

        <div className="px-5 mt-4 flex justify-center">
          <a
            href="https://www.asahi-u.ac.jp/topics/category/shirase/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-[#0b2545] bg-[#13b5b1]/10 px-4 py-2.5 rounded-xl"
          >
            <ExternalLink size={13} /> 朝日大学公式サイト News &amp; Topics を開く
          </a>
        </div>
      </div>
    </div>
  );
}

/* ---------- Confirm Official Site Modal ---------- */
function ConfirmOfficialSiteModal() {
  const { setModal } = useApp();
  const OFFICIAL_NEWS_URL = "https://www.asahi-u.ac.jp/topics/category/shirase/";
  return (
    <div className="flex-1 flex flex-col justify-end pb-2">
      <div className="px-5 py-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="size-12 rounded-2xl bg-[#0b2545]/10 flex items-center justify-center shrink-0">
            <ExternalLink size={20} className="text-[#0b2545]" />
          </div>
          <div>
            <div className="text-base text-slate-800">公式サイトを開きますか？</div>
            <div className="text-xs text-slate-500 mt-0.5">朝日大学 News &amp; Topics</div>
          </div>
        </div>
        <div className="bg-slate-50 rounded-xl px-3 py-2 text-xs text-slate-400 break-all">
          {OFFICIAL_NEWS_URL}
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setModal({ kind: "none" })}
            className="flex-1 py-3.5 rounded-2xl border border-slate-200 text-sm text-slate-600 active:scale-[0.98] transition"
          >
            キャンセル
          </button>
          <button
            onClick={() => {
              setModal({ kind: "none" });
              window.open(OFFICIAL_NEWS_URL, "_blank", "noopener,noreferrer");
            }}
            className="flex-1 py-3.5 rounded-2xl bg-[#0b2545] text-sm text-white active:scale-[0.98] transition flex items-center justify-center gap-2"
          >
            <ExternalLink size={15} /> 開く
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Confirm Logout Modal ---------- */
function ConfirmLogoutModal() {
  const { lang, setModal, logout } = useApp();
  const labels = {
    ja: { q: "ログアウトしますか？", yes: "ログアウト", no: "キャンセル" },
    en: { q: "Log out?", yes: "Log out", no: "Cancel" },
    vi: { q: "Đăng xuất?", yes: "Đăng xuất", no: "Hủy" },
    zh: { q: "确定退出？", yes: "退出", no: "取消" },
    es: { q: "¿Cerrar sesión?", yes: "Salir", no: "Cancelar" },
  }[lang];
  return (
    <div className="px-5 py-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="size-12 rounded-2xl bg-rose-50 flex items-center justify-center shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-rose-500"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
        </div>
        <div className="text-base text-slate-800">{labels.q}</div>
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => setModal({ kind: "none" })}
          className="flex-1 py-3.5 rounded-2xl border border-slate-200 text-sm text-slate-600 active:scale-[0.98] transition"
        >
          {labels.no}
        </button>
        <button
          onClick={() => { setModal({ kind: "none" }); logout(); }}
          className="flex-1 py-3.5 rounded-2xl bg-rose-500 text-sm text-white active:scale-[0.98] transition"
        >
          {labels.yes}
        </button>
      </div>
    </div>
  );
}

/* ---------- Confirm Link Modal (汎用リンク確認) ---------- */
function ConfirmLinkModal({ url, label }: { url: string; label?: string }) {
  const { setModal } = useApp();
  // URLを短く表示（ドメインまで）
  const displayUrl = (() => {
    try { return new URL(url).hostname; } catch { return url; }
  })();

  return (
    <div className="px-5 py-6 space-y-4">
      <div className="flex items-start gap-3">
        <div className="size-12 rounded-2xl bg-[#0b2545]/10 flex items-center justify-center shrink-0 mt-0.5">
          <ExternalLink size={20} className="text-[#0b2545]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-base text-slate-800">リンクを開きますか？</div>
          {label && (
            <div className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">{label}</div>
          )}
        </div>
      </div>
      <div className="bg-slate-50 rounded-xl px-3 py-2 text-xs text-slate-400 truncate">
        {displayUrl}
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => setModal({ kind: "none" })}
          className="flex-1 py-3.5 rounded-2xl border border-slate-200 text-sm text-slate-600 active:scale-[0.98] transition"
        >
          キャンセル
        </button>
        <button
          onClick={() => {
            setModal({ kind: "none" });
            window.open(url, "_blank", "noopener,noreferrer");
          }}
          className="flex-1 py-3.5 rounded-2xl bg-[#0b2545] text-sm text-white active:scale-[0.98] transition flex items-center justify-center gap-2"
        >
          <ExternalLink size={15} /> 開く
        </button>
      </div>
    </div>
  );
}
