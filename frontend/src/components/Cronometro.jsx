import React, { useEffect, useRef, useCallback } from 'react';

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
  isPaused, // Prop para controlar a pausa
}) => {
  const requestRef = useRef();
  const dicasLiberadasRef = useRef(0);
  const tempoPausaRef = useRef(0); // Armazena o momento em que a pausa começou
  const tempoInicioAjustadoRef = useRef(tempoInicioFase); // Tempo de início ajustado pela pausa

  // Ajusta o tempo de início quando o jogo é retomado
  useEffect(() => {
    if (!isPaused && tempoPausaRef.current > 0) {
      const duracaoPausa = Date.now() - tempoPausaRef.current;
      tempoInicioAjustadoRef.current += duracaoPausa;
      tempoPausaRef.current = 0;
    }
  }, [isPaused]);

  const gameLoop = useCallback(() => {
    if (isPaused) {
      if (tempoPausaRef.current === 0) {
        tempoPausaRef.current = Date.now();
      }
      requestRef.current = requestAnimationFrame(gameLoop);
      return; // Sai da função se estiver pausado
    }

    const tempoDecorridoFase = Date.now() - tempoInicioAjustadoRef.current;
    onTempoTick(tempoDecorridoFase);

    if (tempoDecorridoFase >= limiteTempoFase) {
      onFaseTermina({ tempoFinalMs: limiteTempoFase });
      return;
    }

    // Lógica do cronômetro do item
    if (itemAtual && itemAtual.timestampInicio) {
      const tempoDecorridoItem = Date.now() - itemAtual.timestampInicio;

      if (onItemTempoTick) {
        onItemTempoTick(tempoDecorridoItem);
      }

      if (tempoDecorridoItem >= TEMPO_DICA_1_MS && dicasLiberadasRef.current === 0) {
        dicasLiberadasRef.current = 1;
        if (itemAtual.dica1) {
          onDicaLiberada(1, itemAtual.id);
        }
      } else if (tempoDecorridoItem >= TEMPO_DICA_2_MS && dicasLiberadasRef.current === 1) {
        dicasLiberadasRef.current = 2;
        if (itemAtual.dica2) {
          onDicaLiberada(2, itemAtual.id);
        }
      }
    }

    requestRef.current = requestAnimationFrame(gameLoop);
  }, [isPaused, tempoInicioFase, limiteTempoFase, itemAtual, onDicaLiberada, onFaseTermina, onTempoTick, onItemTempoTick]);

  useEffect(() => {
    // Quando o item muda, o contador de dicas reinicia.
    dicasLiberadasRef.current = 0;
  }, [itemAtual]);

  useEffect(() => {
    tempoInicioAjustadoRef.current = tempoInicioFase; // Reinicia o tempo ajustado
    requestRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(requestRef.current);
  }, [tempoInicioFase, gameLoop]);

  return null;
};

export default Cronometro;