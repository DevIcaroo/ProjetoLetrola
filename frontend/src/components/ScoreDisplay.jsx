import React from 'react';
import PropTypes from 'prop-types';
import "../styles/ScoreDisplay.css"

// Constantes de tempo para o cálculo, caso `starsEarned` não seja fornecido
const TEMPO_1_MIN_MS = 60 * 1000;
const TEMPO_3_MIN_MS = 180 * 1000;
const TEMPO_5_MIN_MS = 300 * 1000;
const LIMITE_DICAS = 15;

const ScoreDisplay = ({ tempoDecorridoMs = 0, dicasTotaisUsadas = 0, starsEarned, variant = 'default' }) => {
  let estrelasFinais = 0;

  //Prioriza a prop `starsEarned`
  if (starsEarned !== undefined && starsEarned !== null) {
    // Se um número de estrelas foi passado diretamente, usar.
    estrelasFinais = starsEarned;
  } else {
    // Se não, calcular com base no tempo e dicas (lógica da fase em tempo real).
    let estrelasCalculadas = 3;
    if (tempoDecorridoMs > TEMPO_5_MIN_MS) {
      estrelasCalculadas = 0;
    } else if (tempoDecorridoMs > TEMPO_3_MIN_MS) {
      estrelasCalculadas = 1;
    } else if (tempoDecorridoMs > TEMPO_1_MIN_MS) {
      estrelasCalculadas = 2;
    }
    
    if (dicasTotaisUsadas > LIMITE_DICAS) {
      estrelasCalculadas = Math.max(0, estrelasCalculadas - 1);
    }
    estrelasFinais = estrelasCalculadas;
  }

  const totalStars = [1, 2, 3];

  return (
    // A prop 'variant' permite estilizar de forma diferente para o mapa e para a fase
    <div className={`score-display-container ${variant}`}>
      {totalStars.map((slotNum) => (
        <img
          key={slotNum}
          src="/star.svg"
          alt={`Estrela ${slotNum}`}
          className={`star-icon ${slotNum > estrelasFinais ? 'grayscale' : ''}`}
        />
      ))}
    </div>
  );
};

ScoreDisplay.propTypes = {
  tempoDecorridoMs: PropTypes.number,
  dicasTotaisUsadas: PropTypes.number,
  starsEarned: PropTypes.number, 
  variant: PropTypes.string,   
};

export default ScoreDisplay;