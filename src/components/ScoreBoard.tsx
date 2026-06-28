import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { MatchSettings, LiveMatchState, SetScore, UndoState, SportType, GameMode, PlayerNames } from "../types";
import { CourtVisualizer } from "./CourtVisualizer";
import { playSound, announceScoreIndonesian } from "../utils/audio";
import {
  RotateCcw,
  ArrowLeftRight,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Save,
  ChevronLeft,
  Square,
  AlertTriangle,
  Undo2,
  Mic,
  MicOff,
  Plus,
  Minus,
  CheckCircle,
  Pencil,
  X,
} from "lucide-react";

interface ScoreBoardProps {
  settings: MatchSettings;
  onFinishMatch: (historyEntry: { sets: SetScore[]; winner: "A" | "B"; durationSeconds: number }) => void;
  onExit: () => void;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({ settings, onFinishMatch, onExit }) => {
  const isBadminton = settings.sport === SportType.BADMINTON;
  const isDoubles = settings.mode === GameMode.DOUBLES;

  // Sound and Voice Settings
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [speechEnabled, setSpeechEnabled] = useState<boolean>(true);

  // Local state for editable player names
  const [playerNames, setPlayerNames] = useState<PlayerNames>(settings.playerNames);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [tempPlayerA1, setTempPlayerA1] = useState<string>(settings.playerNames.teamA[0] || "");
  const [tempPlayerA2, setTempPlayerA2] = useState<string>(settings.playerNames.teamA[1] || "");
  const [tempPlayerB1, setTempPlayerB1] = useState<string>(settings.playerNames.teamB[0] || "");
  const [tempPlayerB2, setTempPlayerB2] = useState<string>(settings.playerNames.teamB[1] || "");
  const [tempTeamAName, setTempTeamAName] = useState<string>(settings.playerNames.teamAName || "TIM A");
  const [tempTeamBName, setTempTeamBName] = useState<string>(settings.playerNames.teamBName || "TIM B");

  const openEditModal = () => {
    setTempPlayerA1(playerNames.teamA[0] || "");
    setTempPlayerA2(playerNames.teamA[1] || "");
    setTempPlayerB1(playerNames.teamB[0] || "");
    setTempPlayerB2(playerNames.teamB[1] || "");
    setTempTeamAName(playerNames.teamAName || "TIM A");
    setTempTeamBName(playerNames.teamBName || "TIM B");
    setIsEditModalOpen(true);
  };

  const saveEditedNames = () => {
    const nextA = isDoubles 
      ? [tempPlayerA1.trim() || "Pemain A1", tempPlayerA2.trim() || "Pemain A2"] 
      : [tempPlayerA1.trim() || "Pemain A"];
    const nextB = isDoubles 
      ? [tempPlayerB1.trim() || "Pemain B1", tempPlayerB2.trim() || "Pemain B2"] 
      : [tempPlayerB1.trim() || "Pemain B"];
    
    setPlayerNames({
      teamA: nextA,
      teamB: nextB,
      teamAName: tempTeamAName.trim() || "TIM A",
      teamBName: tempTeamBName.trim() || "TIM B",
    });
    setIsEditModalOpen(false);
  };

  // Match State
  const [state, setState] = useState<LiveMatchState>({
    currentSetIndex: 0,
    setScores: [],
    currentScoreA: 0,
    currentScoreB: 0,
    servingTeam: "A",
    servingPlayerIndex: 0, // A1
    receivingPlayerIndex: 0, // B1
    isMatchOver: false,
    courtSides: {
      leftTeam: "A",
      rightTeam: "B",
    },
    durationSeconds: 0,
    history: [],
  });

  // Timer Ref & State
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Start Timer
  useEffect(() => {
    if (isTimerRunning && !state.isMatchOver) {
      timerIntervalRef.current = setInterval(() => {
        setState((prev) => ({
          ...prev,
          durationSeconds: prev.durationSeconds + 1,
        }));
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isTimerRunning, state.isMatchOver]);

  // Format Timer Duration MM:SS
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Check Game/Set over and Match over rules
  const checkSetStatus = (scoreA: number, scoreB: number) => {
    const target = settings.targetPoints;
    const deuce = settings.deuceEnabled;
    const maxPoints = settings.deuceMaxPoints;

    let isSetOver = false;
    let setWinner: "A" | "B" | null = null;

    if (scoreA >= target || scoreB >= target) {
      if (deuce) {
        // Must win by 2 points lead
        const diff = Math.abs(scoreA - scoreB);
        if (diff >= 2) {
          isSetOver = true;
          setWinner = scoreA > scoreB ? "A" : "B";
        } else if (scoreA === maxPoints || scoreB === maxPoints) {
          // Reached absolute limit cap (e.g. 30 in badminton)
          isSetOver = true;
          setWinner = scoreA === maxPoints ? "A" : "B";
        }
      } else {
        // Direct sudden-death point (no deuce)
        isSetOver = true;
        setWinner = scoreA > scoreB ? "A" : "B";
      }
    }

    return { isSetOver, setWinner };
  };

  // Helper to push state to Undo stack
  const saveUndoState = (currentState: LiveMatchState): UndoState[] => {
    const snap: UndoState = {
      currentSetIndex: currentState.currentSetIndex,
      currentScoreA: currentState.currentScoreA,
      currentScoreB: currentState.currentScoreB,
      servingTeam: currentState.servingTeam,
      servingPlayerIndex: currentState.servingPlayerIndex,
      receivingPlayerIndex: currentState.receivingPlayerIndex,
      isMatchOver: currentState.isMatchOver,
      setScores: [...currentState.setScores],
    };
    return [...currentState.history, snap];
  };

  // Game / Point Logic
  const addPoint = (team: "A" | "B") => {
    if (state.isMatchOver) return;

    setState((prev) => {
      const nextHistory = saveUndoState(prev);
      let nextScoreA = prev.currentScoreA;
      let nextScoreB = prev.currentScoreB;
      let nextServingTeam = prev.servingTeam;
      let nextServingPlayer = prev.servingPlayerIndex;
      let nextReceivingPlayer = prev.receivingPlayerIndex;

      if (team === "A") {
        nextScoreA += 1;
      } else {
        nextScoreB += 1;
      }

      // --- BADMINTON SERVICE ROTATION LOGIC (BWF STANDARDS) ---
      if (isBadminton) {
        if (team === prev.servingTeam) {
          // Serving team won the point -> serving player rotates positions (singles just updates, doubles shifts courts)
          if (isDoubles) {
            // In doubles, only the serving team swaps positions when they score a point on their own serve.
            nextServingPlayer = prev.servingPlayerIndex === 0 ? 1 : 0;
          }
        } else {
          // Receiving team won the point -> "Pindah Servis" (Service over)
          nextServingTeam = team;
          
          if (isDoubles) {
            // In doubles, when receivers win a point, who serves?
            // The service is taken by whichever player of the receiving side is standing in the right or left court
            // based on the team's score being even/odd.
            const receiverScore = team === "A" ? nextScoreA : nextScoreB;
            // Even score -> Right court player serves. Odd score -> Left court player serves.
            nextServingPlayer = receiverScore % 2 === 0 ? 0 : 1;
          } else {
            nextServingPlayer = 0;
          }
        }

        // Determine receivers based on serve
        const currentServerScore = nextServingTeam === "A" ? nextScoreA : nextScoreB;
        nextReceivingPlayer = currentServerScore % 2 === 0 ? 0 : 1;

      } else {
        // --- TABLE TENNIS SERVICE ROTATION LOGIC (ITTF STANDARDS) ---
        // Serves rotate every 2 points. If deuce (>=10-10), rotates every 1 point.
        const totalPoints = nextScoreA + nextScoreB;
        const isDeuceMode = nextScoreA >= 10 && nextScoreB >= 10;
        const serveInterval = isDeuceMode ? 1 : 2;

        if (totalPoints % serveInterval === 0) {
          nextServingTeam = prev.servingTeam === "A" ? "B" : "A";
          if (isDoubles) {
            // 100% Accurate ITTF standard doubles rotation sequence:
            // 1. A0 -> B0 (Team A Player 0 serves to Team B Player 0)
            // 2. B0 -> A1 (Team B Player 0 serves to Team A Player 1)
            // 3. A1 -> B1 (Team A Player 1 serves to Team B Player 1)
            // 4. B1 -> A0 (Team B Player 1 serves to Team A Player 0)
            if (prev.servingTeam === "A" && prev.servingPlayerIndex === 0) {
              // From (A0 -> B0) to (B0 -> A1)
              nextServingPlayer = 0;
              nextReceivingPlayer = 1;
            } else if (prev.servingTeam === "B" && prev.servingPlayerIndex === 0) {
              // From (B0 -> A1) to (A1 -> B1)
              nextServingPlayer = 1;
              nextReceivingPlayer = 1;
            } else if (prev.servingTeam === "A" && prev.servingPlayerIndex === 1) {
              // From (A1 -> B1) to (B1 -> A0)
              nextServingPlayer = 1;
              nextReceivingPlayer = 0;
            } else {
              // From (B1 -> A0) to (A0 -> B0)
              nextServingPlayer = 0;
              nextReceivingPlayer = 0;
            }
          }
        }
      }

      // Check if current set is over
      const { isSetOver, setWinner } = checkSetStatus(nextScoreA, nextScoreB);

      let nextSetIndex = prev.currentSetIndex;
      let nextSetScores = [...prev.setScores];
      let nextIsMatchOver = prev.isMatchOver;

      if (isSetOver && setWinner) {
        // Add completed set score
        const newSetResult: SetScore = {
          scoreA: nextScoreA,
          scoreB: nextScoreB,
          winner: setWinner,
        };
        nextSetScores.push(newSetResult);

        // Play clapping sound effect when a game completes
        if (audioEnabled) {
          playSound("clapping");
        }

        // Count won sets for each team
        const setsWonA = nextSetScores.filter((s) => s.winner === "A").length;
        const setsWonB = nextSetScores.filter((s) => s.winner === "B").length;

        const targetSetsToWin = Math.ceil(settings.bestOfSets / 2);

        if (setsWonA === targetSetsToWin || setsWonB === targetSetsToWin) {
          // Match over!
          nextIsMatchOver = true;
          if (audioEnabled) playSound("buzzer");
        } else {
          // Set over but match continues -> advance to next set & reset score counters
          nextSetIndex += 1;
          nextScoreA = 0;
          nextScoreB = 0;
          nextServingPlayer = 0;
          nextReceivingPlayer = 0;
          if (audioEnabled) playSound("special");

          // Auto swap court sides on set transition (pindah lapangan)
          prev.courtSides = {
            leftTeam: prev.courtSides.leftTeam === "A" ? "B" : "A",
            rightTeam: prev.courtSides.rightTeam === "A" ? "B" : "A",
          };
        }
      } else {
        // Play simple scoring sound feedback
        if (audioEnabled) {
          const isGamePointA = nextScoreA >= settings.targetPoints - 1 && nextScoreA > nextScoreB;
          const isGamePointB = nextScoreB >= settings.targetPoints - 1 && nextScoreB > nextScoreA;
          if (isGamePointA || isGamePointB) {
            playSound("special");
          } else {
            playSound("point");
          }
        }
      }

      // Indonesian TTS Audio Announcement
      if (speechEnabled) {
        const isGamePointA = nextScoreA >= settings.targetPoints - 1 && nextScoreA > nextScoreB;
        const isGamePointB = nextScoreB >= settings.targetPoints - 1 && nextScoreB > nextScoreA;
        const isServiceChanged = prev.servingTeam !== nextServingTeam;
        const rawScoreA = team === "A" ? prev.currentScoreA + 1 : prev.currentScoreA;
        const rawScoreB = team === "B" ? prev.currentScoreB + 1 : prev.currentScoreB;

        announceScoreIndonesian(
          nextScoreA,
          nextScoreB,
          playerNames.teamA,
          playerNames.teamB,
          settings.sport,
          nextServingTeam,
          settings.targetPoints,
          isGamePointA,
          isGamePointB,
          nextIsMatchOver ? setWinner : null,
          isDoubles,
          nextServingPlayer,
          isServiceChanged,
          isSetOver ? setWinner : null,
          rawScoreA,
          rawScoreB,
          prev.currentSetIndex
        );
      }

      return {
        ...prev,
        currentSetIndex: nextSetIndex,
        setScores: nextSetScores,
        currentScoreA: nextScoreA,
        currentScoreB: nextScoreB,
        servingTeam: nextServingTeam,
        servingPlayerIndex: nextServingPlayer,
        receivingPlayerIndex: nextReceivingPlayer,
        isMatchOver: nextIsMatchOver,
        history: nextHistory,
      };
    });
  };

  // Subtract Point
  const subtractPoint = (team: "A" | "B") => {
    setState((prev) => {
      const currentScore = team === "A" ? prev.currentScoreA : prev.currentScoreB;
      if (currentScore === 0) return prev; // Cannot go below zero

      const nextHistory = saveUndoState(prev);
      return {
        ...prev,
        currentScoreA: team === "A" ? prev.currentScoreA - 1 : prev.currentScoreA,
        currentScoreB: team === "B" ? prev.currentScoreB - 1 : prev.currentScoreB,
        history: nextHistory,
      };
    });
    if (audioEnabled) playSound("point");
  };

  // Undo Functionality
  const triggerUndo = () => {
    setState((prev) => {
      if (prev.history.length === 0) return prev;
      const lastIndex = prev.history.length - 1;
      const snap = prev.history[lastIndex];
      const newHistory = prev.history.slice(0, lastIndex);

      return {
        ...prev,
        currentSetIndex: snap.currentSetIndex,
        currentScoreA: snap.currentScoreA,
        currentScoreB: snap.currentScoreB,
        servingTeam: snap.servingTeam,
        servingPlayerIndex: snap.servingPlayerIndex,
        receivingPlayerIndex: snap.receivingPlayerIndex,
        isMatchOver: snap.isMatchOver,
        setScores: snap.setScores,
        history: newHistory,
      };
    });
    if (audioEnabled) playSound("point");
  };

  // Reset current set score
  const triggerReset = () => {
    if (window.confirm("Apakah Anda yakin ingin menyetel ulang skor game ini kembali ke 0 - 0?")) {
      setState((prev) => {
        const nextHistory = saveUndoState(prev);
        return {
          ...prev,
          currentScoreA: 0,
          currentScoreB: 0,
          history: nextHistory,
        };
      });
      if (audioEnabled) playSound("point");
    }
  };

  // Switch Court Sides manual
  const triggerSideSwitch = () => {
    setState((prev) => ({
      ...prev,
      courtSides: {
        leftTeam: prev.courtSides.leftTeam === "A" ? "B" : "A",
        rightTeam: prev.courtSides.rightTeam === "A" ? "B" : "A",
      },
    }));
    if (audioEnabled) playSound("point");
  };

  // Finish match / Save results
  const triggerFinishMatch = () => {
    let finalWinner: "A" | "B" = "A";
    const setsWonA = state.setScores.filter((s) => s.winner === "A").length;
    const setsWonB = state.setScores.filter((s) => s.winner === "B").length;

    if (setsWonA > setsWonB) {
      finalWinner = "A";
    } else if (setsWonB > setsWonA) {
      finalWinner = "B";
    } else {
      // In case they finish early, whoever has higher points in active set
      finalWinner = state.currentScoreA >= state.currentScoreB ? "A" : "B";
    }

    // Include the current unfinished set if it has scores and match is forced-finished
    let finalSets = [...state.setScores];
    if (!state.isMatchOver && (state.currentScoreA > 0 || state.currentScoreB > 0)) {
      finalSets.push({
        scoreA: state.currentScoreA,
        scoreB: state.currentScoreB,
        winner: state.currentScoreA > state.currentScoreB ? "A" : "B",
      });
    }

    onFinishMatch({
      sets: finalSets,
      winner: finalWinner,
      durationSeconds: state.durationSeconds,
      playerNames,
    });
  };

  // Determine game set header label (e.g. Set 1, Set 2, Set 3 (Penentu))
  const getSetLabel = () => {
    const activeSet = state.currentSetIndex + 1;
    if (settings.bestOfSets === 1) return "Set Utama";
    if (activeSet === settings.bestOfSets) return `Set Penentu (Set ${activeSet})`;
    return `Set ${activeSet}`;
  };

  const nameA = playerNames.teamA.join(" & ");
  const nameB = playerNames.teamB.join(" & ");

  const teamANameLabel = playerNames.teamAName || "TIM A";
  const teamBNameLabel = playerNames.teamBName || "TIM B";

  // Identify who is left and who is right for rendering
  const isLeftTeamA = state.courtSides.leftTeam === "A";
  const leftTeamTitle = isLeftTeamA ? teamANameLabel : teamBNameLabel;
  const rightTeamTitle = isLeftTeamA ? teamBNameLabel : teamANameLabel;
  const leftTeamSub = isLeftTeamA ? nameA : nameB;
  const rightTeamSub = isLeftTeamA ? nameB : nameA;

  const leftScore = isLeftTeamA ? state.currentScoreA : state.currentScoreB;
  const rightScore = isLeftTeamA ? state.currentScoreB : state.currentScoreA;

  const leftTeamKey: "A" | "B" = isLeftTeamA ? "A" : "B";
  const rightTeamKey: "A" | "B" = isLeftTeamA ? "B" : "A";

  const totalSetsWonA = state.setScores.filter((s) => s.winner === "A").length;
  const totalSetsWonB = state.setScores.filter((s) => s.winner === "B").length;

  const leftSetsWon = isLeftTeamA ? totalSetsWonA : totalSetsWonB;
  const rightSetsWon = isLeftTeamA ? totalSetsWonB : totalSetsWonA;

  return (
    <div id="live-scoreboard-play-panel" className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/40 rounded-2xl border border-slate-800 p-4 backdrop-blur-sm shadow-xl">
        {/* Navigation & Info */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (window.confirm("Keluar dari game yang sedang berlangsung? Skor saat ini akan hilang.")) {
                onExit();
              }
            }}
            className="flex items-center gap-1 py-2 px-3 rounded-xl bg-slate-950/60 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 transition-all cursor-pointer font-mono text-xs font-bold"
            title="Keluar ke Menu Utama"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>KEMBALI</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-tight">PERTANDINGAN AKTIF</h2>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-violet-500/10 text-violet-400 border border-violet-500/20 uppercase font-mono">
                {settings.sport === SportType.BADMINTON ? "Bulu Tangkis" : "Tenis Meja"}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              Target: {settings.targetPoints} Poin • {isDoubles ? "Ganda" : "Tunggal"}
            </p>
          </div>
        </div>

        {/* Timer & Play/Pause Controls */}
        <div className="flex items-center gap-3">
          {/* Audio Toggles */}
          <div className="flex bg-slate-950/80 rounded-xl p-1 border border-slate-800">
            <button
              onClick={() => setAudioEnabled(!audioEnabled)}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                audioEnabled ? "text-violet-400 bg-slate-800" : "text-slate-500 hover:text-slate-300"
              }`}
              title={audioEnabled ? "Efek suara aktif" : "Efek suara senyap"}
            >
              {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setSpeechEnabled(!speechEnabled)}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                speechEnabled ? "text-violet-400 bg-slate-800" : "text-slate-500 hover:text-slate-300"
              }`}
              title={speechEnabled ? "Pengumuman suara aktif" : "Pengumuman suara senyap"}
            >
              {speechEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </button>
          </div>

          {/* Time Keeper */}
          <div className="bg-slate-950/80 rounded-xl border border-slate-800/80 px-4 py-1.5 text-center font-mono flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">DURASI:</span>
            <span className="text-sm font-bold text-white tracking-wider">
              {formatTimer(state.durationSeconds)}
            </span>
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="ml-1 p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            </button>
          </div>
        </div>
      </div>

      {/* Set Result History Bar */}
      {state.setScores.length > 0 && (
        <div className="bg-slate-950/40 border border-slate-800 p-3 rounded-2xl flex items-center justify-center gap-3 text-xs">
          <span className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider">Skor Set Sebelumnya:</span>
          <div className="flex gap-2">
            {state.setScores.map((set, idx) => (
              <span
                key={`set-badge-${idx}`}
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 font-mono font-bold text-slate-300"
              >
                Set {idx + 1}: <strong className="text-white">{set.scoreA}-{set.scoreB}</strong>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* MATCH OVER SPLASH COVER */}
      {state.isMatchOver ? (
        <div className="bg-gradient-to-br from-violet-950/30 via-slate-900 to-indigo-950/30 rounded-3xl border-2 border-violet-500/30 p-8 text-center shadow-2xl relative overflow-hidden animate-fadeIn space-y-6">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500"></div>

          <div className="inline-flex p-4 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-2">
            <CheckCircle className="w-10 h-10 animate-bounce" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-white tracking-tight">PERTANDINGAN SELESAI!</h2>
            <p className="text-sm text-slate-300">
              Pemenang: <strong className="text-amber-400 text-base">
                {state.setScores.filter((s) => s.winner === "A").length > state.setScores.filter((s) => s.winner === "B").length
                  ? `${teamANameLabel} (${nameA})`
                  : `${teamBNameLabel} (${nameB})`}
              </strong>
            </p>
          </div>

          <div className="bg-slate-950/80 max-w-sm mx-auto p-4 rounded-2xl border border-slate-800/80 space-y-2.5">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Rincian Hasil Akhir</span>
            <div className="flex items-center justify-between text-xs text-slate-300 border-b border-slate-800/60 pb-2">
              <span className="font-medium">{teamANameLabel} <span className="text-slate-500 text-[10px]">({nameA})</span></span>
              <span className="font-mono font-bold text-amber-400">{totalSetsWonA} Set</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="font-medium">{teamBNameLabel} <span className="text-slate-500 text-[10px]">({nameB})</span></span>
              <span className="font-mono font-bold text-amber-400">{totalSetsWonB} Set</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <button
              onClick={triggerFinishMatch}
              className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm font-mono flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              SIMPAN KE RIWAYAT
            </button>
            <button
              onClick={onExit}
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm font-mono cursor-pointer"
            >
              KEMBALI KE MENU
            </button>
          </div>
        </div>
      ) : (
        /* ACTIVE SCORING SCOREBOARD */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* LEFT TEAM SCORECARD */}
          {/* LEFT TEAM SCORECARD */}
          <div className="relative group">
            {/* Clickable Area to Add Point */}
            <div
              onClick={() => addPoint(leftTeamKey)}
              className="bg-slate-900/60 rounded-3xl border-2 border-slate-800 hover:border-slate-700/80 p-8 text-center flex flex-col justify-between h-[26rem] md:h-[30rem] shadow-lg cursor-pointer hover:bg-slate-900/80 transition-all select-none relative overflow-hidden active:scale-[0.99]"
            >
              {/* Highlight background glow */}
              <div className={`absolute top-0 left-0 right-0 h-1.5 ${leftTeamKey === "A" ? "bg-amber-400" : "bg-cyan-400"}`}></div>

              {/* Server indicator in background */}
              {state.servingTeam === leftTeamKey && (
                <div className="absolute top-3 left-4 flex items-center gap-1.5 px-2.5 py-1 bg-amber-400 text-slate-950 rounded-full text-[10px] font-bold font-mono tracking-wide shadow animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-950"></span>
                  MELAKUKAN SERVIS
                </div>
              )}

              {/* Set counter display */}
              <div className="absolute top-3 right-4 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-black tracking-wider text-slate-200 shadow flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">SET MENANG:</span>
                <span className={`text-xl font-black font-sans ${leftTeamKey === "A" ? "text-amber-400" : "text-cyan-400"}`}>{leftSetsWon}</span>
              </div>

              {/* Team Name */}
              <div className="pt-6 flex flex-col items-center justify-center relative">
                <div className="flex items-center gap-1.5 px-6 max-w-full">
                  <h3 className="text-3xl md:text-4xl font-extrabold text-white truncate leading-tight tracking-tight">{leftTeamTitle}</h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal();
                    }}
                    className="p-1.5 rounded-lg bg-slate-950/40 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800/40 transition-colors cursor-pointer shrink-0"
                    title="Edit Nama"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className={`text-3xl md:text-4xl font-bold uppercase tracking-tight mt-2 truncate max-w-full px-6 ${leftTeamKey === "A" ? "text-amber-400" : "text-cyan-400"}`}>
                  {leftTeamSub}
                </span>
              </div>

              {/* Massive Score Score */}
              <div className="my-1 flex items-center justify-center">
                <motion.span
                  key={leftScore}
                  initial={{ scale: 0.8, y: 15, filter: "blur(4px)" }}
                  animate={{ scale: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ type: "spring", stiffness: 450, damping: 15 }}
                  className="text-[16rem] md:text-[20rem] font-black font-['Arial'] text-white tracking-tighter block select-none leading-none"
                >
                  {leftScore}
                </motion.span>
              </div>

              {/* Hint */}
              <div className="text-[11px] text-slate-500 font-mono tracking-wide uppercase flex items-center justify-center gap-1">
                <Plus className="w-3 h-3 text-slate-500" /> TAP UNTUK MENAMBAH POIN
              </div>
            </div>

            {/* Subtract Score Button underneath */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                subtractPoint(leftTeamKey);
              }}
              disabled={leftScore === 0}
              className={`absolute bottom-3 right-3 p-2 rounded-xl border transition-all flex items-center justify-center gap-1 font-mono text-[10px] font-bold z-10 cursor-pointer ${
                leftScore > 0
                  ? "bg-slate-950 hover:bg-red-500/10 text-red-400 border-slate-800 hover:border-red-500/20"
                  : "bg-slate-950/20 text-slate-700 border-transparent cursor-not-allowed"
              }`}
              title="Kurangi 1 Poin"
            >
              <Minus className="w-3 h-3" />
              POIN -1
            </button>
          </div>

          {/* RIGHT TEAM SCORECARD */}
          <div className="relative group">
            {/* Clickable Area to Add Point */}
            <div
              onClick={() => addPoint(rightTeamKey)}
              className="bg-slate-900/60 rounded-3xl border-2 border-slate-800 hover:border-slate-700/80 p-8 text-center flex flex-col justify-between h-[26rem] md:h-[30rem] shadow-lg cursor-pointer hover:bg-slate-900/80 transition-all select-none relative overflow-hidden active:scale-[0.99]"
            >
              {/* Highlight background glow */}
              <div className={`absolute top-0 left-0 right-0 h-1.5 ${rightTeamKey === "A" ? "bg-amber-400" : "bg-cyan-400"}`}></div>

              {/* Server indicator in background */}
              {state.servingTeam === rightTeamKey && (
                <div className="absolute top-3 left-4 flex items-center gap-1.5 px-2.5 py-1 bg-amber-400 text-slate-950 rounded-full text-[10px] font-bold font-mono tracking-wide shadow animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-950"></span>
                  MELAKUKAN SERVIS
                </div>
              )}

              {/* Set counter display */}
              <div className="absolute top-3 right-4 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-black tracking-wider text-slate-200 shadow flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">SET MENANG:</span>
                <span className={`text-xl font-black font-sans ${rightTeamKey === "A" ? "text-amber-400" : "text-cyan-400"}`}>{rightSetsWon}</span>
              </div>

              {/* Team Name */}
              <div className="pt-6 flex flex-col items-center justify-center relative">
                <div className="flex items-center gap-1.5 px-6 max-w-full">
                  <h3 className="text-3xl md:text-4xl font-extrabold text-white truncate leading-tight tracking-tight">{rightTeamTitle}</h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal();
                    }}
                    className="p-1.5 rounded-lg bg-slate-950/40 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800/40 transition-colors cursor-pointer shrink-0"
                    title="Edit Nama"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className={`text-3xl md:text-4xl font-bold uppercase tracking-tight mt-2 truncate max-w-full px-6 ${rightTeamKey === "A" ? "text-amber-400" : "text-cyan-400"}`}>
                  {rightTeamSub}
                </span>
              </div>

              {/* Massive Score Score */}
              <div className="my-1 flex items-center justify-center">
                <motion.span
                  key={rightScore}
                  initial={{ scale: 0.8, y: 15, filter: "blur(4px)" }}
                  animate={{ scale: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ type: "spring", stiffness: 450, damping: 15 }}
                  className="text-[16rem] md:text-[20rem] font-black font-['Arial'] text-white tracking-tighter block select-none leading-none"
                >
                  {rightScore}
                </motion.span>
              </div>

              {/* Hint */}
              <div className="text-[11px] text-slate-500 font-mono tracking-wide uppercase flex items-center justify-center gap-1">
                <Plus className="w-3 h-3 text-slate-500" /> TAP UNTUK MENAMBAH POIN
              </div>
            </div>

            {/* Subtract Score Button underneath */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                subtractPoint(rightTeamKey);
              }}
              disabled={rightScore === 0}
              className={`absolute bottom-3 right-3 p-2 rounded-xl border transition-all flex items-center justify-center gap-1 font-mono text-[10px] font-bold z-10 cursor-pointer ${
                rightScore > 0
                  ? "bg-slate-950 hover:bg-red-500/10 text-red-400 border-slate-800 hover:border-red-500/20"
                  : "bg-slate-950/20 text-slate-700 border-transparent cursor-not-allowed"
              }`}
              title="Kurangi 1 Poin"
            >
              <Minus className="w-3 h-3" />
              POIN -1
            </button>
          </div>

        </div>
      )}

