import React, { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Mundo1_Gameplay from '../components/Mundo1_Gameplay';
import Mundo2_Gameplay from '../components/Mundo2_Gameplay';
import Modal from "../components/Modal.jsx";
import ScoreDisplay from '../components/ScoreDisplay.jsx';
import { salvarProgresso, buscarTotalEstrelas } from "../services/apiProgresso.js";
import { mundos } from "../data/mundoData.js";

// Função para formatar o tempo
const formatTime = (time, unit = 'ms') => {
  const totalSeconds = unit === 'ms' ? Math.floor(time / 1000) : time;
  const min = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const sec = String(totalSeconds % 60).padStart(2, "0");
  return `${min}:${sec}`;
};

// Constantes da fase
const TEMPO_3_ESTRELAS = 60; // em segundos
const MINIMO_ESTRELAS_AVANCAR = 11; // Mínimo de estrelas para desbloquear o próximo mundo

function Fase() {
  const { mundoId, faseId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { jogador } = location.state || {};

  const mundo_id = parseInt(mundoId);
  const fase_id = parseInt(faseId);
  
  // State para o modal de feedback de cada fase
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [resultadoFinal, setResultadoFinal] = useState({ title: "", estrelas: 0, tempoConclusao: 0, proximaMeta: "" });

  // State para o modal de conclusão de mundo
  const [isFimDoMundoOpen, setIsFimDoMundoOpen] = useState(false);
  const [resultadoMundo, setResultadoMundo] = useState({ totalEstrelas: 0, desbloqueado: false, mensagem: "" });
  
  // State para forçar a reinicialização do componente de gameplay
  const [gameKey, setGameKey] = useState(Date.now());

  // Lida com a conclusão de uma fase
  const handleFaseCompleta = useCallback(async (resultado) => {
    try {
        await salvarProgresso(jogador.id, mundo_id, fase_id, resultado.estrelas, resultado.tempoConclusao);
    } catch (error) { 
        console.error("Falha ao salvar o progresso:", error); 
    }

    // Se for a última fase do mundo
    if (fase_id === 5) {
        const totalEstrelasMundo = await buscarTotalEstrelas(jogador.id, mundo_id);
        const desbloqueado = totalEstrelasMundo >= MINIMO_ESTRELAS_AVANCAR;
        
        setResultadoMundo({
            totalEstrelas: totalEstrelasMundo,
            desbloqueado: desbloqueado,
            mensagem: desbloqueado
                ? `Você coletou ${totalEstrelasMundo} estrelas e desbloqueou o próximo mundo!`
                : `Você precisa de pelo menos ${MINIMO_ESTRELAS_AVANCAR} estrelas para avançar. Você conseguiu ${totalEstrelasMundo}. Jogue novamente para conseguir mais estrelas!`
        });
        setIsFimDoMundoOpen(true);
    } else {
        // Se for uma fase normal
        setResultadoFinal({
            title: resultado.estrelas > 0 ? "Fase Concluída!" : "Tempo Esgotado!",
            estrelas: resultado.estrelas,
            tempoConclusao: resultado.tempoConclusao,
            proximaMeta: `Para 3 estrelas, termine em ${formatTime(TEMPO_3_ESTRELAS, 's')}.`
        });
        setIsFeedbackOpen(true);
    }
  }, [jogador, mundo_id, fase_id]);

  // Funções de navegação e controle do modal
  const handleVoltarAoMapa = () => {
        const navState = { jogador, mundo_id };
        if (fase_id === 5) {
            navState.checkWorldCompletion = true;
        }
        setIsFeedbackOpen(false)
        navigate("/mapa-do-jogo", { state: navState });
    };

  const handleAvancar = () => {
    const proxima_fase_id = fase_id + 1;
    setIsFeedbackOpen(false);
    navigate(`/mundo/${mundo_id}/fase/${proxima_fase_id}`, { state: { jogador } });
    setGameKey(Date.now()); // Muda a key para reiniciar o próximo nível
  };

  const handleRetry = () => {
    setIsFeedbackOpen(false);
    setGameKey(Date.now()); // Atualiza a key para forçar a remontagem do componente
  };

  const handleProximoMundo = () => {
    setIsFimDoMundoOpen(false); // Fecha o modal
    const proximo_mundo_id = mundo_id + 1;
    
    // Navega para o mapa, passando o ID do PRÓXIMO mundo no estado
    navigate("/mapa-do-jogo", { 
      state: { jogador, mundo_id: proximo_mundo_id },
      replace: true
    });
  };

  // Renderiza o componente de gameplay correto para o mundo
  const renderGameplay = () => {
    switch (mundo_id) {
      case 1:
        return <Mundo1_Gameplay key={gameKey} jogador={jogador} onFaseCompleta={handleFaseCompleta} />;
      case 2:
        return <Mundo2_Gameplay key={gameKey} jogador={jogador} onFaseCompleta={handleFaseCompleta} />;
      default:
        return <div>Mundo não encontrado!</div>;
    }
  };

  // Redireciona para a home se não houver dados do jogador
  useEffect(() => {
    if (!jogador) {
      navigate('/');
    }
  }, [jogador, navigate]);

  return (
    <div>
      {renderGameplay()}
      
      {/* Modal de Feedback de Fase */}
      <Modal isOpen={isFeedbackOpen} onClose={handleVoltarAoMapa} title={resultadoFinal.title} variant="feedback">
        <div className="feedback-content">
          <div className="feedback-stats">
            <p className="time-status">Seu tempo:
              <span>{formatTime(resultadoFinal.tempoConclusao, 's')}</span>
            </p>
            <ScoreDisplay starsEarned={resultadoFinal.estrelas} />
            <p>{resultadoFinal.proximaMeta}</p>
          </div>
          <div className="feedback-info">
            <p>{mundos[mundo_id]?.mensagemFeedback || "Parabéns, você completou o desafio!"}</p>
          </div>
          <div className="feedback-actions">
            <button className="btn map-btn" onClick={handleVoltarAoMapa}>
              <div></div>
              🏠
            </button>
            <button className="btn retry-btn" onClick={handleRetry}>
              <div></div>
              ↩
            </button>
            {/* Só mostra o botão de avançar se o jogador ganhou estrelas e não é a última fase */}
            {resultadoFinal.estrelas > 0 && fase_id < 5 && (
            <button className="btn next-level-btn" onClick={handleAvancar}>
              <div></div>
              Avançar
            </button>)}
          </div>
        </div>
      </Modal>

      <Modal isOpen={isFimDoMundoOpen} 
      onClose={handleVoltarAoMapa} // Pode reusar a função de voltar ao mapa
      variant="feedback">
        <div className="feedback-content">
          <div className="feedback-stats">
              <p>{resultadoMundo.mensagem}</p>
              {resultadoMundo.desbloqueado && (
                <button className='btn next-level-btn' onClick={handleProximoMundo}>
                  Ir para o próximo mundo
                </button>
              )}
          </div>
        </div>
      </Modal>

    </div>
  );
}

export default Fase;