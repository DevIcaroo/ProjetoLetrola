import React from "react";
import "../styles/GameMap.css";

function GameMap() {

  return (
    <section className="map-section">
      <div className="map-container">
        <img src="/map.svg" alt="ilustração-do-mapa" className="map" />

        <div className="levels-container">
            <div className="level level-1">
                <p>1</p>
                <img src="/level-button.svg" alt="" />
            </div>

            <div className="level level-2">
                <p>2</p>
                <img src="/level-button.svg" alt="" />
            </div>

            <div className="level level-3">
                <p>3</p>
                <img src="/level-button.svg" alt="" />
            </div>

            <div className="level level-4">
                <p>4</p>
                <img src="/level-button.svg" alt="" />
            </div>

            <div className="level level-5">
                <p>5</p>
                <img src="/level-button.svg" alt="" />
            </div>

        </div>

      </div>
    </section>
  );
}

export default GameMap;