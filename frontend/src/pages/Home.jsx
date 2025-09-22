import React, { useState } from "react";
import "../styles/Home.css";
import { useNavigate } from "react-router-dom";
import Modal from "../components/Modal.jsx";
import { buscarJogador, criarJogador } from "../services/apiJogadores.js";
import { verificarProgressoAtivo, iniciarNovoJogo } from "../services/apiProgresso.js";

function Home() {
  const navigate = useNavigate();
  const [modalStep, setModalStep] = useState(0); // 0: Fechado, 1: Opções, 2: Nome
  const [isConfigOpen, setIsConfigOpen] = useState("")
  const [nomeJogador, setNomeJogador] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isNewGame, setIsNewGame] = useState(false);

  const handleStart = () => setModalStep(1);

  const handleChoice = (isNew) => {
    setIsNewGame(isNew);
    setModalStep(2);
  };

  const handleLoginOrCreate = async () => {
    if (nomeJogador.trim() === "") {
      setErrorMessage("Por favor, digite seu nome");
      return;
    }
    setIsLoading(true);
    setErrorMessage("");
    
    try {
      let jogador = await buscarJogador(nomeJogador).catch(async (err) => {
        if (err.message.includes("Jogador não encontrado")) {
          return await criarJogador(nomeJogador);
        }
        throw err;
      });

      if (isNewGame) {
        await iniciarNovoJogo(jogador.id);
      }
      navigate("/mapa-do-jogo", { state: { jogador } });

    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    if (isLoading) return;
    setModalStep(0);
    setErrorMessage("");
    setNomeJogador("");
  };


  return (
    <section className="home-section">
        <div className={`home-container ${modalStep > 0 ? "blur" : ""}`}>
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

        <button className="settings-btn" onClick={() => setIsConfigOpen(true)}>
          <div></div>
          <img src="/Settings.svg" alt="Configurações" />
        </button>

        <button className="start-btn" onClick={handleStart}>
          <div></div>
          Começar
        </button>
      </div>

      <Modal isOpen={modalStep === 1} 
      onClose={closeModal} 
      hideBackground={true}>
        <div className="choice-buttons">
          <button className="btn-choice new-game" onClick={() => handleChoice(true)}>
            Novo Jogo
          </button>
          <button className="btn-choice continue-game" onClick={() => handleChoice(false)}>
            Continuar Jogo
          </button>
        </div>
      </Modal>
      
      <Modal
        isOpen={modalStep === 2}
        onClose={closeModal}
        variant="default"
      >
        <p>Digite seu nome </p>
        <input
          type="text"
          value={nomeJogador}
          placeholder="Ex: Matheus"
          className="input-name"
          onChange={(e) => setNomeJogador(e.target.value)}
          disabled={isLoading}
        />
        <button onClick={handleLoginOrCreate} className="next-btn" disabled={isLoading}>
          <div></div>
          {isLoading ? "Carregando..." : "Continuar"}
        </button>
        {errorMessage && <p className="modal-message">{errorMessage}</p>}
      </Modal>

      <Modal
        isOpen={isConfigOpen}
        onClose={closeModal}
        variant="config"
      >
        <div className="btn-grid">
          <button className="btn music-btn"> <div></div> música</button>
          <button className="btn effect-btn"> <div></div> efeitos</button>
          <button className="btn help-btn" onClick={() => navigate('/ajuda')}> <div></div> ajuda</button>
          <button className="btn skip-btn" onClick={() => setIsConfigOpen(false)}> <div></div> fechar</button>
        </div>
      </Modal>
    </section>
  );
}

export default Home;