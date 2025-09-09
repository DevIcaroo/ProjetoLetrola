import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/Fase.css";
import Modal from "../components/Modal.jsx";
import Cronometro from "../components/Cronometro.jsx";
import { salvarProgresso } from "../services/apiProgresso.js";
import ScoreDisplay from '../components/ScoreDisplay.jsx';
import { buscarItensPorFase } from "../services/apiItensFase.js";

// --- CONFIGURAÇÕES DO JOGO ---
const GRAVIDADE = 0.8;
const FORCA_PULO = 18;
const VELOCIDADE_PERSONAGEM = 8;
const ALTURA_CHAO = 87; // % da tela a partir do topo
const VELOCIDADE_FRUTAS = 2; // Velocidade com que as frutas se movem

// Constantes de tempo (em segundos)
const TEMPO_3_ESTRELAS = 60;
const TEMPO_2_ESTRELAS = 180;
const TEMPO_1_ESTRELA = 300;
const LIMITE_DICAS = 15;

// --- FUNÇÕES UTILITÁRIAS ---
const formatTime = (time, unit = 'ms') => {
  const totalSeconds = unit === 'ms' ? Math.floor(time / 1000) : time;
  const min = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const sec = String(totalSeconds % 60).padStart(2, "0");
  return `${min}:${sec}`;
};

const gerarLetrasPuzzle = (palavra) => {
    const letrasPalavra = palavra.split('');
    const alfabeto = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let letrasGrid = [];
    letrasPalavra.forEach((letra, index) => {
        letrasGrid.push({ id: `palavra-${index}`, letra: letra });
    });
    while (letrasGrid.length < 8) {
        const letraAleatoria = alfabeto[Math.floor(Math.random() * alfabeto.length)];
        letrasGrid.push({ id: `aleatoria-${letrasGrid.length}`, letra: letraAleatoria });
    }
    return letrasGrid.sort(() => Math.random() - 0.5);
};

// --- COMPONENTES DO JOGO ---
const Personagem = ({ pos }) => ( <div className="personagem" style={{ left: `${pos.x}px`, top: `${pos.y}px` }}></div> );
const Fruta = ({ fruta }) => ( <img src={fruta.imgSrc} className="fruta" style={{ left: `${fruta.x}px`, top: `${fruta.y}px` }} alt={fruta.nome} /> );

