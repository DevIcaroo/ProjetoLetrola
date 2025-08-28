import React, { useEffect, useState } from "react";
import { useLocation, useNavigate} from "react-router-dom";
import axios from "axios";
import "../styles/GameMap.css";

function GameMap() {
  const location = useLocation();
  const { playerName } = location.state || {};
  const navigate = useNavigate();
  const levels = [1, 2, 3, 4, 5];

  const verificarFase = async (playerName, level) => {
    try {
      const res = await axios.get(`http://localhost:3000/fase/${playerName}/${level}`);
      return res.data; // { permitido: true/false, fase: {...} }
    } catch (err) {
      if (err.response?.status === 403) {
        alert(err.response.data.mensagem); // mostra mensagem do backend
      } else {
        console.error("Erro ao verificar fase:", err);
      }
      return null;
    }
  };

  const handleLevelClick = async (level) => {
    const resultado = await verificarFase(playerName, level);
    if (resultado?.permitido) {
      navigate(`/fase${level}`, { state: { playerName, levelData: resultado.fase } });
    }
  };

  useEffect(() => {
    if (!playerName) {
      navigate("/");
    }
  }, [playerName, navigate]);


  return (
    <section className="map-section">
      <div className="map-container">
        <img src="/map.svg" alt="ilustração-do-mapa" className="map" />


        <div className="greeting">
          {/* Condicional para exibir o nome do jogador*/}
          <h1>Olá, {playerName || "Jogador"}! </h1>
          <div className="stars-count">
            <p>0 / 15</p>
            <img src="/stars-count.svg" alt="tabua-de-madeira-com-estrelas"/>
          </div>
          
        </div>

        <div className="levels-container">
          {levels.map((level) => (

            <button key={level} onClick={() => handleLevelClick(level)} className={`level level-${level}`}>

            <p>{level}</p>

            <img src="/level-button.svg" alt={`Botão fase ${level}`} />

            </button>
          ))}
        </div>

      </div>
    </section>
  );
}

export default GameMap;