import React from 'react';
import PropTypes from 'prop-types';
import "../styles/ScoreDisplay.css"; // Reutilizando o mesmo estilo

// --- Constantes de Tempo Específicas para a Cruzadinha ---
const TEMPO_3_ESTRELAS = 180; // 3 minutos em segundos
const TEMPO_2_ESTRELAS = 360; // 6 minutos em segundos
const TEMPO_1_ESTRELA = 480;  // ~8 minutos em segundos

const CruzadinhaScoreDisplay = ({ tempoDecorridoMs = 0, variant = 'default' }) => {
  
  // Lógica de cálculo de estrelas baseada no tempo
  const tempoSegundos = Math.floor(tempoDecorridoMs / 1000);
  let estrelasCalculadas = 0;

  if (tempoSegundos <= TEMPO_3_ESTRELAS) {
    estrelasCalculadas = 3;
  } else if (tempoSegundos <= TEMPO_2_ESTRELAS) {
    estrelasCalculadas = 2;
  } else if (tempoSegundos <= TEMPO_1_ESTRELA) {
    estrelasCalculadas = 1;
  }

  const totalStars = [1, 2, 3];

  return (
    <div className={`score-display-container ${variant}`}>
      {totalStars.map((slotNum) => (
        <img
          key={slotNum}
          src="/star.svg"
          alt={`Estrela ${slotNum}`}
          className={`star-icon ${slotNum > estrelasCalculadas ? 'grayscale' : ''}`}
        />
      ))}
    </div>
  );
};

CruzadinhaScoreDisplay.propTypes = {
  tempoDecorridoMs: PropTypes.number.isRequired,
  variant: PropTypes.string,   
};

export default CruzadinhaScoreDisplay;