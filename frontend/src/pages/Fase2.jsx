import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/Fase.css";
import Modal from "../components/Modal.jsx";
import Cronometro from "../components/Cronometro.jsx";
import { salvarProgresso } from "../services/apiProgresso.js"
import ScoreDisplay from '../components/ScoreDisplay.jsx'; // 🔹 Nova importação

// Constantes de tempo para cálculo de estrelas (EM SEGUNDOS)
const TEMPO_1_MIN = 60;
const TEMPO_3_MIN = 180;
const TEMPO_5_MIN = 300;
const LIMITE_DICAS = 15; // Limite de dicas antes de perder estrela

// Função para formatar o tempo de milissegundos para MM:SS
const formatTime = (ms) => {
  const totalSeconds = Math.floor(ms / 1000);
  const min = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const sec = String(totalSeconds % 60).padStart(2, "0");
  return `${min}:${sec}`;
};

function Fase1() {
  const navigate = useNavigate();
  const location = useLocation(); // 🔹 Hook para pegar dados da navegação

  // --- CONTROLE DE ESTADO DO JOGO ---
  const { id_jogador } = location.state || {}; // 🔹 Pega o id_jogador
  const fase_id = 2; // Define o ID desta fase
  const [estadoJogo, setEstadoJogo] = useState("jogando"); // 'jogando', 'pausado', 'finalizado'
  const [tempoInicioFase, setTempoInicioFase] = useState(Date.now());
  const [tempoDecorridoParaScore, setTempoDecorridoParaScore] = useState(0);  const [dicasTotaisUsadas, setDicasTotaisUsadas] = useState(0); // 🔹 Adiciona estado para dicas

  // --- CONTROLE DE UI ---
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [tempoExibido, setTempoExibido] = useState("00:00");
  const [resultadoFinal, setResultadoFinal] = useState({ title: "", message: "" });

  // Se não houver id_jogador, volta para a home para evitar erros
  useEffect(() => {
    if (!id_jogador) {
      console.error("ID do jogador não encontrado, redirecionando para a home.");
      navigate("/");
    }
  }, [id_jogador, navigate]);
  

  // --- CALLBACKS PARA O CRONÔMETRO ---

  const handleTempoTick = (tempoMs) => {
    setTempoExibido(formatTime(tempoMs));
    setTempoDecorridoParaScore(tempoMs)
  };

  // 🔹 IMPLEMENTAÇÃO DA LÓGICA COM BACKEND
  const handleFaseTermina = async ({ tempoFinalMs, motivo }) => {
    if (estadoJogo === "finalizado") return;

    setEstadoJogo("finalizado");
    const tempoFinalSegundos = Math.floor(tempoFinalMs / 1000);

    let estrelas = 0;
    let title = "Tempo Esgotado!";
    let message = "Você não conseguiu concluir a tempo. Tente novamente!";

    if (motivo !== 'tempo_esgotado') {
        // Lógica de cálculo de estrelas 
        if (tempoFinalSegundos <= TEMPO_1_MIN) {
          estrelas = 3;
        } else if (tempoFinalSegundos <= TEMPO_3_MIN) {
          estrelas = 2;
        } else if (tempoFinalSegundos <= TEMPO_5_MIN) {
          estrelas = 1;
        }

        // Redução de estrelas por dicas
        if (dicasTotaisUsadas > LIMITE_DICAS) {
          estrelas = Math.max(0, estrelas - 1);
        }

        // Define a mensagem do modal de acordo com as estrelas
        title = estrelas > 1 ? "Excelente!" : "Bom Trabalho!";
        message = `Você conseguiu ${estrelas} estrela(s)! ${"⭐".repeat(estrelas)}`;
    }
    
    // 🔹 CHAMA A API PARA SALVAR O PROGRESSO NO BACKEND
    try {
      console.log(`Salvando progresso: Jogador ${id_jogador}, Fase ${fase_id}, Estrelas ${estrelas}, Tempo ${tempoFinalSegundos}s`);
      await salvarProgresso(id_jogador, fase_id, estrelas, tempoFinalSegundos);
      console.log("Progresso salvo com sucesso!");
    } catch (error) {
      console.error("Falha ao salvar o progresso:", error);
      // Poderia mostrar uma mensagem de erro para o usuário aqui
    }

    setResultadoFinal({ title, message });
    setIsFeedbackOpen(true);
  };

  // --- FUNÇÕES DE CONTROLE DO JOGO ---
  const handlePausar = () => {
    setEstadoJogo(estadoJogo === 'jogando' ? 'pausado' : 'jogando');
    setIsConfigOpen(false);
  };

  const handleRetry = () => {
    setTempoInicioFase(Date.now());
    setDicasTotaisUsadas(0);
    setEstadoJogo("jogando");
    setIsConfigOpen(false);
    setIsFeedbackOpen(false);
  };

  const handleConcluirFase = () => {
    const tempoDecorrido = Date.now() - tempoInicioFase;
    handleFaseTermina({ tempoFinalMs: tempoDecorrido });
  };
  
  return (
    <section className="level-section">
      {estadoJogo === "jogando" && (
        <Cronometro
          tempoInicioFase={tempoInicioFase}
          limiteTempoFase={TEMPO_5_MIN * 1000} // Limite da fase em milissegundos
          onTempoTick={handleTempoTick}
          onFaseTermina={(resultado) => handleFaseTermina({...resultado, motivo: 'tempo_esgotado'})}
          itemAtual={null} 
          onDicaLiberada={() => setDicasTotaisUsadas(d => d + 1)} // Incrementa dicas
        />
      )}

      <div className="level-container">
        <img src="./level-1-background.svg" alt="fundo-de-floresta" className="level-1-bg" />
        <div className="clouds-wrapper">
          <img src="./clouds.svg" alt="nuvens" className="clouds" />
          <img src="./clouds.svg" alt="nuvens" className="clouds delay" />
        </div>
        <div className="trees-wrapper">
          <img src="./trees-transparent.svg" alt="pinheiros" className="pines" />
          <img src="./trees-transparent.svg" alt="pinheiros" className="pines delay" />
        </div>
      </div>

      <header>
        <button className="level-settings-btn" onClick={() => setIsConfigOpen(true)}>
          <img src="/Settings.svg" alt="Configurações" />
        </button>

        <ScoreDisplay tempoDecorridoMs={tempoDecorridoParaScore} 
        dicasTotaisUsadas={dicasTotaisUsadas}
    /> 

        <div className="timer">
          <img src="./timer.svg" alt="Cronômetro" />
          <p className="seconds">{tempoExibido}</p>
        </div>
      </header>
      
      <button 
        className="timer-btn" 
        onClick={handleConcluirFase} 
        disabled={estadoJogo === 'finalizado'}
      >
        Concluir Fase
      </button>

      <Modal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        title="Pausa"
        variant="config"
      >
        <div className="btn-level-grid">
          <button className="btn map-btn" onClick={() => navigate("/mapa-do-jogo", { state: { id_jogador } })}><div></div>🏠</button>
          <button className="btn stop-btn" onClick={handlePausar}><div></div>{estadoJogo === 'pausado' ? '▶' : '⏸'}</button>
          <button className="btn retry-btn" onClick={handleRetry}><div></div>↩</button>
          <button className="btn help-btn"><div></div>ajuda</button>
          <button className="btn skip-btn" onClick={() => setIsConfigOpen(false)}><div></div>fechar</button>
        </div>
      </Modal>

      <Modal
        isOpen={isFeedbackOpen}
        onClose={() => navigate("/mapa-do-jogo", { state: { id_jogador } })} // Volta para o mapa
        title={resultadoFinal.title}
        variant="feedback"
      >
        <p>{resultadoFinal.message}</p>
        <button className="btn retry-btn" onClick={handleRetry} style={{marginTop: '20px'}}> <div></div>Jogar Novamente</button>
      </Modal>
    </section>
  );
}

export default Fase1;