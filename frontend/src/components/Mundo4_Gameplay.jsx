import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CaçaPalavras from './CaçaPalavras';
import Modal from "./Modal.jsx";
import Cronometro from "./Cronometro.jsx";
import ScoreDisplay from './ScoreDisplay.jsx';
import '../styles/Mundo4.css';
import { useAudio } from "../hooks/useAudio";
import TutorialModal from "./TutorialModal.jsx"; // 1. Importar o modal de tutorial
import { tutorials } from "../data/tutorialData.js"; // 2. Importar os dados do tutorial

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
  const { playSound, isMusicMuted, toggleMusic, isSfxMuted, toggleSfx } = useAudio();
  const faseAtual = fasesMundo4[faseId];

  const mundo_id = parseInt(mundoId);
  const fase_id = parseInt(faseId);

  // 3. Adicionar estado para controlar o tutorial
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  const [estadoJogo, setEstadoJogo] = useState("carregando");
  const [tempo, setTempo] = useState({ inicio: Date.now(), decorrido: 0 });
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [palavrasEncontradas, setPalavrasEncontradas] = useState([]);

  // Efeito para tocar a música de fundo
  useEffect(() => {
    const audio = playSound(`musica-mundo-${MUNDO_ID}`, true);
    return () => {
        if (audio) audio.pause();
    };
  }, [playSound]);

  // 4. Efeito para verificar e mostrar o tutorial
  useEffect(() => {
    if (fase_id === 1) {
        const storageKey = `tutorial_mundo_${mundo_id}_visto`;
        const tutorialJaVisto = sessionStorage.getItem(storageKey);
        if (!tutorialJaVisto) {
            setIsTutorialOpen(true);
        }
    }
  }, [mundo_id, fase_id]);

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
    playSound('fase-acerto');
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

  // --- Handlers com som para os botões ---
  const handleOpenConfig = () => { playSound('click'); setIsConfigOpen(true); };
  const handleVoltarAoMapa = () => { playSound('click'); navigate("/mapa-do-jogo", { state: { jogador, mundo_id: MUNDO_ID } }); };
  const handlePausar = () => { playSound('click'); setEstadoJogo(estadoJogo === 'jogando' ? 'pausado' : 'jogando'); };
  const handleRetry = () => { playSound('click'); window.location.reload(); };
  const handleNavigateAjuda = () => { playSound('click'); navigate('/ajuda'); };
  const handleCloseConfig = () => { playSound('click'); setIsConfigOpen(false); };
  const handleCloseTutorial = () => {
    const storageKey = `tutorial_mundo_${mundo_id}_visto`;
    sessionStorage.setItem(storageKey, 'true');
    setIsTutorialOpen(false);
    setTempo({ inicio: Date.now(), decorrido: 0 });
  };


  if (estadoJogo === "carregando") return <div className="loading-screen">Carregando...</div>;
  if (!faseAtual) return <div className="error-screen">Fase não encontrada!</div>;

  return (
    <section className="mundo4-section">
      <TutorialModal 
          isOpen={isTutorialOpen}
          onClose={handleCloseTutorial}
          steps={tutorials[mundo_id]}
      />
      <header className="mundo4-header">
        <button className="level-settings-btn" onClick={handleOpenConfig}>
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
              isPaused={estadoJogo === "pausado" || isTutorialOpen}
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

      <Modal isOpen={isConfigOpen} onClose={handleCloseConfig} variant="config">
          <div className="btn-level-grid">
              <button className={`btn music-btn ${isMusicMuted ? 'grayscale' : ''}`} onClick={toggleMusic}>
                  <div></div> música
              </button>
              <button className={`btn effect-btn ${isSfxMuted ? 'grayscale' : ''}`} onClick={toggleSfx}>
                  <div></div> efeitos
              </button>
              <button className="btn map-btn" onClick={handleVoltarAoMapa}><div></div>🏠</button>
              <button className="btn stop-btn" onClick={handlePausar}><div></div>{estadoJogo === 'pausado' ? '▶' : '⏸'}</button>
              <button className="btn retry-btn" onClick={handleRetry}><div></div>↩</button>
              <button className="btn help-btn" onClick={handleNavigateAjuda}><div></div> ajuda</button>
              <button className="btn skip-btn" onClick={handleCloseConfig}><div></div> fechar</button>
          </div>
      </Modal>
    </section>
  );
}

export default Mundo4_Gameplay;