import { AppProvider, useApp } from "./AppContext";
import { BottomNav } from "./components/BottomNav";
import { HomeScreen } from "./components/screens/HomeScreen";
import { TasksScreen } from "./components/screens/TasksScreen";
import { AIScreen } from "./components/screens/AIScreen";
import { LinksScreen } from "./components/screens/LinksScreen";
import { MenuScreen } from "./components/screens/MenuScreen";
import { AnalysisScreen } from "./components/screens/AnalysisScreen";
import { LoginScreen } from "./components/screens/LoginScreen";
import { Modals } from "./components/Modals";

function Shell() {
  const { tab, loggedIn } = useApp();
  if (!loggedIn) return <LoginScreen />;
  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-50 flex flex-col">
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {tab === "home" && <HomeScreen />}
        {tab === "tasks" && <TasksScreen />}
        {tab === "ai" && <AIScreen />}
        {tab === "links" && <LinksScreen />}
        {tab === "analysis" && <AnalysisScreen />}
        {tab === "menu" && <MenuScreen />}
      </div>
      <BottomNav />
      <Modals />
    </div>
  );
}

function AppShell() {
  const { theme } = useApp();
  return (
    <div className="size-full flex items-center justify-center bg-slate-200 p-4 overflow-hidden">
      <div className={`relative w-full max-w-[390px] h-full max-h-[844px] rounded-[2.5rem] overflow-hidden shadow-2xl border-[10px] border-slate-900 ${theme === "dark" ? "dark bg-slate-950" : "bg-white"}`}>
        <Shell />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
