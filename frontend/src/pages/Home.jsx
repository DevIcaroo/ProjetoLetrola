import React, { useState } from "react";
import "../styles/Home.css";
import { useNavigate } from "react-router-dom";
import Modal from "../components/Modal.jsx";

function Home() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");

  const handleStart = () => {
    setIsModalOpen(true);
  };

  const handleContinue = () => {
    if (name.trim() !== "") {
      navigate("/mapa-do-jogo", { state: { id_jogador: name } });
    } else {
      alert("Por favor, insira seu nome.");
    }
  };

  return (
    <section className="home-section">
      <div className={`home-container ${isModalOpen ? "blur" : ""}`}>
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

        <button className="settings-btn">
          <img src="/Settings.svg" alt="Configurações" />
        </button>

        <button className="start-btn" onClick={handleStart}>
          Começar
        </button>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Quem é você?">
        <p>Digite seu nome</p>
        <input
          type="text"
          placeholder="Ex: Matheus"
          className="input-name"
          onChange={(e) => setName(e.target.value)}
        />

        <button onClick={handleContinue} className="next-btn">
          Continuar
        </button>
      </Modal>
    </section>
  );
}

export default Home;
