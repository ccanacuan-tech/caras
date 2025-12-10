
import React, { useState, useEffect } from "react";
import Detector from "./Detector";

const expresiones = {
  happy: "😀",
  sad: "😢",
  surprised: "😲",
};

const MAX_HIGH_SCORES = 5;

function Game() {
  const [target, setTarget] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [score, setScore] = useState(0);
  const [highScores, setHighScores] = useState([]);

  useEffect(() => {
    const storedHighScores = JSON.parse(localStorage.getItem('highScores')) || [];
    setHighScores(storedHighScores);
  }, []);

  const startRound = () => {
    const random = Object.keys(expresiones)[Math.floor(Math.random() * Object.keys(expresiones).length)];
    setTarget(random);
    setScore(0);
    setGameStarted(true);
    setTimeLeft(5);
  };

  useEffect(() => {
    if (timeLeft === 0) {
      setGameStarted(false);
      setTimeLeft(null);

      const newHighScores = [...highScores, score].sort((a, b) => b - a).slice(0, MAX_HIGH_SCORES);
      setHighScores(newHighScores);
      localStorage.setItem('highScores', JSON.stringify(newHighScores));
    }

    if (!timeLeft) return;

    const intervalId = setInterval(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeLeft, highScores, score]);

  return (
    <div>
      {!gameStarted && <button onClick={startRound}>Iniciar Ronda</button>}
      {gameStarted && (
        <div>
          <h2>Imita esta cara: <span style={{ fontSize: '5rem' }}>{expresiones[target]}</span></h2>
          <h3>Tiempo restante: {timeLeft}s ⏱️</h3>
          <Detector targetExpression={target} setScore={setScore} score={score} />
        </div>
      )}

      <div className="ranking">
        <h2>🏆 Ranking 🏆</h2>
        <ol>
          {highScores.map((s, i) => (
            <li key={i}>{s}%</li>
          ))}
        </ol>
      </div>
    </div>
  );
}

export default Game;
