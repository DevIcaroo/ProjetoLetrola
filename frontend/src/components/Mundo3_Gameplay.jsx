import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { buscarCruzadinhaPorFase } from '../services/apiCruzadinhas';
import Modal from "./Modal.jsx";
import Cronometro from "./Cronometro.jsx";
import CruzadinhaScoreDisplay from './CruzadinhaScoreDisplay.jsx';
import '../styles/Cruzadinha.css';
import { useAudio } from "../hooks/useAudio";
import TutorialModal from "./TutorialModal.jsx";
import { tutorials } from "../data/tutorialData.js";

// --- Constantes ---
const MUNDO_ID = 3;
const DOUBLE_CLICK_DELAY = 300;
const TEMPO_3_ESTRELas = 180;
const TEMPO_2_ESTRELAS = 360;
const TEMPO_1_ESTRELA = 500;

const formatTime = (timeInMs) => {
    const totalSeconds = Math.floor(timeInMs / 1000);
    const min = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
    const sec = String(totalSeconds % 60).padStart(2, "0");
    return `${min}:${sec}`;
};

const dicaImagens = {
    'FITA': '/fita.svg', 'FLOR': '/flor.svg', 'BOLA': '/bola.svg',
    'VELA': '/vela.svg', 'LAÇO': '/laco.svg', 'PAINEL': '/painel.svg', 'LÂMPADA': '/lampada.svg', 'BANDEIRA': '/bandeira.svg',
    'BALÃO': '/balao.svg', 'ESTRELA': '/estrela.svg', 'CORDA': '/corda.svg', 'TECIDO': '/tecido.svg', 'GUIZO': '/guizo.svg',
    'GLITTER': '/glitter.svg', 'POMPOM': '/pompom.svg', 'FITAS': '/fitas.svg', 'LUZES': '/pisca-pisca.svg', 'LANTEJOULA': '/lantejoula.svg', 'CONFETE': '/confete.svg', 'GUIRLANDA': '/guirlanda.svg',
    'DECORAÇÃO': '/decoracao.svg', 'BANDEIRINHAS': '/bandeirinhas.svg', 'ENFEITE': '/enfeite.svg', 'COLORIDO': '/colorido.svg', 'PISCA': '/pisca.svg', 'FLORIDO': '/florido.svg', 'ARCO': '/arco.svg',
};

