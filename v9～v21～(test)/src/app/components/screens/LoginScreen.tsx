import { useState } from "react";
import { useApp } from "../../AppContext";
import { t } from "../../i18n";
import { LANGUAGES } from "../../i18n";
import { STUDENT } from "../../data";
import { GraduationCap, Globe, User, Lock, ChevronRight, Eye, EyeOff } from "lucide-react";

export function LoginScreen() {
  const { lang, setLang, login } = useApp();
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [langOpen, setLangOpen] = useState(false);
  const [error, setError] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id.trim()) { setError(true); return; }
    if (pw !== "test") { setError(true); return; }
    setError(false);
    login(id.trim());
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-gradient-to-br from-[#0b2545] via-[#0f3b5c] to-[#13b5b1] text-white overflow-hidden">
      {/* decorative blobs */}
      <div className="absolute -top-20 -right-16 size-56 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute bottom-24 -left-20 size-56 rounded-full bg-[#13b5b1]/30 blur-3xl" />

      {/* language switch */}
      <div className="relative px-5 pt-9 flex justify-end">
        <div className="relative">
          <button
            onClick={() => setLangOpen((v) => !v)}
            className="flex items-center gap-1.5 text-xs bg-white/15 rounded-full px-3 py-1.5 active:scale-95 transition"
          >
            <Globe size={14} />
            {LANGUAGES.find((l) => l.code === lang)?.native}
          </button>
          {langOpen && (
            <div className="absolute right-0 mt-2 w-36 bg-white rounded-2xl shadow-xl overflow-hidden z-10">
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => { setLang(l.code); setLangOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 text-sm active:bg-slate-100 ${
                    l.code === lang ? "text-[#0b2545] bg-slate-50" : "text-slate-600"
                  }`}
                >
                  {l.native}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* brand */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-8">
        <div className="size-20 rounded-3xl bg-white/15 backdrop-blur flex items-center justify-center mb-5 shadow-lg">
          <GraduationCap size={40} />
        </div>
        <div className="text-2xl tracking-wide">{t("loginTitle", lang)}</div>
        <div className="text-sm opacity-80 mt-2 text-center">{t("loginSub", lang)}</div>
      </div>

      {/* form sheet */}
      <div className="relative bg-white text-slate-800 rounded-t-[2rem] px-6 pt-7 pb-9">
        <form onSubmit={submit} className="space-y-3">
          <label className="flex items-center gap-3 bg-slate-50 rounded-2xl px-4 py-3 border border-slate-100 focus-within:border-[#13b5b1] transition">
            <User size={18} className="text-slate-400 shrink-0" />
            <div className="flex-1">
              <div className="text-[11px] text-slate-400">{ { ja: "ユーザー名", en: "Username", vi: "Tên đăng nhập", zh: "用户名", es: "Usuario" }[lang] }</div>
              <input
                value={id}
                onChange={(e) => { setId(e.target.value); setError(false); }}
                className="w-full bg-transparent outline-none text-sm text-slate-800"
                placeholder={ { ja: "名前を入力", en: "Enter your name", vi: "Nhập tên", zh: "输入姓名", es: "Ingrese su nombre" }[lang] }
              />
            </div>
          </label>

          <label className="flex items-center gap-3 bg-slate-50 rounded-2xl px-4 py-3 border border-slate-100 focus-within:border-[#13b5b1] transition">
            <Lock size={18} className="text-slate-400 shrink-0" />
            <div className="flex-1">
              <div className="text-[11px] text-slate-400">{t("password", lang)}</div>
              <input
                type={showPw ? "text" : "password"}
                value={pw}
                onChange={(e) => { setPw(e.target.value); setError(false); }}
                className="w-full bg-transparent outline-none text-sm text-slate-800"
                placeholder="••••••••"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="text-slate-400 active:text-slate-600 transition shrink-0"
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </label>

          {error && (
            <div className="text-xs text-rose-500 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2 text-center">
              { { ja: "ユーザー名またはパスワードが正しくありません", en: "Invalid username or password", vi: "Sai tên đăng nhập hoặc mật khẩu", zh: "用户名或密码错误", es: "Usuario o contraseña incorrectos" }[lang] }
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#0b2545] to-[#13b5b1] text-white rounded-2xl py-3.5 flex items-center justify-center gap-2 active:scale-[0.99] transition mt-1"
          >
            {t("loginBtn", lang)}
            <ChevronRight size={18} />
          </button>
        </form>

        <button className="w-full text-center text-xs text-slate-400 mt-4 active:text-slate-600">
          {t("forgotPw", lang)}
        </button>

        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-slate-100" />
          <span className="text-[11px] text-slate-300">or</span>
          <div className="flex-1 h-px bg-slate-100" />
        </div>

        <button
          onClick={() => login(id.trim() || "__sso__")}
          className="w-full border border-slate-200 rounded-2xl py-3 text-sm text-slate-600 active:bg-slate-50 transition"
        >
          {t("ssoLogin", lang)}
        </button>

        <p className="text-[10px] text-slate-300 text-center mt-4 leading-relaxed">
          {t("loginTerms", lang)}
        </p>
      </div>
    </div>
  );
}
