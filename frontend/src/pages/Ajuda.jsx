import React from "react";
import { useNavigate } from "react-router-dom";
import { useAudio } from "../hooks/useAudio"; // Importar o hook de áudio
import "../styles/Ajuda.css";

function Ajuda() {
  const navigate = useNavigate();
  const { playSound } = useAudio(); // Usar o hook de áudio

  // Função para voltar com som
  const handleVoltar = () => {
    playSound('click'); // Tocar som de clique
    navigate(-1); // Navega uma página para trás no histórico
  };

  return (
    <section className="ajuda-section">
      <div className="ajuda-container">
        <img src="/logo.svg" alt="Logo Letrola" className="ajuda-logo" />

        <h1>Olá, Aventureiro!</h1>
        <p className="ajuda-subtitulo">Precisa de uma mãozinha? Veja como jogar cada mundo!</p>

        {/* Container para os cards */}
        <div className="ajuda-cards-container">

          {/* Card Mundo 1 */}
          <div className="ajuda-card mundo-1">
            <h2>Mundo 1: Floresta das Frutas</h2>
            <p>
              Use as <strong>setas do teclado</strong> (⬅️ e ➡️) para correr e a <strong>seta para cima</strong> (⬆️) para pular. Toque nas frutas!
            </p>
            <p>
              No desafio, arraste as letras coloridas para os espaços cinzas e forme o nome da fruta.
            </p>
          </div>

          {/* Card Mundo 2 */}
          <div className="ajuda-card mundo-2">
            <h2>Mundo 2: Floresta Gelada</h2>
            <p>
              Use o <strong>mouse</strong> para mover a vara de pescar. O anzol seguirá o cursor.
            </p>
            <p>
              <strong>Clique</strong> com o anzol sobre as bebidas para pescá-las. No desafio, clique em duas letras para trocá-las de lugar e formar o nome.
            </p>
          </div>

          {/* Card Mundo 3 */}
          <div className="ajuda-card mundo-3">
            <h2>Mundo 3: Lagoa da Diversão</h2>
            <p>
              Complete as palavras cruzadas! <strong>Clique em uma dica</strong> na lista à esquerda para ativar a palavra na grade.
            </p>
            <p>
              Use o <strong>teclado para digitar</strong> as letras. Use as <strong>setas</strong> para navegar ou clique duas vezes em uma letra comum para mudar a direção.
            </p>
          </div>

          {/* Card Mundo 4 */}
          <div className="ajuda-card mundo-4">
            <h2>Mundo 4: Savana Mágica </h2>
            <p>
              Encontre as palavras escondidas! A lista está à esquerda. Elas podem estar na horizontal ou vertical.
            </p>
            <p>
              <strong>Clique e arraste</strong> o mouse sobre as letras na grade para selecionar uma palavra. Solte o botão para confirmar.
            </p>
          </div>

        </div> 

        {/* --- Dicas e Estrelas (Geral) --- */}
        <div className="ajuda-geral">
          <div className="ajuda-topico">
            <h2>E se eu não souber a palavra? </h2>
            <p>
              Nos Mundos 1 e 2, dicas aparecerão se você demorar. No Mundo 3, as dicas estão sempre visíveis!
            </p>
          </div>

          <div className="ajuda-topico">
            <h2>Para que servem as estrelas? </h2>
            <p>
              Quanto mais rápido você for, mais estrelas ganha (até 3)! Colete estrelas para desbloquear novos mundos!
            </p>
          </div>
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