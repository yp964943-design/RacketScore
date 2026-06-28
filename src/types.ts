export enum SportType {
  BADMINTON = "badminton",
  TABLE_TENNIS = "table_tennis",
}

export enum GameMode {
  SINGLES = "singles", // Tunggal
  DOUBLES = "doubles", // Ganda
}

export interface PlayerNames {
  teamA: string[]; // [Player 1, Player 2 (if doubles)]
  teamB: string[]; // [Player 1, Player 2 (if doubles)]
  teamAName?: string; // Custom team name for Team A
  teamBName?: string; // Custom team name for Team B
}

export interface MatchSettings {
  sport: SportType;
  mode: GameMode;
  targetPoints: number; // 21 for Badminton, 11 for Table Tennis
  bestOfSets: number; // 1, 3, 5 sets
  deuceEnabled: boolean;
  deuceMaxPoints: number; // 30 for Badminton, no limit (or e.g. 99) for Table Tennis
  customNames: boolean;
  playerNames: PlayerNames;
}

export interface SetScore {
  scoreA: number;
  scoreB: number;
  winner: "A" | "B";
}

export interface MatchHistoryEntry {
  id: string;
  date: string;
  sport: SportType;
  mode: GameMode;
  playerNames: PlayerNames;
  sets: SetScore[];
  winner: "A" | "B";
  durationSeconds: number;
  notes?: string;
}

export interface LiveMatchState {
  currentSetIndex: number; // 0-indexed
  setScores: SetScore[]; // scores of completed sets
  currentScoreA: number;
  currentScoreB: number;
  servingTeam: "A" | "B";
  servingPlayerIndex: number; // 0 or 1 (for doubles)
  receivingPlayerIndex: number; // 0 or 1 (for doubles)
  isMatchOver: boolean;
  courtSides: {
    leftTeam: "A" | "B";
    rightTeam: "A" | "B";
  };
  durationSeconds: number;
  history: UndoState[]; // for undo functionality
}

export interface UndoState {
  currentSetIndex: number;
  currentScoreA: number;
  currentScoreB: number;
  servingTeam: "A" | "B";
  servingPlayerIndex: number;
  receivingPlayerIndex: number;
  isMatchOver: boolean;
  setScores: SetScore[];
}
