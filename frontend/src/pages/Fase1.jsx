import React, { useState, useEffect, useRef }from "react";
import "../styles/Fase.css";
import Modal from "../components/Modal.jsx";

function Fase1() {
  const [isConfigOpen, setIsConfigOpen] = useState(false);// Modal de configurações
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((prev) => (prev < 300 ? prev + 1 : prev));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (secs) => {
    const min = String(Math.floor(secs / 60)).padStart(2, "0");
    const sec = String(secs % 60).padStart(2, "0");
    return `${min}:${sec}`;
  };

  const handleTimerButton = () => {
    if (seconds <= 60) {
      alert("muito bom!");
    } else if (seconds <= 180) {
      alert("tá ok!");
    } else if (seconds <= 300) {
      alert("pode melhorar...");
    } else if (seconds = 300) {
      alert("o tempo acabou!");
    }
  };

  // Ref to store interval id
  const intervalRef = useRef(null);

  // Start timer function
  const startTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setSeconds((prev) => (prev < 300 ? prev + 1 : prev));
    }, 1000);
  };

  useEffect(() => {
    startTimer();
    return () => clearInterval(intervalRef.current);
  }, []);

  const handleRetry = () => {
    setSeconds(0);
    startTimer();
  };

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

        {/* Botão de Configurações */}
        <button className="level-settings-btn" onClick={() => setIsConfigOpen(true)}>
          <img src="/Settings.svg" alt="Configurações" />
        </button>

        <div className="timer">
          <img src="./timer.svg" alt="" />
          <p className="seconds">{formatTime(seconds)}</p>
        </div>
        
      </header>

      <button className="timer-btn" onClick={handleTimerButton}>Parar o tempo</button>

       {/* Modal de Configurações */}
      <Modal
        isOpen={isConfigOpen}
        title="Configurações"
        variant="config"
      >
        <div className="btn-level-grid">
          
          <button className="btn map-btn"> <div></div>🏠</button>

          <button className="btn stop-btn"> <div></div>⏸</button>

          <button className="btn retry-btn" onClick={handleRetry} > <div></div>↩</button>

          <button className="btn help-btn"> <div></div> ajuda</button>

          <button className="btn skip-btn" onClick={() => setIsConfigOpen(false)}> <div></div> fechar</button>
        </div>
      </Modal>
    </section>
  );
}

export default Fase1;