function Mundo3_Gameplay({ jogador, onFaseCompleta }) {
  const { mundoId, faseId } = useParams();
  const navigate = useNavigate();
  const { playSound, isMusicMuted, toggleMusic, isSfxMuted, toggleSfx } = useAudio();

  const mundo_id = parseInt(mundoId);
  const fase_id = parseInt(faseId);

  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [estadoJogo, setEstadoJogo] = useState("carregando");
  const [grid, setGrid] = useState([]);
  const [palavras, setPalavras] = useState([]);
  const [palavraAtiva, setPalavraAtiva] = useState(null);
  const [tempo, setTempo] = useState({ inicio: Date.now(), decorrido: 0 });
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [celulasComErro, setCelulasComErro] = useState({});
  const inputsRef = useRef({});
  const lastClickInfoRef = useRef({ time: 0, cellKey: null });

  useEffect(() => {
    const audio = playSound(`musica-mundo-${MUNDO_ID}`, true);
    return () => { if (audio) audio.pause(); };
  }, [playSound]);

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
  }, [estadoJogo, onFaseCompleta, tempo.decorrido]);

  const inicializarFase = useCallback(async () => {
    setEstadoJogo('carregando');
    try {
      const palavrasDaApi = await buscarCruzadinhaPorFase(mundo_id, fase_id);
      if (!palavrasDaApi || palavrasDaApi.length === 0) throw new Error("Nenhuma palavra retornada pela API.");

      const padding = 1;
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
      
      const gridWidth = maxX + padding * 2;
      const gridHeight = maxY + padding * 2;
      const novaGrid = Array.from({ length: gridHeight }, () => Array(gridWidth).fill(null));
      const palavrasCompletas = palavrasDaApi.map((p, index) => ({ ...p, id: index, numero: index + 1, estaCompleta: false }));

      palavrasCompletas.forEach(p => {
        for (let i = 0; i < p.palavra.length; i++) {
          const x = p.posicao_x + padding + (p.orientacao === 'horizontal' ? i : 0);
          const y = p.posicao_y + padding + (p.orientacao === 'vertical' ? i : 0);
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
  }, [mundo_id, fase_id]);

    useEffect(() => {
        if (!jogador) {
            navigate("/");
        } else {
            inicializarFase().catch(error => {
                console.error("Falha ao inicializar a fase:", error);
                setEstadoJogo("erro");
            });
        }
    }, [jogador, navigate, inicializarFase]);
 
  useEffect(() => {
    if (estadoJogo === 'jogando' && palavras.length > 0 && palavras.every(p => p.estaCompleta)) {
      finalizarFase('concluido');
    }
  }, [palavras, estadoJogo, finalizarFase]);

    const handleFocus = (y, x, cell) => {
        const now = Date.now();
        const { time, cellKey } = lastClickInfoRef.current;
        const currentCellKey = `${y}-${x}`;
        lastClickInfoRef.current = { time: now, cellKey: currentCellKey };
        
        const idsDasPalavras = Object.keys(cell.palavras).map(id => parseInt(id));
        if (idsDasPalavras.length === 0) return;

        const palavrasDaCelula = palavras.filter(p => idsDasPalavras.includes(p.id) && !p.estaCompleta);
        if (palavrasDaCelula.length === 0) return;

        const isDoubleClick = now - time < DOUBLE_CLICK_DELAY && cellKey === currentCellKey;
        if (isDoubleClick && palavrasDaCelula.length > 1) {
            const currentIndex = palavrasDaCelula.findIndex(p => p.id === palavraAtiva?.id);
            const nextIndex = (currentIndex + 1) % palavrasDaCelula.length;
            setPalavraAtiva(palavrasDaCelula[nextIndex]);
        } else if (!palavraAtiva || !idsDasPalavras.includes(palavraAtiva.id)) {
            setPalavraAtiva(palavrasDaCelula[0]);
        }
    };
 
    const avancarParaProximaPalavra = (palavraRecemCompleta) => {
        const padding = 1;
        for (let i = 0; i < palavraRecemCompleta.palavra.length; i++) {
            const x = palavraRecemCompleta.posicao_x + padding + (palavraRecemCompleta.orientacao === 'horizontal' ? i : 0);
            const y = palavraRecemCompleta.posicao_y + padding + (palavraRecemCompleta.orientacao === 'vertical' ? i : 0);
            const celula = grid[y][x];
            const idsDasPalavras = Object.keys(celula.palavras);

            if (idsDasPalavras.length > 1) {
                const idOutraPalavra = idsDasPalavras.find(id => parseInt(id) !== palavraRecemCompleta.id);
                if (idOutraPalavra) {
                    const outraPalavra = palavras.find(p => p.id === parseInt(idOutraPalavra));
                    if (outraPalavra && !outraPalavra.estaCompleta) {
                        setPalavraAtiva(outraPalavra);
                        for (let j = 0; j < outraPalavra.palavra.length; j++) {
                            const nextX = outraPalavra.posicao_x + padding + (outraPalavra.orientacao === 'horizontal' ? j : 0);
                            const nextY = outraPalavra.posicao_y + padding + (outraPalavra.orientacao === 'vertical' ? j : 0);
                            if (grid[nextY][nextX].letra === '') {
                                inputsRef.current[`${nextY}-${nextX}`]?.focus();
                                break;
                            }
                        }
                        return;
                    }
                }
            }
        }
    };

  const handleInputChange = (y, x, value) => {
    if (estadoJogo !== 'jogando' || isTutorialOpen) return;
    const letra = value.slice(-1).toUpperCase();
    setGrid(prevGrid => {
        const novaGrid = prevGrid.map(row => row.map(cell => cell ? {...cell} : null));
        if (novaGrid[y][x]) {
            novaGrid[y][x].letra = letra;
            const idsDasPalavrasAfetadas = Object.keys(novaGrid[y][x].palavras);
            setPalavras(prevPalavras => {
                const palavrasAtualizadas = [...prevPalavras];
                idsDasPalavrasAfetadas.forEach(id => {
                    const palavraObj = palavrasAtualizadas.find(p => p.id === parseInt(id));
                    if (palavraObj && !palavraObj.estaCompleta) {
                        const palavraFormada = construirPalavra(palavraObj, novaGrid);
                        if (palavraFormada.length === palavraObj.palavra.length) {
                            if (palavraFormada === palavraObj.palavra) {
                                playSound('fase-acerto');
                                const palavraCompleta = { ...palavraObj, estaCompleta: true };
                                palavrasAtualizadas[palavrasAtualizadas.findIndex(p => p.id === parseInt(id))] = palavraCompleta;
                                atualizarStatusDaGrid(novaGrid, palavraObj, 'correto');
                                avancarParaProximaPalavra(palavraCompleta);
                            } else {
                                playSound('fase-erro');
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
      const padding = 1;
      const indexNaPalavra = (palavraAtiva.orientacao === 'horizontal') ? x - (palavraAtiva.posicao_x + padding) : y - (palavraAtiva.posicao_y + padding);
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
    const padding = 1;
    for (let i = 0; i < palavraInfo.palavra.length; i++) {
      const x = palavraInfo.posicao_x + padding + (palavraInfo.orientacao === 'horizontal' ? i : 0);
      const y = palavraInfo.posicao_y + padding + (palavraInfo.orientacao === 'vertical' ? i : 0);
      palavraFormada += gridAtual[y][x]?.letra || '';
    }
    return palavraFormada;
  };
  const atualizarStatusDaGrid = (grid, palavraInfo, status) => {
    const padding = 1;
    for (let i = 0; i < palavraInfo.palavra.length; i++) {
      const x = palavraInfo.posicao_x + padding + (palavraInfo.orientacao === 'horizontal' ? i : 0);
      const y = palavraInfo.posicao_y + padding + (palavraInfo.orientacao === 'vertical' ? i : 0);
      if (grid[y][x]) grid[y][x].status = status;
    }
  };
  const acionarFeedbackErro = (palavraInfo) => {
    const celulas = {};
    const padding = 1;
    for (let i = 0; i < palavraInfo.palavra.length; i++) {
        const x = palavraInfo.posicao_x + padding + (palavraInfo.orientacao === 'horizontal' ? i : 0);
        const y = palavraInfo.posicao_y + padding + (palavraInfo.orientacao === 'vertical' ? i : 0);
        celulas[`${y}-${x}`] = true;
    }
    setCelulasComErro(celulas);
    setTimeout(() => setCelulasComErro({}), 500);
  };
  
    const handleOpenConfig = () => { playSound('click'); setIsConfigOpen(true); };
    const handleVoltarAoMapa = () => { playSound('click'); navigate("/mapa-do-jogo", { state: { jogador, mundo_id: MUNDO_ID } }); };
    const handlePausar = () => { playSound('click'); setEstadoJogo(estadoJogo === 'jogando' ? 'pausado' : 'jogando'); };
    const handleRetry = () => { playSound('click'); inicializarFase(); };
    const handleNavigateAjuda = () => { playSound('click'); navigate('/ajuda'); };
    const handleCloseConfig = () => { playSound('click'); setIsConfigOpen(false); };
    const handleCloseTutorial = () => {
        const storageKey = `tutorial_mundo_${mundo_id}_visto`;
        sessionStorage.setItem(storageKey, 'true');
        setIsTutorialOpen(false);
        setTempo({ inicio: Date.now(), decorrido: 0 });
    };

  if (estadoJogo === 'carregando') return <div className="loading-screen-3">Carregando Cruzadinha...</div>;
  if (estadoJogo === 'erro') return <div className="error-screen-3">Erro ao carregar a fase.</div>;

  const padding = 1;

  return (
    <section className="cruzadinha-section">
        <TutorialModal 
            isOpen={isTutorialOpen}
            onClose={handleCloseTutorial}
            steps={tutorials[mundo_id]}
        />
        <header className="cruzadinha-header">
            <button className="level-settings-btn" onClick={handleOpenConfig}><img src="/Settings.svg" alt="Configurações" /></button>
            <CruzadinhaScoreDisplay tempoDecorridoMs={tempo.decorrido} />
            <div className="cruzadinha-timer"><img src="/timer.svg" alt="Cronômetro" /><p className="cruzadinha-seconds">{formatTime(tempo.decorrido)}</p></div>
        </header>

        <Cronometro
            isPaused={estadoJogo !== 'jogando' || isTutorialOpen}
            tempoInicioFase={tempo.inicio}
            limiteTempoFase={TEMPO_1_ESTRELA * 1000}
            onFaseTermina={() => finalizarFase('tempo_esgotado')}
            onTempoTick={(ms) => setTempo(t => ({ ...t, decorrido: ms }))}
        />
      
        <main className="cruzadinha-main-content">
            <div className="dicas-painel-container">
                <img src="/dicas-painel.svg" alt="Sapo Hebert" className="sapo-personagem" />
                <div className="placa-dicas">
                    <ul>{palavras.map(p => (<li key={p.id} onClick={() => !p.estaCompleta && setPalavraAtiva(p)} className={palavraAtiva?.id === p.id ? 'active' : ''}><strong>DICA {p.numero}:</strong> {p.dica}</li>))}</ul>
                </div>
            </div>

            <div className="cruzadinha-grid-container">
                {grid.length > 0 && (
                    <div className="cruzadinha-grid" style={{ gridTemplateColumns: `repeat(${grid[0].length}, 43px)` }}>
                        {palavras.map(p => {
                            const imgUrl = dicaImagens[p.palavra];
                            if (!imgUrl) return null;
                            const style = p.orientacao === 'horizontal' ? { top: `${(p.posicao_y + padding) * 43}px`, left: `${(p.posicao_x + padding - 1) * 43}px` } : { top: `${(p.posicao_y + padding - 1) * 43}px`, left: `${(p.posicao_x + padding) * 43}px` };
                            return <img key={`dica-${p.id}`} src={imgUrl} alt={`Dica para ${p.palavra}`} id={`dica-${p.palavra}`} className="dica-imagem" style={style} />;
                        })}
                        
                        {grid.map((row, y) => row.map((cell, x) => {
                            if (!cell) return <div key={`${y}-${x}`} className="grid-cell empty" />;
                            const isReadOnly = palavras.some(p => p.estaCompleta && cell.palavras[p.id]);
                            const isActiveWord = palavraAtiva && !palavraAtiva.estaCompleta && cell.palavras[palavraAtiva.id];
                            const isError = celulasComErro[`${y}-${x}`];
                            const isCorrect = palavras.some(p => p.estaCompleta && cell.palavras[p.id]);
                            let cellClassName = 'grid-cell';
                            if(isActiveWord) cellClassName += ' active-word';
                            if(isError) cellClassName += ' error';
                            if(isCorrect) cellClassName += ' correct';
                            return (<div key={`${y}-${x}`} className={cellClassName}><input ref={el => inputsRef.current[`${y}-${x}`] = el} type="text" maxLength="1" value={cell.letra} onChange={(e) => handleInputChange(y, x, e.target.value)} onKeyDown={(e) => handleKeyDown(e, y, x)} onClick={() => handleFocus(y, x, cell)} readOnly={isReadOnly} /></div>);
                        }))}
                    </div>
                )}
            </div>
        </main>

        <Modal isOpen={isConfigOpen} onClose={handleCloseConfig} variant="config">
            <div className="btn-level-grid">
                <button className={`btn music-btn ${isMusicMuted ? 'grayscale' : ''}`} onClick={toggleMusic}><div></div> música</button>
                <button className={`btn effect-btn ${isSfxMuted ? 'grayscale' : ''}`} onClick={toggleSfx}><div></div> efeitos</button>
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

export default Mundo3_Gameplay;