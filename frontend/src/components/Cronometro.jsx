import React, { useEffect, useRef, useCallback } from 'react';

// Constantes de tempo (em milissegundos para compatibilidade com Date.now())
const TEMPO_1_MIN_MS = 60 * 1000;
const TEMPO_3_MIN_MS = 180 * 1000;

const TEMPO_DICA_1_MS = 15 * 1000; // 15 segundos
const TEMPO_DICA_2_MS = 30 * 1000; // 30 segundos

const Cronometro = ({
  tempoInicioFase,
  limiteTempoFase,
  itemAtual,
  onDicaLiberada,
  onFaseTermina,
  onTempoTick,
  onItemTempoTick,
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

      // Envia o tempo do item de volta para a UI
      if (onItemTempoTick) {
        onItemTempoTick(tempoDecorridoItem);
      }

       //Lógica de dicas para 15s e 30s
        if (tempoDecorridoItem >= TEMPO_DICA_1_MS && dicasLiberadasRef.current === 0) {
          dicasLiberadasRef.current = 1;
          if (itemAtual.dica1) {
              onDicaLiberada(1, itemAtual.id); // Notifica a Fase que a Dica 1 está pronta
          }
        } else if (tempoDecorridoItem >= TEMPO_DICA_2_MS && dicasLiberadasRef.current === 1) {
          dicasLiberadasRef.current = 2;
          if (itemAtual.dica2) {
              onDicaLiberada(2, itemAtual.id); // Notifica a Fase que a Dica 2 está pronta
          }
        }
      }

      requestRef.current = requestAnimationFrame(gameLoop);
  }, [tempoInicioFase, limiteTempoFase, itemAtual, onDicaLiberada, onFaseTermina, onTempoTick, onItemTempoTick]);

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