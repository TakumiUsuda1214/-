import { Bell, Globe, LogOut } from "lucide-react";
import { useApp } from "../AppContext";
import { t } from "../i18n";

export function AppHeader() {
  const { lang, setModal, notifications, username: rawUsername, universityNoticesBadge } = useApp();
  const username = rawUsername === "__sso__" ? t("ssoUsername", lang) : rawUsername;
  const unread = notifications.filter((n) => !n.read).length + universityNoticesBadge;
  const today = new Date(2026, 5, 4);
  const dateStr = today.toLocaleDateString(
    { ja: "ja-JP", en: "en-US", vi: "vi-VN", zh: "zh-CN", es: "es-ES" }[lang],
    { weekday: "short", month: "short", day: "numeric" }
  );

  return (
    <div className="px-5 pt-9 pb-3 bg-gradient-to-br from-[#0b2545] to-[#13b5b1] text-white rounded-b-3xl relative">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs opacity-80">{dateStr}</div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setModal({ kind: "language" })}
            className="size-8 rounded-full bg-white/15 flex items-center justify-center active:scale-95 transition"
            aria-label="Language"
          >
            <Globe size={16} />
          </button>
          <button
            onClick={() => setModal({ kind: "notifications" })}
            className="size-8 rounded-full bg-white/15 flex items-center justify-center relative active:scale-95 transition"
            aria-label="Notifications"
          >
            <Bell size={16} />
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-0.5 rounded-full bg-rose-500 text-[9px] flex items-center justify-center">
                {unread}
              </span>
            )}
          </button>
          <button
            onClick={() => setModal({ kind: "confirmLogout" })}
            className="size-8 rounded-full bg-white/15 flex items-center justify-center active:scale-95 transition"
            aria-label="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
      <div className="text-lg">{t("greetingMorning", lang)}, {username}</div>
      <div className="text-xs opacity-80 mt-0.5">{t("greetingSub", lang)}</div>

    </div>
  );
}
