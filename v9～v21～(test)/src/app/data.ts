import { Lang } from "./i18n";

export const STUDENT = {
  name: { ja: "山田 太郎", en: "Taro Yamada", vi: "Yamada Taro", zh: "山田太郎", es: "Taro Yamada" } as Record<Lang, string>,
  id: "S2300123",
  faculty: { ja: "経営学部 経営学科", en: "Business / Management", vi: "Kinh doanh / Quản trị", zh: "经营学部 经营学科", es: "Negocios / Gestión" } as Record<Lang, string>,
  year: { ja: "3年生", en: "3rd year", vi: "Năm 3", zh: "三年级", es: "3er año" } as Record<Lang, string>,
};

export type Notice = { id: string; titleI18n: Record<Lang, string>; tag: "important" | "info" | "warn"; date: string };
export const NOTICES: Notice[] = [
  { id: "n1", tag: "important", date: "06/04",
    titleI18n: { ja: "本日 情報リテラシー 3限休講", en: "Info Literacy class cancelled (3rd period today)", vi: "Hủy lớp Tin học hôm nay tiết 3", zh: "今日3限信息素养停课", es: "Clase de Informática cancelada (3a hora)" } },
  { id: "n2", tag: "info", date: "06/03",
    titleI18n: { ja: "前期試験期間のお知らせ", en: "Mid-term exam schedule announced", vi: "Lịch thi giữa kỳ", zh: "期中考试安排通知", es: "Calendario de exámenes" } },
  { id: "n3", tag: "warn", date: "06/02",
    titleI18n: { ja: "図書館 開館時間変更", en: "Library hours changed", vi: "Giờ thư viện thay đổi", zh: "图书馆开放时间变更", es: "Horario biblioteca cambiado" } },
];

export type Cancellation = { id: string; course: Record<Lang, string>; teacher: string; date: string; period: string; type: "cancelled" | "makeup" | "roomChange" | "online"; note: Record<Lang, string>; read?: boolean };
export const CANCELLATIONS: Cancellation[] = [
  { id: "c1", course: { ja: "情報リテラシー", en: "Info Literacy", vi: "Tin học", zh: "信息素养", es: "Informática" }, teacher: "佐藤 健", date: "06/04", period: "3", type: "cancelled", note: { ja: "教員体調不良のため", en: "Instructor unwell", vi: "GV ốm", zh: "教师身体原因", es: "Docente enfermo" } },
  { id: "c2", course: { ja: "Academic English", en: "Academic English", vi: "Tiếng Anh học thuật", zh: "学术英语", es: "Inglés académico" }, teacher: "Smith J.", date: "06/05", period: "2", type: "roomChange", note: { ja: "A棟203 → B棟301", en: "A-203 → B-301", vi: "A-203 → B-301", zh: "A-203 → B-301", es: "A-203 → B-301" } },
  { id: "c3", course: { ja: "経営学入門", en: "Intro to Management", vi: "Nhập môn Quản trị", zh: "经营学入门", es: "Intro Gestión" }, teacher: "高橋 美咲", date: "06/12", period: "5", type: "makeup", note: { ja: "5月20日休講分", en: "Makeup for May 20", vi: "Bù 20/5", zh: "5月20日补课", es: "Reposición 20/5" } },
];

export type Assignment = {
  id: string; course: Record<Lang, string>; title: Record<Lang, string>;
  due: string; status: "notSubmitted" | "submitted" | "grading" | "feedbackAvailable";
  daysLeft: number; priority: "high" | "mid" | "low";
};
export const ASSIGNMENTS: Assignment[] = [
  { id: "a1", course: { ja: "情報リテラシー", en: "Info Literacy", vi: "Tin học", zh: "信息素养", es: "Informática" }, title: { ja: "第5回レポート", en: "Report #5", vi: "Báo cáo #5", zh: "第5次报告", es: "Informe #5" }, due: "06/10 23:59", status: "notSubmitted", daysLeft: 3, priority: "high" },
  { id: "a2", course: { ja: "Academic English", en: "Academic English", vi: "Tiếng Anh", zh: "学术英语", es: "Inglés" }, title: { ja: "Vocabulary Quiz", en: "Vocabulary Quiz", vi: "Quiz từ vựng", zh: "词汇测验", es: "Quiz vocabulario" }, due: "06/07 09:00", status: "notSubmitted", daysLeft: 1, priority: "high" },
  { id: "a3", course: { ja: "経営学入門", en: "Intro Management", vi: "Quản trị", zh: "经营学", es: "Gestión" }, title: { ja: "ケース分析", en: "Case Study", vi: "Phân tích case", zh: "案例分析", es: "Caso práctico" }, due: "06/15 23:59", status: "submitted", daysLeft: 8, priority: "mid" },
  { id: "a4", course: { ja: "統計学", en: "Statistics", vi: "Thống kê", zh: "统计学", es: "Estadística" }, title: { ja: "演習問題3", en: "Exercises 3", vi: "Bài tập 3", zh: "习题3", es: "Ejercicios 3" }, due: "05/30 23:59", status: "feedbackAvailable", daysLeft: -5, priority: "low" },
];

