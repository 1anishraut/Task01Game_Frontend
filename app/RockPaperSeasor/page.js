"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import { useRouter } from "next/navigation"; // For navigation

const socket = io("https://task01game-backend.onrender.com/");

export default function GameClient2() {
  const router = useRouter();
  const [playerName, setPlayerName] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [opponentName, setOpponentName] = useState("");
  const [myChoice, setMyChoice] = useState(null);
  const [opponentChoice, setOpponentChoice] = useState(null);
  const [status, setStatus] = useState("");
  const [result, setResult] = useState(null);
  const [score, setScore] = useState(() => {
    // Load score from localStorage if exists
    if (typeof window !== "undefined") {
      return (
        JSON.parse(localStorage.getItem("score")) || {
          wins: 0,
          losses: 0,
          draws: 0,
        }
      );
    }
    return { wins: 0, losses: 0, draws: 0 };
  });

  // Save score to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("score", JSON.stringify(score));
    }
  }, [score]);

  // Clear score on refresh / game end
 useEffect(() => {
   if (typeof window !== "undefined") {
     localStorage.removeItem("score");
     setScore({ wins: 0, losses: 0, draws: 0 });
   }
 }, []);

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
    if (mine === opponent) {
      setResult("Draw 🤝");
      setScore((prev) => ({ ...prev, draws: prev.draws + 1 }));
    } else if (
      (mine === "rock" && opponent === "scissors") ||
      (mine === "paper" && opponent === "rock") ||
      (mine === "scissors" && opponent === "paper")
    ) {
      setResult("You win! 🏆");
      setScore((prev) => ({ ...prev, wins: prev.wins + 1 }));
    } else {
      setResult("You lose 😢");
      setScore((prev) => ({ ...prev, losses: prev.losses + 1 }));
    }
  };

  const resetGame = () => {
    setMyChoice(null);
    setOpponentChoice(null);
    setResult(null);
    setStatus(`Playing against ${opponentName}`);
  };

  const endGame = () => {
    socket.emit("leave_match");
    socket.disconnect();
    setIsPlaying(false);
    setPlayerName("");
    setOpponentName("");
    setResult(null);
    setStatus("Game ended");
    setScore({ wins: 0, losses: 0, draws: 0 }); 
    if (typeof window !== "undefined") localStorage.removeItem("score");
    router.push("/Home");
  };

  return (
    <div
      style={{
        backgroundImage:
          "url('https://plus.unsplash.com/premium_photo-1677870728119-52aef052d7ef?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Z2FtaW5nJTIwd2FsbHBhcGVyc3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=500')",
      }}
      className="flex flex-col items-center justify-center min-h-screen  text-white bg-center bg-cover relative"
    >
      <p className="mt-2 text-xl font-semibold absolute top-0 z-10 border p-2 rounded-full backdrop-blur-sm bg-white/10">
        <span className="text-green-500">Wins: {score.wins}</span> |
        <span className="text-red-500"> Losses: {score.losses}</span> |
        <span className="text-yellow-500"> Draws: {score.draws}</span>
      </p>

      <div className="flex flex-col items-center justify-center  backdrop-blur-sm bg-white/10 p-10 shadow-2xl shadow-white/6 border border-white/30 rounded-sm">
        <div className="mb-4">
          <Image
            src="/logo.png"
            alt="Game Logo"
            width={200}
            height={200}
            className="rounded-full shadow-lg"
            priority
          />
        </div>
        <h1 className="text-2xl font-bold mb-6 text-red-600">
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
              className="bg-yellow-600 px-5 py-2 rounded-lg hover:bg-yellow-700 cursor-pointer"
            >
              Start Game
            </button>
            <p className="text-gray-400 mt-3">{status}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-4">
            <p className="text-gray-300 text-3xl md:text-6xl border p-2 rounded-md font-black uppercase">
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
                  className="flex flex-col items-center bg-gray-800 px-4 py-3 rounded-lg hover:bg-gray-700 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-black shadow-lg w-20 h-20"
                >
                  <img
                    src={item.img}
                    alt={item.name}
                    className="w-10 h-10 object-contain mb-2"
                  />
                  <span className="capitalize">{item.name}</span>
                </button>
              ))}
            </div>

            {myChoice && <p>Your choice: {myChoice}</p>}
            {opponentChoice && <p>Opponent choice: {opponentChoice}</p>}

            {result && (
              <div className="flex flex-col items-center mt-2 space-y-4">
                <p className="text-yellow-400 text-2xl">{result}</p>
                <div className="flex space-x-4">
                  <button
                    onClick={resetGame}
                    className="bg-yellow-500 px-5 py-2 rounded-lg hover:bg-yellow-600"
                  >
                    Play Again
                  </button>
                  <button
                    onClick={endGame}
                    className="bg-red-600 px-5 py-2 rounded-lg hover:bg-red-700"
                  >
                    End Game
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
