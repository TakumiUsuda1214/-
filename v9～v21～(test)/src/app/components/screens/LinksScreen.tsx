import { useState } from "react";
import { useApp } from "../../AppContext";
import { t } from "../../i18n";
import { LINKS } from "../../data";
import { Search, ExternalLink, BookOpen, GraduationCap, Mail, FolderOpen, Briefcase, FileText, Library, MessageCircle, Heart, Globe, Utensils, AlertCircle, QrCode, Users } from "lucide-react";

const ICONS: Record<string, any> = { BookOpen, GraduationCap, Mail, FolderOpen, Briefcase, FileText, Library, MessageCircle, Heart, Globe, Utensils, AlertCircle, QrCode, Users };
const CATS = ["all", "study", "life", "career", "facility", "other"] as const;
const CAT_KEY: Record<string, string> = { study: "studyLearning", life: "studentLife", career: "career", facility: "facility", other: "other" };

export function LinksScreen() {
  const { lang, setModal, setTab } = useApp();
  const [cat, setCat] = useState<typeof CATS[number]>("all");
  const [q, setQ] = useState("");

  const filtered = LINKS.filter((l) => (cat === "all" || l.cat === cat) && (!q || l.name[lang].toLowerCase().includes(q.toLowerCase())));

  const open = (l: typeof LINKS[number]) => {
    if (l.id === "l13") return setModal({ kind: "qr" });
    if (l.id === "l11") return setModal({ kind: "cafeteria" });
    if (l.id === "l12") return setModal({ kind: "cancellations" });
    if (l.url) return window.open(l.url, "_blank");
    if (l.id === "l14") return setModal({ kind: "clubs" });
  };

  return (
    <div className="pb-24">
      <div className="px-5 pt-12 pb-4 bg-gradient-to-br from-[#0b2545] to-[#13b5b1] text-white rounded-b-3xl">
        <div className="text-xl mb-3">{t("navLinks", lang)}</div>
        <div className="bg-white rounded-full flex items-center gap-2 px-3 py-2">
          <Search size={16} className="text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("searchPlaceholder", lang)} className="flex-1 outline-none text-sm text-slate-700 bg-transparent" />
        </div>
      </div>

      <div className="px-5 mt-4 flex gap-2 overflow-x-auto pb-1">
        {CATS.map((c) => (
          <button key={c} onClick={() => setCat(c)} className={`shrink-0 text-xs px-3 py-1.5 rounded-full transition ${cat === c ? "bg-[#0b2545] text-white" : "bg-white border border-slate-200 text-slate-600"}`}>
            {c === "all" ? t("all", lang) : t(CAT_KEY[c], lang)}
          </button>
        ))}
      </div>

      <div className="px-5 mt-4 grid grid-cols-1 gap-2.5">
        {filtered.map((l) => {
          const Icon = ICONS[l.icon] ?? BookOpen;
          return (
            <button key={l.id} onClick={() => open(l)} className="bg-white rounded-2xl p-4 border border-slate-100 flex items-center gap-3 active:scale-[0.99] transition text-left">
              <div className="size-11 rounded-xl bg-[#13b5b1]/15 flex items-center justify-center text-[#0b2545]">
                <Icon size={20} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-slate-800">{l.name[lang]}</span>
                  {l.url && <ExternalLink size={12} className="text-slate-400" />}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">{l.desc[lang]}</div>
              </div>
              <span className="text-xs text-[#0b2545] px-2 py-1 rounded-full bg-slate-50">{t("open", lang)}</span>
            </button>
          );
        })}
        {filtered.length === 0 && <div className="text-center text-sm text-slate-400 py-8">No results</div>}
      </div>
    </div>
  );
}
