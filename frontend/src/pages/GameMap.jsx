import React, { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/GameMap.css";
import Modal from "../components/Modal";
import ScoreDisplay from "../components/ScoreDisplay";
import { buscarFaseAtual, buscarEstrelas } from "../services/apiProgresso";
import { verificarAcessoFase } from "../services/apiFases";
import { mundos } from "../data/mundoData";

function GameMap() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { jogador, mundo_id = 1 } = location.state || {};

  const dadosMundo = mundos[mundo_id] || mundos[1];
  const levels = [1, 2, 3, 4, 5];

  const [starsPerLevel, setStarsPerLevel] = useState({});
  const [faseMaisAlta, setFaseMaisAlta] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isWorldConfigOpen, setIsWorldConfigOpen] = useState(false);
  const [indiceHistoria, setIndiceHistoria] = useState(0);
  const [mostrarHistoria, setMostrarHistoria] = useState(!sessionStorage.getItem(`historia_mundo_${mundo_id}_vista`));
  
  // NOVO ESTADO: Armazena o nível de desbloqueio dos mundos
  const [mundosDesbloqueados, setMundosDesbloqueados] = useState({ 1: true });

  // MUDANÇA: A lógica foi movida para um useCallback para ser usada no useEffect
  const buscarDadosDoJogador = useCallback(async () => {
    if (!jogador || !jogador.id) return;

    // Busca o progresso do mundo atual (visível no mapa)
    const faseAtual = await buscarFaseAtual(jogador.id, mundo_id);
    setFaseMaisAlta(faseAtual);

    const newStars = {};
    for (const level of levels) {
      newStars[level] = await buscarEstrelas(jogador.id, mundo_id, level);
    }
    setStarsPerLevel(newStars);

    // Busca o progresso de TODOS os mundos para o modal de seleção
    const statusMundos = { 1: true }; // Mundo 1 é sempre desbloqueado
    for (const idMundo in mundos) {
        if (idMundo > 1) {
            const faseMaxMundoAnterior = await buscarFaseAtual(jogador.id, idMundo - 1);
            // Um mundo é considerado concluído se a fase atual for maior que 5.
            if (faseMaxMundoAnterior > 5) {
                statusMundos[idMundo] = true;
            }
        }
    }
    setMundosDesbloqueados(statusMundos);

  }, [jogador, mundo_id]);

  useEffect(() => {
    if (!jogador || !jogador.id) {
      navigate("/");
      return;
    }
    buscarDadosDoJogador();
  }, [jogador, navigate, mundo_id, buscarDadosDoJogador]);

  const handleLevelClick = async (level) => {
    try {
      const resultado = await verificarAcessoFase(jogador.id, mundo_id, level);
      if (resultado?.permitido) {
        navigate(`/mundo/${mundo_id}/fase/${level}`, { state: { jogador } });
      } else {
        setModalMessage(resultado.mensagem || "Você ainda não pode acessar esta fase.");
        setIsModalOpen(true);
      }
    } catch (error) {
        console.error("Erro ao verificar acesso à fase:", error);
        setModalMessage("Não foi possível verificar o acesso à fase. Tente novamente.");
        setIsModalOpen(true);
    }
  };

  const handleWorldChange = (novoMundoId) => {
    navigate('/mapa-do-jogo', { state: { jogador, mundo_id: novoMundoId } });
    setIsWorldConfigOpen(false);
  };

  const handleProximoDialogo = () => {
    if (indiceHistoria < dadosMundo.historia.length - 1) {
      setIndiceHistoria(indiceHistoria + 1);
    } else {
      sessionStorage.setItem(`historia_mundo_${mundo_id}_vista`, 'true');
      setMostrarHistoria(false);
    }
  };

  const totalStars = Object.values(starsPerLevel).reduce((a, b) => a + b, 0);
  const maxStars = levels.length * 3;

  return (
    <section className="map-section">
      {/* Tela da História (agora dinâmica) */}
      {mostrarHistoria && dadosMundo.historia && (
        <div className="historia-overlay">
          <div className="historia-container">
            <img
              src={dadosMundo.historia[indiceHistoria].imagem}
              alt="Cena da história"
              className="historia-imagem"
            />
            <p className="historia-dialogo">
              {dadosMundo.historia[indiceHistoria].dialogo}
            </p>
            <button className="historia-btn" onClick={handleProximoDialogo}>
              {indiceHistoria < dadosMundo.historia.length - 1 ? "Próximo →" : "Jogar!"}
            </button>
          </div>
        </div>
      )}

      <div className="map-container">
        <img src={dadosMundo.mapa.imagem} alt={`Mapa do ${dadosMundo.nome}`} className="map"/>

        <div className="greeting">
          <h1>Olá, {jogador?.nome || "Jogador"}!</h1>
          <div className="stars-count">
            <p>{totalStars} / {maxStars}</p>
            <img src="/stars-count.svg" alt="tabua-de-madeira-com-estrelas" />
          </div>
        </div>

        <button className="settings-btn-right" onClick={() => setIsConfigOpen(true)}>
          <div></div>
          <img src="/Settings.svg" alt="Configurações" />
        </button>

        <button className="world-btn-right" onClick={() => setIsWorldConfigOpen(true)}>
          <div></div>
          <img src="/World.svg" alt="Configurações" />
        </button>


        <div className="levels-container">
          {levels.map((level) => {
            const isLocked = level > faseMaisAlta;
            return (
              <button
                key={level}
                onClick={() => handleLevelClick(level)}
                className={`level level-${level} ${isLocked ? 'locked' : ''}`}
              >
                <ScoreDisplay
                  starsEarned={starsPerLevel[level]}
                  variant="map"
                />
                <p>{level}</p>
                <img src="/level-button.svg" alt={`Botão fase ${level}`} />
              </button>
            );
          })}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        variant="faseInfo"
      >
        <p>{modalMessage}</p>
      </Modal>

      <Modal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        variant="config"
      >
        <div className="btn-grid">
          <button className="btn music-btn"> <div></div> música</button>
          <button className="btn effect-btn"> <div></div> efeitos</button>
          <button className="btn help-btn" onClick={() => navigate('/ajuda')}> <div></div> ajuda</button>
        </div>
      </Modal>

      <Modal
        isOpen={isWorldConfigOpen}
        onClose={() => setIsWorldConfigOpen(false)}
        variant="worldConfig"
      >
        <div className="btn-grid-world">
           {Object.keys(mundos).map(id => (
            <button 
              key={id}
              className={`btn-world mundo-${id}-btn`}
              onClick={() => handleWorldChange(parseInt(id))}
              disabled={!mundosDesbloqueados[id]}
            >
              <div></div> {mundos[id].nome}
            </button>
          ))}
        </div>
      </Modal>
    </section>
  );
}

export default GameMap;