      {/* MID-CONTROL ACTION BAR */}
      {!state.isMatchOver && (
        <div className="flex flex-wrap items-center justify-center gap-3 bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
          {/* Set Tracker Label */}
          <div className="px-4 py-1.5 rounded-xl bg-slate-900 border border-slate-800/80 font-mono text-xs font-bold text-white mr-auto">
            🏁 {getSetLabel()}
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2.5">
            {/* Edit Names */}
            <button
              onClick={openEditModal}
              className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold font-mono bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 transition-all cursor-pointer"
              title="Edit nama tim dan nama pemain"
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit Nama
            </button>

            {/* Undo */}
            <button
              onClick={triggerUndo}
              disabled={state.history.length === 0}
              className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold font-mono border transition-all cursor-pointer ${
                state.history.length > 0
                  ? "bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-800"
                  : "bg-slate-900/40 text-slate-600 border-transparent cursor-not-allowed"
              }`}
              title="Batalkan poin terakhir"
            >
              <Undo2 className="w-3.5 h-3.5" />
              Batal (Undo)
            </button>

            {/* Switch sides */}
            <button
              onClick={triggerSideSwitch}
              className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold font-mono bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 transition-all cursor-pointer"
              title="Pindah sisi lapangan kiri/kanan di layar"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              Pindah Lapangan
            </button>

            {/* Reset */}
            <button
              onClick={triggerReset}
              className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold font-mono bg-slate-900 hover:bg-red-500/10 text-red-400 border border-slate-800 hover:border-red-500/20 transition-all cursor-pointer"
              title="Setel ulang skor game ini"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Ulang (Reset)
            </button>

            {/* Finish match prematurely */}
            <button
              onClick={() => {
                if (window.confirm("Selesaikan pertandingan sekarang secara paksa dan simpan hasil saat ini?")) {
                  triggerFinishMatch();
                }
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold font-mono bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/10 transition-all cursor-pointer"
              title="Selesaikan game & simpan"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              Selesai & Simpan
            </button>
          </div>
        </div>
      )}

      {/* COURT GRAPHICS VISUALIZER PANEL */}
      <CourtVisualizer
        sport={settings.sport}
        mode={settings.mode}
        playerNames={playerNames}
        scoreA={state.currentScoreA}
        scoreB={state.currentScoreB}
        servingTeam={state.servingTeam}
        servingPlayerIndex={state.servingPlayerIndex}
        receivingPlayerIndex={state.receivingPlayerIndex}
        courtSides={state.courtSides}
      />

      {/* EDIT NAMES OVERLAY MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Pencil className="w-4 h-4 text-violet-400" />
                <h3 className="font-bold text-white text-sm">Edit Nama Pemain / Tim</h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Team A names */}
              <div className="space-y-2.5">
                <h4 className="text-[11px] font-bold text-amber-400 font-mono uppercase tracking-wider">Tim / Pemain A</h4>
                <div className="space-y-2">
                  <div>
                    <label className="text-[10px] text-slate-400 font-mono block mb-1">Nama Tim A</label>
                    <input
                      type="text"
                      value={tempTeamAName}
                      onChange={(e) => setTempTeamAName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                      placeholder="Nama Tim A"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-mono block mb-1">Pemain A1 {isDoubles && "(Servis Awal)"}</label>
                    <input
                      type="text"
                      value={tempPlayerA1}
                      onChange={(e) => setTempPlayerA1(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                      placeholder="Nama Pemain A1"
                    />
                  </div>
                  {isDoubles && (
                    <div>
                      <label className="text-[10px] text-slate-400 font-mono block mb-1">Pemain A2</label>
                      <input
                        type="text"
                        value={tempPlayerA2}
                        onChange={(e) => setTempPlayerA2(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                        placeholder="Nama Pemain A2"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Team B names */}
              <div className="space-y-2.5">
                <h4 className="text-[11px] font-bold text-cyan-400 font-mono uppercase tracking-wider">Tim / Pemain B</h4>
                <div className="space-y-2">
                  <div>
                    <label className="text-[10px] text-slate-400 font-mono block mb-1">Nama Tim B</label>
                    <input
                      type="text"
                      value={tempTeamBName}
                      onChange={(e) => setTempTeamBName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                      placeholder="Nama Tim B"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-mono block mb-1">Pemain B1 {isDoubles && "(Penerima Awal)"}</label>
                    <input
                      type="text"
                      value={tempPlayerB1}
                      onChange={(e) => setTempPlayerB1(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                      placeholder="Nama Pemain B1"
                    />
                  </div>
                  {isDoubles && (
                    <div>
                      <label className="text-[10px] text-slate-400 font-mono block mb-1">Pemain B2</label>
                      <input
                        type="text"
                        value={tempPlayerB2}
                        onChange={(e) => setTempPlayerB2(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                        placeholder="Nama Pemain B2"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="p-4 bg-slate-950/60 border-t border-slate-800 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={saveEditedNames}
                className="px-4 py-2 rounded-xl text-xs font-bold font-mono bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-md shadow-indigo-500/10 cursor-pointer"
              >
                Simpan Nama
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
