// Sound and voice synthesis utility for Indonesian Scoreboard

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
}

// Play a synthesized beep or sound using Web Audio API
export function playSound(type: "point" | "special" | "buzzer" | "whistle" | "clapping") {
  try {
    const ctx = getAudioContext();
    if (ctx.state === "suspended") {
      ctx.resume();
    }

    const now = ctx.currentTime;

    if (type === "clapping") {
      // Synthesize rich, realistic applause/clapping purely using Web Audio API
      const duration = 3.0; // 3 seconds of clapping
      const numClaps = 60;  // 60 scattered claps to sound like a crowd
      
      // Create a single noise buffer for efficiency
      const bufferSize = ctx.sampleRate * 0.15; // 150ms of noise per clap
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      
      for (let i = 0; i < numClaps; i++) {
        // Random time offset within the duration, slightly denser in the first half
        const rand = Math.random();
        const clapTime = now + (rand * rand) * duration;
        
        // Component 1: High-frequency crisp hand slap (filtered noise)
        const noise = ctx.createBufferSource();
        noise.buffer = noiseBuffer;
        
        const filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        // Vary bandpass center frequency for natural sounding hand size and speed dispersion
        filter.frequency.setValueAtTime(900 + Math.random() * 800, clapTime);
        filter.Q.setValueAtTime(3.0, clapTime);
        
        const noiseGain = ctx.createGain();
        // Volume slightly decreases over time
        const volumeMultiplier = Math.max(0.15, 1.0 - (clapTime - now) / duration);
        const noiseVol = (0.15 + Math.random() * 0.2) * volumeMultiplier;
        
        noiseGain.gain.setValueAtTime(noiseVol, clapTime);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, clapTime + 0.04 + Math.random() * 0.06);
        
        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        
        noise.start(clapTime);
        noise.stop(clapTime + 0.15);

        // Component 2: Low-frequency warm thump (the hand cavity resonance)
        if (Math.random() > 0.25) {
          const osc = ctx.createOscillator();
          const thumpGain = ctx.createGain();
          
          osc.type = "triangle";
          osc.frequency.setValueAtTime(140 + Math.random() * 90, clapTime);
          osc.frequency.exponentialRampToValueAtTime(70, clapTime + 0.03);
          
          const thumpVol = (0.08 + Math.random() * 0.12) * volumeMultiplier;
          thumpGain.gain.setValueAtTime(thumpVol, clapTime);
          thumpGain.gain.exponentialRampToValueAtTime(0.001, clapTime + 0.035);
          
          osc.connect(thumpGain);
          thumpGain.connect(ctx.destination);
          
          osc.start(clapTime);
          osc.stop(clapTime + 0.04);
        }
      }
      return;
    }

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    if (type === "point") {
      // Short high beep for point
      osc.type = "sine";
      osc.frequency.setValueAtTime(600, now);
      gainNode.gain.setValueAtTime(0.15, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (type === "special") {
      // Double beep for set/game point
      osc.type = "triangle";
      osc.frequency.setValueAtTime(880, now);
      gainNode.gain.setValueAtTime(0.2, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      
      const osc2 = ctx.createOscillator();
      const gainNode2 = ctx.createGain();
      osc2.connect(gainNode2);
      gainNode2.connect(ctx.destination);
      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(880, now + 0.15);
      gainNode2.gain.setValueAtTime(0.2, now + 0.15);
      gainNode2.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

      osc.start(now);
      osc.stop(now + 0.12);
      osc2.start(now + 0.15);
      osc2.stop(now + 0.3);
    } else if (type === "buzzer") {
      // Long lower buzzer sound
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.linearRampToValueAtTime(100, now + 0.6);
      gainNode.gain.setValueAtTime(0.2, now);
      gainNode.gain.linearRampToValueAtTime(0.01, now + 0.6);
      osc.start(now);
      osc.stop(now + 0.6);
    } else if (type === "whistle") {
      // Sport whistle effect: high pitch oscillating
      osc.type = "sine";
      osc.frequency.setValueAtTime(2500, now);
      osc.frequency.linearRampToValueAtTime(2600, now + 0.1);
      osc.frequency.linearRampToValueAtTime(2400, now + 0.2);
      osc.frequency.linearRampToValueAtTime(2550, now + 0.4);

      gainNode.gain.setValueAtTime(0.12, now);
      gainNode.gain.linearRampToValueAtTime(0.12, now + 0.3);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.start(now);
      osc.stop(now + 0.45);
    }
  } catch (e) {
    console.error("Audio Context error:", e);
  }
}

// Translate scores into natural Indonesian speech
export function announceScoreIndonesian(
  scoreA: number,
  scoreB: number,
  playerANames: string[],
  playerBNames: string[],
  sport: string,
  servingTeam: "A" | "B",
  targetPoints: number,
  isGamePointA: boolean,
  isGamePointB: boolean,
  winner?: "A" | "B" | null,
  isDoubles?: boolean,
  servingPlayerIndex?: number,
  isServiceChanged?: boolean,
  completedSetWinner?: "A" | "B" | null,
  completedSetScoreA?: number,
  completedSetScoreB?: number,
  completedSetIndex?: number
) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;

  // Stop any ongoing speech first
  window.speechSynthesis.cancel();

  const nameA = playerANames.join(" & ") || "Pemain A";
  const nameB = playerBNames.join(" & ") || "Pemain B";

  let sentence = "";

  // Helper to get active server's name
  let serverName = "";
  if (isDoubles) {
    const idx = servingPlayerIndex ?? 0;
    if (servingTeam === "A") {
      serverName = playerANames[idx] || playerANames[0] || "Pemain A";
    } else {
      serverName = playerBNames[idx] || playerBNames[0] || "Pemain B";
    }
  } else {
    serverName = servingTeam === "A" ? nameA : nameB;
  }

  const servicePrefix = isServiceChanged ? "Pindah servis. " : "";

  // 1. If a set (game) has just finished
  if (completedSetWinner) {
    const setWinnerName = completedSetWinner === "A" ? nameA : nameB;
    const gameLabel = completedSetIndex !== undefined ? `Game ke ${completedSetIndex + 1}` : "Game";
    sentence = `${gameLabel} selesai. Pemenangnya adalah ${setWinnerName}. Skor akhir ${completedSetScoreA} lawan ${completedSetScoreB}.`;
    
    // If the entire match is also over
    if (winner) {
      const matchWinnerName = winner === "A" ? nameA : nameB;
      sentence += ` Pertandingan selesai! Pemenang pertandingan adalah ${matchWinnerName}.`;
    }
  } else if (winner) {
    // Fallback if match is over but completedSetWinner wasn't passed
    const matchWinnerName = winner === "A" ? nameA : nameB;
    sentence = `Pertandingan selesai! Pemenangnya adalah ${matchWinnerName}. Skor akhir ${scoreA} lawan ${scoreB}.`;
  } else if (isGamePointA) {
    sentence = `${servicePrefix}Game point untuk ${nameA}. Skor ${scoreA}, ${scoreB}. Servis oleh ${serverName}.`;
  } else if (isGamePointB) {
    sentence = `${servicePrefix}Game point untuk ${nameB}. Skor ${scoreB}, ${scoreA}. Servis oleh ${serverName}.`;
  } else if (scoreA === scoreB) {
    if (scoreA === 0) {
      sentence = `Mulai pertandingan. Servis oleh ${serverName}.`;
    } else if (scoreA === targetPoints - 1) {
      sentence = `Deuce! Jus! Skor ${scoreA} sama. Servis oleh ${serverName}.`;
    } else {
      sentence = `${servicePrefix}Skor ${scoreA} sama. Servis oleh ${serverName}.`;
    }
  } else {
    if (servingTeam === "A") {
      sentence = `${servicePrefix}Skor ${scoreA}, ${scoreB}. Servis oleh ${serverName}.`;
    } else {
      sentence = `${servicePrefix}Skor ${scoreB}, ${scoreA}. Servis oleh ${serverName}.`;
    }
  }

  try {
    const utterance = new SpeechSynthesisUtterance(sentence);
    utterance.lang = "id-ID";
    
    // Find an Indonesian voice if available
    const voices = window.speechSynthesis.getVoices();
    const idVoice = voices.find((voice) => voice.lang.startsWith("id"));
    if (idVoice) {
      utterance.voice = idVoice;
    }
    
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.error("Speech synthesis error:", e);
  }
}