export type CafeItem = { id: string; name: Record<Lang, string>; price: number; kcal: number; cat: "set" | "noodle" | "rice" | "snack" | "drink"; soldOut?: boolean };
export const CAFE: CafeItem[] = [
  { id: "f1", cat: "set", price: 580, kcal: 720, name: { ja: "日替わり定食", en: "Daily Set", vi: "Set ngày", zh: "每日套餐", es: "Menú del día" } },
  { id: "f2", cat: "rice", price: 480, kcal: 850, name: { ja: "カレーライス", en: "Curry Rice", vi: "Cơm cà ri", zh: "咖喱饭", es: "Curry" } },
  { id: "f3", cat: "noodle", price: 380, kcal: 520, name: { ja: "うどん", en: "Udon", vi: "Mì udon", zh: "乌冬面", es: "Udon" } },
  { id: "f4", cat: "noodle", price: 450, kcal: 610, name: { ja: "ラーメン", en: "Ramen", vi: "Ramen", zh: "拉面", es: "Ramen" }, soldOut: true },
  { id: "f5", cat: "rice", price: 520, kcal: 780, name: { ja: "唐揚げ丼", en: "Karaage Bowl", vi: "Cơm gà chiên", zh: "唐扬鸡盖饭", es: "Bol pollo" } },
  { id: "f6", cat: "snack", price: 280, kcal: 180, name: { ja: "サラダセット", en: "Salad Set", vi: "Salad", zh: "沙拉套餐", es: "Ensalada" } },
  { id: "f7", cat: "drink", price: 180, kcal: 30, name: { ja: "コーヒー", en: "Coffee", vi: "Cà phê", zh: "咖啡", es: "Café" } },
];

export type Club = { id: string; name: Record<Lang, string>; cat: "sports" | "academic" | "culture" | "intl" | "volunteer"; days: string; place: string; recruiting: boolean; event?: Record<Lang, string> };
export const CLUBS: Club[] = [
  { id: "cl1", cat: "sports", name: { ja: "野球部", en: "Baseball Club", vi: "CLB Bóng chày", zh: "棒球部", es: "Béisbol" }, days: "火・木・土", place: "第1グラウンド", recruiting: true, event: { ja: "6/15 練習試合", en: "6/15 Practice match", vi: "15/6 Trận giao hữu", zh: "6/15 练习赛", es: "15/6 amistoso" } },
  { id: "cl2", cat: "sports", name: { ja: "バスケットボール部", en: "Basketball", vi: "Bóng rổ", zh: "篮球部", es: "Baloncesto" }, days: "月・水・金", place: "体育館A", recruiting: true },
  { id: "cl3", cat: "academic", name: { ja: "経営学研究会", en: "Mgmt Society", vi: "Hội Quản trị", zh: "经营研究会", es: "Soc. Gestión" }, days: "水", place: "C-203", recruiting: false },
  { id: "cl4", cat: "intl", name: { ja: "国際交流サークル", en: "Intl Exchange", vi: "Giao lưu QT", zh: "国际交流社", es: "Intercambio" }, days: "金", place: "国際センター", recruiting: true, event: { ja: "6/20 ウェルカムパーティ", en: "6/20 Welcome party", vi: "20/6 Tiệc chào đón", zh: "6/20 欢迎会", es: "20/6 Bienvenida" } },
  { id: "cl5", cat: "culture", name: { ja: "音楽サークル", en: "Music Circle", vi: "CLB Âm nhạc", zh: "音乐社", es: "Música" }, days: "木", place: "音楽室", recruiting: true },
  { id: "cl6", cat: "volunteer", name: { ja: "ボランティアサークル", en: "Volunteer", vi: "Tình nguyện", zh: "志愿社", es: "Voluntariado" }, days: "土", place: "学生会館", recruiting: true },
];

