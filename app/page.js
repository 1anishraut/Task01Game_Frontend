"use client";

import dynamic from "next/dynamic";
import React, { useState } from "react";
import Image from "next/image";

const Game2 = dynamic(() => import("./RockPaperSeasor/GameClient2.js"), {
  ssr: false,
});

export default function RockPaperScissorsPage() {
  const [startGame, setStartGame] = useState(false);

  if (startGame) {
    return <Game2 />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      
      <div className="mb-6">
        <Image
          src="/logo.png"
          alt="Game Logo"
          width={328}
          height={128}
          className="object-contain drop-shadow-lg"
          priority
        />
      </div>

      
      <h1 className="text-4xl font-bold mb-24 text-yellow-400">
        Rock Paper Scissors
      </h1>

     
      <button
        onClick={() => setStartGame(true)}
        className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg text-lg font-semibold transition-all"
      >
        Start Game
      </button>
    </div>
  );
}
