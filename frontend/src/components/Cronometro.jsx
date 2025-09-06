import React, { useEffect, useRef, useCallback } from 'react';

// Constantes de tempo (em milissegundos para compatibilidade com Date.now())
const TEMPO_1_MIN_MS = 60 * 1000;
const TEMPO_3_MIN_MS = 180 * 1000;

const Cronometro = ({
  tempoInicioFase,
  limiteTempoFase,
  itemAtual,
  onDicaLiberada, // Substitui o 'onDicaCallback'
  onFaseTermina,
  onTempoTick,
}) => {
  const requestRef = useRef();
  const dicasLiberadasRef = useRef(0);

  const gameLoop = useCallback(() => {
    const tempoDecorridoFase = Date.now() - tempoInicioFase;
    onTempoTick(tempoDecorridoFase);

    if (tempoDecorridoFase >= limiteTempoFase) {
      onFaseTermina({ tempoFinalMs: limiteTempoFase });
      return;
    }

    // Lógica do cronômetro do item
    if (itemAtual && itemAtual.timestampInicio) {
      const tempoDecorridoItem = Date.now() - itemAtual.timestampInicio;

      // Lógica para liberar as dicas
      if (tempoDecorridoItem >= TEMPO_1_MIN_MS && dicasLiberadasRef.current === 0) {
        dicasLiberadasRef.current = 1;
        // O callback informa a fase para controle de estado
        if (itemAtual.dica1) {
            onDicaLiberada(itemAtual.dica1, 1);
        }
      } else if (tempoDecorridoItem >= TEMPO_3_MIN_MS && dicasLiberadasRef.current === 1) {
        dicasLiberadasRef.current = 2;
        if (itemAtual.dica2) {
            onDicaLiberada(itemAtual.dica2, 2);
        }
      }
    }

    requestRef.current = requestAnimationFrame(gameLoop);
  }, [tempoInicioFase, limiteTempoFase, itemAtual, onDicaLiberada, onFaseTermina, onTempoTick]);

  useEffect(() => {
    // Quando o item muda,o contador de dicas liberadas reinicia.
    dicasLiberadasRef.current = 0;
  }, [itemAtual]);

  useEffect(() => {
    if (tempoInicioFase) {
      requestRef.current = requestAnimationFrame(gameLoop);
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [tempoInicioFase, gameLoop]);

  return null;
};

export default Cronometro;