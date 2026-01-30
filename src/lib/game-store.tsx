"use client";

import { createContext, useContext, useReducer, type ReactNode } from "react";

export interface Player {
  id: string;
  name: string;
  cards: string[];
  roundScore: number;
  totalScore: number;
}

export interface Game {
  id: string;
  status: "setup" | "playing";
  players: Player[];
  round: number;
  winner: string | null;
}

interface GameState {
  games: Game[];
}

export const ALL_CARDS = [
  "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12",
  "plus_2", "plus_4", "plus_6", "plus_8", "plus_10",
  "x2",
  "freeze", "flip_three", "second_chance",
] as const;

export function cardLabel(cardId: string): string {
  if (cardId === "x2") return "x2";
  if (cardId === "freeze") return "Freeze";
  if (cardId === "flip_three") return "Flip 3";
  if (cardId === "second_chance") return "2nd Chance";
  if (cardId.startsWith("plus_")) return `+${cardId.slice(5)}`;
  return cardId;
}

export function hasFlip7(cardIds: string[]): boolean {
  let count = 0;
  for (const id of cardIds) {
    if (!isNaN(Number(id))) count++;
  }
  return count >= 7;
}

export function computeScore(cardIds: string[]): number {
  let numberSum = 0;
  let numberCount = 0;
  let bonusSum = 0;
  let hasX2 = false;

  for (const id of cardIds) {
    const num = Number(id);
    if (!isNaN(num)) {
      numberSum += num;
      numberCount++;
    } else if (id.startsWith("plus_")) {
      bonusSum += Number(id.slice(5));
    } else if (id === "x2") {
      hasX2 = true;
    }
  }

  const flip7Bonus = numberCount >= 7 ? 15 : 0;
  const total = numberSum + bonusSum + flip7Bonus;
  return hasX2 ? total * 2 : total;
}

type GameAction =
  | { type: "CREATE_GAME"; gameId: string }
  | { type: "ADD_PLAYER"; gameId: string; player: Pick<Player, "id" | "name"> }
  | { type: "REMOVE_PLAYER"; gameId: string; playerId: string }
  | { type: "START_GAME"; gameId: string }
  | { type: "ADD_CARD"; gameId: string; playerId: string; cardId: string }
  | { type: "REMOVE_CARD"; gameId: string; playerId: string; cardId: string }
  | { type: "NEW_ROUND"; gameId: string };

function updatePlayer(
  game: Game,
  playerId: string,
  fn: (p: Player) => Player
): Game {
  return {
    ...game,
    players: game.players.map((p) => (p.id === playerId ? fn(p) : p)),
  };
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "CREATE_GAME":
      return {
        ...state,
        games: [
          ...state.games,
          { id: action.gameId, status: "setup", players: [], round: 1, winner: null },
        ],
      };
    case "ADD_PLAYER":
      return {
        ...state,
        games: state.games.map((g) =>
          g.id === action.gameId
            ? {
                ...g,
                players: [
                  ...g.players,
                  { ...action.player, cards: [], roundScore: 0, totalScore: 0 },
                ],
              }
            : g
        ),
      };
    case "REMOVE_PLAYER":
      return {
        ...state,
        games: state.games.map((g) =>
          g.id === action.gameId
            ? { ...g, players: g.players.filter((p) => p.id !== action.playerId) }
            : g
        ),
      };
    case "START_GAME":
      return {
        ...state,
        games: state.games.map((g) =>
          g.id === action.gameId ? { ...g, status: "playing" } : g
        ),
      };
    case "ADD_CARD":
      return {
        ...state,
        games: state.games.map((g) =>
          g.id === action.gameId
            ? updatePlayer(g, action.playerId, (p) => {
                const cards = [...p.cards, action.cardId];
                return { ...p, cards, roundScore: computeScore(cards) };
              })
            : g
        ),
      };
    case "REMOVE_CARD":
      return {
        ...state,
        games: state.games.map((g) =>
          g.id === action.gameId
            ? updatePlayer(g, action.playerId, (p) => {
                const idx = p.cards.indexOf(action.cardId);
                if (idx === -1) return p;
                const cards = [...p.cards];
                cards.splice(idx, 1);
                return { ...p, cards, roundScore: computeScore(cards) };
              })
            : g
        ),
      };
    case "NEW_ROUND":
      return {
        ...state,
        games: state.games.map((g) => {
          if (g.id !== action.gameId) return g;
          const updatedPlayers = g.players.map((p) => ({
            ...p,
            totalScore: p.totalScore + p.roundScore,
            cards: [] as string[],
            roundScore: 0,
          }));
          const maxTotal = Math.max(...updatedPlayers.map((p) => p.totalScore));
          const winner =
            maxTotal >= 200
              ? updatedPlayers.find((p) => p.totalScore === maxTotal)!.id
              : null;
          return {
            ...g,
            players: updatedPlayers,
            round: g.round + 1,
            winner,
          };
        }),
      };
    default:
      return state;
  }
}

const GameContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
} | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, { games: [] });
  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}
