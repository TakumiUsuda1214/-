import { createContext, useContext, useState, ReactNode } from "react";
import { Lang } from "./i18n";
import { NotificationItem, CANCELLATIONS, Cancellation, Assignment, ASSIGNMENTS } from "./data";

export type Tab = "home" | "tasks" | "ai" | "links" | "menu";

export type CustomScheduleItem = {
  id: string;
  time: string;
  title: string;
  place: string;
  tag: "class" | "club" | "other";
};

export type Modal =
  | { kind: "none" }
  | { kind: "qr" }
  | { kind: "cafeteria" }
  | { kind: "cancellations" }
  | { kind: "moodle"; id: string }
  | { kind: "clubs" }
  | { kind: "settings" }
  | { kind: "notifications" }
  | { kind: "language" }
  | { kind: "notice"; id: string }
  | { kind: "scheduleEdit" }
  | { kind: "noticesList" }
  | { kind: "universityNotices" }
  | { kind: "confirmOfficialSite" }
  | { kind: "confirmLogout" }
  | { kind: "confirmLink"; url: string; label?: string };

type Ctx = {
  loggedIn: boolean; username: string; login: (name: string) => void; logout: () => void;
  lang: Lang; setLang: (l: Lang) => void;
  tab: Tab; setTab: (t: Tab) => void;
  modal: Modal; setModal: (m: Modal) => void;
  notifications: NotificationItem[]; markNotifRead: (id: string) => void; markAllNotifsRead: () => void;
  cancellations: Cancellation[]; markCancellationRead: (id: string) => void;
  assignments: Assignment[];
  theme: "light" | "dark"; setTheme: (t: "light" | "dark") => void;
  notif: boolean; setNotif: (v: boolean) => void;
  moodleSync: { assignments: boolean; feedback: boolean; grades: boolean };
  setMoodleSync: (v: { assignments: boolean; feedback: boolean; grades: boolean }) => void;
  customSchedule: CustomScheduleItem[];
  addScheduleItem: (item: Omit<CustomScheduleItem, "id">) => void;
  removeScheduleItem: (id: string) => void;
  collapsed: Record<string, boolean>; toggleCollapsed: (id: string) => void;
  universityNoticesBadge: number;
  setUniversityNoticesBadge: (n: number) => void;
};

const C = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [lang, setLang] = useState<Lang>("ja");
  const [tab, setTab] = useState<Tab>("home");
  const [modal, setModal] = useState<Modal>({ kind: "none" });
  // ダミー通知は無効化 — 実際の通知のみ使用
  const [notifications, setNotifs] = useState<NotificationItem[]>([]);
  const [cancellations, setCancellations] = useState(CANCELLATIONS);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [notif, setNotif] = useState(true);
  const [moodleSync, setMoodleSync] = useState({ assignments: true, feedback: true, grades: false });
  const [customSchedule, setCustomSchedule] = useState<CustomScheduleItem[]>([]);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [universityNoticesBadge, setUniversityNoticesBadgeRaw] = useState<number>(() => {
    try { return Number(sessionStorage.getItem("univ_badge") ?? "0"); } catch { return 0; }
  });
  const setUniversityNoticesBadge = (n: number) => {
    try { sessionStorage.setItem("univ_badge", String(n)); } catch { /* ignore */ }
    setUniversityNoticesBadgeRaw(n);
  };

  const toggleCollapsed = (id: string) =>
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));

  const addScheduleItem = (item: Omit<CustomScheduleItem, "id">) => {
    setCustomSchedule((prev) => [...prev, { ...item, id: `cs${Date.now()}` }]);
  };
  const removeScheduleItem = (id: string) => {
    setCustomSchedule((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <C.Provider value={{
      loggedIn, username,
      login: (name: string) => { setUsername(name); setLoggedIn(true); },
      logout: () => {
        try { sessionStorage.removeItem("univ_badge"); sessionStorage.removeItem("asahi_shirase_notices_session_v3"); } catch { /* ignore */ }
        setUniversityNoticesBadgeRaw(0);
        setLoggedIn(false); setUsername(""); setTab("home"); setModal({ kind: "none" });
      },
      lang, setLang, tab, setTab, modal, setModal,
      notifications,
      markNotifRead: (id) => setNotifs((ns) => ns.map((n) => (n.id === id ? { ...n, read: true } : n))),
      markAllNotifsRead: () => setNotifs((ns) => ns.map((n) => ({ ...n, read: true }))),
      cancellations,
      markCancellationRead: (id) => setCancellations((cs) => cs.map((c) => (c.id === id ? { ...c, read: true } : c))),
      assignments: ASSIGNMENTS,
      theme, setTheme,
      notif, setNotif,
      moodleSync, setMoodleSync,
      customSchedule, addScheduleItem, removeScheduleItem,
      collapsed, toggleCollapsed,
      universityNoticesBadge, setUniversityNoticesBadge: setUniversityNoticesBadge,
    }}>
      {children}
    </C.Provider>
  );
}

export const useApp = () => {
  const v = useContext(C);
  if (!v) throw new Error("AppProvider missing");
  return v;
};
