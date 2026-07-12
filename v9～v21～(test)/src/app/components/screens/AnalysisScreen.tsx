import { useState, useMemo } from "react";
import { AppHeader } from "../AppHeader";
import { useApp } from "../../AppContext";
import { t } from "../../i18n";
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from "recharts";
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription 
} from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { 
  LayoutDashboard, GraduationCap, FileInput, 
  TrendingUp, Clock, Calendar, CheckCircle2, 
  Plus, Trash2, Upload, AlertCircle, Info, ChevronRight
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

// --- デモデータ ---

const USAGE_STATS = [
  { label: "ログイン回数", value: "128", unit: "回" },
  { label: "お知らせ閲覧", value: "45", unit: "回" },
  { label: "課題閲覧", value: "89", unit: "回" },
  { label: "学食メニュー閲覧", value: "32", unit: "回" },
  { label: "予定編集", value: "12", unit: "回" },
  { label: "AIチャット", value: "56", unit: "回" },
];

const DAILY_USAGE = [
  { day: "月", count: 12 },
  { day: "火", count: 18 },
  { day: "水", count: 15 },
  { day: "木", count: 22 },
  { day: "金", count: 20 },
  { day: "土", count: 8 },
  { day: "日", count: 5 },
];

const FEATURE_USAGE = [
  { name: "ホーム", value: 120 },
  { name: "課題", value: 85 },
  { name: "AI相談", value: 50 },
  { name: "リンク", value: 30 },
  { name: "メニュー", value: 45 },
];

const TIME_USAGE = [
  { time: "8-10", count: 15 },
  { time: "10-12", count: 25 },
  { time: "12-14", count: 40 },
  { time: "14-16", count: 20 },
  { time: "16-18", count: 18 },
  { time: "18-20", count: 10 },
  { time: "20-22", count: 5 },
];

const ACADEMIC_STATS = [
  { label: "GPA", value: "3.42", unit: "" },
  { label: "取得単位数", value: "64", unit: "単位" },
  { label: "出席率", value: "94", unit: "%" },
  { label: "課題提出率", value: "98", unit: "%" },
];

const GPA_HISTORY = [
  { term: "1年前期", gpa: 3.2 },
  { term: "1年後期", gpa: 3.35 },
  { term: "2年前期", gpa: 3.42 },
];

const COURSES = [
  { id: "c1", name: "情報リテラシー", grade: "A", attendance: 100, assignment: 100 },
  { id: "c2", name: "微分積分学", grade: "B", attendance: 90, assignment: 95 },
  { id: "c3", name: "英語コミュニケーション", grade: "A", attendance: 95, assignment: 100 },
  { id: "c4", name: "プログラミング基礎", grade: "S", attendance: 100, assignment: 100 },
  { id: "c5", name: "日本国憲法", grade: "B", attendance: 85, assignment: 90 },
];

// --- コンポーネント ---

export function AnalysisScreen() {
  const { lang } = useApp();
  const [activeTab, setActiveTab] = useState("usage");

  return (
    <div className="pb-24 bg-slate-50 min-h-full">
      <AppHeader />
      
      <div className="px-5 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-slate-800">{t("navAnalysis", lang)}</h1>
          <span className="text-[10px] px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-medium">デモデータ</span>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-slate-200/50 p-1 rounded-xl">
            <TabsTrigger value="usage" className="rounded-lg py-2 text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm">利用状況</TabsTrigger>
            <TabsTrigger value="academic" className="rounded-lg py-2 text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm">学習状況</TabsTrigger>
            <TabsTrigger value="input" className="rounded-lg py-2 text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm">データ入力</TabsTrigger>
          </TabsList>

          <TabsContent value="usage" className="space-y-5 animate-in fade-in duration-300">
            <div className="grid grid-cols-2 gap-3">
              {USAGE_STATS.map((stat, i) => (
                <Card key={i} className="border-none shadow-sm rounded-2xl overflow-hidden">
                  <CardContent className="p-4">
                    <p className="text-[11px] text-slate-500 mb-1">{stat.label}</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-bold text-slate-800">{stat.value}</span>
                      <span className="text-[10px] text-slate-400">{stat.unit}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="p-4 pb-0">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <TrendingUp size={16} className="text-[#13b5b1]" />
                  日別利用回数
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-4">
                <div className="h-[180px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={DAILY_USAGE}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} dy={10} />
                      <YAxis hide />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }}
                      />
                      <Line type="monotone" dataKey="count" stroke="#13b5b1" strokeWidth={3} dot={{ r: 4, fill: '#13b5b1', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="p-4 pb-0">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <LayoutDashboard size={16} className="text-[#4338ca]" />
                  機能別利用回数
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-4">
                <div className="h-[180px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={FEATURE_USAGE} layout="vertical" margin={{ left: -20 }}>
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} />
                      <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }} />
                      <Bar dataKey="value" fill="#4338ca" radius={[0, 4, 4, 0]} barSize={12} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="p-4 pb-0">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Clock size={16} className="text-amber-500" />
                  利用時間帯
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-4">
                <div className="h-[180px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={TIME_USAGE}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 9, fill: '#94a3b8'}} dy={5} />
                      <YAxis hide />
                      <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }} />
                      <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="academic" className="space-y-5 animate-in fade-in duration-300">
            <div className="grid grid-cols-2 gap-3">
              {ACADEMIC_STATS.map((stat, i) => (
                <Card key={i} className="border-none shadow-sm rounded-2xl overflow-hidden">
                  <CardContent className="p-4">
                    <p className="text-[11px] text-slate-500 mb-1">{stat.label}</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-bold text-slate-800">{stat.value}</span>
                      <span className="text-[10px] text-slate-400">{stat.unit}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="p-4 pb-0">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <TrendingUp size={16} className="text-[#7c3aed]" />
                  GPA推移
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-4">
                <div className="h-[180px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={GPA_HISTORY}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="term" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} dy={10} />
                      <YAxis domain={[0, 4]} hide />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }} />
                      <Line type="monotone" dataKey="gpa" stroke="#7c3aed" strokeWidth={3} dot={{ r: 5, fill: '#7c3aed', strokeWidth: 2, stroke: '#fff' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-700 px-1">履修科目</h3>
              {COURSES.map((course) => (
                <CourseItem key={course.id} course={course} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="input" className="space-y-5 animate-in fade-in duration-300">
            <SurveySection />
            <StudyTimeSection />
            <CsvAnalysisSection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function CourseItem({ course }: { course: any }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="border-none shadow-sm rounded-2xl overflow-hidden transition-all">
      <button 
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-4 flex items-center justify-between active:bg-slate-50 transition"
      >
        <div className="flex items-center gap-3">
          <div className={`size-8 rounded-lg flex items-center justify-center font-bold text-white ${
            course.grade === 'S' ? 'bg-amber-400' : course.grade === 'A' ? 'bg-indigo-500' : 'bg-slate-400'
          }`}>
            {course.grade}
          </div>
          <span className="text-sm font-medium text-slate-800">{course.name}</span>
        </div>
        <ChevronRight size={16} className={`text-slate-300 transition-transform ${expanded ? 'rotate-90' : ''}`} />
      </button>
      
      {expanded && (
        <div className="px-4 pb-4 pt-0 grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-200">
          <div className="bg-slate-50 p-3 rounded-xl">
            <p className="text-[10px] text-slate-400 mb-1">出席率</p>
            <p className="text-sm font-bold text-slate-700">{course.attendance}%</p>
            <div className="w-full h-1 bg-slate-200 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-emerald-500" style={{ width: `${course.attendance}%` }} />
            </div>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl">
            <p className="text-[10px] text-slate-400 mb-1">課題提出率</p>
            <p className="text-sm font-bold text-slate-700">{course.assignment}%</p>
            <div className="w-full h-1 bg-slate-200 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-blue-500" style={{ width: `${course.assignment}%` }} />
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

// --- データ入力セクション ---

function SurveySection() {
  const [rating, setRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  // デモ用の集計結果
  const stats = {
    count: 42,
    avg: 4.2,
    dist: [
      { star: 5, count: 20 },
      { star: 4, count: 15 },
      { star: 3, count: 5 },
      { star: 2, count: 2 },
      { star: 1, count: 0 },
    ]
  };

  return (
    <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <GraduationCap size={16} className="text-rose-500" />
          アンケート分析
        </CardTitle>
        <CardDescription className="text-[11px]">授業やアプリの満足度を教えてください</CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        {!submitted ? (
          <div className="space-y-4">
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button 
                  key={s} 
                  onClick={() => setRating(s)}
                  className={`size-10 rounded-xl flex items-center justify-center text-lg transition ${
                    rating >= s ? 'bg-rose-500 text-white shadow-md' : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <Button 
              disabled={rating === 0} 
              onClick={() => setSubmitted(true)}
              className="w-full bg-rose-500 hover:bg-rose-600 rounded-xl h-11 text-sm font-bold"
            >
              回答を送信
            </Button>
          </div>
        ) : (
          <div className="space-y-4 animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between p-3 bg-rose-50 rounded-xl">
              <div>
                <p className="text-[10px] text-rose-600 font-medium">平均評価</p>
                <p className="text-2xl font-black text-rose-700">{stats.avg}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-rose-600 font-medium">回答数</p>
                <p className="text-lg font-bold text-rose-700">{stats.count}件</p>
              </div>
            </div>
            <div className="space-y-2">
              {stats.dist.map((d) => (
                <div key={d.star} className="flex items-center gap-3">
                  <span className="text-[10px] text-slate-400 w-4">{d.star}★</span>
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-400" style={{ width: `${(d.count / stats.count) * 100}%` }} />
                  </div>
                  <span className="text-[10px] text-slate-400 w-6 text-right">{d.count}</span>
                </div>
              ))}
            </div>
            <Button variant="outline" onClick={() => setSubmitted(false)} className="w-full rounded-xl text-xs h-9 border-slate-200 text-slate-500">
              再回答する
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StudyTimeSection() {
  const [records, setRecords] = useState<{id: string, date: string, subject: string, hours: number}[]>([
    { id: '1', date: '2024-06-01', subject: '数学', hours: 2 },
    { id: '2', date: '2024-06-02', subject: '英語', hours: 1.5 },
  ]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [subject, setSubject] = useState('');
  const [hours, setHours] = useState('');

  const addRecord = () => {
    if (!subject || !hours) return;
    setRecords([...records, { id: Date.now().toString(), date, subject, hours: parseFloat(hours) }]);
    setSubject('');
    setHours('');
  };

  const deleteRecord = (id: string) => {
    setRecords(records.filter(r => r.id !== id));
  };

  const stats = useMemo(() => {
    const total = records.reduce((acc, r) => acc + r.hours, 0);
    const avg = records.length > 0 ? (total / records.length).toFixed(1) : 0;
    
    // 科目別
    const bySubject = records.reduce((acc: any, r) => {
      acc[r.subject] = (acc[r.subject] || 0) + r.hours;
      return acc;
    }, {});
    const subjectData = Object.entries(bySubject).map(([name, value]) => ({ name, value }));

    // 日別
    const byDate = records.reduce((acc: any, r) => {
      acc[r.date] = (acc[r.date] || 0) + r.hours;
      return acc;
    }, {});
    const dateData = Object.entries(byDate).map(([date, hours]) => ({ date, hours })).sort((a, b) => a.date.localeCompare(b.date));

    return { total, avg, subjectData, dateData };
  }, [records]);

  return (
    <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <Clock size={16} className="text-indigo-500" />
          学習時間分析
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-[10px] text-slate-400">日付</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-9 text-xs rounded-lg border-slate-200" />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] text-slate-400">科目</Label>
            <Input placeholder="例: 数学" value={subject} onChange={(e) => setSubject(e.target.value)} className="h-9 text-xs rounded-lg border-slate-200" />
          </div>
          <div className="col-span-2 space-y-1">
            <Label className="text-[10px] text-slate-400">学習時間 (時間)</Label>
            <div className="flex gap-2">
              <Input type="number" step="0.5" placeholder="1.5" value={hours} onChange={(e) => setHours(e.target.value)} className="h-9 text-xs rounded-lg border-slate-200" />
              <Button onClick={addRecord} className="h-9 px-4 bg-indigo-500 hover:bg-indigo-600 rounded-lg text-xs font-bold">追加</Button>
            </div>
          </div>
        </div>

        {records.length > 0 ? (
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-indigo-50 p-3 rounded-xl">
                <p className="text-[10px] text-indigo-600 font-medium">合計時間</p>
                <p className="text-lg font-bold text-indigo-700">{stats.total}時間</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl">
                <p className="text-[10px] text-slate-500 font-medium">平均時間</p>
                <p className="text-lg font-bold text-slate-700">{stats.avg}時間</p>
              </div>
            </div>

            <div className="h-[150px] w-full">
              <p className="text-[10px] text-slate-400 mb-2">日別推移</p>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.dateData}>
                  <XAxis dataKey="date" hide />
                  <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '10px' }} />
                  <Line type="monotone" dataKey="hours" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] text-slate-400">記録一覧</p>
              {records.map(r => (
                <div key={r.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg text-[11px]">
                  <span className="text-slate-400">{r.date.split('-').slice(1).join('/')}</span>
                  <span className="font-medium text-slate-700 flex-1 ml-3">{r.subject}</span>
                  <span className="font-bold text-slate-800 mr-3">{r.hours}h</span>
                  <button onClick={() => deleteRecord(r.id)} className="text-slate-300 hover:text-rose-500"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-slate-400 text-xs">まだデータがありません</div>
        )}
      </CardContent>
    </Card>
  );
}

function CsvAnalysisSection() {
  const [data, setData] = useState<{name: string, value: number}[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({ count: 0, avg: 0, min: 0, max: 0 });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
      setError("CSVファイルを選択してください。");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/).filter(line => line.trim() !== "");
        if (lines.length < 2) {
          setError("CSVに十分なデータがありません。");
          return;
        }

        const headers = lines[0].split(",");
        const values: number[] = [];
        const chartData: any[] = [];

        // 数値データを探す (簡易的な実装)
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(",");
          const val = parseFloat(cols[1]); // 2列目を数値として扱う
          if (!isNaN(val)) {
            values.push(val);
            chartData.push({ name: cols[0], value: val });
          }
        }

        if (values.length === 0) {
          setError("有効な数値データが見つかりませんでした。2列目に数値を入力してください。");
          return;
        }

        const sum = values.reduce((a, b) => a + b, 0);
        setStats({
          count: values.length,
          avg: parseFloat((sum / values.length).toFixed(2)),
          min: Math.min(...values),
          max: Math.max(...values),
        });
        setData(chartData.slice(0, 20)); // 最大20件表示
        setError(null);
      } catch (err) {
        setError("ファイルの読み込み中にエラーが発生しました。");
      }
    };
    reader.readAsText(file);
  };

  return (
    <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <FileInput size={16} className="text-emerald-500" />
          CSV分析
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="relative">
          <input 
            type="file" 
            accept=".csv" 
            onChange={handleFileUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center bg-slate-50/50">
            <Upload size={24} className="text-slate-300 mb-2" />
            <p className="text-xs text-slate-500 font-medium">CSVファイルをアップロード</p>
            <p className="text-[10px] text-slate-400 mt-1">1列目:ラベル, 2列目:数値</p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 rounded-xl flex items-start gap-2 animate-in fade-in slide-in-from-top-1">
            <AlertCircle size={14} className="text-rose-500 mt-0.5 shrink-0" />
            <p className="text-[11px] text-rose-600 leading-relaxed">{error}</p>
          </div>
        )}

        {data ? (
          <div className="space-y-4 animate-in fade-in duration-500">
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-emerald-50 p-2 rounded-lg">
                <p className="text-[9px] text-emerald-600">件数</p>
                <p className="text-sm font-bold text-emerald-700">{stats.count}</p>
              </div>
              <div className="bg-emerald-50 p-2 rounded-lg">
                <p className="text-[9px] text-emerald-600">平均</p>
                <p className="text-sm font-bold text-emerald-700">{stats.avg}</p>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg">
                <p className="text-[9px] text-slate-500">最小</p>
                <p className="text-sm font-bold text-slate-700">{stats.min}</p>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg">
                <p className="text-[9px] text-slate-500">最大</p>
                <p className="text-sm font-bold text-slate-700">{stats.max}</p>
              </div>
            </div>

            <div className="h-[150px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <XAxis dataKey="name" hide />
                  <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '10px' }} />
                  <Bar dataKey="value" fill="#10b981" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : !error && (
          <div className="p-3 bg-blue-50 rounded-xl flex items-start gap-2">
            <Info size={14} className="text-blue-500 mt-0.5 shrink-0" />
            <p className="text-[10px] text-blue-600 leading-relaxed">
              ブラウザ内でのみ処理されるため、サーバーにデータが送信されることはありません。
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
