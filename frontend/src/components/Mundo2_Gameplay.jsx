import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/Fase.css";
import Modal from "./Modal.jsx";
import Cronometro from "./Cronometro.jsx";
import ScoreDisplay from './ScoreDisplay.jsx';
import { buscarItensPorFase } from "../services/apiItensFase.js";

const GRAVIDADE = 0.8;
const FORCA_PULO = 18;
const VELOCIDADE_PERSONAGEM = 8;
const ALTURA_CHAO = 87;
const VELOCIDADE_BEBIDAS = 2;
const TEMPO_3_ESTRELAS = 60;
const TEMPO_2_ESTRELAS = 180;
const TEMPO_1_ESTRELA = 300;
const LIMITE_DICAS = 15;

const formatTime = (time, unit = 'ms') => {
  const totalSeconds = unit === 'ms' ? Math.floor(time / 1000) : time;
  const min = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const sec = String(totalSeconds % 60).padStart(2, "0");
  return `${min}:${sec}`;
};

const gerarLetrasEmbaralhadas = (palavra) => {
  const letrasPalavra = palavra.split('').map((letra, index) => ({ id: `letra-${index}`, letra, fixa: false }));
  return letrasPalavra.sort(() => Math.random() - 0.5);
};

const Personagem = ({ pos, direcao }) => (
    <img 
        src="/bear-run.gif" 
        className={`personagem-gif ${direcao === 'esquerda' ? 'virado-esquerda' : ''}`} 
        style={{ left: `${pos.x}px`, top: `${pos.y}px` }}
        alt="Personagem Urso Correndo"
    />
);

const Bebida = ({ bebida }) => ( 
    <img src={bebida.imgSrc} className="bebida" style={{ left: `${bebida.x}px`, top: `${bebida.y}px` }} alt={bebida.nome} /> 
);

