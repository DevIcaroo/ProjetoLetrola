import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CaçaPalavras from './CaçaPalavras'; // O componente do jogo em si
import Modal from "./Modal.jsx";
import Cronometro from "./Cronometro.jsx";
import ScoreDisplay from './ScoreDisplay.jsx';
import '../styles/Mundo4.css'; // Estilos para o novo mundo

// --- Dados mockados para as fases do Mundo 4 ---
const fasesMundo4 = {
  1: {
    palavras: ['BOLO', 'PUDIM', 'TORTA'],
    gridSize: 10,
  },
  2: {
    palavras: ['COCADA', 'AÇAI', 'PICOLÉ', 'MANJAR', 'SORVETE'],
    gridSize: 12,
  },
  3: {
    palavras: ['CHOCOLATE', 'BOLINHO', 'BISCOITO', 'PAVÊ', 'PAÇOCA'],
    gridSize: 15,
  },
  4: {
    palavras: ['MOUSSE', 'BOMBOM', 'TAPIOCA', 'CHURROS', 'GELATINA', 'PANQUECA', 'ROCAMBOLE'],
    gridSize: 18,
  },
  5: {
    palavras: ['BANOFFE', 'CARAMELO', 'SUSPIRO', 'PANETONE', 'COOKIES', 'QUINDIM', 'PAMONHA'],
    gridSize: 20,
  },
};

// --- Constantes de Configuração do Jogo ---
const MUNDO_ID = 4;
const TEMPO_3_ESTRELAS = 180; // 3 minutos
const TEMPO_2_ESTRELAS = 300; // 5 minutos
const TEMPO_1_ESTRELA = 480; // 8 minutos

const formatTime = (timeInMs) => {
    const totalSeconds = Math.floor(timeInMs / 1000);
    const min = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
    const sec = String(totalSeconds % 60).padStart(2, "0");
    return `${min}:${sec}`;
};

function Mundo4_Gameplay({ jogador, onFaseCompleta }) {
  const { mundoId, faseId } = useParams();
  const navigate = useNavigate();
  const faseAtual = fasesMundo4[faseId];

  const [estadoJogo, setEstadoJogo] = useState("carregando");
  const [tempo, setTempo] = useState({ inicio: Date.now(), decorrido: 0 });
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [palavrasEncontradas, setPalavrasEncontradas] = useState([]);

  const finalizarFase = useCallback((motivo = 'concluido') => {
      if (estadoJogo === "finalizado") return;
      setEstadoJogo("finalizado");

      const tempoFinalSegundos = Math.floor(tempo.decorrido / 1000);
      let estrelas = 0;

      if (motivo !== 'tempo_esgotado') {
          if (tempoFinalSegundos <= TEMPO_3_ESTRELAS) estrelas = 3;
          else if (tempoFinalSegundos <= TEMPO_2_ESTRELAS) estrelas = 2;
          else if (tempoFinalSegundos <= TEMPO_1_ESTRELA) estrelas = 1;
      }
      onFaseCompleta({ estrelas, tempoConclusao: tempoFinalSegundos });
  }, [estadoJogo, tempo.decorrido, onFaseCompleta]);

  const handlePalavraEncontrada = (palavra) => {
    setPalavrasEncontradas(prev => [...prev, palavra]);
  };

  useEffect(() => {
    if (faseAtual && palavrasEncontradas.length === faseAtual.palavras.length) {
      finalizarFase('concluido');
    }
  }, [palavrasEncontradas, faseAtual, finalizarFase]);


  useEffect(() => {
    if (!jogador) navigate("/");
    else setEstadoJogo("jogando");
  }, [jogador, navigate]);


  if (estadoJogo === "carregando") return <div className="loading-screen">Carregando...</div>;
  if (!faseAtual) return <div className="error-screen">Fase não encontrada!</div>;

  return (
    <section className="mundo4-section">
      <header className="mundo4-header">
        <button className="level-settings-btn" onClick={() => setIsConfigOpen(true)}>
          <img src="/Settings.svg" alt="Configurações" />
        </button>
        <ScoreDisplay tempoDecorridoMs={tempo.decorrido} />
        <div className="timer">
            <img src="/timer.svg" alt="Cronômetro" />
            <p className="seconds">{formatTime(tempo.decorrido)}</p>
        </div>
      </header>

       {(estadoJogo === "jogando" || estadoJogo === "pausado") && (
          <Cronometro
              isPaused={estadoJogo === "pausado"}
              tempoInicioFase={tempo.inicio}
              limiteTempoFase={TEMPO_1_ESTRELA * 1000}
              onTempoTick={(ms) => setTempo(t => ({ ...t, decorrido: ms }))}
              onFaseTermina={() => finalizarFase('tempo_esgotado')}
          />
      )}

      <main className="mundo4-main">
        <CaçaPalavras
          palavras={faseAtual.palavras}
          gridSize={faseAtual.gridSize}
          onPalavraEncontrada={handlePalavraEncontrada}
        />
      </main>

      <Modal isOpen={isConfigOpen} onClose={() => setIsConfigOpen(false)} variant="config">
          <div className="btn-level-grid">
              <button className="btn map-btn" onClick={() => navigate("/mapa-do-jogo", { state: { jogador, mundo_id: MUNDO_ID } })}>🏠</button>
              <button className="btn stop-btn" onClick={() => setEstadoJogo(estadoJogo === 'pausado' ? 'jogando' : 'pausado')}>{estadoJogo === 'pausado' ? '▶' : '⏸'}</button>
              <button className="btn retry-btn" onClick={() => window.location.reload()}>↩</button>
              <button className="btn help-btn" onClick={() => navigate('/ajuda')}>ajuda</button>
              <button className="btn skip-btn" onClick={() => setIsConfigOpen(false)}>fechar</button>
          </div>
      </Modal>
    </section>
  );
}

export default Mundo4_Gameplay;