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

/*const FRUTAS_DA_FASE = [
  { nome: 'BANANA', imgSrc: '/banana.svg' },
  { nome: 'ABACATE', imgSrc: '/abacate.svg' },
  { nome: 'LARANJA', imgSrc: '/laranja.svg' },
  { nome: 'MAMAO', imgSrc: '/mamao.svg' },
  { nome: 'MANGA', imgSrc: '/manga.svg' },
  { nome: 'ABACAXI', imgSrc: '/abacaxi.svg' },
  { nome: 'UVA', imgSrc: '/uva.svg' },
  { nome: 'MELANCIA', imgSrc: '/melancia.svg' },
  { nome: 'LIMAO', imgSrc: '/limao.svg' },
  { nome: 'COCO', imgSrc: '/coco.svg' },
];*/

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
    let letrasGrid = [...letrasPalavra];
    while (letrasGrid.length < 8) {
        const letraAleatoria = alfabeto[Math.floor(Math.random() * alfabeto.length)];
        if (!letrasGrid.includes(letraAleatoria)) {
            letrasGrid.push(letraAleatoria);
        }
    }
    return letrasGrid.sort(() => Math.random() - 0.5);
};

// --- COMPONENTES DO JOGO ---
const Personagem = ({ pos }) => ( <div className="personagem" style={{ left: `${pos.x}px`, top: `${pos.y}px` }}></div> );
const Fruta = ({ fruta }) => ( <img src={fruta.imgSrc} className="fruta" style={{ left: `${fruta.x}px`, top: `${fruta.y}px` }} alt={fruta.nome} /> );

