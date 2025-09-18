import React, { useEffect, useState } from "react";
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
  
  // MUDANÇA: Recebe o objeto 'jogador' e o 'mundo_id' do estado da navegação.
  // Se 'mundo_id' não for passado, ele assume o valor padrão 1.
  const { jogador, mundo_id = 1 } = location.state || {};

  // Carrega os dados do mundo correto. Se o mundo não existir, usa o mundo 1.
  const dadosMundo = mundos[mundo_id] || mundos[1];
  const levels = [1, 2, 3, 4, 5];

  const [starsPerLevel, setStarsPerLevel] = useState({});
  const [faseMaisAlta, setFaseMaisAlta] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [indiceHistoria, setIndiceHistoria] = useState(0);
  // Controla se a história deve ser mostrada. O 'sessionStorage' evita que ela reapareça ao voltar de uma fase.
  const [mostrarHistoria, setMostrarHistoria] = useState(!sessionStorage.getItem(`historia_mundo_${mundo_id}_vista`));

  useEffect(() => {
    if (!jogador || !jogador.id) {
      navigate("/");
      return;
    }

    const buscarDadosDoJogador = async () => {
      // Usa jogador.id e o mundo_id dinâmico para as chamadas de API
      const faseAtual = await buscarFaseAtual(jogador.id, mundo_id);
      setFaseMaisAlta(faseAtual);

      const newStars = {};
      for (const level of levels) {
        newStars[level] = await buscarEstrelas(jogador.id, mundo_id, level);
      }
      setStarsPerLevel(newStars);
    };

    buscarDadosDoJogador();
    // MUDANÇA: Adicionado 'mundo_id' ao array de dependências para recarregar os dados quando o mundo mudar.
  }, [jogador, navigate, mundo_id]);


  const handleLevelClick = async (level) => {
    try {
      const resultado = await verificarAcessoFase(jogador.id, mundo_id, level);
      if (resultado?.permitido) {
        // MUDANÇA: A navegação agora usa o 'mundo_id' dinâmico.
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

  const handleProximoDialogo = () => {
    if (indiceHistoria < dadosMundo.historia.length - 1) {
      setIndiceHistoria(indiceHistoria + 1);
    } else {
      // Marca a história como vista no sessionStorage para não mostrar novamente na mesma sessão.
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
