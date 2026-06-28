import React from "react";
import { MatchHistoryEntry, SportType, GameMode } from "../types";
import { Calendar, Trash2, Clock, Trophy, Award, Trash } from "lucide-react";

interface HistoryListProps {
  history: MatchHistoryEntry[];
  onDeleteEntry: (id: string) => void;
  onClearAll: () => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({
  history,
  onDeleteEntry,
  onClearAll,
}) => {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return dateStr;
    }
  };

  if (history.length === 0) {
    return (
      <div id="history-empty-state" className="flex flex-col items-center justify-center p-12 text-center bg-slate-900/40 rounded-2xl border border-slate-800 backdrop-blur-sm shadow-xl">
        <div className="w-16 h-16 rounded-full bg-slate-950 flex items-center justify-center text-slate-500 border border-slate-800 mb-4">
          <Calendar className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-white mb-1">Belum Ada Riwayat</h3>
        <p className="text-xs text-slate-400 max-w-sm mb-4">
          Semua hasil pertandingan yang Anda selesaikan akan otomatis tercatat dan disimpan di sini secara lokal.
        </p>
      </div>
    );
  }

  return (
    <div id="history-list-container" className="space-y-6">
      {/* Header and Clear All Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Riwayat Pertandingan</h2>
          <p className="text-xs text-slate-400">Total {history.length} pertandingan tercatat secara lokal</p>
        </div>
        <button
          onClick={() => {
            if (window.confirm("Apakah Anda yakin ingin menghapus semua riwayat pertandingan? Tindakan ini tidak dapat dibatalkan.")) {
              onClearAll();
            }
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all cursor-pointer"
        >
          <Trash className="w-4 h-4" />
          Hapus Semua
        </button>
      </div>

      {/* History Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {history.map((match) => {
          const isBadminton = match.sport === SportType.BADMINTON;
          const isSingles = match.mode === GameMode.SINGLES;
          const winnerTeam = match.winner === "A" ? "Team A" : "Team B";

          const teamANames = match.playerNames.teamA.join(" & ");
          const teamBNames = match.playerNames.teamB.join(" & ");
          const winnerNames = match.winner === "A" ? teamANames : teamBNames;

          return (
            <div
              key={match.id}
              className="relative bg-slate-900/40 rounded-2xl border border-slate-800/80 p-5 hover:border-slate-700/80 transition-all shadow-lg flex flex-col justify-between"
            >
              {/* Card Header Info */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold font-mono tracking-wider uppercase ${
                      isBadminton
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                    }`}
                  >
                    {isBadminton ? "Bulu Tangkis" : "Tenis Meja"}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] bg-slate-950/60 text-slate-400 border border-slate-800 font-mono">
                    {isSingles ? "Tunggal" : "Ganda"}
                  </span>
                </div>
                <button
                  onClick={() => {
                    if (window.confirm("Hapus pertandingan ini dari riwayat?")) {
                      onDeleteEntry(match.id);
                    }
                  }}
                  className="p-1.5 rounded-lg bg-slate-950/40 hover:bg-red-500/10 text-slate-400 hover:text-red-400 border border-transparent hover:border-red-500/20 transition-all cursor-pointer"
                  title="Hapus pertandingan"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Matchup & Score */}
              <div className="space-y-3 mb-4">
                {/* Team A Info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`w-2.5 h-2.5 rounded-full ${match.winner === "A" ? "bg-amber-400" : "bg-slate-700"}`}></div>
                    <span className={`text-xs font-bold truncate ${match.winner === "A" ? "text-amber-200" : "text-slate-300"}`}>
                      {teamANames}
                    </span>
                  </div>
                  <span className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${match.winner === "A" ? "bg-amber-400/10 text-amber-400" : "text-slate-500"}`}>
                    TIM A
                  </span>
                </div>

                {/* Team B Info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`w-2.5 h-2.5 rounded-full ${match.winner === "B" ? "bg-amber-400" : "bg-slate-700"}`}></div>
                    <span className={`text-xs font-bold truncate ${match.winner === "B" ? "text-amber-200" : "text-slate-300"}`}>
                      {teamBNames}
                    </span>
                  </div>
                  <span className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${match.winner === "B" ? "bg-amber-400/10 text-amber-400" : "text-slate-500"}`}>
                    TIM B
                  </span>
                </div>

                {/* Score Summary Blocks */}
                <div className="mt-3 flex items-center gap-1 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80 justify-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase font-mono mr-2">Set:</span>
                  {match.sets.map((set, idx) => (
                    <div
                      key={`set-result-${idx}`}
                      className={`px-2.5 py-1 rounded text-xs font-mono font-bold border ${
                        set.winner === "A"
                          ? "bg-amber-500/5 border-amber-500/20 text-amber-300"
                          : "bg-slate-800/50 border-slate-700 text-slate-300"
                      }`}
                    >
                      {set.scoreA}-{set.scoreB}
                    </div>
                  ))}
                </div>
              </div>

              {/* Card Footer (Duration / Date / Winner name) */}
              <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>{formatDuration(match.durationSeconds)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>{formatDate(match.date)}</span>
                </div>
              </div>

              {/* Absolute winner crown floating badge */}
              <div className="absolute -top-2.5 -right-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 rounded-full p-1.5 shadow-lg border-2 border-slate-950 flex items-center justify-center">
                <Trophy className="w-3.5 h-3.5" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
