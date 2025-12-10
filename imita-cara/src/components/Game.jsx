
import React, { useState } from "react";
import Detector from "./Detector";

const expresiones = ["happy", "sad", "surprised"];

function Game() {
  const [target, setTarget] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);

  const startRound = () => {
    const random = expresiones[Math.floor(Math.random() * expresiones.length)];
    setTarget(random);
    setGameStarted(true);
  };

  return (
    <div>
      {!gameStarted && <button onClick={startRound}>Iniciar Ronda</button>}
      {gameStarted && (
        <div>
          <h2>Imita esta cara: {target}</h2>
          <Detector targetExpression={target} />
        </div>
      )}
    </div>
  );
}

export default Game;
