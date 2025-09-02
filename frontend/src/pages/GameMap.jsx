import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/GameMap.css";
import Modal from "../components/Modal";

function GameMap() {
  const location = useLocation();
  const { id_jogador } = location.state || {};
  const navigate = useNavigate();
  const levels = [1, 2, 3, 4, 5];
  const [starsPerLevel, setStarsPerLevel] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false); // 🔹 controla modal
  const [modalMessage, setModalMessage] = useState("");   // 🔹 mensagem do backend

  const buscarEstrelas = async () => {
    const newStars = {};
    for (const level of levels) {
      try {
        const res = await axios.get(`http://localhost:3000/estrelas/${id_jogador}/${level}`);
        newStars[level] = res.data.estrelas || 0;
      } catch (err) {
        newStars[level] = 0;
        console.error(`Erro ao buscar estrelas da fase ${level}:`, err);
      }
    }
    setStarsPerLevel(newStars);
  };

  const verificarFase = async (id_jogador, level) => {
    try {
      const res = await axios.get(`http://localhost:3000/fase/${id_jogador}/${level}`);
      return res.data;
    } catch (err) {
      if (err.response?.status === 403) {
        setModalMessage(err.response.data.mensagem); // 🔹 abre modal com msg
        setIsModalOpen(true);
      } else {
        console.error("Erro ao verificar fase:", err);
      }
      return null;
    }
  };

  const handleLevelClick = async (level) => {
    const resultado = await verificarFase(id_jogador, level);
    if (resultado?.permitido) {
      navigate(`/fase-${level}`, { state: { id_jogador, levelData: resultado.fase } });
    }
  };

  useEffect(() => {
    if (!id_jogador) {
      navigate("/");
    }
    buscarEstrelas();
  }, [id_jogador, navigate]);

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

        <div className="levels-container">
          {levels.map((level) => (
            <button
              key={level}
              onClick={() => handleLevelClick(level)}
              className={`level level-${level}`}
            >
              <div className="level-stars">
                {"★".repeat(starsPerLevel[level] || 0)}
                {"☆".repeat(3 - (starsPerLevel[level] || 0))}
              </div>
              <p>{level}</p>
              <img src="/level-button.svg" alt={`Botão fase ${level}`} />
            </button>
          ))}
        </div>
      </div>

      {/* 🔹 Modal para mensagens do backend */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Aviso"
      >
        <p>{modalMessage}</p>
      </Modal>
    </section>
  );
}

export default GameMap;
