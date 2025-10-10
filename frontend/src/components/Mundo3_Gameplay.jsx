import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { buscarCruzadinhaPorFase } from '../services/apiCruzadinhas';
import Modal from "./Modal.jsx";
import Cronometro from "./Cronometro.jsx";
import ScoreDisplay from './ScoreDisplay.jsx';
import '../styles/Cruzadinha.css';

// --- Constantes ---
const MUNDO_ID = 3;
const formatTime = (timeInMs) => {
    const totalSeconds = Math.floor(timeInMs / 1000);
    const min = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
    const sec = String(totalSeconds % 60).padStart(2, "0");
    return `${min}:${sec}`;
};

function Mundo3_Gameplay({ jogador, onFaseCompleta }) {
  const { faseId } = useParams();
  const navigate = useNavigate();

  // --- Estados do Componente ---
  const [estadoJogo, setEstadoJogo] = useState('carregando');
  const [grid, setGrid] = useState([]);
  const [palavras, setPalavras] = useState([]);
  const [palavraAtiva, setPalavraAtiva] = useState(null);
  const [tempo, setTempo] = useState({ inicio: Date.now(), decorrido: 0 }); // Única fonte de verdade para o tempo
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [celulasComErro, setCelulasComErro] = useState({});
  const inputsRef = useRef({});

  // --- Lógica de Inicialização ---
  const inicializarFase = useCallback(async () => {
    setEstadoJogo('carregando');
    try {
      const palavrasDaApi = await buscarCruzadinhaPorFase(MUNDO_ID, faseId);
      if (!palavrasDaApi || palavrasDaApi.length === 0) throw new Error("Nenhuma palavra retornada pela API.");

      let maxX = 0, maxY = 0;
      palavrasDaApi.forEach(({ palavra, posicao_x, posicao_y, orientacao }) => {
        if (orientacao === 'horizontal') {
          maxX = Math.max(maxX, posicao_x + palavra.length);
          maxY = Math.max(maxY, posicao_y + 1);
        } else {
          maxX = Math.max(maxX, posicao_x + 1);
          maxY = Math.max(maxY, posicao_y + palavra.length);
        }
      });

      const novaGrid = Array.from({ length: maxY }, () => Array(maxX).fill(null));
      const palavrasCompletas = palavrasDaApi.map((p, index) => ({
        ...p, id: index, numero: index + 1, estaCompleta: false
      }));

      palavrasCompletas.forEach(p => {
        for (let i = 0; i < p.palavra.length; i++) {
          const x = p.posicao_x + (p.orientacao === 'horizontal' ? i : 0);
          const y = p.posicao_y + (p.orientacao === 'vertical' ? i : 0);
          if (!novaGrid[y][x]) novaGrid[y][x] = { letra: '', palavras: {}, status: 'neutral' };
          novaGrid[y][x].palavras[p.id] = true;
          if (i === 0) novaGrid[y][x].numero = p.numero;
        }
      });

      setPalavras(palavrasCompletas);
      setGrid(novaGrid);
      setPalavraAtiva(palavrasCompletas[0]);
      setTempo({ inicio: Date.now(), decorrido: 0 });
      setEstadoJogo('jogando');
    } catch (error) {
      console.error("Erro ao carregar cruzadinha:", error);
      setEstadoJogo('erro');
    }
  }, [faseId]);

  useEffect(() => {
    inicializarFase();
  }, [inicializarFase]);
  
  // --- Efeitos de Jogo ---
  useEffect(() => {
    if (estadoJogo === 'jogando' && palavras.length > 0 && palavras.every(p => p.estaCompleta)) {
      const tempoFinalMs = Date.now() - tempo.inicio;
      onFaseCompleta({ estrelas: 3, tempoConclusao: Math.floor(tempoFinalMs / 1000) });
    }
  }, [palavras, estadoJogo, onFaseCompleta, tempo.inicio]);

  useEffect(() => {
    if (palavraAtiva) {
      const { posicao_y, posicao_x } = palavraAtiva;
      inputsRef.current[`${posicao_y}-${posicao_x}`]?.focus();
    }
  }, [palavraAtiva]);
  
  // --- Funções de Manipulação ---
  const handlePausar = () => {
    setEstadoJogo(prev => prev === 'jogando' ? 'pausado' : 'jogando');
    setIsConfigOpen(false);
  };
  
  // (Lógicas de input, keydown e auxiliares permanecem as mesmas)
  const handleInputChange = (y, x, value) => {
    if (estadoJogo !== 'jogando') return;
    const letra = value.slice(-1).toUpperCase();
    setGrid(prevGrid => {
        const novaGrid = prevGrid.map(row => row.map(cell => cell ? {...cell} : null));
        if (novaGrid[y][x]) {
            novaGrid[y][x].letra = letra;
            const idsDasPalavrasAfetadas = Object.keys(novaGrid[y][x].palavras);
            setPalavras(prevPalavras => {
                const palavrasAtualizadas = [...prevPalavras];
                idsDasPalavrasAfetadas.forEach(id => {
                    const palavraObj = palavrasAtualizadas[id];
                    if (!palavraObj.estaCompleta) {
                        const palavraFormada = construirPalavra(palavraObj, novaGrid);
                        if (palavraFormada.length === palavraObj.palavra.length) {
                            if (palavraFormada === palavraObj.palavra) {
                                palavrasAtualizadas[id] = { ...palavraObj, estaCompleta: true };
                                atualizarStatusDaGrid(novaGrid, palavraObj, 'correto');
                            } else {
                                acionarFeedbackErro(palavraObj);
                            }
                        }
                    }
                });
                return palavrasAtualizadas;
            });
        }
        return novaGrid;
    });
    if (letra && palavraAtiva) {
      let nextX = x, nextY = y;
      const indexNaPalavra = (palavraAtiva.orientacao === 'horizontal') ? x - palavraAtiva.posicao_x : y - palavraAtiva.posicao_y;
      if (indexNaPalavra < palavraAtiva.palavra.length - 1) {
        if (palavraAtiva.orientacao === 'horizontal') nextX++; else nextY++;
        inputsRef.current[`${nextY}-${nextX}`]?.focus();
      }
    }
  };
  const handleKeyDown = (e, y, x) => {
    let nextY = y, nextX = x;
    if (e.key === 'ArrowUp') nextY--;
    else if (e.key === 'ArrowDown') nextY++;
    else if (e.key === 'ArrowLeft') nextX--;
    else if (e.key === 'ArrowRight') nextX++;
    else if (e.key === 'Backspace' && grid[y][x].letra === '') {
        if (palavraAtiva?.orientacao === 'horizontal') nextX--; else nextY--;
    } else return;
    const nextInput = inputsRef.current[`${nextY}-${nextX}`];
    if (nextInput) {
        e.preventDefault();
        nextInput.focus();
    }
  };
  const construirPalavra = (palavraInfo, gridAtual) => {
    let palavraFormada = '';
    for (let i = 0; i < palavraInfo.palavra.length; i++) {
      const x = palavraInfo.posicao_x + (palavraInfo.orientacao === 'horizontal' ? i : 0);
      const y = palavraInfo.posicao_y + (palavraInfo.orientacao === 'vertical' ? i : 0);
      palavraFormada += gridAtual[y][x].letra;
    }
    return palavraFormada;
  };
  const atualizarStatusDaGrid = (grid, palavraInfo, status) => {
    for (let i = 0; i < palavraInfo.palavra.length; i++) {
      const x = palavraInfo.posicao_x + (palavraInfo.orientacao === 'horizontal' ? i : 0);
      const y = palavraInfo.posicao_y + (palavraInfo.orientacao === 'vertical' ? i : 0);
      if (grid[y][x]) grid[y][x].status = status;
    }
  };
  const acionarFeedbackErro = (palavraInfo) => {
    const celulas = {};
    for (let i = 0; i < palavraInfo.palavra.length; i++) {
        const x = palavraInfo.posicao_x + (palavraInfo.orientacao === 'horizontal' ? i : 0);
        const y = palavraInfo.posicao_y + (palavraInfo.orientacao === 'vertical' ? i : 0);
        celulas[`${y}-${x}`] = true;
    }
    setCelulasComErro(celulas);
    setTimeout(() => setCelulasComErro({}), 500);
  };

  // --- Renderização ---
  if (estadoJogo === 'carregando') return <div className="loading-screen">Carregando Cruzadinha...</div>;
  if (estadoJogo === 'erro') return <div className="error-screen">Erro ao carregar a fase.</div>;

  return (
    <section className="cruzadinha-section">
        <header className="cruzadinha-header">
            <button className="level-settings-btn" onClick={() => setIsConfigOpen(true)}>
                <img src="/Settings.svg" alt="Configurações" />
            </button>
            <ScoreDisplay tempoDecorridoMs={tempo.decorrido} />
            <div className="timer">
                <img src="/timer.svg" alt="Cronômetro" />
                <p className="seconds">{formatTime(tempo.decorrido)}</p>
            </div>
        </header>

        <Cronometro
            isPaused={estadoJogo !== 'jogando'}
            tempoInicioFase={tempo.inicio}
            onTempoTick={(ms) => setTempo(t => ({ ...t, decorrido: ms }))}
        />
      
      <div className="cruzadinha-painel-container">
        <img src="/painel-cruzadinha.svg" alt="Painel da Cruzadinha" className="painel-bg" />
        {grid.length > 0 && (
          <div className="cruzadinha-grid" style={{ gridTemplateColumns: `repeat(${grid[0].length}, 43px)` }}>
            {grid.map((row, y) => row.map((cell, x) => {
                if (!cell) return <div key={`${y}-${x}`} className="grid-cell empty" />;
                const isReadOnly = palavras.some(p => p.estaCompleta && cell.palavras[p.id]);
                const isActiveWord = palavraAtiva && cell.palavras[palavraAtiva.id];
                const isError = celulasComErro[`${y}-${x}`];
                const isCorrect = cell.status === 'correto';
                const cellClassName = `${isActiveWord ? 'active-word' : ''} ${isError ? 'error' : ''} ${isCorrect ? 'correct' : ''}`;

                return (
                  <div key={`${y}-${x}`} className="grid-cell">
                    {cell.numero && <span className="cell-number">{cell.numero}</span>}
                    <input
                      ref={el => inputsRef.current[`${y}-${x}`] = el}
                      type="text"
                      maxLength="1"
                      value={cell.letra}
                      onChange={(e) => handleInputChange(y, x, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, y, x)}
                      onFocus={() => {
                          const idPrimeiraPalavra = Object.keys(cell.palavras)[0];
                          const palavraClicada = palavras.find(p => p.id == idPrimeiraPalavra);
                          if (palavraClicada && !palavraClicada.estaCompleta) setPalavraAtiva(palavraClicada);
                      }}
                      className={cellClassName}
                      readOnly={isReadOnly}
                    />
                  </div>
                );
            }))}
          </div>
        )}
      </div>

      <div className="dica-container">
        <p>{palavraAtiva ? palavraAtiva.dica : "Selecione uma palavra para ver a dica."}</p>
      </div>

        <Modal isOpen={isConfigOpen} onClose={() => setIsConfigOpen(false)} title="Pausa" variant="config">
            <div className="btn-level-grid">
                <button className="btn map-btn" onClick={() => navigate("/mapa-do-jogo", { state: { jogador, mundo_id: MUNDO_ID } })}>🏠</button>
                <button className="btn stop-btn" onClick={handlePausar}>{estadoJogo === 'pausado' ? '▶' : 'Continuar'}</button>
                <button className="btn retry-btn" onClick={inicializarFase}>↩</button>
                <button className="btn help-btn" onClick={() => navigate('/ajuda')}>ajuda</button>
                <button className="btn skip-btn" onClick={() => setIsConfigOpen(false)}>fechar</button>
            </div>
        </Modal>
    </section>
  );
}

export default Mundo3_Gameplay;