function Fase4() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id_jogador } = location.state || {};
  const mundo_id = 1;
  const fase_id = 4;
  const proxima_fase_id = fase_id + 1;

  // --- ESTADOS ---
  const [estadoJogo, setEstadoJogo] = useState("carregando");
  const [tempoInicioFase, setTempoInicioFase] = useState(Date.now());
  const [tempoDecorridoParaScore, setTempoDecorridoParaScore] = useState(0);
  const [dicasTotaisUsadas, setDicasTotaisUsadas] = useState(0);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [tempoExibido, setTempoExibido] = useState("00:00");
  const [resultadoFinal, setResultadoFinal] = useState({
    title: "", estrelas: 0, tempoConclusao: 0, proximaMeta: "", aprendizado: "Você aprendeu a soletrar os nomes das frutas!"});
  const [personagemPos, setPersonagemPos] = useState({ x: 100, y: 0, vy: 0 });
  const [teclasPressionadas, setTeclasPressionadas] = useState({});
  const [frutas, setFrutas] = useState([]);
  const [isPuzzleOpen, setIsPuzzleOpen] = useState(false);
  const [puzzleAtual, setPuzzleAtual] = useState({
    fruta: null, letrasGrid: [], slotsResposta: [],
  });
  const [puzzleError, setPuzzleError] = useState(false);
  const [colisaoAtiva, setColisaoAtiva] = useState(false);
  const [itemEmJogo, setItemEmJogo] = useState(null);
  const [tempoDoItemExibido, setTempoDoItemExibido] = useState("00:00");
  const [dicasDisponiveis, setDicasDisponiveis] = useState([]);
  const [dicaExibida, setDicaExibida] = useState("Colete as frutas para aprender a soletrar!");

  const gameLoopRef = useRef();
  const animationFrameRef = useRef(0);

  // --- INICIALIZAÇÃO ---
  const inicializarFase = useCallback(async () => {
    console.log(`Buscando itens para o Mundo ${mundo_id}, Fase ${fase_id}...`);
    const itensDaApi = await buscarItensPorFase(mundo_id, fase_id);

    if (itensDaApi.length === 0) {
        console.error(`Nenhum item encontrado para a fase. Verifique o backend.`);
        setEstadoJogo("erro");
        return;
    }

    setTempoInicioFase(Date.now());
    setDicasTotaisUsadas(0);
    setTempoDecorridoParaScore(0);
    setPersonagemPos({ x: 100, y: 0, vy: 0 });
    setColisaoAtiva(false);
    
    const screenWidth = window.innerWidth;
    const totalWorldWidth = itensDaApi.length * 400;

    setFrutas(itensDaApi.map((item, index) => ({
        id: item.id,
        nome: item.resposta.toUpperCase(),
        imgSrc: item.imagem_url,
        dica1: item.dica1,
        dica2: item.dica2,
        x: screenWidth + 200 + (index * 400),
        y: (window.innerHeight * (ALTURA_CHAO / 100) - 150) - (index % 2 === 0 ? 0 : 80),
        initialY: (window.innerHeight * (ALTURA_CHAO / 100) - 150) - (index % 2 === 0 ? 0 : 80),
        pega: false,
        totalWorldWidth: totalWorldWidth,
    })));
    setEstadoJogo("jogando");
    setIsConfigOpen(false);
    setIsFeedbackOpen(false);
  }, [mundo_id, fase_id]);
    
  useEffect(() => {
    if (!id_jogador) {
      navigate("/");
    } else {
        inicializarFase();
    }
  }, [id_jogador, navigate, inicializarFase]);

  // --- CONTROLES ---
  useEffect(() => {
    const handleKeyDown = (e) => setTeclasPressionadas(prev => ({ ...prev, [e.key]: true }));
    const handleKeyUp = (e) => setTeclasPressionadas(prev => ({ ...prev, [e.key]: false }));
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // --- LÓGICA DO PUZZLE E JOGO ---
  const handlePegarFruta = useCallback((fruta) => {
    setItemEmJogo({ ...fruta, timestampInicio: Date.now() });
    setDicaExibida("Arraste as letras para formar a palavra!");
    setDicasDisponiveis([]);
    setPuzzleAtual({
      fruta: fruta,
      letrasGrid: gerarLetrasPuzzle(fruta.nome),
      slotsResposta: Array(fruta.nome.length).fill(null),
    });
    setIsPuzzleOpen(true);
  }, []);

  const handleAcertoPuzzle = () => {
    // A única responsabilidade agora é marcar a fruta como 'pega' e liberar o bloqueio.
    setFrutas(prevFrutas =>
      prevFrutas.map(f =>
        f.id === puzzleAtual.fruta.id ? { ...f, pega: true } : f
      )
    );
    setIsPuzzleOpen(false);
    setColisaoAtiva(false);
    setItemEmJogo(null);
    setDicaExibida("Parabéns! Continue coletando as outras frutas.");
  };

  // ✅ SOLUÇÃO: useEffect para verificar a condição de vitória de forma declarativa
  useEffect(() => {
      // Se não houver frutas no estado ou se o jogo não estiver rodando, não faz nada
      if (frutas.length === 0 || estadoJogo !== "jogando") {
          return;
      }
      // Verifica se TODAS as frutas no array de estado têm a propriedade `pega: true`
      const todasPegas = frutas.every(fruta => fruta.pega);
      // Se todas foram pegas, conclui a fase
      if (todasPegas) {
          handleConcluirFase();
      }
  }, [frutas, estadoJogo]); // Roda sempre que o estado `frutas` muda

  // --- GAME LOOP ---
  const gameLoop = useCallback(() => {
    if (estadoJogo !== "jogando" || isPuzzleOpen) {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
      return;
    }
    setPersonagemPos(prevPos => {
      let { x, y, vy } = prevPos;
      if (teclasPressionadas['ArrowLeft']) x -= VELOCIDADE_PERSONAGEM;
      if (teclasPressionadas['ArrowRight']) x += VELOCIDADE_PERSONAGEM;
      vy += GRAVIDADE;
      y += vy;
      const chao = window.innerHeight * (ALTURA_CHAO / 100) - 50;
      if (y > chao) { y = chao; vy = 0; }
      if (teclasPressionadas['ArrowUp'] && y === chao) { vy = -FORCA_PULO; }
      if (x < 0) x = 0;
      if (x > window.innerWidth - 50) x = window.innerWidth - 50;
      return { x, y, vy };
    });
    setFrutas(frutasAtuais => frutasAtuais.map(fruta => {
      if (!fruta.pega) {
          fruta.x -= VELOCIDADE_FRUTAS;
          fruta.y = fruta.initialY + (Math.sin(animationFrameRef.current / 30 + fruta.id) * 10);
          if (fruta.x < -100) {
              fruta.x += fruta.totalWorldWidth;
          }
      }
      return fruta;
    }));
    for (const fruta of frutas) {
      if (!fruta.pega && !colisaoAtiva) {
        const pRect = { x: personagemPos.x, y: personagemPos.y, width: 50, height: 50 };
        const fRect = { x: fruta.x, y: fruta.y, width: 50, height: 50 };
        if (pRect.x < fRect.x + fRect.width && pRect.x + pRect.width > fRect.x &&
            pRect.y < fRect.y + fRect.height && pRect.y + pRect.height > fRect.y) {
          setColisaoAtiva(true);
          handlePegarFruta(fruta);
          break;
        }
      }
    }
    animationFrameRef.current++;
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [estadoJogo, isPuzzleOpen, teclasPressionadas, personagemPos, frutas, handlePegarFruta, colisaoAtiva]);

  useEffect(() => {
    gameLoopRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(gameLoopRef.current);
  }, [gameLoop]);

  const handleDragStart = (e, letraObj, origem, index) => {
    e.dataTransfer.setData('letraData', JSON.stringify({ ...letraObj, origem, index }));
  };

  const handleDropLetra = (e, indexSlot) => {
    e.preventDefault();
    const letraArrastada = JSON.parse(e.dataTransfer.getData('letraData'));
    setPuzzleAtual(prev => {
        const novasLetrasGrid = [...prev.letrasGrid];
        const novosSlots = [...prev.slotsResposta];
        const letraExistenteNoSlot = novosSlots[indexSlot];
        novosSlots[indexSlot] = { id: letraArrastada.id, letra: letraArrastada.letra };
        if (letraArrastada.origem === 'grid') {
            const indexNaGrid = novasLetrasGrid.findIndex(l => l && l.id === letraArrastada.id);
            if (indexNaGrid > -1) novasLetrasGrid[indexNaGrid] = null;
        } else {
            novosSlots[letraArrastada.index] = null;
        }
        if (letraExistenteNoSlot) {
            const indexOriginal = novasLetrasGrid.findIndex(l => l && l.id === letraExistenteNoSlot.id);
            if(indexOriginal > -1) {
                 novasLetrasGrid[indexOriginal] = letraExistenteNoSlot;
            } else {
                const primeiroVazio = novasLetrasGrid.findIndex(l => l === null);
                if(primeiroVazio > -1) novasLetrasGrid[primeiroVazio] = letraExistenteNoSlot;
            }
        }
        const todosPreenchidos = novosSlots.every(slot => slot !== null);
        if (todosPreenchidos) {
            const palavraFormada = novosSlots.map(l => l.letra).join('');
            if (palavraFormada === prev.fruta.nome) {
                setTimeout(() => handleAcertoPuzzle(), 200);
            } else {
                setPuzzleError(true);
                setTimeout(() => setPuzzleError(false), 500); 
            }
        }
        return { ...prev, letrasGrid: novasLetrasGrid, slotsResposta: novosSlots };
    });
  };

  const handleDropNoGrid = (e) => {
    e.preventDefault();
    const letraArrastada = JSON.parse(e.dataTransfer.getData('letraData'));
    if (letraArrastada.origem !== 'slot') return;
    setPuzzleAtual(prev => {
        const novasLetrasGrid = [...prev.letrasGrid];
        const novosSlots = [...prev.slotsResposta];
        const indexOriginal = novasLetrasGrid.findIndex(l => l && l.id === letraArrastada.id);
        if (indexOriginal > -1) {
            novasLetrasGrid[indexOriginal] = { id: letraArrastada.id, letra: letraArrastada.letra };
            novosSlots[letraArrastada.index] = null;
        }
        return { ...prev, letrasGrid: novasLetrasGrid, slotsResposta: novosSlots };
    });
  };

  // --- LÓGICA DE FASE ---
  const handleTempoTick = (tempoMs) => {
    setTempoExibido(formatTime(tempoMs, 'ms'));
    setTempoDecorridoParaScore(tempoMs);
  };
  const handleItemTempoTick = (tempoMs) => {
    setTempoDoItemExibido(formatTime(tempoMs, 'ms'));
  };
  const handleDicaLiberada = (nivelDica, itemId) => {
    const item = itemEmJogo;
    if (!item || item.id !== itemId) return;
    const dicaTexto = nivelDica === 1 ? item.dica1 : item.dica2;
    if (dicaTexto) {
      setDicaExibida(dicaTexto);
      setDicasTotaisUsadas(prev => prev + 1);
    }
  };

  const handleConcluirFase = useCallback(() => {
    if (estadoJogo === "finalizado") return;
    const tempoFinalMs = Date.now() - tempoInicioFase;
    handleFaseTermina({ tempoFinalMs });
  }, [estadoJogo, tempoInicioFase]);
  
  const handleFaseTermina = async ({ tempoFinalMs, motivo }) => {
    if (estadoJogo === "finalizado") return;
    setEstadoJogo("finalizado");
    const tempoFinalSegundos = Math.floor(tempoFinalMs / 1000);
    let estrelas = 0;
    let title = "Tempo Esgotado!";
    let proximaMeta = "Tente novamente para conseguir ao menos uma estrela!";
    if (motivo !== 'tempo_esgotado') {
        if (tempoFinalSegundos <= TEMPO_3_ESTRELAS) { estrelas = 3; title = "Excelente!"; proximaMeta = "Você alcançou a pontuação máxima!"; }
        else if (tempoFinalSegundos <= TEMPO_2_ESTRELAS) { estrelas = 2; title = "Muito Bom!"; proximaMeta = `Para 3 estrelas, termine em ${formatTime(TEMPO_3_ESTRELAS, 's')}.`; }
        else if (tempoFinalSegundos <= TEMPO_1_ESTRELA) { estrelas = 1; title = "Bom Trabalho!"; proximaMeta = `Para 2 estrelas, termine em ${formatTime(TEMPO_2_ESTRELAS, 's')}.`; }
        if (dicasTotaisUsadas > LIMITE_DICAS) { estrelas = Math.max(0, estrelas - 1); }
    }
    try {
        await salvarProgresso(id_jogador, mundo_id, fase_id, estrelas, tempoFinalSegundos);
    } catch (error) { console.error("Falha ao salvar o progresso:", error); }
    setResultadoFinal({
        title, estrelas, tempoConclusao: tempoFinalSegundos, proximaMeta,
        aprendizado: "Você aprendeu a soletrar os nomes das frutas!"
    });
    setIsFeedbackOpen(true);
  };

  const handlePausar = () => setEstadoJogo(estadoJogo === 'jogando' ? 'pausado' : 'jogando');
  const handleRetry = () => inicializarFase();
  const handleAvancar = () => navigate(`/fase-${proxima_fase_id}`, { state: { id_jogador } });
  const handleVoltarAoMapa = () => navigate("/mapa-do-jogo", { state: { id_jogador } });

  if (estadoJogo === "carregando") { return <div style={{color: "white"}}>Carregando fase...</div>; }
  if (estadoJogo === "erro") { return <div style={{color: "white"}}>Ocorreu um erro ao carregar a fase. Tente voltar ao mapa.</div>; }

  return (
    <section className="level-section">
      {estadoJogo === "jogando" && (
        <Cronometro
          tempoInicioFase={tempoInicioFase}
          limiteTempoFase={TEMPO_1_ESTRELA * 1000}
          onTempoTick={handleTempoTick}
          onFaseTermina={(resultado) => handleFaseTermina({ ...resultado, motivo: 'tempo_esgotado' })}
          itemAtual={itemEmJogo}
          onDicaLiberada={handleDicaLiberada}
          onItemTempoTick={handleItemTempoTick}
        />
      )}
      <div className="level-container">
        <img src="./level-1-background.svg" alt="fundo-de-floresta" className="level-1-bg" />
        <div className="clouds-wrapper"><img src="./clouds.svg" alt="nuvens" className="clouds" /><img src="./clouds.svg" alt="nuvens" className="clouds delay" /></div>
        <div className="trees-wrapper"><img src="./trees-transparent.svg" alt="pinheiros" className="pines" /><img src="./trees-transparent.svg" alt="pinheiros" className="pines delay" /></div>
        <div className="chao"></div>
        <Personagem pos={personagemPos} />
        {frutas.map(fruta => !fruta.pega && <Fruta key={fruta.id} fruta={fruta} />)}
      </div>
      <header>
        <button className="level-settings-btn" onClick={() => setIsConfigOpen(true)}><img src="/Settings.svg" alt="Configurações" /></button>
        <ScoreDisplay tempoDecorridoMs={tempoDecorridoParaScore} dicasTotaisUsadas={dicasTotaisUsadas} />
        <div className="timer"><img src="./timer.svg" alt="Cronômetro" /><p className="seconds">{tempoExibido}</p></div>
      </header>
      <Modal isOpen={isPuzzleOpen} title="Qual o nome da fruta?" onClose={() => {}} variant="puzzle">
        <div className="puzzle-container">
          <div className="fruit-slots">
            <img src={puzzleAtual.fruta?.imgSrc} alt={puzzleAtual.fruta?.nome} className="puzzle-fruta-img" />
            <div className={`puzzle-slots-resposta ${puzzleError ? 'error' : ''}`} onDragOver={(e) => e.preventDefault()}>
              {puzzleAtual.slotsResposta.map((letraObj, index) => (
                <div key={index} className="slot-resposta" onDrop={(e) => handleDropLetra(e, index)}>
                  {letraObj && (
                    <div className="letra-arrastavel" draggable onDragStart={(e) => handleDragStart(e, letraObj, 'slot', index)}>
                      {letraObj.letra}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="puzzle-letras-grid" onDragOver={(e) => e.preventDefault()} onDrop={handleDropNoGrid}>
            {puzzleAtual.letrasGrid.map((letraObj, index) => (
              <div key={letraObj?.id || index} className="slot-grid">
                {letraObj && (
                  <div className={`letra-arrastavel letra-arrastavel-${index + 1}`} draggable onDragStart={(e) => handleDragStart(e, letraObj, 'grid', index)}>
                    {letraObj.letra}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="balao-dicas">
            <img src="./baloon.svg" alt="" className="baloon" />
            <p id="hint-text">{dicaExibida}</p>
          </div>
        </div>
      </Modal>
      <Modal isOpen={isConfigOpen} onClose={() => setIsConfigOpen(false)} title="Pausa" variant="config">
        <div className="btn-level-grid">
          <button className="btn map-btn" onClick={handleVoltarAoMapa}><div></div>🏠</button>
          <button className="btn stop-btn" onClick={handlePausar}><div></div>{estadoJogo === 'pausado' ? '▶' : '⏸'}</button>
          <button className="btn retry-btn" onClick={handleRetry}><div></div>↩</button>
          <button className="btn help-btn" onClick={() => navigate('/ajuda')}><div></div> ajuda</button>
          <button className="btn skip-btn" onClick={() => setIsConfigOpen(false)}><div></div>fechar</button>
        </div>
      </Modal>
      <Modal isOpen={isFeedbackOpen} onClose={handleVoltarAoMapa} title={resultadoFinal.title} variant="feedback">
        <div className="feedback-content">
          <div className="feedback-stats">
            <p className="time-status">Seu tempo: <span>{formatTime(resultadoFinal.tempoConclusao, 's')}</span></p>
            <ScoreDisplay starsEarned={resultadoFinal.estrelas} />
            <p>{resultadoFinal.proximaMeta}</p>
          </div>
          <div className="feedback-info"><p>{resultadoFinal.aprendizado}</p></div>
          <div className="feedback-actions">
            <button className="btn map-btn" onClick={handleVoltarAoMapa}><div></div>🏠</button>
            <button className="btn retry-btn" onClick={handleRetry}><div></div>↩</button>
            {resultadoFinal.estrelas > 0 && fase_id < 5 && (
            <button className="btn next-level-btn" onClick={handleAvancar}><div></div>Avançar</button>)}
          </div>
        </div>
      </Modal>
    </section>
  );
}

export default Fase4;