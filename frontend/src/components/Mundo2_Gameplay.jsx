import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/Fase.css";
import Modal from "./Modal.jsx";
import Cronometro from "./Cronometro.jsx";
import ScoreDisplay from './ScoreDisplay.jsx';
import PuzzleTroca from './PuzzleTroca.jsx';
import { buscarItensPorFase } from "../services/apiItensFase.js";

// --- Constantes de Configuração do Jogo ---
const TEMPO_3_ESTRELAS = 60;
const TEMPO_2_ESTRELAS = 180;
const TEMPO_1_ESTRELA = 300;
const LIMITE_DICAS = 15;
const POSICAO_PONTA_VARA = { x: 850, y: 100 }; // Ponto de origem da linha

// --- Função Utilitária ---
const formatTime = (timeInMs) => {
    const totalSeconds = Math.floor(timeInMs / 1000);
    const min = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
    const sec = String(totalSeconds % 60).padStart(2, "0");
    return `${min}:${sec}`;
};

// --- Componentes de UI (Filhos) ---

const VaraDePesca = ({ mousePos }) => {
    const deltaX = mousePos.x - POSICAO_PONTA_VARA.x;
    const deltaY = mousePos.y - POSICAO_PONTA_VARA.y;

    const distancia = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const angulo = Math.atan2(deltaY, deltaX) * (180 / Math.PI) - 90;

    return (
        <div className="vara-container">
            {/* A Linha */}
            <div
                className="linha-pesca"
                style={{
                    height: `${distancia}px`,
                    transform: `rotate(${angulo}deg)`,
                }}
            />
        </div>
    );
};

const Bebida = ({ bebida, onClick }) => (
    <img
        src={bebida.imgSrc}
        className="bebida-flutuante"
        style={{ left: `${bebida.x}%`, animationDelay: `${bebida.delay}s` }}
        alt={bebida.nome}
        onClick={() => onClick(bebida)}
    />
);

