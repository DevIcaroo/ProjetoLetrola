import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Credits.css';
import { useAudio } from '../hooks/useAudio';

function Credits() {
  const navigate = useNavigate();
  const [creditsFinished, setCreditsFinished] = useState(false);
  const videoRef = useRef(null);
  const { playSound } = useAudio();


  const handleVoltarInicio = () => {
    playSound('click');
    navigate('/');
  };

  // Função chamada quando a animação CSS dos créditos termina
  const handleAnimationEnd = () => {
    setCreditsFinished(true);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  // Tenta iniciar o vídeo quando o componente monta
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        console.warn("Autoplay do vídeo bloqueado:", error);
      });
    }
  }, []);


  return (
    <section className="credits-section">
      <video
        ref={videoRef}
        className="credits-video-bg"
        src="/video-creditos.mp4"
        muted
        autoPlay
        loop
        playsInline
      >
        Seu navegador não suporta vídeos HTML5.
      </video>

      <div className="credits-overlay"></div>

      {!creditsFinished ? (
        <div
          className="credits-scroll-container"
          onAnimationEnd={handleAnimationEnd}
        >

          <div className="credits-team-scroll">
            <div className="credits-role">
              <h2>Product Owner (PO)</h2>
              <p>Gustavo Ícaro</p>
            </div>
            <div className="credits-role">
              <h2>Scrum Master (SM)</h2>
              <p>Abraão Vieri</p>
            </div>
            <div className="credits-role">
              <h2>Desenvolvedores (Devs)</h2>
              <p>Anna Caroline</p>
              <p>Raquel Rocha</p>
              <p>Vitor Douglas</p>
            </div>
            <div className="credits-role">
              <h2>Quality Assurance (QA)</h2>
              <p>Guilherme augusto</p>
            </div>
            <div className="credits-role">
              <h2>Designer</h2>
              <p>Anna Caroline</p>
            </div>
          </div>
          <div style={{ height: '20vh' }}></div>
        </div>
      ) : (
        <div className="credits-end-sequence">
          <img src="/logo.svg" alt="Logo Letrola" className="credits-logo-final" />
          <button className="btn-jogar-novamente" onClick={handleVoltarInicio}>
            <div></div>
            Jogar Novamente
          </button>
        </div>
      )}
    </section>
  );
}

export default Credits;