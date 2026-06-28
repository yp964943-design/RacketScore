import React, { useState, useEffect } from "react";
import { SportType, GameMode, MatchSettings as SettingsType, MatchHistoryEntry, SetScore } from "./types";
import { MatchSettings } from "./components/MatchSettings";
import { ScoreBoard } from "./components/ScoreBoard";
import { HistoryList } from "./components/HistoryList";
import { RulesInfo } from "./components/RulesInfo";
import { Trophy, Calendar, BookOpen, Settings, BarChart2, Activity } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<"setup" | "history" | "rules">("setup");
  const [activeMatch, setActiveMatch] = useState<SettingsType | null>(null);
  const [matchHistory, setMatchHistory] = useState<MatchHistoryEntry[]>([]);

  // Load history from local storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("sports_scoreboard_history");
      if (stored) {
        setMatchHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load match history from localStorage:", e);
    }
  }, []);

  // Save history to local storage
  const saveHistory = (newHistory: MatchHistoryEntry[]) => {
    setMatchHistory(newHistory);
    try {
      localStorage.setItem("sports_scoreboard_history", JSON.stringify(newHistory));
    } catch (e) {
      console.error("Failed to save match history to localStorage:", e);
    }
  };

  // Handle Starting a Match
  const handleStartMatch = (settings: SettingsType) => {
    setActiveMatch(settings);
  };

  // Handle Completing a Match
  const handleFinishMatch = (result: { sets: SetScore[]; winner: "A" | "B"; durationSeconds: number; playerNames?: { teamA: string[]; teamB: string[] } }) => {
    if (!activeMatch) return;

    const newEntry: MatchHistoryEntry = {
      id: `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      date: new Date().toISOString(),
      sport: activeMatch.sport,
      mode: activeMatch.mode,
      playerNames: result.playerNames || activeMatch.playerNames,
      sets: result.sets,
      winner: result.winner,
      durationSeconds: result.durationSeconds,
    };

    const updatedHistory = [newEntry, ...matchHistory];
    saveHistory(updatedHistory);
    setActiveMatch(null);
    setActiveTab("history"); // Redirect to history to view the completed card!
  };

  // Delete Individual Entry
  const handleDeleteEntry = (id: string) => {
    const updated = matchHistory.filter((entry) => entry.id !== id);
    saveHistory(updated);
  };

  // Clear All Entries
  const handleClearAllHistory = () => {
    saveHistory([]);
  };

  // Statistics Calculation
  const totalMatches = matchHistory.length;
  const badmintonCount = matchHistory.filter((m) => m.sport === SportType.BADMINTON).length;
  const tableTennisCount = matchHistory.filter((m) => m.sport === SportType.TABLE_TENNIS).length;
  const lastMatch = matchHistory[0];

  return (
    <div id="app-root" className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-violet-500/30 selection:text-violet-200">
      
      {/* BACKGROUND DECORATIVE GLOW */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* MAIN CONTAINER */}
      <div className="relative max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        {/* APP HEADER */}
        {!activeMatch && (
          <header className="mb-8 text-center sm:text-left flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-900 pb-6">
            <div className="flex items-center justify-center sm:justify-start gap-3">
              <div className="p-3 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-2xl shadow-lg shadow-indigo-500/15">
                <Activity className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                  ScoreArena
                </h1>
                <p className="text-xs text-slate-400 mt-1 font-mono">
                  Pencatat Skor Bulu Tangkis & Tenis Meja Profesional
                </p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="flex bg-slate-900/60 p-1 rounded-xl border border-slate-800/80 max-w-sm mx-auto sm:mx-0">
              <button
                onClick={() => setActiveTab("setup")}
                className={`flex items-center gap-1.5 py-2 px-4 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "setup"
                    ? "bg-slate-800 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                Skor Baru
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`flex items-center gap-1.5 py-2 px-4 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "history"
                    ? "bg-slate-800 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                Riwayat
                {totalMatches > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 bg-violet-500 text-slate-950 font-black text-[9px] rounded-full">
                    {totalMatches}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab("rules")}
                className={`flex items-center gap-1.5 py-2 px-4 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "rules"
                    ? "bg-slate-800 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                Aturan
              </button>
            </nav>
          </header>
        )}

        {/* ACTIVE LIVE MATCH OVERLAY MODE */}
        {activeMatch ? (
          <div className="animate-fadeIn">
            <ScoreBoard
              settings={activeMatch}
              onFinishMatch={handleFinishMatch}
              onExit={() => setActiveMatch(null)}
            />
          </div>
        ) : (
          /* STANDARD DASHBOARD TABS */
          <main className="space-y-6">
            
            {/* Summary Statistics Panel (Only on main setup page) */}
            {activeTab === "setup" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-900/20 border border-slate-900 p-4 rounded-2xl">
                
                {/* Total games */}
                <div className="flex items-center gap-3 p-3 bg-slate-900/40 rounded-xl border border-slate-800/40">
                  <div className="p-2 bg-violet-500/10 text-violet-400 rounded-lg">
                    <BarChart2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold font-mono uppercase">Total Sesi Main</p>
                    <p className="text-sm font-extrabold text-white font-mono">{totalMatches} Pertandingan</p>
                  </div>
                </div>

                {/* Bulu Tangkis (Badminton) */}
                <div className="flex items-center gap-3 p-3 bg-slate-900/40 rounded-xl border border-slate-800/40">
                  <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                    <span className="text-sm">🏸</span>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold font-mono uppercase">Bulu Tangkis</p>
                    <p className="text-sm font-extrabold text-white font-mono">{badmintonCount} Sesi</p>
                  </div>
                </div>

                {/* Tenis Meja (Table Tennis) */}
                <div className="flex items-center gap-3 p-3 bg-slate-900/40 rounded-xl border border-slate-800/40">
                  <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                    <span className="text-sm">🏓</span>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold font-mono uppercase">Tenis Meja</p>
                    <p className="text-sm font-extrabold text-white font-mono">{tableTennisCount} Sesi</p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENTS */}
            <div className="animate-fadeIn">
              {activeTab === "setup" && (
                <div className="space-y-6">
                  {/* Active Setup card */}
                  <div className="bg-slate-900/40 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl backdrop-blur-sm">
                    <div className="max-w-md mx-auto text-center mb-6 space-y-1">
                      <h2 className="text-xl font-bold text-white tracking-tight">Mulai Pertandingan Baru</h2>
                      <p className="text-xs text-slate-400">Atur preferensi permainan, klik mulai, dan gunakan layar sebagai papan skor langsung.</p>
                    </div>
                    <MatchSettings onStartMatch={handleStartMatch} />
                  </div>
                </div>
              )}

              {activeTab === "history" && (
                <HistoryList
                  history={matchHistory}
                  onDeleteEntry={handleDeleteEntry}
                  onClearAll={handleClearAllHistory}
                />
              )}

              {activeTab === "rules" && <RulesInfo />}
            </div>
          </main>
        )}

        {/* GLOBAL APP FOOTER */}
        {!activeMatch && (
          <footer className="mt-16 pt-6 border-t border-slate-900 text-center text-[11px] text-slate-500 font-mono">
            <p>ScoreArena • Aplikasi Papan Skor Digital Bulu Tangkis & Tenis Meja</p>
            <p className="mt-1 text-slate-600">Disimpan secara lokal di browser Anda • Mendukung pengumuman suara bahasa Indonesia</p>
          </footer>
        )}

      </div>
    </div>
  );
}
