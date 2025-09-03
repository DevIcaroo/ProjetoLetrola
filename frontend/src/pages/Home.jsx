import React, { useState } from "react";
import "../styles/Home.css";
import { useNavigate } from "react-router-dom";
import Modal from "../components/Modal.jsx";

function Home() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);       // Modal do nome
  const [isConfigOpen, setIsConfigOpen] = useState(false);     // Modal de configurações
  const [id_jogador, setId_jogador] = useState("");            // ✅ nome do jogador
  const [showError, setShowError] = useState(false);

  const handleStart = () => {
    setIsModalOpen(true);
  };

  const handleContinue = () => {
    if (id_jogador.trim() === "") {
      setShowError(true); // exibe mensagem de erro
    } else {
      setShowError(false); // limpa erro
      setIsModalOpen(false);

      // Exemplo: navegar para o mapa
      navigate("/mapa-do-jogo", { state: { id_jogador } });
    }
  };

  return (
    <section className="home-section">
      <div
        className={`home-container ${isModalOpen || isConfigOpen ? "blur" : ""}`}
      >
        <img src="/background forest.svg" alt="plano-de-fundo" className="home-bg" />
        <img src="/logo.svg" alt="logo-letrola" className="logo" />
        <img src="./monkey.svg" alt="macaco" className="monkey" />
        <img src="./light.svg" alt="luz" className="light" />

        <div className="cube-container">
          <img src="/pink cube.svg" alt="" className="pink" />
          <img src="/green cube.svg" alt="" className="green" />
          <img src="/blue cube.svg" alt="" className="blue" />
          <img src="/yellow cube.svg" alt="" className="yellow" />
          <img src="/red cube.svg" alt="" className="red" />
        </div>

        {/* Botão de Configurações */}
        <button className="settings-btn" onClick={() => setIsConfigOpen(true)}>
          <div></div>
          <img src="/Settings.svg" alt="Configurações" />
        </button>

        <button className="start-btn" onClick={handleStart}>
          <div></div>
          Começar
        </button>
      </div>

      {/* Modal para nome do jogador */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Quem é você?"
        variant="default"
      >
        <p>Digite seu nome</p>
        <input
          type="text"
          value={id_jogador} // ✅ usando id_jogador
          placeholder="Ex: Matheus"
          className="input-name"
          onChange={(e) => setId_jogador(e.target.value)} // ✅ atualiza id_jogador
        />

        <button onClick={handleContinue} className="next-btn">
          <div></div>
          Continuar
        </button>

        {showError && <p className="modal-message">Por favor, digite seu nome</p>}
      </Modal>

      {/* Modal de Configurações */}
      <Modal
        isOpen={isConfigOpen}
        title="Configurações"
        variant="config"
      >
        <div className="btn-grid">
          <button className="btn music-btn"> <div></div> música</button>
          <button className="btn effect-btn"> <div></div> efeitos</button>
          <button className="btn help-btn"> <div></div> ajuda</button>
          <button className="btn skip-btn" onClick={() => setIsConfigOpen(false)}> <div></div> fechar</button>
        </div>
      </Modal>
    </section>
  );
}

export default Home;
