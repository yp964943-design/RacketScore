import React from "react";
import { SportType, GameMode } from "../types";
import { User, ShieldAlert } from "lucide-react";

interface CourtVisualizerProps {
  sport: SportType;
  mode: GameMode;
  playerNames: { teamA: string[]; teamB: string[] };
  scoreA: number;
  scoreB: number;
  servingTeam: "A" | "B";
  servingPlayerIndex: number;
  receivingPlayerIndex: number;
  courtSides: { leftTeam: "A" | "B"; rightTeam: "A" | "B" };
}

export const CourtVisualizer: React.FC<CourtVisualizerProps> = ({
  sport,
  mode,
  playerNames,
  scoreA,
  scoreB,
  servingTeam,
  servingPlayerIndex,
  receivingPlayerIndex,
  courtSides,
}) => {
  const isBadminton = sport === SportType.BADMINTON;
  const isDoubles = mode === GameMode.DOUBLES;

  // Identify who is on the left side of the screen and who is on the right side of the screen
  const leftTeam = courtSides.leftTeam;
  const rightTeam = courtSides.rightTeam;

  const leftTeamNames = leftTeam === "A" ? playerNames.teamA : playerNames.teamB;
  const rightTeamNames = rightTeam === "A" ? playerNames.teamA : playerNames.teamB;

  // Scores for left and right
  const leftScore = leftTeam === "A" ? scoreA : scoreB;
  const rightScore = rightTeam === "A" ? scoreA : scoreB;

  // Determine badminton serving courts (Right vs Left)
  // For Badminton, serve is based on the server's current score
  const serverScore = servingTeam === "A" ? scoreA : scoreB;
  const isEvenScore = serverScore % 2 === 0;

  // Service court position:
  // In singles: Even score = Right side, Odd score = Left side.
  // In doubles: Same rule for the server team's serving player.
  const servingFromRight = isEvenScore; 
  const receivingToRight = isEvenScore; // receiver stands diagonally, so they receive on their Right side relative to court baseline

  // Render Table Tennis layout
  if (!isBadminton) {
    // TABLE TENNIS VISUALIZATION
    // Table Tennis rules: Serves alternate every 2 points.
    // If score is deuce (10-10) or more (total points >= 20), serves alternate every 1 point.
    const totalPoints = scoreA + scoreB;
    const isDeuceMode = scoreA >= 10 && scoreB >= 10;
    const serveInterval = isDeuceMode ? 1 : 2;
    const servesCompletedInCurrentPeriod = totalPoints % serveInterval;
    const servesRemaining = serveInterval - servesCompletedInCurrentPeriod;

    return (
      <div id="table-tennis-court-container" className="flex flex-col items-center justify-center p-4 bg-slate-900/40 rounded-2xl border border-slate-800 backdrop-blur-sm">
        <div className="text-xs font-mono text-slate-400 mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          VISUALISASI MEJA PINGPONG (TENIS MEJA)
        </div>

        {/* Table Tennis Table */}
        <div className="relative w-full max-w-lg aspect-[9/5] bg-emerald-800 rounded-lg border-4 border-white shadow-xl overflow-hidden flex items-center justify-between">
          {/* Center line (White dashed/solid line dividing the two serving halves) */}
          <div className="absolute top-0 bottom-0 left-0 right-0 border-t border-b border-dashed border-white/50 h-0 m-auto"></div>
          
          {/* Net (Vertical dividing line in the middle) */}
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-2 bg-slate-700/80 border-l border-r border-white/60 z-10 flex flex-col justify-between py-1">
            <div className="w-3 h-1 -ml-0.5 bg-slate-500 rounded-sm"></div>
            <div className="w-3 h-1 -ml-0.5 bg-slate-500 rounded-sm"></div>
          </div>

          {/* LEFT COURT SIDE */}
          {isDoubles ? (
            <div className="relative flex-1 h-full flex flex-col z-20">
              {/* SISI KIRI - TOP HALF (Left Court for left team) */}
              <div className="flex-1 w-full flex items-center justify-center p-1.5 relative border-b border-dashed border-white/20">
                {(() => {
                  const partnerIdx = servingTeam === leftTeam ? (1 - servingPlayerIndex) : (1 - receivingPlayerIndex);
                  const partnerName = leftTeamNames[partnerIdx] || `Pemain ${partnerIdx + 1}`;
                  return (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full border bg-slate-900/95 border-slate-800 text-slate-400 text-[10px]">
                      <div className="w-4 h-4 rounded-full bg-slate-700 text-white text-[9px] font-bold flex items-center justify-center">
                        {partnerName.substring(0, 1).toUpperCase()}
                      </div>
                      <div className="font-medium truncate max-w-[75px]">{partnerName}</div>
                    </div>
                  );
                })()}
              </div>

              {/* SISI KIRI - BOTTOM HALF (Right Court for left team - Service / Receive box) */}
              <div className={`flex-1 w-full flex items-center justify-center p-1.5 relative transition-colors duration-300 ${
                servingTeam === leftTeam
                  ? "bg-amber-400/15"
                  : "bg-cyan-500/10"
              }`}>
                {servingTeam === leftTeam ? (
                  <span className="absolute bottom-1 left-2 bg-amber-400 text-slate-950 font-black text-[7.5px] px-1 rounded shadow uppercase">SERVIS KANAN</span>
                ) : (
                  <span className="absolute bottom-1 left-2 bg-cyan-400 text-slate-950 font-black text-[7.5px] px-1 rounded shadow uppercase">RESERVE KANAN</span>
                )}

                {(() => {
                  const activeIdx = servingTeam === leftTeam ? servingPlayerIndex : receivingPlayerIndex;
                  const activeName = leftTeamNames[activeIdx] || `Pemain ${activeIdx + 1}`;
                  const isActiveServer = servingTeam === leftTeam;
                  return (
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-all ${
                      isActiveServer
                        ? "bg-amber-500/25 border-amber-400 text-amber-200 shadow-md scale-105"
                        : "bg-cyan-500/25 border-cyan-400 text-cyan-200 shadow-md scale-105"
                    }`}>
                      <div className={`w-4.5 h-4.5 rounded-full flex items-center justify-center text-[9px] font-bold ${
                        isActiveServer ? "bg-amber-400 text-slate-950" : "bg-cyan-400 text-slate-950"
                      }`}>
                        {activeName.substring(0, 1).toUpperCase()}
                      </div>
                      <div className="text-[11px] font-bold truncate max-w-[75px]">{activeName}</div>
                      <span className={`w-1.5 h-1.5 rounded-full ${isActiveServer ? "bg-amber-400 animate-pulse" : "bg-cyan-400"}`}></span>
                    </div>
                  );
                })()}
              </div>
            </div>
          ) : (
            <div className={`relative flex-1 h-full flex flex-col justify-center items-center transition-all ${
              servingTeam === leftTeam ? "bg-emerald-700/40" : "bg-transparent"
            }`}>
              <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-slate-950/60 border border-slate-700/50 text-[10px] font-mono text-slate-300">
                SISI KIRI: REGION {leftTeam}
              </div>

              {/* Players on Left Side */}
              <div className="flex flex-col gap-4 z-20">
                {leftTeamNames.slice(0, 1).map((name, idx) => {
                  const isServer = servingTeam === leftTeam;
                  return (
                    <div
                      key={`tt-left-player-${idx}`}
                      className={`flex items-center gap-2.5 px-3 py-1.5 rounded-full border transition-all ${
                        isServer
                          ? "bg-amber-500/20 border-amber-400 text-amber-200 shadow-lg shadow-amber-500/10 scale-105"
                          : "bg-slate-900/80 border-slate-700/80 text-slate-300"
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        isServer ? "bg-amber-400 text-slate-950" : "bg-slate-700 text-white"
                      }`}>
                        {name.substring(0, 1).toUpperCase() || (leftTeam === "A" ? "A" : "B")}
                      </div>
                      <div className="text-xs font-semibold truncate max-w-[90px]">{name}</div>
                      {isServer && (
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Serve Indicator Badge */}
              {servingTeam === leftTeam && (
                <div className="absolute bottom-2 left-2 bg-amber-400 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                  SERVIS ({servesRemaining}x lagi)
                </div>
              )}
            </div>
          )}

          {/* RIGHT COURT SIDE */}
          {isDoubles ? (
            <div className="relative flex-1 h-full flex flex-col z-20">
              {/* SISI KANAN - TOP HALF (Right Court for right team - Service / Receive box) */}
              <div className={`flex-1 w-full flex items-center justify-center p-1.5 relative border-b border-dashed border-white/20 transition-colors duration-300 ${
                servingTeam === rightTeam
                  ? "bg-amber-400/15"
                  : "bg-cyan-500/10"
              }`}>
                {servingTeam === rightTeam ? (
                  <span className="absolute top-1 right-2 bg-amber-400 text-slate-950 font-black text-[7.5px] px-1 rounded shadow uppercase">SERVIS KANAN</span>
                ) : (
                  <span className="absolute top-1 right-2 bg-cyan-400 text-slate-950 font-black text-[7.5px] px-1 rounded shadow uppercase">RESERVE KANAN</span>
                )}

                {(() => {
                  const activeIdx = servingTeam === rightTeam ? servingPlayerIndex : receivingPlayerIndex;
                  const activeName = rightTeamNames[activeIdx] || `Pemain ${activeIdx + 1}`;
                  const isActiveServer = servingTeam === rightTeam;
                  return (
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-all ${
                      isActiveServer
                        ? "bg-amber-500/25 border-amber-400 text-amber-200 shadow-md scale-105"
                        : "bg-cyan-500/25 border-cyan-400 text-cyan-200 shadow-md scale-105"
                    }`}>
                      <div className={`w-4.5 h-4.5 rounded-full flex items-center justify-center text-[9px] font-bold ${
                        isActiveServer ? "bg-amber-400 text-slate-950" : "bg-cyan-400 text-slate-950"
                      }`}>
                        {activeName.substring(0, 1).toUpperCase()}
                      </div>
                      <div className="text-[11px] font-bold truncate max-w-[75px]">{activeName}</div>
                      <span className={`w-1.5 h-1.5 rounded-full ${isActiveServer ? "bg-amber-400 animate-pulse" : "bg-cyan-400"}`}></span>
                    </div>
                  );
                })()}
              </div>

              {/* SISI KANAN - BOTTOM HALF (Left Court for right team) */}
              <div className="flex-1 w-full flex items-center justify-center p-1.5 relative">
                {(() => {
                  const partnerIdx = servingTeam === rightTeam ? (1 - servingPlayerIndex) : (1 - receivingPlayerIndex);
                  const partnerName = rightTeamNames[partnerIdx] || `Pemain ${partnerIdx + 1}`;
                  return (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full border bg-slate-900/95 border-slate-800 text-slate-400 text-[10px]">
                      <div className="w-4 h-4 rounded-full bg-slate-700 text-white text-[9px] font-bold flex items-center justify-center">
                        {partnerName.substring(0, 1).toUpperCase()}
                      </div>
                      <div className="font-medium truncate max-w-[75px]">{partnerName}</div>
                    </div>
                  );
                })()}
              </div>
            </div>
          ) : (
            <div className={`relative flex-1 h-full flex flex-col justify-center items-center transition-all ${
              servingTeam === rightTeam ? "bg-emerald-700/40" : "bg-transparent"
            }`}>
              <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-slate-950/60 border border-slate-700/50 text-[10px] font-mono text-slate-300">
                SISI KANAN: REGION {rightTeam}
              </div>

              {/* Players on Right Side */}
              <div className="flex flex-col gap-4 z-20">
                {rightTeamNames.slice(0, 1).map((name, idx) => {
                  const isServer = servingTeam === rightTeam;
                  return (
                    <div
                      key={`tt-right-player-${idx}`}
                      className={`flex items-center gap-2.5 px-3 py-1.5 rounded-full border transition-all ${
                        isServer
                          ? "bg-amber-500/20 border-amber-400 text-amber-200 shadow-lg shadow-amber-500/10 scale-105"
                          : "bg-slate-900/80 border-slate-700/80 text-slate-300"
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        isServer ? "bg-amber-400 text-slate-950" : "bg-slate-700 text-white"
                      }`}>
                        {name.substring(0, 1).toUpperCase() || (rightTeam === "A" ? "A" : "B")}
                      </div>
                      <div className="text-xs font-semibold truncate max-w-[90px]">{name}</div>
                      {isServer && (
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Serve Indicator Badge */}
              {servingTeam === rightTeam && (
                <div className="absolute bottom-2 right-2 bg-amber-400 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                  SERVIS ({servesRemaining}x lagi)
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-2 text-center px-4">
          <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
            {isDeuceMode 
              ? "Skor ≥ 10-10: Servis bergantian setiap 1 poin"
              : `Servis bergantian setiap 2 poin (Siklus saat ini: ${scoreA + scoreB} poin dimainkan)`}
          </p>
          {isDoubles && (
            <p className="text-[10px] text-slate-400 leading-relaxed font-mono mt-1 border-t border-slate-800/40 pt-1">
              💡 <span className="text-amber-300">Mode Ganda</span>: Servis selalu dimulai dari SISI KANAN (Bottom-Left / Top-Right) menyilang secara diagonal ke SISI KANAN penerima.
            </p>
          )}
        </div>
      </div>
    );
  }

  // BADMINTON COURT VISUALIZATION
  // Badminton court split:
  // - Left & Right halves divided by the net in the middle.
  // - Each half is further split horizontally into left service court and right service court.
  // Let's draw this with SVG or grid elements inside a styled court!
  // Court orientation: Horizontal.
  // Left side has the left team, Right side has the right team.
  // Inside left side, we have:
  // - Upper division (from player's perspective, this is Left or Right? Let's label them clearly: Right court is Bottom half if facing right, Left court is Top half. Let's make it standard).
  // Standard badminton court:
  // When looking at the court horizontally:
  // For the left team (facing right):
  // - Top half = LEFT service court (even is right, which is the bottom half. Odd is left, which is top half).
  // - Bottom half = RIGHT service court (even scores).
  // For the right team (facing left):
  // - Top half = RIGHT service court (even scores, since facing left, right is top half).
  // - Bottom half = LEFT service court (odd scores).

  return (
    <div id="badminton-court-container" className="flex flex-col items-center justify-center p-4 bg-slate-900/40 rounded-2xl border border-slate-800 backdrop-blur-sm">
      <div className="text-xs font-mono text-slate-400 mb-3 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        VISUALISASI LAPANGAN BULU TANGKIS (BADMINTON)
      </div>

      {/* Badminton Court Container */}
      <div className="relative w-full max-w-xl aspect-[16/9] bg-emerald-900 rounded-xl border-[3px] border-white shadow-2xl flex">
        {/* Net (Vertical dividing line in the middle) */}
        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-1.5 bg-slate-300/95 shadow-md z-30 flex flex-col justify-between py-1">
          <div className="w-2.5 h-1 -ml-0.5 bg-slate-500 rounded-sm"></div>
          <div className="h-full border-l border-dashed border-slate-400"></div>
          <div className="w-2.5 h-1 -ml-0.5 bg-slate-500 rounded-sm"></div>
        </div>

        {/* Short Service Lines (Garasi depan servis - 1.98m from net) */}
        {/* Left court short service line */}
        <div className="absolute top-0 bottom-0 left-[35%] w-0.5 bg-white/75 z-10"></div>
        {/* Right court short service line */}
        <div className="absolute top-0 bottom-0 right-[35%] w-0.5 bg-white/75 z-10"></div>

        {/* Long Service Lines for Doubles (Garasi belakang ganda - 0.76m from baseline) */}
        <div className="absolute top-0 bottom-0 left-[6%] w-0.5 bg-white/60 z-10"></div>
        <div className="absolute top-0 bottom-0 right-[6%] w-0.5 bg-white/60 z-10"></div>

        {/* Center Lines dividing left and right service courts */}
        {/* Left half center line */}
        <div className="absolute top-1/2 left-0 right-1/2 border-t-[1.5px] border-white/85 z-10"></div>
        {/* Right half center line */}
        <div className="absolute top-1/2 left-1/2 right-0 border-t-[1.5px] border-white/85 z-10"></div>

        {/* Sidelines for Doubles vs Singles */}
        {/* Doubles side boundaries (Outer lines - already the border) */}
        {/* Singles side boundaries (Inner lines - 0.46m inside outer lines) */}
        <div className="absolute left-0 right-0 top-[8%] border-t-[1.5px] border-white/50 z-10"></div>
        <div className="absolute left-0 right-0 bottom-[8%] border-b-[1.5px] border-white/50 z-10"></div>


        {/* LEFT TEAM COURT HALVES (Upper half = Left Court, Lower half = Right Court) */}
        <div className="w-1/2 h-full relative flex flex-col">
          {/* TOP HALF - Left Service Court (Odd Score serve/receive) */}
          <div className={`flex-1 relative transition-colors duration-300 ${
            servingTeam === leftTeam && !servingFromRight 
              ? "bg-amber-400/20" 
              : servingTeam !== leftTeam && !receivingToRight
              ? "bg-cyan-500/10"
              : "bg-transparent"
          }`}>
            {servingTeam === leftTeam && !servingFromRight && (
              <span className="absolute top-2 left-2 bg-amber-400 text-slate-950 font-bold text-[9px] px-1 rounded shadow">SERVIS KIRI (GANJIL)</span>
            )}
            {servingTeam !== leftTeam && !receivingToRight && (
              <span className="absolute top-2 left-2 bg-cyan-400 text-slate-950 font-bold text-[9px] px-1 rounded shadow">RESERVE KIRI</span>
            )}

            {/* Players in Left-Top Court */}
            {(!isDoubles && servingTeam === leftTeam && !servingFromRight) || (isDoubles && leftTeamNames[1] && (servingTeam === leftTeam ? servingPlayerIndex === 1 : receivingPlayerIndex === 1)) ? (
              <div className="absolute bottom-2 right-4 flex items-center gap-1.5 bg-slate-950/80 text-white rounded-full px-2 py-1 border border-amber-400/80 z-20 shadow-md">
                <div className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 text-[10px] font-bold flex items-center justify-center">
                  {(leftTeam === "A" ? leftTeamNames[servingTeam === "A" ? servingPlayerIndex : receivingPlayerIndex] : leftTeamNames[servingTeam === "B" ? servingPlayerIndex : receivingPlayerIndex])?.substring(0, 1).toUpperCase()}
                </div>
                <div className="text-[10px] max-w-[70px] truncate font-medium">
                  {leftTeam === "A" 
                    ? leftTeamNames[servingTeam === "A" ? servingPlayerIndex : receivingPlayerIndex] 
                    : leftTeamNames[servingTeam === "B" ? servingPlayerIndex : receivingPlayerIndex]}
                </div>
              </div>
            ) : null}
          </div>

          {/* BOTTOM HALF - Right Service Court (Even Score serve/receive) */}
          <div className={`flex-1 relative border-t border-white/30 transition-colors duration-300 ${
            servingTeam === leftTeam && servingFromRight 
              ? "bg-amber-400/20" 
              : servingTeam !== leftTeam && receivingToRight
              ? "bg-cyan-500/10"
              : "bg-transparent"
          }`}>
            {servingTeam === leftTeam && servingFromRight && (
              <span className="absolute bottom-2 left-2 bg-amber-400 text-slate-950 font-bold text-[9px] px-1 rounded shadow">SERVIS KANAN (GENAP)</span>
            )}
            {servingTeam !== leftTeam && receivingToRight && (
              <span className="absolute bottom-2 left-2 bg-cyan-400 text-slate-950 font-bold text-[9px] px-1 rounded shadow">RESERVE KANAN</span>
            )}

            {/* Players in Left-Bottom Court */}
            {(!isDoubles && (servingTeam !== leftTeam || servingFromRight)) || (isDoubles && (servingTeam === leftTeam ? servingPlayerIndex === 0 : receivingPlayerIndex === 0)) ? (
              <div className="absolute top-2 right-4 flex items-center gap-1.5 bg-slate-950/80 text-white rounded-full px-2 py-1 border border-amber-400/80 z-20 shadow-md">
                <div className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 text-[10px] font-bold flex items-center justify-center">
                  {(leftTeam === "A" ? leftTeamNames[servingTeam === "A" ? servingPlayerIndex : receivingPlayerIndex] : leftTeamNames[servingTeam === "B" ? servingPlayerIndex : receivingPlayerIndex])?.substring(0, 1).toUpperCase()}
                </div>
                <div className="text-[10px] max-w-[70px] truncate font-medium">
                  {leftTeam === "A" 
                    ? leftTeamNames[servingTeam === "A" ? servingPlayerIndex : receivingPlayerIndex] 
                    : leftTeamNames[servingTeam === "B" ? servingPlayerIndex : receivingPlayerIndex]}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* RIGHT TEAM COURT HALVES (Upper half = Right Court, Lower half = Left Court - due to opposite facing direction) */}
        <div className="w-1/2 h-full relative flex flex-col">
          {/* TOP HALF - Right Service Court (Even Score serve/receive) */}
          <div className={`flex-1 relative transition-colors duration-300 ${
            servingTeam === rightTeam && servingFromRight 
              ? "bg-amber-400/20" 
              : servingTeam !== rightTeam && receivingToRight
              ? "bg-cyan-500/10"
              : "bg-transparent"
          }`}>
            {servingTeam === rightTeam && servingFromRight && (
              <span className="absolute top-2 right-2 bg-amber-400 text-slate-950 font-bold text-[9px] px-1 rounded shadow">SERVIS KANAN (GENAP)</span>
            )}
            {servingTeam !== rightTeam && receivingToRight && (
              <span className="absolute top-2 right-2 bg-cyan-400 text-slate-950 font-bold text-[9px] px-1 rounded shadow">RESERVE KANAN</span>
            )}

            {/* Players in Right-Top Court */}
            {(!isDoubles && (servingTeam !== rightTeam || servingFromRight)) || (isDoubles && (servingTeam === rightTeam ? servingPlayerIndex === 0 : receivingPlayerIndex === 0)) ? (
              <div className="absolute bottom-2 left-4 flex items-center gap-1.5 bg-slate-950/80 text-white rounded-full px-2 py-1 border border-amber-400/80 z-20 shadow-md">
                <div className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 text-[10px] font-bold flex items-center justify-center">
                  {(rightTeam === "A" ? rightTeamNames[servingTeam === "A" ? servingPlayerIndex : receivingPlayerIndex] : rightTeamNames[servingTeam === "B" ? servingPlayerIndex : receivingPlayerIndex])?.substring(0, 1).toUpperCase()}
                </div>
                <div className="text-[10px] max-w-[70px] truncate font-medium">
                  {rightTeam === "A" 
                    ? rightTeamNames[servingTeam === "A" ? servingPlayerIndex : receivingPlayerIndex] 
                    : rightTeamNames[servingTeam === "B" ? servingPlayerIndex : receivingPlayerIndex]}
                </div>
              </div>
            ) : null}
          </div>

          {/* BOTTOM HALF - Left Service Court (Odd Score serve/receive) */}
          <div className={`flex-1 relative border-t border-white/30 transition-colors duration-300 ${
            servingTeam === rightTeam && !servingFromRight 
              ? "bg-amber-400/20" 
              : servingTeam !== rightTeam && !receivingToRight
              ? "bg-cyan-500/10"
              : "bg-transparent"
          }`}>
            {servingTeam === rightTeam && !servingFromRight && (
              <span className="absolute bottom-2 right-2 bg-amber-400 text-slate-950 font-bold text-[9px] px-1 rounded shadow">SERVIS KIRI (GANJIL)</span>
            )}
            {servingTeam !== rightTeam && !receivingToRight && (
              <span className="absolute bottom-2 right-2 bg-cyan-400 text-slate-950 font-bold text-[9px] px-1 rounded shadow">RESERVE KIRI</span>
            )}

            {/* Players in Right-Bottom Court */}
            {(!isDoubles && servingTeam === rightTeam && !servingFromRight) || (isDoubles && rightTeamNames[1] && (servingTeam === rightTeam ? servingPlayerIndex === 1 : receivingPlayerIndex === 1)) ? (
              <div className="absolute top-2 left-4 flex items-center gap-1.5 bg-slate-950/80 text-white rounded-full px-2 py-1 border border-amber-400/80 z-20 shadow-md">
                <div className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 text-[10px] font-bold flex items-center justify-center">
                  {(rightTeam === "A" ? rightTeamNames[servingTeam === "A" ? servingPlayerIndex : receivingPlayerIndex] : rightTeamNames[servingTeam === "B" ? servingPlayerIndex : receivingPlayerIndex])?.substring(0, 1).toUpperCase()}
                </div>
                <div className="text-[10px] max-w-[70px] truncate font-medium">
                  {rightTeam === "A" 
                    ? rightTeamNames[servingTeam === "A" ? servingPlayerIndex : receivingPlayerIndex] 
                    : rightTeamNames[servingTeam === "B" ? servingPlayerIndex : receivingPlayerIndex]}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Singles/Doubles explanation context */}
      <div className="mt-2.5 text-center px-4">
        <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
          {isDoubles 
            ? "Mode Ganda: Servis dilakukan menyilang secara diagonal. Posisi berpindah saat tim penyervis mendapat poin."
            : "Mode Tunggal: Berdiri di kanan jika skor genap (0, 2, 4...), di kiri jika skor ganjil (1, 3, 5...)."}
        </p>
      </div>
    </div>
  );
};
