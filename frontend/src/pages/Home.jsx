import React, { useState } from "react";
import "../styles/Home.css";
import { useNavigate } from "react-router-dom";
import Modal from "../components/Modal.jsx";
import { buscarJogador, criarJogador } from "../services/apiJogadores.js";

function Home() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [nomeJogador, setNomeJogador] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleStart = () => {
    setIsModalOpen(true);
    setErrorMessage("");
    setNomeJogador("");
  };

  const handleContinue = async () => {
    if (nomeJogador.trim() === "") {
      setErrorMessage("Por favor, digite seu nome");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    let jogador;
    try {
      // Tenta buscar o jogador para obter o objeto { id, nome }
      jogador = await buscarJogador(nomeJogador);
      console.log("Jogador encontrado, continuando...");
    } catch (error) {
      // Se não encontrar, cria um novo jogador para obter o objeto { id, nome }
      if (error.message.includes("Jogador não encontrado")) {
        try {
          console.log("Jogador não encontrado, criando um novo...");
          jogador = await criarJogador(nomeJogador);
        } catch (createError) {
          setErrorMessage(createError.message);
          setIsLoading(false);
          return;
        }
      } else {
        // Lida com outros erros (ex: nome já em uso, falha de rede)
        setErrorMessage(error.message);
        setIsLoading(false);
        return;
      }
    }
    
    // MUDANÇA: Navega passando o objeto 'jogador' completo ({ id, nome }) no estado.
    // Isso garante que as próximas telas terão acesso tanto ao ID quanto ao nome.
    navigate("/mapa-do-jogo", { state: { jogador } });
    setIsLoading(false);
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

        <button className="settings-btn" onClick={() => setIsConfigOpen(true)}>
          <div></div>
          <img src="/Settings.svg" alt="Configurações" />
        </button>

        <button className="start-btn" onClick={handleStart}>
          <div></div>
          Começar
        </button>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => !isLoading && setIsModalOpen(false)}
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
        <button onClick={handleContinue} className="next-btn" disabled={isLoading}>
          <div></div>
          {isLoading ? "Carregando..." : "Continuar"}
        </button>
        {errorMessage && <p className="modal-message">{errorMessage}</p>}
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
          <button className="btn skip-btn" onClick={() => setIsConfigOpen(false)}> <div></div> fechar</button>
        </div>
      </Modal>
    </section>
  );
}

export default Home;