import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/GameMap.css";
import Modal from "../components/Modal";
import ScoreDisplay from "../components/ScoreDisplay";
import { buscarFaseAtual, buscarEstrelas } from "../services/apiProgresso";
import { verificarAcessoFase } from "../services/apiFases";

function GameMap() {
  const location = useLocation();
  const { id_jogador } = location.state || {};
  const navigate = useNavigate();
  
  const mundo_id = 1; 
  const levels = [1, 2, 3, 4, 5];

  const [starsPerLevel, setStarsPerLevel] = useState({});
  const [faseMaisAlta, setFaseMaisAlta] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  useEffect(() => {
    if (!id_jogador) {
      navigate("/");
      return;
    }

    const buscarDadosDoJogador = async () => {
      // ✅ CORREÇÃO: Passa o mundo_id para a função da API
      const faseAtual = await buscarFaseAtual(id_jogador, mundo_id);
      setFaseMaisAlta(faseAtual);

      const newStars = {};
      for (const level of levels) {
        // ✅ CORREÇÃO: Passa o mundo_id para a função da API
        newStars[level] = await buscarEstrelas(id_jogador, mundo_id, level);
      }
      setStarsPerLevel(newStars);
    };

    buscarDadosDoJogador();
  }, [id_jogador, navigate]);

  const handleLevelClick = async (level) => {
    try {
      // ✅ CORREÇÃO: Passa o mundo_id para a função da API
      const resultado = await verificarAcessoFase(id_jogador, mundo_id, level);
      
      if (resultado?.permitido) {
        navigate(`/fase-${level}`, { state: { id_jogador } });
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

  const totalStars = Object.values(starsPerLevel).reduce((a, b) => a + b, 0);
  const maxStars = levels.length * 3;

  return (
    <section className="map-section">
      <div className="map-container">
        <img src="/map.svg" alt="ilustração-do-mapa" className="map" />

        <div className="greeting">
          <h1>Olá, {id_jogador || "Jogador"}! </h1>
          <div className="stars-count">
            <p>{totalStars} / {maxStars}</p>
            <img src="/stars-count.svg" alt="tabua-de-madeira-com-estrelas" />
          </div>
        </div>

        <button className="settings-btn-right" onClick={() => setIsConfigOpen(true)}>
          <div></div>
          <img src="/Settings.svg" alt="Configurações" />
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
        title="Nível Bloqueado"
      >
        <p>{modalMessage}</p>
      </Modal>

      <Modal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        title="Configurações"
        variant="config"
      >
        <div className="btn-grid">
          <button className="btn music-btn"> <div></div> música</button>
          <button className="btn effect-btn"> <div></div> efeitos</button>
          <button className="btn help-btn" onClick={() => navigate('/ajuda')}> <div></div> ajuda</button>
        </div>
      </Modal>
    </section>
  );
}

export default GameMap;