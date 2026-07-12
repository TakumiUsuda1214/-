import { Home, ListChecks, Sparkles, Link2, Menu } from "lucide-react";
import { useApp, Tab } from "../AppContext";
import { t } from "../i18n";

const items: { id: Tab; icon: any; key: string }[] = [
  { id: "home", icon: Home, key: "navHome" },
  { id: "tasks", icon: ListChecks, key: "navTasks" },
  { id: "ai", icon: Sparkles, key: "navAI" },
  { id: "links", icon: Link2, key: "navLinks" },
  { id: "menu", icon: Menu, key: "navMenu" },
];

export function BottomNav() {
  const { tab, setTab, lang } = useApp();
  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-slate-200 pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-5 px-2 pt-1.5 pb-2">
        {items.map(({ id, icon: Icon, key }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              onClick={() => setTab(id)}
              className="flex flex-col items-center gap-0.5 py-1.5 active:scale-95 transition-transform"
            >
              <div className={`relative flex items-center justify-center transition-colors ${active ? "text-[#0b2545]" : "text-slate-400"}`}>
                <Icon size={22} strokeWidth={active ? 2.4 : 2} />
              </div>
              <span className={`text-[10px] ${active ? "text-[#0b2545]" : "text-slate-400"}`}>{t(key, lang)}</span>
              <span className={`mt-0.5 h-1 w-1 rounded-full transition-colors ${active ? "bg-[#13b5b1]" : "bg-transparent"}`} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