function Fase1() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id_jogador } = location.state || {};
  const fase_id = 1;
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
    title: "", estrelas: 0, tempoConclusao: 0, proximaMeta: "",
    aprendizado: "Você aprendeu a soletrar os nomes das frutas!"
  });
  const [personagemPos, setPersonagemPos] = useState({ x: 100, y: 0, vy: 0 });
  const [teclasPressionadas, setTeclasPressionadas] = useState({});
  const [frutas, setFrutas] = useState([]);
  const [isPuzzleOpen, setIsPuzzleOpen] = useState(false);
  const [puzzleAtual, setPuzzleAtual] = useState({
    fruta: null, letrasGrid: [], slotsResposta: [],
  });
  const [colisaoAtiva, setColisaoAtiva] = useState(false);

  const gameLoopRef = useRef();
  const animationFrameRef = useRef(0);

  // --- INICIALIZAÇÃO (BUSCAR DADOS NO BANCO) ---
  const inicializarFase = useCallback(async () => {
    console.log(`Buscando itens para a fase ${fase_id}...`);
    const itensDaApi = await buscarItensPorFase(fase_id);

    if (itensDaApi.length === 0) {
        console.error(`Nenhum item encontrado para a fase ${fase_id}. Verifique o backend.`);
        setEstadoJogo("erro"); // Um novo estado para mostrar erro ao jogador
        return;
    }

    setTempoInicioFase(Date.now());
    setDicasTotaisUsadas(0);
    setTempoDecorridoParaScore(0);
    setPersonagemPos({ x: 100, y: 0, vy: 0 });
    setColisaoAtiva(false);
    
    const screenWidth = window.innerWidth;
    const totalWorldWidth = itensDaApi.length * 400;

    // o jogo é montado com as dados do banco
    setFrutas(itensDaApi.map((item, index) => {
        const yBase = window.innerHeight * (ALTURA_CHAO / 100) - 150;
        const yPos = yBase - (index % 2 === 0 ? 0 : 80);
        return {
            id: item.id, // Usa o ID do banco
            nome: item.resposta, // Usa o campo 'resposta'
            imgSrc: item.imagem_url, // Usa o campo 'imagem_url'
            x: screenWidth + 200 + (index * 400),
            y: yPos,
            initialY: yPos,
            pega: false,
            totalWorldWidth: totalWorldWidth,
        }
    }));
    setEstadoJogo("jogando"); // Inicia o jogo após carregar tudo
    setIsConfigOpen(false);
    setIsFeedbackOpen(false);
  }, [fase_id]);

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
    setPuzzleAtual({
      fruta: fruta,
      letrasGrid: gerarLetrasPuzzle(fruta.nome),
      slotsResposta: Array(fruta.nome.length).fill(null),
    });
    setIsPuzzleOpen(true);
  }, []);

  const handleAcertoPuzzle = () => {
    setFrutas(prevFrutas =>
      prevFrutas.map(f =>
        f.id === puzzleAtual.fruta.id ? { ...f, pega: true } : f
      )
    );
    setIsPuzzleOpen(false);
    setColisaoAtiva(false);
  };
  
  useEffect(() => {
      if (frutas.length === 0 || estadoJogo !== "jogando") return;
      const todasPegas = frutas.every(fruta => fruta.pega);
      if (todasPegas) {
          handleConcluirFase();
      }
  }, [frutas, estadoJogo]);

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
  }, 
  [estadoJogo, isPuzzleOpen, teclasPressionadas, personagemPos, frutas, handlePegarFruta, colisaoAtiva]
);

  useEffect(() => {
    gameLoopRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(gameLoopRef.current);
  }, [gameLoop]);

  const handleDropLetra = (e, indexSlot) => {
    e.preventDefault();
    const letraArrastada = JSON.parse(e.dataTransfer.getData('letra'));
    setPuzzleAtual(prev => {
      const novosSlots = [...prev.slotsResposta];
      if (letraArrastada.origem === 'slot') {
          novosSlots[letraArrastada.index] = null;
      }
      novosSlots[indexSlot] = letraArrastada.letra;
      if (!novosSlots.includes(null) && novosSlots.join('') === prev.fruta.nome) {
        handleAcertoPuzzle();
      }
      return { ...prev, slotsResposta: novosSlots };
    });
  };

  // --- LÓGICA DE FASE ---
  const handleTempoTick = (tempoMs) => {
    setTempoExibido(formatTime(tempoMs, 'ms'));
    setTempoDecorridoParaScore(tempoMs);
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
        await salvarProgresso(id_jogador, fase_id, estrelas, tempoFinalSegundos);
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

   if (estadoJogo === "carregando") {
      return <div>Carregando fase...</div>;
  }
  
  if (estadoJogo === "erro") {
      return <div>Ocorreu um erro ao carregar a fase. Tente voltar ao mapa.</div>;
  }

  return (
    <section className="level-section">
      {estadoJogo === "jogando" && (
        <Cronometro
          tempoInicioFase={tempoInicioFase}
          limiteTempoFase={TEMPO_1_ESTRELA * 1000}
          onTempoTick={handleTempoTick}
          onFaseTermina={(resultado) => handleFaseTermina({ ...resultado, motivo: 'tempo_esgotado' })}
          itemAtual={null}
          onDicaLiberada={() => setDicasTotaisUsadas(d => d + 1)}
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
      <Modal isOpen={isPuzzleOpen} onClose={() => {}} title={`Qual é o nome da fruta?`} variant="default">
        <div className="puzzle-container">
            <img src={puzzleAtual.fruta?.imgSrc} alt={puzzleAtual.fruta?.nome} className="puzzle-fruta-img" />
            <div className="puzzle-slots-resposta" onDragOver={(e) => e.preventDefault()}>
                {puzzleAtual.slotsResposta.map((letra, index) => (
                    <div key={index} className="slot-resposta" onDrop={(e) => handleDropLetra(e, index)}>
                        {letra && (
                            <div className="letra-arrastavel" draggable onDragStart={(e) => { e.dataTransfer.setData('letra', JSON.stringify({ letra, index, origem: 'slot' })); }}>
                                {letra}
                            </div>
                        )}
                    </div>
                ))}
            </div>
            <div className="puzzle-letras-grid">
                {puzzleAtual.letrasGrid.map((letra, index) => (
                    <div key={index} className="letra-arrastavel" draggable onDragStart={(e) => { e.dataTransfer.setData('letra', JSON.stringify({ letra, index, origem: 'grid' })); }}>
                        {letra}
                    </div>
                ))}
            </div>
        </div>
      </Modal>
      <Modal isOpen={isConfigOpen} onClose={() => setIsConfigOpen(false)} title="Pausa" variant="config">
        <div className="btn-level-grid">
          <button className="btn map-btn" onClick={handleVoltarAoMapa}><div></div>🏠</button>
          <button className="btn stop-btn" onClick={handlePausar}><div></div>{estadoJogo === 'pausado' ? '▶' : '⏸'}</button>
          <button className="btn retry-btn" onClick={handleRetry}><div></div>↩</button>
          <button className="btn help-btn"><div></div>ajuda</button>
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

export default Fase1;