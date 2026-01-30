"use client";

import { useGame } from "@/lib/game-store";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/react";

export default function Home() {
  const { dispatch } = useGame();
  const router = useRouter();

  function handleNewGame() {
    const id = crypto.randomUUID();
    dispatch({ type: "CREATE_GAME", gameId: id });
    router.push(`/game/${id}`);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <Image src="/logo.webp" alt="Flip7" width={200} height={200} className="mb-8" priority />
      <p className="mb-8 text-center text-gray-500">
        Application de calcul de score
      </p>
      <Button variant="primary" size="lg" onPress={handleNewGame}>
        Nouvelle partie
      </Button>
    </div>
  );
}
