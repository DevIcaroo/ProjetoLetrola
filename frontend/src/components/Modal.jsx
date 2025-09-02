import React from "react";
import "../styles/Modal.css";

function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <img src="./modal.svg" alt="ilustracao-modal" className="modal-bg"/>

        <div className="modal-content"onClick={(e) => e.stopPropagation()}>

          {title && (<h2 className="modal-title">{title}</h2>)}
          
          <div className="modal-body">
            {children}
          </div>

          <button onClick={onClose} className="close-btn">
            Fechar
          </button>

        </div>
    </div>
  );
}

export default Modal;
