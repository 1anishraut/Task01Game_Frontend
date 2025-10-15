"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:4000");

export default function GameClient2() {
  const [playerName, setPlayerName] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [opponentName, setOpponentName] = useState("");
  const [myChoice, setMyChoice] = useState(null);
  const [opponentChoice, setOpponentChoice] = useState(null);
  const [status, setStatus] = useState("Enter your name to start");
  const [result, setResult] = useState(null);

  useEffect(() => {
    socket.on("OpponentFound", (data) => {
      setOpponentName(data.opponentName);
      setIsPlaying(true);
      setStatus(`Opponent found: ${data.opponentName}`);
      setMyChoice(null);
      setOpponentChoice(null);
      setResult(null);
    });

    socket.on("OpponentNotFound", () => {
      setStatus("Waiting for opponent...");
    });

    socket.on("opponentChoiceFromServer", (data) => {
      setOpponentChoice(data.choice);
      if (myChoice) calculateResult(myChoice, data.choice);
    });

    socket.on("opponentLeftMatch", () => {
      setStatus("Your opponent left the match 😢");
      setIsPlaying(false);
    });

    return () => {
      socket.off("OpponentFound");
      socket.off("OpponentNotFound");
      socket.off("opponentChoiceFromServer");
      socket.off("opponentLeftMatch");
    };
  }, [myChoice]);

  const handleJoin = () => {
    if (!playerName) return;
    socket.emit("request_to_play", { playerName });
    setStatus("Searching for opponent...");
  };

  const handleChoice = (choice) => {
    if (!isPlaying || myChoice) return;
    setMyChoice(choice);
    socket.emit("playerChoiceFromClient", { choice });
    setStatus("Waiting for opponent's choice...");
    if (opponentChoice) calculateResult(choice, opponentChoice);
  };

  const calculateResult = (mine, opponent) => {
    if (mine === opponent) setResult("Draw 🤝");
    else if (
      (mine === "rock" && opponent === "scissors") ||
      (mine === "paper" && opponent === "rock") ||
      (mine === "scissors" && opponent === "paper")
    )
      setResult("You win! 🏆");
    else setResult("You lose 😢");
    setStatus("Game over");
  };

  const resetGame = () => {
    setMyChoice(null);
    setOpponentChoice(null);
    setResult(null);
    setStatus(`Playing against ${opponentName}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="mb-4">
        <Image
          src="/logo.png"
          alt="Game Logo"
          width={300}
          height={200}
          className="rounded-full shadow-lg"
          priority
        />
      </div>
      <h1 className="text-4xl font-bold mb-6 text-yellow-400">
        Rock Paper Scissors
      </h1>

      {!isPlaying ? (
        <div className="flex flex-col items-center space-y-3">
          <input
            type="text"
            placeholder="Enter your name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="px-4 py-2 rounded-md text-white outline-none border border-white"
          />
          <button
            onClick={handleJoin}
            className="bg-blue-600 px-5 py-2 rounded-lg hover:bg-blue-700"
          >
            Start Game
          </button>
          <p className="text-gray-400 mt-3">{status}</p>
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-4">
          <p className="text-gray-300 text-6xl border p-2 rounded-md font-black uppercase">
            <span className="text-red-600 ">You </span>
            <span className="lowercase">vs </span>
            <span className="text-blue-600">{opponentName}</span>
          
          </p>
          <p className="text-green-400">{status}</p>

          <div className="flex space-x-6">
            {[
              { name: "rock", img: "/rock.png" },
              { name: "paper", img: "/paper.png" },
              { name: "scissors", img: "/scissor.png" },
            ].map((item) => (
              <button
                key={item.name}
                onClick={() => handleChoice(item.name)}
                className="flex flex-col items-center bg-gray-800 px-4 py-3 rounded-lg hover:bg-gray-700 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-black shadow-lg"
              >
                <img
                  src={item.img}
                  alt={item.name}
                  className="w-20 h-20 object-contain mb-2"
                />
                <span className="capitalize">{item.name}</span>
              </button>
            ))}
          </div>

          {myChoice && <p>Your choice: {myChoice}</p>}
          {opponentChoice && <p>Opponent choice: {opponentChoice}</p>}

          {result && (
            <div>
              <p className="text-yellow-400 text-2xl mt-2">{result}</p>
              <button
                onClick={resetGame}
                className="mt-4 bg-yellow-500 px-5 py-2 rounded-lg hover:bg-yellow-600"
              >
                Play Again
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
