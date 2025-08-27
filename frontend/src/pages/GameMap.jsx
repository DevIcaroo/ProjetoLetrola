import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/GameMap.css";

function GameMap() {
  const location = useLocation();
  const { playerName } = location.state || {};
  const navigate = useNavigate();


  return (
    <section className="map-section">
      <div className="map-container">
        <img src="/map.svg" alt="ilustração-do-mapa" className="map" />


        <div className="greeting">
          {/* Condicional para exibir o nome do jogador ou um valor padrão */}
          <h1>Olá, {playerName}! </h1>
          <div className="stars-count">
            <p>0 / 15</p>
            <img src="/stars-count.svg" alt="tabua-de-madeira-com-estrelas"/>
          </div>
          
        </div>

        <div className="levels-container">
            <div onClick={() => navigate("/fase1")} className="level level-1">
                <p>1</p>
                <img src="/level-button.svg" alt="" />
            </div>

            <div onClick={() => navigate("/fase2")} className="level level-2">
                <p>2</p>
                <img src="/level-button.svg" alt="" />
            </div>

            <div onClick={() => navigate("/fase3")} className="level level-3">
                <p>3</p>
                <img src="/level-button.svg" alt="" />
            </div>

            <div onClick={() => navigate("/fase4")} className="level level-4">
                <p>4</p>
                <img src="/level-button.svg" alt="" />
            </div>

            <div onClick={() => navigate("/fase5")} className="level level-5">
                <p>5</p>
                <img src="/level-button.svg" alt="" />
            </div>

        </div>

      </div>
    </section>
  );
}

export default GameMap;