// --- Componente Principal da Fase ---
function Mundo2_Gameplay({ jogador, onFaseCompleta }) {
    const navigate = useNavigate();
    const { mundoId, faseId } = useParams();
    const gameAreaRef = useRef(null);

    const [estadoJogo, setEstadoJogo] = useState("carregando");
    const [tempo, setTempo] = useState({ inicio: Date.now(), decorrido: 0 });
    const [dicasUsadas, setDicasUsadas] = useState(0);
    const [bebidas, setBebidas] = useState([]);
    const [puzzle, setPuzzle] = useState({ isOpen: false, item: null });
    const [dicaExibida, setDicaExibida] = useState("Troque as letras para formar a palavra!");
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isConfigOpen, setIsConfigOpen] = useState(false);

    const handleMouseMove = useCallback((e) => {
        if (estadoJogo !== 'jogando' || puzzle.isOpen) return;
        const rect = gameAreaRef.current?.getBoundingClientRect() || { top: 0, left: 0 };
        setMousePos({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        });
    }, [estadoJogo, puzzle.isOpen]);

    const finalizarFase = useCallback((motivo = 'concluido') => {
        if (estadoJogo === "finalizado") return;
        setEstadoJogo("finalizado");

        const tempoFinalSegundos = Math.floor(tempo.decorrido / 1000);
        let estrelas = 0;

        if (motivo !== 'tempo_esgotado') {
            if (tempoFinalSegundos <= TEMPO_3_ESTRELAS) estrelas = 3;
            else if (tempoFinalSegundos <= TEMPO_2_ESTRELAS) estrelas = 2;
            else if (tempoFinalSegundos <= TEMPO_1_ESTRELA) estrelas = 1;

            if (dicasUsadas > LIMITE_DICAS) {
                estrelas = Math.max(0, estrelas - 1);
            }
        }
        onFaseCompleta({ estrelas, tempoConclusao: tempoFinalSegundos });
    }, [estadoJogo, tempo.decorrido, dicasUsadas, onFaseCompleta]);

    const inicializarFase = useCallback(async () => {
        setEstadoJogo("carregando");
        try {
            const itensDaApi = await buscarItensPorFase(parseInt(mundoId), parseInt(faseId));
            if (!itensDaApi?.length) throw new Error("Nenhum item encontrado.");

            setBebidas(itensDaApi.map((item, index) => ({
                id: item.id,
                nome: item.resposta.toUpperCase(),
                imgSrc: item.imagem_url,
                dica1: item.dica1,
                dica2: item.dica2,
                x: 20 + (index * 25),
                delay: Math.random() * 5,
                pega: false,
            })));
            
            setTempo({ inicio: Date.now(), decorrido: 0 });
            setDicasUsadas(0);
            setPuzzle({ isOpen: false, item: null });
            setIsConfigOpen(false);
            setEstadoJogo("jogando");
        } catch (error) {
            console.error("Erro ao inicializar fase:", error);
            setEstadoJogo("erro");
        }
    }, [mundoId, faseId]);

    const handlePescarBebida = useCallback((bebida) => {
        if (estadoJogo !== 'jogando') return;
        setEstadoJogo("pausado");
        setPuzzle({ isOpen: true, item: { ...bebida, timestampInicio: Date.now() } });
    }, [estadoJogo]);

    const handleAcertoPuzzle = useCallback(() => {
        if (!puzzle.item) return;
        setBebidas(prev => prev.map(b => b.id === puzzle.item.id ? { ...b, pega: true } : b));
        setPuzzle({ isOpen: false, item: null });
        setDicaExibida("Troque as letras para formar a palavra!");
        setEstadoJogo("jogando");
    }, [puzzle.item]);
    
    const handleDicaLiberada = useCallback((nivelDica, itemId) => {
        if (!puzzle.item || puzzle.item.id !== itemId) return;
        const dicaTexto = nivelDica === 1 ? puzzle.item.dica1 : puzzle.item.dica2;
        if(dicaTexto) {
            setDicaExibida(dicaTexto);
            setDicasUsadas(prev => prev + 1);
        }
    }, [puzzle.item]);

    const handlePausar = useCallback(() => {
        setEstadoJogo(prev => (prev === 'jogando' ? 'pausado' : 'jogando'));
        setIsConfigOpen(false);
    }, []);

    useEffect(() => {
        if (!jogador) navigate("/");
        else inicializarFase();
    }, [jogador, navigate, inicializarFase]);
    
    useEffect(() => {
        if (estadoJogo === "jogando" && bebidas.length > 0 && bebidas.every(b => b.pega)) {
            finalizarFase('concluido');
        }
    }, [bebidas, estadoJogo, finalizarFase]);

    if (estadoJogo === "carregando") return <div className="loading-screen">Carregando...</div>;
    if (estadoJogo === "erro") return <div className="error-screen">Erro ao carregar a fase.</div>;

    return (
        <section className="level-section" onMouseMove={handleMouseMove} ref={gameAreaRef}>
            <header>
                <button className="level-settings-btn" onClick={() => setIsConfigOpen(true)}>
                    <img src="/Settings.svg" alt="Configurações" />
                </button>
                <ScoreDisplay tempoDecorridoMs={tempo.decorrido} dicasTotaisUsadas={dicasUsadas} />
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
                    itemAtual={puzzle.item}
                    onDicaLiberada={handleDicaLiberada}
                />
            )}
            
            <div className="level-container-mundo2">
                <img src="/level-2-background.svg" alt="Fundo da fase 2" className="level-bg-mundo2" />
                <VaraDePesca mousePos={mousePos} />
                <div className="agua">
                    {bebidas.filter(b => !b.pega).map(bebida => (
                        <Bebida key={bebida.id} bebida={bebida} onClick={handlePescarBebida} />
                    ))}
                </div>
            </div>

            <Modal isOpen={puzzle.isOpen} 
            title="Qual o nome da bebida?" 
            variant="puzzle"
            contentClassName="mundo-2-puzzle-content"
            modalBgClassName="mundo-2-puzzle-bg"
            >
                {puzzle.item && (
                    <div className="puzzle-container">
                        <img src={puzzle.item.imgSrc} alt={puzzle.item.nome} className="puzzle-bebida-img" />
                        <PuzzleTroca palavraCorreta={puzzle.item.nome} onComplete={handleAcertoPuzzle} />
                        <div className="balao-dicas">
                            <img src="/baloon.svg" alt="balão de dica" className="baloon" />
                            <p id="hint-text">{dicaExibida}</p>
                        </div>
                    </div>
                )}
            </Modal>

            <Modal isOpen={isConfigOpen} onClose={() => setIsConfigOpen(false)} title="Pausa" variant="config">
                <div className="btn-level-grid">
                    <button className="btn map-btn" onClick={() => navigate("/mapa-do-jogo", { state: { jogador, mundoId } })}>🏠</button>
                    <button className="btn stop-btn" onClick={handlePausar}>{estadoJogo === 'pausado' ? '▶' : '⏸'}</button>
                    <button className="btn retry-btn" onClick={inicializarFase}>↩</button>
                    <button className="btn help-btn" onClick={() => navigate('/ajuda')}>ajuda</button>
                    <button className="btn skip-btn" onClick={() => setIsConfigOpen(false)}>fechar</button>
                </div>
            </Modal>
        </section>
    );
}

export default Mundo2_Gameplay;