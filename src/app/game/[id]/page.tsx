"use client";

import { useGame, ALL_CARDS, cardLabel, hasFlip7 } from "@/lib/game-store";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import {
  Button,
  Card,
  Input,
  Label,
  Modal,
  TextField,
  useOverlayState,
} from "@heroui/react";

export default function GamePage() {
  const { id } = useParams<{ id: string }>();
  const { state, dispatch } = useGame();
  const router = useRouter();
  const addPlayerModal = useOverlayState();
  const cardModal = useOverlayState();
  const [playerName, setPlayerName] = useState("");
  const [activePlayerId, setActivePlayerId] = useState<string | null>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const firedFlip7 = useRef<Set<string>>(new Set());

  const game = state.games.find((g) => g.id === id);

  useEffect(() => {
    if (!game || game.status !== "playing") return;
    for (const p of game.players) {
      if (hasFlip7(p.cards) && !firedFlip7.current.has(p.id)) {
        firedFlip7.current.add(p.id);
        const el = cardRefs.current[p.id];
        if (el) {
          const rect = el.getBoundingClientRect();
          const x = (rect.left + rect.width / 2) / window.innerWidth;
          const y = (rect.top + rect.height / 2) / window.innerHeight;
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { x, y },
          });
        }
      } else if (!hasFlip7(p.cards)) {
        firedFlip7.current.delete(p.id);
      }
    }
  });

  if (!game) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4 gap-4">
        <p className="text-gray-500">Partie introuvable</p>
        <Button variant="ghost" onPress={() => router.push("/")}>
          Retour
        </Button>
      </div>
    );
  }

  function addPlayer() {
    const name = playerName.trim();
    if (!name) return;
    dispatch({
      type: "ADD_PLAYER",
      gameId: id,
      player: { id: crypto.randomUUID(), name },
    });
    setPlayerName("");
    addPlayerModal.close();
  }

  function removePlayer(playerId: string) {
    dispatch({ type: "REMOVE_PLAYER", gameId: id, playerId });
  }

  function startGame() {
    dispatch({ type: "START_GAME", gameId: id });
  }

  function openCardPicker(playerId: string) {
    setActivePlayerId(playerId);
    cardModal.open();
  }

  function addCard(cardId: string) {
    if (!activePlayerId) return;
    dispatch({
      type: "ADD_CARD",
      gameId: id,
      playerId: activePlayerId,
      cardId,
    });
  }

  function removeCard(playerId: string, cardId: string) {
    dispatch({ type: "REMOVE_CARD", gameId: id, playerId, cardId });
  }

  if (game.status === "setup") {
    return (
      <div className="mx-auto flex h-[100dvh] max-w-md flex-col px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="ghost" size="sm" onPress={() => router.push("/")}>
            ← Retour
          </Button>
          <h1 className="text-xl font-bold">Partie</h1>
          <div className="w-16" />
        </div>

        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            Joueurs ({game.players.length})
          </h2>
          <Button variant="primary" size="sm" onPress={addPlayerModal.open}>
            + Ajouter
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {game.players.length === 0 ? (
            <p className="py-12 text-center text-gray-400">
              Aucun joueur pour le moment, ajoutez des joueurs pour commencer la partie !
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {game.players.map((player) => (
                <Card key={player.id}>
                  <Card.Content className="flex flex-row items-center justify-between py-3 px-4">
                    <span className="font-medium">{player.name}</span>
                    <Button
                      variant="danger"
                      size="sm"
                      onPress={() => removePlayer(player.id)}
                    >
                      Supprimer
                    </Button>
                  </Card.Content>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="shrink-0 pt-4 pb-2">
          <Button
            variant="primary"
            className="w-full"
            isDisabled={game.players.length < 2}
            onPress={startGame}
          >
            Commencer la partie
          </Button>
        </div>

        <Modal state={addPlayerModal}>
          <Modal.Backdrop>
            <Modal.Container>
              <Modal.Dialog>
                <Modal.CloseTrigger />
                <Modal.Header>
                  <Modal.Heading>Ajouter un joueur</Modal.Heading>
                </Modal.Header>
                <Modal.Body>
                  <TextField
                    value={playerName}
                    onChange={setPlayerName}
                    autoFocus
                  >
                    <Label>Nom du joueur</Label>
                    <Input
                      onKeyDown={(e: React.KeyboardEvent) =>
                        e.key === "Enter" && addPlayer()
                      }
                    />
                  </TextField>
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="ghost" onPress={addPlayerModal.close}>
                    Annuler
                  </Button>
                  <Button
                    variant="primary"
                    onPress={addPlayer}
                    isDisabled={!playerName.trim()}
                  >
                    Ajouter
                  </Button>
                </Modal.Footer>
              </Modal.Dialog>
            </Modal.Container>
          </Modal.Backdrop>
        </Modal>
      </div>
    );
  }

  if (game.winner) {
    const sorted = [...game.players].sort((a, b) => b.totalScore - a.totalScore);
    return (
      <div className="mx-auto flex h-[100dvh] max-w-md flex-col items-center justify-center px-4 gap-6">
        <h1 className="text-3xl font-bold">Partie terminee !</h1>
        <p className="text-xl">
          {sorted[0].name} remporte la partie !
        </p>
        <div className="w-full flex-1 overflow-y-auto flex flex-col gap-2">
          {sorted.map((p, i) => (
            <div
              key={p.id}
              className={`flex items-center justify-between rounded-lg px-4 py-3 ${
                i === 0 ? "bg-yellow-100 font-bold" : "bg-gray-50"
              }`}
            >
              <span>{i + 1}. {p.name}</span>
              <span>{p.totalScore} pts</span>
            </div>
          ))}
        </div>
        <div className="shrink-0 w-full pb-2">
          <Button variant="primary" className="w-full" onPress={() => router.push("/")}>
            Retour
          </Button>
        </div>
      </div>
    );
  }

  // Playing phase
  return (
    <div className="mx-auto flex h-[100dvh] max-w-md flex-col px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <Button variant="ghost" size="sm" onPress={() => router.push("/")}>
          ← Retour
        </Button>
        <h1 className="text-xl font-bold">Manche {game.round}</h1>
        <div className="w-16" />
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col gap-4">
        {game.players.map((player) => (
          <div key={player.id} ref={(el) => { cardRefs.current[player.id] = el; }}>
          <Card>
            <Card.Content className="flex flex-col gap-3 py-3 px-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">{player.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">{player.totalScore} pts</span>
                  <span className="text-lg font-bold">+{player.roundScore}</span>
                  <Button
                    variant="primary"
                    size="sm"
                    onPress={() => openCardPicker(player.id)}
                  >
                    + Carte
                  </Button>
                </div>
              </div>

              {player.cards.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {player.cards.map((cardId, idx) => (
                    <button
                      key={`${cardId}-${idx}`}
                      className="relative h-16 w-12 overflow-hidden rounded border border-gray-200 transition-transform hover:scale-105"
                      onClick={() => removeCard(player.id, cardId)}
                      title={`Retirer ${cardLabel(cardId)}`}
                    >
                      <Image
                        src={`/cards/${cardId}.png`}
                        alt={cardLabel(cardId)}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </button>
                  ))}
                </div>
              )}
            </Card.Content>
          </Card>
          </div>
        ))}
      </div>

      <div className="shrink-0 pt-4 pb-2">
        <Button
          variant="primary"
          className="w-full"
          onPress={() => dispatch({ type: "NEW_ROUND", gameId: id })}
        >
          Nouvelle manche
        </Button>
      </div>

      <Modal state={cardModal}>
        <Modal.Backdrop>
          <Modal.Container>
            <Modal.Dialog>
              <Modal.CloseTrigger />
              <Modal.Header>
                <Modal.Heading>Choisir une carte</Modal.Heading>
              </Modal.Header>
              <Modal.Body>
                <div className="grid grid-cols-4 gap-2">
                  {ALL_CARDS.map((cardId) => {
                    const activePlayer = game.players.find(
                      (p) => p.id === activePlayerId
                    );
                    const count = activePlayer
                      ? activePlayer.cards.filter((c) => c === cardId).length
                      : 0;
                    const isNumber = !isNaN(Number(cardId));
                    const disabled = isNumber && count > 0;
                    return (
                      <button
                        key={cardId}
                        className={`relative aspect-[3/4] overflow-hidden rounded border-2 transition-transform hover:scale-105 ${
                          count > 0
                            ? "border-blue-500 ring-2 ring-blue-300"
                            : "border-gray-200"
                        }`}
                        onClick={() => !disabled && addCard(cardId)}
                      >
                        <Image
                          src={`/cards/${cardId}.png`}
                          alt={cardLabel(cardId)}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                        {count > 0 && (
                          <>
                            <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-bl bg-blue-500 text-xs font-bold text-white">
                              {count}
                            </span>
                            <span
                              className="absolute top-0 left-0 flex h-5 w-5 items-center justify-center rounded-br bg-red-500 text-xs font-bold text-white cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeCard(activePlayerId!, cardId);
                              }}
                            >
                              −
                            </span>
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="primary" onPress={cardModal.close}>
                  Valider
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </div>
  );
}
