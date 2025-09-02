import React from "react";
import "../styles/Fase.css";

function Fase1() {
  return (
    <section className="level-section">
      <div className="level-container">
        {/* Fundo fixo */}
        <img
          src="./level-1-background.svg"
          alt="fundo-de-floresta-com-pinheiros-e-gramado"
          className="level-1-bg"
        />

        {/* Nuvens animadas */}
        <div className="clouds-wrapper">
          <img src="./clouds.svg" alt="nuvens" className="clouds" />
          <img src="./clouds.svg" alt="nuvens" className="clouds delay" />
        </div>

        {/* Árvores animadas */}
        <div className="trees-wrapper">
          <img src="./trees-transparent.svg" alt="pinheiros" className="pines" />
          <img src="./trees-transparent.svg" alt="pinheiros" className="pines delay" />
        </div>
      </div>

      <header>
        <div className="timer">
          
        </div>
      </header>
    </section>
  );
}

export default Fase1;
