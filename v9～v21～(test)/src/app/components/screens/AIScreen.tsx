import { useState, useRef, useEffect } from "react";
import { useApp } from "../../AppContext";
import { t, Lang } from "../../i18n";
import { Send, Sparkles, BookOpen, Library, Utensils, AlertCircle, ChevronRight } from "lucide-react";

type Msg = { id: string; from: "ai" | "user"; text: string; cards?: { label: string; action?: () => void; icon?: any }[] };

const SUGGESTIONS: Record<Lang, string[]> = {
  ja: ["履修登録はどこ？", "Moodleの課題を確認したい", "今日の食堂メニューは？", "休講情報を見たい", "学生証QRを表示したい", "図書館を使いたい"],
  en: ["Where can I check my assignments?", "Show my Moodle assignments", "How can I contact the career center?", "Where is the library?", "What is today's cafeteria menu?", "Are there any canceled classes today?"],
  vi: ["Đăng ký học ở đâu?", "Xem bài tập Moodle", "Thực đơn căng tin hôm nay?", "Lịch hủy hôm nay?", "Hiển thị QR thẻ SV", "Sử dụng thư viện"],
  zh: ["在哪里选课？", "查看Moodle作业", "今天食堂有什么？", "今天有停课吗？", "显示学生证QR", "使用图书馆"],
  es: ["¿Dónde inscribirme?", "Mostrar tareas Moodle", "Menú cafetería hoy", "¿Clases canceladas?", "Mostrar QR de ID", "Usar biblioteca"],
};

export function AIScreen() {
  const { lang, setModal, setTab } = useApp();
  const [messages, setMessages] = useState<Msg[]>(() => [
    { id: "m1", from: "ai", text: { ja: "こんにちは！大学生活で困ったことを質問してください。", en: "Hi! Ask me anything about campus life.", vi: "Xin chào! Hỏi tôi về cuộc sống ĐH.", zh: "你好！有什么校园问题尽管问。", es: "¡Hola! Pregúntame sobre la vida universitaria." }[lang] },
  ]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const reply = (q: string) => {
    const lq = q.toLowerCase();
    if (/moodle|課題|作业|tarea|bài tập|assignment/i.test(q)) {
      return {
        text: { ja: "Moodleから取得した直近の課題を表示します。未提出が2件あります。", en: "Showing recent Moodle tasks. 2 not submitted.", vi: "Có 2 bài chưa nộp.", zh: "Moodle上有2份未提交作业。", es: "Hay 2 tareas pendientes." }[lang],
        cards: [
          { label: "情報リテラシー 第5回レポート", icon: BookOpen, action: () => setModal({ kind: "moodle", id: "a1" }) },
          { label: "Academic English Vocabulary Quiz", icon: BookOpen, action: () => setModal({ kind: "moodle", id: "a2" }) },
        ],
      };
    }
    if (/食堂|cafeteria|menu|食|cà phê|comedor/i.test(q) || lq.includes("menu")) {
      return {
        text: { ja: "今日のおすすめは日替わり定食とカレーライスです。混雑状況はやや混雑です。", en: "Today's picks: Daily Set and Curry Rice. Somewhat busy.", vi: "Set ngày & Cơm cà ri. Khá đông.", zh: "今日推荐：每日套餐、咖喱饭。较忙。", es: "Hoy: Menú del día y Curry. Algo lleno." }[lang],
        cards: [{ label: t("todayCafeteria", lang), icon: Utensils, action: () => setModal({ kind: "cafeteria" }) }],
      };
    }
    if (/休講|cancel|停课|hủy|cancelad/i.test(q)) {
      return {
        text: { ja: "本日の休講情報をお知らせします。", en: "Here are today's class changes.", vi: "Thay đổi lớp hôm nay.", zh: "今日课程变更。", es: "Cambios de clase de hoy." }[lang],
        cards: [{ label: t("classCancellation", lang), icon: AlertCircle, action: () => setModal({ kind: "cancellations" }) }],
      };
    }
    if (/図書館|library|thư viện|图书馆|biblioteca/i.test(q)) {
      return {
        text: { ja: "図書館の蔵書検索や開館情報はこちらから確認できます。", en: "You can search the library catalog here.", vi: "Tìm sách thư viện tại đây.", zh: "可在此检索图书馆藏书。", es: "Busca en el catálogo aquí." }[lang],
        cards: [{ label: t("navLinks", lang), icon: Library, action: () => { setTab("links"); } }],
      };
    }
    if (/qr|学生証|thẻ|学生证|estudiante/i.test(q)) {
      return {
        text: { ja: "学生証QRコードを表示します。", en: "Showing student ID QR.", vi: "Hiển thị QR thẻ SV.", zh: "显示学生证QR。", es: "Mostrando QR." }[lang],
        cards: [{ label: t("studentIdQR", lang), action: () => setModal({ kind: "qr" }) }],
      };
    }
    return {
      text: { ja: "リンク画面から関連サービスを探してみてください。", en: "Try the Links tab for related services.", vi: "Thử tab Liên kết.", zh: "请在链接页查找服务。", es: "Prueba la pestaña Enlaces." }[lang],
      cards: [{ label: t("navLinks", lang), action: () => setTab("links") }],
    };
  };

  const send = (q: string) => {
    if (!q.trim()) return;
    const userMsg: Msg = { id: `u${Date.now()}`, from: "user", text: q };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setTimeout(() => {
      const r = reply(q);
      setMessages((m) => [...m, { id: `a${Date.now()}`, from: "ai", text: r.text, cards: r.cards }]);
    }, 500);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 pt-12 pb-3 bg-gradient-to-br from-[#0b2545] to-[#13b5b1] text-white rounded-b-3xl">
        <div className="flex items-center gap-2">
          <div className="size-9 rounded-xl bg-white/20 flex items-center justify-center"><Sparkles size={18} /></div>
          <div>
            <div className="text-base">{t("navAI", lang)}</div>
            <div className="text-[11px] opacity-90">{t("aiHelpDesc", lang)}</div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-2 space-y-3">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm ${
              m.from === "user" ? "bg-[#0b2545] text-white rounded-br-md" : "bg-[#13b5b1]/10 text-slate-800 rounded-bl-md"
            }`}>
              <div>{m.text}</div>
              {m.cards && (
                <div className="mt-2 space-y-1.5">
                  {m.cards.map((c, i) => {
                    const Icon = c.icon;
                    return (
                      <button key={i} onClick={c.action} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 flex items-center gap-2 text-slate-800 active:scale-[0.99] transition">
                        {Icon && <Icon size={16} className="text-[#0b2545]" />}
                        <span className="text-xs flex-1 text-left">{c.label}</span>
                        <ChevronRight size={14} className="text-slate-400" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div className="px-4 pb-2">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {SUGGESTIONS[lang].map((s, i) => (
            <button key={i} onClick={() => send(s)} className="shrink-0 text-xs px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 active:scale-95 transition">
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pb-24 pt-1 border-t border-slate-100 bg-white">
        <div className="flex items-center gap-2 mt-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send(input)}
            placeholder={t("askPlaceholder", lang)}
            className="flex-1 bg-slate-100 rounded-full px-4 py-2.5 text-sm outline-none focus:ring-2 ring-[#13b5b1]"
          />
          <button onClick={() => send(input)} className="size-10 rounded-full bg-[#0b2545] text-white flex items-center justify-center active:scale-95">
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
