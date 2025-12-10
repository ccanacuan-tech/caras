
import React, { useState, useEffect } from "react";
import Detector from "./Detector";

const expresiones = {
  happy: "😀",
  sad: "😢",
  surprised: "😲",
};

function Game() {
  const [target, setTarget] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);

  const startRound = () => {
    const random = Object.keys(expresiones)[Math.floor(Math.random() * Object.keys(expresiones).length)];
    setTarget(random);
    setGameStarted(true);
    setTimeLeft(5);
  };

  useEffect(() => {
    if (timeLeft === 0) {
      setGameStarted(false);
      setTimeLeft(null);
    }

    if (!timeLeft) return;

    const intervalId = setInterval(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeLeft]);


  return (
    <div>
      {!gameStarted && <button onClick={startRound}>Iniciar Ronda</button>}
      {gameStarted && (
        <div>
          <h2>Imita esta cara: <span style={{ fontSize: '5rem' }}>{expresiones[target]}</span></h2>
          <h3>Tiempo restante: {timeLeft}s ⏱️</h3>
          <Detector targetExpression={target} />
        </div>
      )}
    </div>
  );
}

export default Game;
