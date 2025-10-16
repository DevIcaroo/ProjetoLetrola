import React, { useState } from 'react';
import { useAudio } from '../hooks/useAudio';
import '../styles/TutorialModal.css';

function TutorialModal({ isOpen, onClose, steps = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { playSound } = useAudio();

  if (!isOpen || steps.length === 0) {
    return null;
  }

  const handleNext = () => {
    playSound('click');
    if (currentIndex < steps.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onClose();
    }
  };

  const currentStep = steps[currentIndex];
  const isLastStep = currentIndex === steps.length - 1;

  // Verifica se o passo atual usa a imagem completa ou o formato antigo (texto + imagem)
  const isFullImageStep = currentStep.image && !currentStep.text;

  return (
    <div className="tutorial-overlay" onClick={handleNext}>
      <div className="tutorial-content" onClick={(e) => e.stopPropagation()}>
        
        {isFullImageStep ? (
          // Novo layout: Apenas a imagem do modal completo
          <img src={currentStep.image} alt="Tutorial passo a passo" className="tutorial-full-image" />
        ) : (
          // Layout antigo para outros mundos (fallback)
          <>
            <img src={currentStep.image} alt="Ilustração do tutorial" className="tutorial-image" />
            <p className="tutorial-text">{currentStep.text}</p>
          </>
        )}

        <button className="tutorial-btn" onClick={handleNext}>
          {isLastStep ? 'Jogar!' : 'Próximo'}
        </button>
      </div>
    </div>
  );
}

export default TutorialModal;