export type LinkItem = { id: string; name: Record<Lang, string>; desc: Record<Lang, string>; cat: "study" | "life" | "career" | "facility" | "other"; url?: string; icon: string };
export const LINKS: LinkItem[] = [
  { id: "l1", cat: "study", icon: "BookOpen", name: { ja: "Moodle", en: "Moodle", vi: "Moodle", zh: "Moodle", es: "Moodle" }, desc: { ja: "授業・課題", en: "Classes & tasks", vi: "Lớp & bài", zh: "课程作业", es: "Clases y tareas" },url:"https://moodle2026.asahi-u.ac.jp"},
  { id: "l2", cat: "study", icon: "GraduationCap", name: { ja: "教務Webシステム", en: "Academic Portal", vi: "Cổng học vụ", zh: "教务系统", es: "Portal académico" }, desc: { ja: "履修・成績", en: "Enrollment, grades", vi: "Đăng ký, điểm", zh: "选课成绩", es: "Inscripción" },url: "https://unipa.asahi-u.ac.jp/uprx/up/pk/pky501/Pky50101.xhtml"},
  { id: "l3", cat: "study", icon: "Mail", name: { ja: "学生用Webメール", en: "Student Mail", vi: "Email SV", zh: "学生邮箱", es: "Correo" }, desc: { ja: "大学メール", en: "University mail", vi: "Email trường", zh: "校园邮件", es: "Mail uni." },url: "https://webmail.asahi-u.ac.jp/"},
  { id: "l4", cat: "study", icon: "FolderOpen", name: { ja: "ファイルサーバ", en: "File Server", vi: "Máy chủ file", zh: "文件服务器", es: "Servidor" }, desc: { ja: "資料共有", en: "Shared files", vi: "Tệp chung", zh: "共享文件", es: "Archivos" },url: "https://webfs.asahi-u.ac.jp/proself/login/login.go?AD=init"},
  { id: "l5", cat: "career", icon: "Briefcase", name: { ja: "就職支援Web", en: "Career Center", vi: "Hỗ trợ nghề", zh: "就业支援", es: "Carrera" }, desc: { ja: "就職活動支援", en: "Career support", vi: "Hỗ trợ NN", zh: "就业支持", es: "Soporte" }, url: "https://ago.asahi-u.ac.jp" },
  { id: "l6", cat: "study", icon: "FileText", name: { ja: "証明書発行", en: "Certificates", vi: "Chứng chỉ", zh: "证书发行", es: "Certificados" }, desc: { ja: "在学・成績証明", en: "Enrollment, grades", vi: "Giấy tờ", zh: "在学成绩证明", es: "Documentos" },url: "https://www.asahi-u.ac.jp/campus/sup/f-syoumei/" },
  { id: "l7", cat: "facility", icon: "Library", name: { ja: "図書館", en: "Library", vi: "Thư viện", zh: "图书馆", es: "Biblioteca" }, desc: { ja: "蔵書検索", en: "Book search", vi: "Tìm sách", zh: "藏书检索", es: "Búsqueda" }, url: "https://lopac.asahi-u.ac.jp/drupal/ja/?q=en" },
  { id: "l8", cat: "facility", icon: "MessageCircle", name: { ja: "相談窓口", en: "Counseling", vi: "Tư vấn", zh: "咨询窗口", es: "Orientación" }, desc: { ja: "学生相談", en: "Student support", vi: "Hỗ trợ SV", zh: "学生咨询", es: "Apoyo" },url: "https://www.asahi-u.ac.jp/campus/sup/mado/" },
  { id: "l9", cat: "facility", icon: "Heart", name: { ja: "健康サービス", en: "Health Services", vi: "Y tế", zh: "健康服务", es: "Salud" }, desc: { ja: "保健室・病院", en: "Clinic & hospital", vi: "Phòng y tế", zh: "保健室", es: "Clínica" }, url: "https://www.hosp.asahi-u.ac.jp" },
  { id: "l10", cat: "other", icon: "Globe", name: { ja: "大学公式サイト", en: "Official Site", vi: "Trang chính thức", zh: "大学官网", es: "Sitio oficial" }, desc: { ja: "公式情報", en: "Official info", vi: "Thông tin", zh: "官方信息", es: "Info oficial" }, url: "https://www.asahi-u.ac.jp" },
  { id: "l11", cat: "life", icon: "Utensils", name: { ja: "食堂情報", en: "Cafeteria", vi: "Căng tin", zh: "食堂", es: "Cafetería" }, desc: { ja: "メニュー・混雑", en: "Menu & crowd", vi: "Thực đơn", zh: "菜单/拥挤", es: "Menú" } },
  { id: "l12", cat: "life", icon: "AlertCircle", name: { ja: "休講・補講情報", en: "Class Changes", vi: "Đổi lịch", zh: "停课信息", es: "Cambios" }, desc: { ja: "授業変更", en: "Schedule changes", vi: "Thay đổi", zh: "课程变更", es: "Cambios" } },
  { id: "l13", cat: "life", icon: "QrCode", name: { ja: "学生証QR", en: "Student ID QR", vi: "Thẻ SV QR", zh: "学生证", es: "ID QR" }, desc: { ja: "学生証表示", en: "Show student ID", vi: "Hiển thị thẻ", zh: "显示学生证", es: "Mostrar ID" } },
  { id: "l14", cat: "life", icon: "Users", name: { ja: "クラブ・サークル", en: "Clubs", vi: "CLB", zh: "社团", es: "Clubes" }, desc: { ja: "活動情報", en: "Activities", vi: "Hoạt động", zh: "活动信息", es: "Actividades" },url: "https://www.asahi-u.ac.jp/campus/f-club/" },
];

