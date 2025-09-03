import React from "react";
import "../styles/Modal.css";

function Modal({ isOpen, onClose, title, children, variant = "default" }) {
  if (!isOpen) return null;

  // Seleciona a imagem de fundo de acordo com o tipo de modal
  const backgrounds = {
    default: "./modal.svg", // modal geral (nome/aviso)
    config: "./modal-yellow.svg", // configurações
    feedback: "./modal-green.svg", // feedback de fase
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <img
        src={backgrounds[variant]}
        alt="fundo-modal"
        className="modal-bg"
      />

      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {title && <h2 className="modal-title">{title}</h2>}

        <div className="modal-body">{children}</div>

        <button onClick={onClose} className="close-btn">
          Fechar
        </button>
      </div>
    </div>
  );
}

export default Modal;
