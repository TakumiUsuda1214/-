import { useApp } from "../../AppContext";
import { t } from "../../i18n";
import { STUDENT } from "../../data";
import { QrCode, Globe, Bell, Building2, DollarSign, Briefcase, Shield, CloudRain, Globe2, MessageCircle, RefreshCw, Settings as SetIcon, ChevronRight, HelpCircle, LogOut } from "lucide-react";

export function MenuScreen() {
  const { lang, setModal, username: rawUsername } = useApp();
  const username = rawUsername === "__sso__" ? t("ssoUsername", lang) : rawUsername;

  const items: { icon: any; key: string; desc?: string; onClick?: () => void }[] = [
    { icon: QrCode, key: "studentIdQR", desc: { ja: "学生証を表示", en: "Show ID", vi: "Thẻ SV", zh: "显示学生证", es: "Mostrar ID" }[lang], onClick: () => setModal({ kind: "qr" }) },
    { icon: Globe, key: "language", onClick: () => setModal({ kind: "language" }) },
    { icon: Bell, key: "notifications", onClick: () => setModal({ kind: "notifications" }) },
    { icon: SetIcon, key: "settings", onClick: () => setModal({ kind: "settings" }) },
  ];
  const more: { icon: any; label: string; desc: string; url?: string }[] = [
    { icon: Building2, label: { ja: "施設情報", en: "Facilities", vi: "Cơ sở", zh: "设施", es: "Instalaciones" }[lang], desc: { ja: "キャンパス案内", en: "Campus map", vi: "Bản đồ", zh: "校园地图", es: "Mapa" }[lang] ,url: "https://www.asahi-u.ac.jp/inf/fac/f-shisetsu/"},
    { icon: DollarSign, label: { ja: "学費・奨学金", en: "Tuition & Scholarship", vi: "Học phí", zh: "学费奖学金", es: "Matrícula" }[lang], desc: "—" ,url: "https://www.asahi-u.ac.jp/campus/tuition/"},
    { icon: Briefcase, label: { ja: "学生アルバイト情報", en: "Part-time jobs", vi: "Việc làm thêm", zh: "兼职信息", es: "Empleos" }[lang], desc: "—" ,url: "https://www.asahi-u.ac.jp/students/fstudents/"},
    { icon: Shield, label: { ja: "災害対策マニュアル", en: "Disaster manual", vi: "Hướng dẫn thiên tai", zh: "防灾手册", es: "Manual desastres" }[lang], desc: "—",url: "https://www.asahi-u.ac.jp/media/bousai-1.pdf",},
    { icon: CloudRain, label: { ja: "自然災害時の授業措置", en: "Disaster class policy", vi: "Lớp khi thiên tai", zh: "灾害课程措施", es: "Clases por desastres" }[lang], desc: "—",url: "https://www.asahi-u.ac.jp/media/natural_disasters.pdf",},
    { icon: Globe2, label: { ja: "国際学生サポート", en: "Intl student support", vi: "Hỗ trợ SV QT", zh: "国际生支持", es: "Apoyo intl." }[lang], desc: "—" ,url: "https://www.asahi-u.ac.jp/global/"},
    { icon: MessageCircle, label: { ja: "相談窓口", en: "Counseling", vi: "Tư vấn", zh: "咨询窗口", es: "Orientación" }[lang], desc: "—" ,url: "https://www.asahi-u.ac.jp/campus/sup/mado/"},
    { icon: RefreshCw, label: { ja: "Moodle連携設定", en: "Moodle settings", vi: "Cài Moodle", zh: "Moodle设置", es: "Ajustes Moodle" }[lang], desc: "—", },
    { icon: HelpCircle, label: t("help", lang), desc: "—" },
  ];

  return (
    <div className="pb-24">
      <div className="px-5 pt-12 pb-4 bg-gradient-to-br from-[#0b2545] to-[#13b5b1] text-white rounded-b-3xl">
        <div className="text-xl">{t("navMenu", lang)}</div>
      </div>

      {/* Profile card */}
      <div className="px-5 mt-4">
        <div className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-3">
          <div className="size-14 rounded-full bg-gradient-to-br from-[#0b2545] to-[#13b5b1] text-white flex items-center justify-center text-lg">
            {username.slice(0, 1).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="text-sm text-slate-800">{username}</div>
            <div className="text-xs text-slate-500">{STUDENT.id} · {STUDENT.year[lang]}</div>
            <div className="text-xs text-slate-500">{STUDENT.faculty[lang]}</div>
          </div>
          <button onClick={() => setModal({ kind: "qr" })} className="text-xs px-3 py-1.5 rounded-full bg-[#0b2545] text-white flex items-center gap-1 active:scale-95">
            <QrCode size={14} /> QR
          </button>
        </div>
      </div>

      {/* Quick actions */}
      <div className="px-5 mt-4 space-y-2">
        {items.map((it, i) => {
          const Icon = it.icon;
          return (
            <button key={i} onClick={it.onClick} className="w-full bg-white rounded-2xl border border-slate-100 p-3.5 flex items-center gap-3 active:scale-[0.99] transition text-left">
              <div className="size-10 rounded-xl bg-[#13b5b1]/15 flex items-center justify-center text-[#0b2545]"><Icon size={18} /></div>
              <div className="flex-1">
                <div className="text-sm text-slate-800">{t(it.key, lang)}</div>
                {it.desc && <div className="text-xs text-slate-500 mt-0.5">{it.desc}</div>}
              </div>
              <ChevronRight size={16} className="text-slate-300" />
            </button>
          );
        })}
      </div>

      <div className="px-5 mt-5 text-xs text-slate-500 mb-2">More</div>
      <div className="px-5 space-y-2">
        {more.map((it, i) => {
          const Icon = it.icon;
          return (
            <button key={i} onClick={() => it.url && window.open(it.url, "_blank")} className="w-full bg-white rounded-2xl border border-slate-100 p-3.5 flex items-center gap-3 active:scale-[0.99] transition text-left">
              <div className="size-10 rounded-xl bg-slate-50 flex items-center justify-center text-[#0b2545]"><Icon size={18} /></div>
              <div className="flex-1">
                <div className="text-sm text-slate-800">{it.label}</div>
                <div className="text-xs text-slate-500 mt-0.5">{it.desc}</div>
              </div>
              <ChevronRight size={16} className="text-slate-300" />
            </button>
          );
        })}
      </div>

      {/* Logout */}
      <div className="px-5 mt-5 pb-2">
        <button
          onClick={() => setModal({ kind: "confirmLogout" })}
          className="w-full bg-white rounded-2xl border border-rose-100 p-3.5 flex items-center gap-3 active:scale-[0.99] transition text-left"
        >
          <div className="size-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500"><LogOut size={18} /></div>
          <div className="flex-1 text-sm text-rose-500">{t("logout", lang)}</div>
        </button>
      </div>
    </div>
  );
}
