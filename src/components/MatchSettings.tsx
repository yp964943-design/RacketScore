import React, { useState, useEffect } from "react";
import { SportType, GameMode, MatchSettings as SettingsType, PlayerNames } from "../types";
import { Play, Settings2, Users, User, CircleHelp, Info } from "lucide-react";
import { playSound } from "../utils/audio";

interface MatchSettingsProps {
  onStartMatch: (settings: SettingsType) => void;
}

export const MatchSettings: React.FC<MatchSettingsProps> = ({ onStartMatch }) => {
  const [sport, setSport] = useState<SportType>(SportType.BADMINTON);
  const [mode, setMode] = useState<GameMode>(GameMode.SINGLES);
  const [bestOfSets, setBestOfSets] = useState<number>(3);
  const [customNames, setCustomNames] = useState<boolean>(false);
  const [targetPoints, setTargetPoints] = useState<number>(21);
  const [deuceEnabled, setDeuceEnabled] = useState<boolean>(true);
  const [deuceMaxPoints, setDeuceMaxPoints] = useState<number>(30);

  // Player Names State
  const [playerA1, setPlayerA1] = useState("Pemain A1");
  const [playerA2, setPlayerA2] = useState("Pemain A2");
  const [playerB1, setPlayerB1] = useState("Pemain B1");
  const [playerB2, setPlayerB2] = useState("Pemain B2");
  const [teamAName, setTeamAName] = useState("TIM A");
  const [teamBName, setTeamBName] = useState("TIM B");

  // Sync default target points when sport changes
  useEffect(() => {
    if (sport === SportType.BADMINTON) {
      setTargetPoints(21);
      setDeuceMaxPoints(30);
    } else {
      setTargetPoints(11);
      setDeuceMaxPoints(99); // No practical limit for Table Tennis
    }
  }, [sport]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Prepare Player Names
    let teamA: string[] = [];
    let teamB: string[] = [];

    if (customNames) {
      if (mode === GameMode.SINGLES) {
        teamA = [playerA1.trim() || "Pemain A"];
        teamB = [playerB1.trim() || "Pemain B"];
      } else {
        teamA = [playerA1.trim() || "Pemain A1", playerA2.trim() || "Pemain A2"];
        teamB = [playerB1.trim() || "Pemain B1", playerB2.trim() || "Pemain B2"];
      }
    } else {
      if (mode === GameMode.SINGLES) {
        teamA = ["Tim A"];
        teamB = ["Tim B"];
      } else {
        teamA = ["Tim A1", "Tim A2"];
        teamB = ["Tim B1", "Tim B2"];
      }
    }

    const settings: SettingsType = {
      sport,
      mode,
      targetPoints,
      bestOfSets,
      deuceEnabled,
      deuceMaxPoints,
      customNames,
      playerNames: {
        teamA,
        teamB,
        teamAName: customNames ? (teamAName.trim() || "TIM A") : "TIM A",
        teamBName: customNames ? (teamBName.trim() || "TIM B") : "TIM B",
      },
    };

    // Play sport whistle start sound
    playSound("whistle");
    onStartMatch(settings);
  };

  return (
    <form
      id="match-settings-form"
      onSubmit={handleSubmit}
      className="space-y-6 max-w-2xl mx-auto"
    >
      {/* Sport Selector Cards */}
      <div className="space-y-3">
        <label className="text-sm font-bold text-slate-300 font-mono tracking-wider uppercase">Pilih Cabang Olahraga</label>
        <div className="grid grid-cols-2 gap-4">
          {/* Badminton Selection */}
          <button
            type="button"
            onClick={() => setSport(SportType.BADMINTON)}
            className={`relative p-5 rounded-2xl border-2 text-left transition-all ${
              sport === SportType.BADMINTON
                ? "bg-emerald-500/10 border-emerald-500 shadow-lg shadow-emerald-500/10 text-white"
                : "bg-slate-900/40 border-slate-800 hover:border-slate-700 text-slate-400"
            }`}
          >
            <div className="flex flex-col h-full justify-between">
              <span className="text-xl mb-1">🏸</span>
              <div>
                <h3 className="font-bold text-base text-white">Bulu Tangkis</h3>
                <p className="text-[11px] text-slate-400 mt-1">Standar BWF (21 Poin, Deuce maks 30)</p>
              </div>
            </div>
            {sport === SportType.BADMINTON && (
              <span className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm"></span>
            )}
          </button>

          {/* Table Tennis Selection */}
          <button
            type="button"
            onClick={() => setSport(SportType.TABLE_TENNIS)}
            className={`relative p-5 rounded-2xl border-2 text-left transition-all ${
              sport === SportType.TABLE_TENNIS
                ? "bg-blue-500/10 border-blue-500 shadow-lg shadow-blue-500/10 text-white"
                : "bg-slate-900/40 border-slate-800 hover:border-slate-700 text-slate-400"
            }`}
          >
            <div className="flex flex-col h-full justify-between">
              <span className="text-xl mb-1">🏓</span>
              <div>
                <h3 className="font-bold text-base text-white">Tenis Meja</h3>
                <p className="text-[11px] text-slate-400 mt-1">Standar ITTF (11 Poin, Deuce tak terbatas)</p>
              </div>
            </div>
            {sport === SportType.TABLE_TENNIS && (
              <span className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-blue-400 shadow-sm"></span>
            )}
          </button>
        </div>
      </div>

      {/* Game Mode Selector (Singles/Doubles) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Game Mode */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold text-slate-400 font-mono tracking-wider uppercase">Kategori Pertandingan</label>
          <div className="flex gap-2 p-1 bg-slate-950/80 rounded-xl border border-slate-800/80">
            <button
              type="button"
              onClick={() => setMode(GameMode.SINGLES)}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                mode === GameMode.SINGLES
                  ? "bg-slate-800 text-white shadow-sm border border-slate-700/60"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <User className="w-3.5 h-3.5" />
              Tunggal (1v1)
            </button>
            <button
              type="button"
              onClick={() => setMode(GameMode.DOUBLES)}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                mode === GameMode.DOUBLES
                  ? "bg-slate-800 text-white shadow-sm border border-slate-700/60"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Ganda (2v2)
            </button>
          </div>
        </div>

        {/* Set Duration (Best of) */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold text-slate-400 font-mono tracking-wider uppercase">Jumlah Game (Best Of)</label>
          <div className="flex gap-2 p-1 bg-slate-950/80 rounded-xl border border-slate-800/80">
            {[1, 3, 5].map((sets) => (
              <button
                key={`sets-count-${sets}`}
                type="button"
                onClick={() => setBestOfSets(sets)}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                  bestOfSets === sets
                    ? "bg-slate-800 text-white shadow-sm border border-slate-700/60"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {sets === 1 ? "1 Set" : `Best of ${sets}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Advanced Score Configurations */}
      <div className="p-5 bg-slate-900/30 rounded-2xl border border-slate-800/80 space-y-4">
        <h4 className="text-xs font-bold text-slate-300 font-mono flex items-center gap-1.5 border-b border-slate-800/60 pb-2 mb-2">
          <Settings2 className="w-3.5 h-3.5 text-violet-400" />
          PENGATURAN SKOR & ATURAN JUS (DEUCE)
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Target score points */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 font-mono uppercase">Target Poin Set</label>
            <input
              type="number"
              min="1"
              max="99"
              value={targetPoints}
              onChange={(e) => setTargetPoints(Math.max(1, parseInt(e.target.value) || 0))}
              className="w-full bg-slate-950 border border-slate-800 focus:border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono font-bold outline-none"
            />
          </div>

          {/* Deuce rule toggle */}
          <div className="space-y-1.5 flex flex-col justify-end">
            <span className="text-[11px] font-bold text-slate-400 font-mono uppercase mb-1.5">Sistem Deuce (Jus)</span>
            <label className="relative flex items-center justify-between cursor-pointer p-2 bg-slate-950 border border-slate-800/80 rounded-xl h-[38px]">
              <span className="text-xs font-medium text-slate-300">Aktifkan</span>
              <input
                type="checkbox"
                checked={deuceEnabled}
                onChange={(e) => setDeuceEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-8 h-4.5 bg-slate-800 rounded-full peer peer-focus:ring-0 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-1.5 after:right-4 after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-violet-500 peer-checked:after:bg-white peer-checked:after:border-transparent"></div>
            </label>
          </div>

          {/* Deuce points limit */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 font-mono uppercase flex items-center justify-between">
              <span>Batas Maksimal Poin</span>
              <span className="text-[9px] text-slate-500 lowercase">(BWF: 30)</span>
            </label>
            <input
              type="number"
              disabled={!deuceEnabled}
              min={targetPoints + 1}
              max="150"
              value={deuceMaxPoints}
              onChange={(e) => setDeuceMaxPoints(Math.max(targetPoints + 1, parseInt(e.target.value) || 0))}
              className={`w-full bg-slate-950 border focus:border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono font-bold outline-none ${
                deuceEnabled ? "border-slate-800 opacity-100" : "border-slate-900 opacity-40 cursor-not-allowed"
              }`}
            />
          </div>
        </div>
      </div>

      {/* Player Names Section */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-slate-300 font-mono tracking-wider uppercase">Nama Pemain/Tim</label>
          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-400 hover:text-white transition-colors">
            <input
              type="checkbox"
              checked={customNames}
              onChange={(e) => setCustomNames(e.target.checked)}
              className="rounded border-slate-800 bg-slate-950 text-violet-500 focus:ring-0"
            />
            Kustomisasi Nama Pemain & Tim
          </label>
        </div>

        {customNames ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 bg-slate-900/30 rounded-2xl border border-slate-800/80 animate-fadeIn">
            {/* Team A configuration */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-amber-400 font-mono uppercase tracking-wider">Tim / Pemain A</h4>
              <div className="space-y-2">
                <div>
                  <label className="text-[10px] text-slate-400 font-mono font-medium block mb-1">Nama Tim A</label>
                  <input
                    type="text"
                    value={teamAName}
                    onChange={(e) => setTeamAName(e.target.value)}
                    placeholder="Contoh: TIM A, PB Garuda, dll"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-slate-700 rounded-xl px-3 py-2 text-sm text-white outline-none mb-2"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-mono font-medium block mb-1">Pemain A1 (Servis Awal)</label>
                  <input
                    type="text"
                    value={playerA1}
                    onChange={(e) => setPlayerA1(e.target.value)}
                    placeholder="Nama Pemain"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-slate-700 rounded-xl px-3 py-2 text-sm text-white outline-none"
                    required
                  />
                </div>
                {mode === GameMode.DOUBLES && (
                  <div>
                    <label className="text-[10px] text-slate-400 font-mono font-medium block mb-1">Pemain A2</label>
                    <input
                      type="text"
                      value={playerA2}
                      onChange={(e) => setPlayerA2(e.target.value)}
                      placeholder="Nama Pemain Kedua"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-slate-700 rounded-xl px-3 py-2 text-sm text-white outline-none"
                      required
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Team B configuration */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-cyan-400 font-mono uppercase tracking-wider">Tim / Pemain B</h4>
              <div className="space-y-2">
                <div>
                  <label className="text-[10px] text-slate-400 font-mono font-medium block mb-1">Nama Tim B</label>
                  <input
                    type="text"
                    value={teamBName}
                    onChange={(e) => setTeamBName(e.target.value)}
                    placeholder="Contoh: TIM B, PB Rajawali, dll"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-slate-700 rounded-xl px-3 py-2 text-sm text-white outline-none mb-2"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-mono font-medium block mb-1">Pemain B1 (Penerima Awal)</label>
                  <input
                    type="text"
                    value={playerB1}
                    onChange={(e) => setPlayerB1(e.target.value)}
                    placeholder="Nama Pemain"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-slate-700 rounded-xl px-3 py-2 text-sm text-white outline-none"
                    required
                  />
                </div>
                {mode === GameMode.DOUBLES && (
                  <div>
                    <label className="text-[10px] text-slate-400 font-mono font-medium block mb-1">Pemain B2</label>
                    <input
                      type="text"
                      value={playerB2}
                      onChange={(e) => setPlayerB2(e.target.value)}
                      placeholder="Nama Pemain Kedua"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-slate-700 rounded-xl px-3 py-2 text-sm text-white outline-none"
                      required
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-start gap-2.5 text-xs text-slate-400 leading-relaxed">
            <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <span>
              Aplikasi akan menggunakan label bawaan yaitu <strong>TIM A</strong> vs <strong>TIM B</strong>. Anda dapat mengaktifkan &quot;Kustomisasi Nama Pemain & Tim&quot; di atas untuk mencatat nama asli pemain serta nama tim kustom.
            </span>
          </div>
        )}
      </div>

      {/* Start Button */}
      <button
        type="submit"
        className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold py-3.5 px-6 rounded-2xl shadow-xl shadow-indigo-500/10 hover:shadow-indigo-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-sm font-mono cursor-pointer"
      >
        <Play className="w-4 h-4 fill-current" />
        MULAI PERTANDINGAN
      </button>
    </form>
  );
};