function Mundo2_Gameplay({ jogador, onFaseCompleta }) {
    const navigate = useNavigate();
    const { mundoId, faseId } = useParams();

    const mundo_id = parseInt(mundoId);
    const fase_id = parseInt(faseId);

    const [estadoJogo, setEstadoJogo] = useState("carregando");
    const [tempoInicioFase, setTempoInicioFase] = useState(Date.now());
    const [tempoDecorridoParaScore, setTempoDecorridoParaScore] = useState(0);
    const [dicasTotaisUsadas, setDicasTotaisUsadas] = useState(0);
    const [isConfigOpen, setIsConfigOpen] = useState(false);
    const [tempoExibido, setTempoExibido] = useState("00:00");
    const [personagemPos, setPersonagemPos] = useState({ x: 100, y: 0, vy: 0 });
    const [direcaoPersonagem, setDirecaoPersonagem] = useState('direita');
    const [teclasPressionadas, setTeclasPressionadas] = useState({});
    const [bebidas, setBebidas] = useState([]);
    const [isPuzzleOpen, setIsPuzzleOpen] = useState(false);
    const [puzzleAtual, setPuzzleAtual] = useState({ 
        bebida: null, 
        palavraOriginal: '',
        slotsResposta: []
    });
    const [puzzleError, setPuzzleError] = useState(false);
    const [colisaoAtiva, setColisaoAtiva] = useState(false);
    const [itemEmJogo, setItemEmJogo] = useState(null);
    const [dicaExibida, setDicaExibida] = useState("Troque as letras para formar a palavra!");
    
    const gameLoopRef = useRef();

    const handleFaseTermina = useCallback(({ tempoFinalMs, motivo }) => {
        if (estadoJogo === "finalizado") return;
        setEstadoJogo("finalizado");
        
        const tempoFinalSegundos = Math.floor(tempoFinalMs / 1000);
        let estrelas = 0;
        if (motivo !== 'tempo_esgotado') {
            if (tempoFinalSegundos <= TEMPO_3_ESTRELAS) estrelas = 3;
            else if (tempoFinalSegundos <= TEMPO_2_ESTRELAS) estrelas = 2;
            else if (tempoFinalSegundos <= TEMPO_1_ESTRELA) estrelas = 1;
            if (dicasTotaisUsadas > LIMITE_DICAS) estrelas = Math.max(0, estrelas - 1);
        }
        onFaseCompleta({ estrelas, tempoConclusao: tempoFinalSegundos });
    }, [estadoJogo, dicasTotaisUsadas, onFaseCompleta]);

    const inicializarFase = useCallback(async () => {
        const itensDaApi = await buscarItensPorFase(mundo_id, fase_id);
        if (itensDaApi.length === 0) {
            throw new Error("Nenhum item encontrado para a fase.");
        }
        setTempoInicioFase(Date.now());
        setDicasTotaisUsadas(0);
        setTempoDecorridoParaScore(0);
        setPersonagemPos({ x: 100, y: 0, vy: 0 });
        setDirecaoPersonagem('direita');
        setColisaoAtiva(false);
        const screenWidth = window.innerWidth;
        const totalWorldWidth = itensDaApi.length * 400;
        setBebidas(itensDaApi.map((item, index) => ({
            id: item.id,
            nome: item.resposta.toUpperCase(),
            imgSrc: item.imagem_url,
            dica1: item.dica1,
            dica2: item.dica2,
            x: screenWidth + 200 + (index * 400),
            y: (window.innerHeight * (ALTURA_CHAO / 100) - 150) - (index % 2 === 0 ? 0 : 80),
            pega: false,
            totalWorldWidth: totalWorldWidth,
        })));
        setEstadoJogo("jogando");
        setIsConfigOpen(false);
    }, [mundo_id, fase_id]);

    const handleConcluirFase = useCallback(() => {
        if (estadoJogo === "finalizado") return;
        const tempoFinalMs = Date.now() - tempoInicioFase;
        handleFaseTermina({ tempoFinalMs });
    }, [estadoJogo, tempoInicioFase, handleFaseTermina]);

    useEffect(() => {
        if (!jogador) {
            navigate("/");
        } else {
            inicializarFase().catch(error => { setEstadoJogo("erro"); });
        }
    }, [jogador, navigate, inicializarFase]);

    useEffect(() => {
        if (bebidas.length > 0 && estadoJogo === "jogando") {
            if (bebidas.every(bebida => bebida.pega)) {
                handleConcluirFase();
            }
        }
    }, [bebidas, estadoJogo, handleConcluirFase]);

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

    const handlePegarBebida = useCallback((bebida) => {
        setItemEmJogo({ ...bebida, timestampInicio: Date.now() });
        setDicaExibida("Troque as letras para formar o nome da bebida!");
        const letrasEmbaralhadas = gerarLetrasEmbaralhadas(bebida.nome);
        setPuzzleAtual({
            bebida: bebida,
            palavraOriginal: bebida.nome,
            slotsResposta: letrasEmbaralhadas,
        });
        setIsPuzzleOpen(true);
    }, []);
    
    const handleAcertoPuzzle = useCallback(() => {
        setBebidas(prevBebidas =>
            prevBebidas.map(b =>
                b.id === puzzleAtual.bebida.id ? { ...b, pega: true } : b
            )
        );
        setIsPuzzleOpen(false);
        setColisaoAtiva(false);
        setItemEmJogo(null);
        setDicaExibida("Parabéns! Continue coletando as outras bebidas.");
    }, [puzzleAtual.bebida]);

    const verificarEFixarLetrasCorretas = useCallback((slots) => {
        const palavraArray = puzzleAtual.palavraOriginal.split('');
        const novosSlots = slots.map((slot, index) => {
            if (slot && !slot.fixa && slot.letra === palavraArray[index]) {
                return { ...slot, fixa: true };
            }
            return slot;
        });
        
        if (novosSlots.every(slot => slot.fixa)) {
            setTimeout(handleAcertoPuzzle, 500);
        }
        return novosSlots;
    }, [puzzleAtual.palavraOriginal, handleAcertoPuzzle]);

    const gameLoop = useCallback(() => {
        if (estadoJogo !== "jogando" || isPuzzleOpen) {
            gameLoopRef.current = requestAnimationFrame(gameLoop);
            return;
        }
        setPersonagemPos(prevPos => {
            let { x, y, vy } = prevPos;
            if (teclasPressionadas['ArrowLeft']) x -= VELOCIDADE_PERSONAGEM;
            if (teclasPressionadas['ArrowRight']) x += VELOCIDADE_PERSONAGEM;
            setDirecaoPersonagem(teclasPressionadas['ArrowLeft'] ? 'esquerda' : 'direita');
            vy += GRAVIDADE;
            y += vy;
            const chao = window.innerHeight * (ALTURA_CHAO / 100) - 50;
            if (y > chao) { y = chao; vy = 0; }
            if (teclasPressionadas['ArrowUp'] && y === chao) vy = -FORCA_PULO;
            if (x < 0) x = 0;
            if (x > window.innerWidth - 50) x = window.innerWidth - 50;
            return { x, y, vy };
        });
        setBebidas(bebidasAtuais => bebidasAtuais.map(bebida => {
            if (!bebida.pega) {
                bebida.x -= VELOCIDADE_BEBIDAS;
                if (bebida.x < -100) bebida.x += bebida.totalWorldWidth;
            }
            return bebida;
        }));
        for (const bebida of bebidas) {
            if (!bebida.pega && !colisaoAtiva) {
                const pRect = { x: personagemPos.x, y: personagemPos.y, width: 50, height: 50 };
                const bRect = { x: bebida.x, y: bebida.y, width: 50, height: 50 };
                if (pRect.x < bRect.x + bRect.width && pRect.x + pRect.width > bRect.x &&
                    pRect.y < bRect.y + bRect.height && pRect.y + pRect.height > bRect.y) {
                    setColisaoAtiva(true);
                    handlePegarBebida(bebida);
                    break;
                }
            }
        }
        gameLoopRef.current = requestAnimationFrame(gameLoop);
    }, [estadoJogo, isPuzzleOpen, teclasPressionadas, personagemPos.x, personagemPos.y, bebidas, colisaoAtiva, handlePegarBebida]);

    useEffect(() => {
        gameLoopRef.current = requestAnimationFrame(gameLoop);
        return () => cancelAnimationFrame(gameLoopRef.current);
    }, [gameLoop]);

    const handleDragStart = (e, indexSlotOrigem) => { 
        if (puzzleAtual.slotsResposta[indexSlotOrigem]?.fixa) {
            e.preventDefault();
            return;
        }
        e.dataTransfer.setData('slotIndexData', indexSlotOrigem.toString());
        e.dataTransfer.effectAllowed = 'move';
    };
    
    const handleDropLetra = (e, indexSlotDestino) => {
        e.preventDefault();
        const indexOrigem = parseInt(e.dataTransfer.getData('slotIndexData'));
        if (indexOrigem === indexSlotDestino) return;

        const slotOrigem = puzzleAtual.slotsResposta[indexOrigem];
        const slotDestino = puzzleAtual.slotsResposta[indexSlotDestino];

        if (slotOrigem?.fixa || slotDestino?.fixa) {
            setPuzzleError(true);
            setTimeout(() => setPuzzleError(false), 800);
            return;
        }

        const novosSlots = [...puzzleAtual.slotsResposta];
        novosSlots[indexOrigem] = slotDestino;
        novosSlots[indexSlotDestino] = slotOrigem;

        const slotsAtualizados = verificarEFixarLetrasCorretas(novosSlots);
        setPuzzleAtual(prev => ({ ...prev, slotsResposta: slotsAtualizados }));
    };

    const handleTempoTick = (tempoMs) => {
        setTempoExibido(formatTime(tempoMs, 'ms'));
        setTempoDecorridoParaScore(tempoMs);
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
    
    const handleRetry = () => inicializarFase();
    const handlePausar = () => setEstadoJogo(estadoJogo === 'jogando' ? 'pausado' : 'jogando');

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
                />
            )}
            <div className="level-container">
                <img src="/level-2-background.svg" alt="fundo do mundo 2" className="level-1-bg" />
                <div className="chao"></div>
                <Personagem pos={personagemPos} direcao={direcaoPersonagem} />
                {bebidas.map(bebida => !bebida.pega && <Bebida key={bebida.id} bebida={bebida} />)}
            </div>
            <header>
                <button className="level-settings-btn" onClick={() => setIsConfigOpen(true)}><img src="/Settings.svg" alt="Configurações" /></button>
                <ScoreDisplay tempoDecorridoMs={tempoDecorridoParaScore} dicasTotaisUsadas={dicasTotaisUsadas} />
                <div className="timer"><img src="/timer.svg" alt="Cronômetro" /><p className="seconds">{tempoExibido}</p></div>
            </header>
            <Modal isOpen={isPuzzleOpen} title="Qual o nome da bebida?" variant="puzzle">
                <div className="puzzle-container">
                    <img src={puzzleAtual.bebida?.imgSrc} alt={puzzleAtual.bebida?.nome} className="puzzle-fruta-img" />
                    <div className={`puzzle-slots-troca ${puzzleError ? 'error' : ''}`}>
                        {puzzleAtual.slotsResposta.map((slot, index) => (
                            <div
                                key={slot.id}
                                className={`slot-letra ${slot.fixa ? 'locked' : ''}`}
                                draggable={!slot.fixa}
                                onDragStart={(e) => handleDragStart(e, index)}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => handleDropLetra(e, index)}
                            >
                                {slot.letra}
                            </div>
                        ))}
                    </div>
                    <div className="balao-dicas">
                        <img src="/baloon.svg" alt="balão de dica" className="baloon" />
                        <p id="hint-text">{dicaExibida}</p>
                    </div>
                </div>
            </Modal>
            <Modal isOpen={isConfigOpen} onClose={() => setIsConfigOpen(false)} title="Pausa" variant="config">
                <div className="btn-level-grid">
                    <button className="btn map-btn" onClick={() => navigate("/mapa-do-jogo", { state: { jogador, mundo_id } })}><div></div>🏠</button>
                    <button className="btn stop-btn" onClick={handlePausar}><div></div>{estadoJogo === 'pausado' ? '▶' : '⏸'}</button>
                    <button className="btn retry-btn" onClick={handleRetry}><div></div>↩</button>
                    <button className="btn help-btn" onClick={() => navigate('/ajuda')}><div></div> ajuda</button>
                    <button className="btn skip-btn" onClick={() => setIsConfigOpen(false)}><div></div>fechar</button>
                </div>
            </Modal>
        </section>
    );
};

export default Mundo2_Gameplay;