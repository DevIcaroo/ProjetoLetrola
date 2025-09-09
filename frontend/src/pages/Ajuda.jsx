import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Ajuda.css"; // Vamos criar este arquivo de estilo

function Ajuda() {
  const navigate = useNavigate();

  // Função para voltar para a tela anterior
  const handleVoltar = () => {
    navigate(-1); // Navega uma página para trás no histórico
  };

  return (
    <section className="ajuda-section">
      <div className="ajuda-container">
        <img src="/logo.svg" alt="Logo Letrola" className="ajuda-logo" />
        
        <h1>Olá, Aventureiro! 👋</h1>
        <p className="ajuda-subtitulo">Precisa de uma mãozinha? O Macaco Sábio te ajuda!</p>

        <div className="ajuda-topico">
          <h2>Como Jogar? 🤔</h2>
          <p>
            É super fácil! Use as <strong>setas do teclado</strong> (⬅️ e ➡️) para correr pela fase e a <strong>seta para cima</strong> (⬆️) para pular. Seu objetivo é tocar em todas as frutinhas que aparecem na tela!
          </p>
        </div>

        <div className="ajuda-topico">
          <h2>O Quebra-Cabeça das Frutas 🍍</h2>
          <p>
            Quando você pega uma fruta, um desafio aparece! Arraste as letrinhas coloridas para os espaços cinzas para formar o nome da fruta. Se acertar, a fruta é coletada!
          </p>
        </div>
        
        <div className="ajuda-topico">
          <h2>E se eu não souber a palavra? 💡</h2>
          <p>
            Não se preocupe! Se você demorar um pouquinho, o jogo te dá uma <strong>dica</strong> automática para ajudar. Fique de olho no balão de fala!
          </p>
        </div>

        <div className="ajuda-topico">
          <h2>Para que servem as estrelas? ⭐</h2>
          <p>
            Quanto mais rápido você completar a fase, mais estrelas você ganha! Elas mostram para todo mundo como você é um ótimo jogador. Tente conseguir 3 estrelas em todas as fases!
          </p>
        </div>

        <button className="btn-voltar" onClick={handleVoltar}>
          <div></div>
          Voltar para o Jogo
        </button>
      </div>
    </section>
  );
}

export default Ajuda;