export type NotificationItem = { id: string; titleI18n: Record<Lang, string>; time: string; type: "task" | "moodle" | "cancel" | "notice" | "club" | "cafe"; read: boolean; important?: boolean };
export const NOTIFICATIONS: NotificationItem[] = [
  { id: "no1", type: "cancel", important: true, time: "08:12", read: false, titleI18n: { ja: "情報リテラシー 3限休講", en: "Info Literacy 3rd period cancelled", vi: "Hủy Tin học tiết 3", zh: "信息素养3限停课", es: "Informática 3a cancelada" } },
  { id: "no2", type: "task", important: true, time: "07:30", read: false, titleI18n: { ja: "Vocabulary Quiz 締切まで1日", en: "Vocab Quiz due in 1 day", vi: "Quiz từ vựng còn 1 ngày", zh: "词汇测验剩1天", es: "Quiz vence en 1 día" } },
  { id: "no3", type: "moodle", time: "06:00", read: true, titleI18n: { ja: "Moodle同期完了", en: "Moodle sync complete", vi: "Đồng bộ Moodle xong", zh: "Moodle同步完成", es: "Sincronización Moodle" } },
  { id: "no4", type: "notice", time: "昨日", read: true, titleI18n: { ja: "図書館開館時間変更", en: "Library hours changed", vi: "Giờ thư viện đổi", zh: "图书馆时间变更", es: "Horario biblioteca" } },
  { id: "no5", type: "club", time: "昨日", read: true, titleI18n: { ja: "国際交流サークル ウェルカムパーティ", en: "Intl Circle welcome party", vi: "Tiệc CLB QT", zh: "国际交流欢迎会", es: "Bienvenida intl" } },
];

export const SCHEDULE = [
  { id: "s1", time: "09:00", title: { ja: "情報リテラシー", en: "Info Literacy", vi: "Tin học", zh: "信息素养", es: "Informática" } as Record<Lang, string>, place: "C-201", tag: "cancelled" as const },
  { id: "s2", time: "10:40", title: { ja: "経営学入門", en: "Intro Management", vi: "Quản trị", zh: "经营入门", es: "Gestión" } as Record<Lang, string>, place: "B-105", tag: "class" as const },
  { id: "s3", time: "13:00", title: { ja: "Academic English", en: "Academic English", vi: "Tiếng Anh", zh: "学术英语", es: "Inglés" } as Record<Lang, string>, place: "B-301", tag: "roomChange" as const },
  { id: "s4", time: "16:30", title: { ja: "野球部 練習", en: "Baseball practice", vi: "Tập bóng chày", zh: "棒球部练习", es: "Práctica béisbol" } as Record<Lang, string>, place: "Ground 1", tag: "club" as const },
];
