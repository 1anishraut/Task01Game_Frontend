"use client";
import React, { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:4000");

export default function GameClient() {
  const [playerName, setPlayerName] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [opponentName, setOpponentName] = useState("");
  const [playingAs, setPlayingAs] = useState(null);
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [winner, setWinner] = useState(null);
  const [status, setStatus] = useState("Enter your name to start");

  // ✅ Handle server events
  useEffect(() => {
    socket.on("OpponentFound", (data) => {
      setOpponentName(data.opponentName);
      setPlayingAs(data.playingAs);
      setIsPlaying(true);
      setBoard(Array(9).fill(null));
      setWinner(null);
      setStatus(`Opponent found: ${data.opponentName}`);
      setIsMyTurn(data.playingAs === "cross"); 
    });

    socket.on("OpponentNotFound", () => {
      setStatus("Waiting for opponent...");
    });

    socket.on("playerMoveFromServer", (data) => {
      setBoard(data.board);
      setIsMyTurn(true);
      checkWinner(data.board);
    });

    socket.on("opponentLeftMatch", () => {
      setStatus("Your opponent left the match 😢");
      setIsPlaying(false);
    });

    return () => {
      socket.off("OpponentFound");
      socket.off("OpponentNotFound");
      socket.off("playerMoveFromServer");
      socket.off("opponentLeftMatch");
    };
  }, []);

  // ✅ Join match
  const handleJoin = () => {
    if (!playerName) return;
    socket.emit("request_to_play", { playerName });
    setStatus("Searching for opponent...");
  };

  // ✅ Handle player move
  const handleClick = (index) => {
    if (!isMyTurn || winner || board[index]) return;
    const newBoard = [...board];
    newBoard[index] = playingAs === "cross" ? "X" : "O";
    setBoard(newBoard);
    setIsMyTurn(false);
    checkWinner(newBoard);
    socket.emit("playerMoveFromClient", { board: newBoard });
  };

  // ✅ Check for winner
  const checkWinner = (board) => {
    const winPatterns = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (let pattern of winPatterns) {
      const [a, b, c] = pattern;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        setWinner(board[a]);
        setStatus(`${board[a]} wins! 🏆`);
        return;
      }
    }

    if (board.every((cell) => cell)) {
      setWinner("Draw");
      setStatus("It's a draw 🤝");
    }
  };

  // ✅ Restart Game
  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setWinner(null);
    setStatus(`Playing against ${opponentName}`);
    setIsMyTurn(playingAs === "cross");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-6 text-yellow-400">
        Tic Tac Toe ⚔️
      </h1>

      {!isPlaying ? (
        <div className="flex flex-col items-center space-y-3">
          <input
            type="text"
            placeholder="Enter your name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="px-4 py-2 rounded-md text-black outline-none"
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
        <div className="flex flex-col items-center">
          <p className="mb-2 text-gray-300">
            You ({playingAs === "cross" ? "X" : "O"}) vs {opponentName}
          </p>
          <p className="mb-4 text-green-400">{status}</p>

          <div className="grid grid-cols-3 gap-2">
            {board.map((cell, index) => (
              <button
                key={index}
                onClick={() => handleClick(index)}
                className="w-20 h-20 bg-gray-700 text-3xl font-bold flex items-center justify-center rounded-lg hover:bg-gray-600"
              >
                {cell === "X" ? (
                  <span className="text-red-500">X</span>
                ) : cell === "O" ? (
                  <span className="text-blue-400">O</span>
                ) : (
                  ""
                )}
              </button>
            ))}
          </div>

          {winner && (
            <button
              onClick={resetGame}
              className="mt-6 bg-yellow-500 px-5 py-2 rounded-lg hover:bg-yellow-600"
            >
              Play Again
            </button>
          )}
        </div>
      )}
    </div>
  );
}
