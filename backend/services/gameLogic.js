// services/gameLogic.js

// Importa a função da API para salvar o progresso
import { salvarProgresso } from './apiProgresso.js';

// Variáveis de estado para a FASE INTEIRA
let tempoFase = 0;
let cronometroFaseIntervalo = null;
let dicasTotaisUsadas = 0;

// Variáveis de estado para o ITEM ATUAL
let tempoItemAtual = 0;
let cronometroItemIntervalo = null;
let dicasItemAtual = 0;
let itemAtual = null;
let onShowDica = null;

// --- NOVOS VALORES PARA O CÁLCULO DE ESTRELAS ---
// O tempo de referência para as estrelas da FASE INTEIRA
const TEMPO_1_MIN = 60;   // 1 minuto em segundos
const TEMPO_3_MIN = 180;  // 3 minutos em segundos
const TEMPO_5_MIN = 300;  // 5 minutos em segundos
const LIMITE_DICAS = 15;  // Limite de dicas para não perder estrelas

/**
 * Inicia o cronômetro principal para a fase inteira.
 * Deve ser chamado apenas no início da fase.
 * @returns {void}
 */
function iniciarCronometroFase() {
  tempoFase = 0;
  dicasTotaisUsadas = 0;
  if (cronometroFaseIntervalo) {
    clearInterval(cronometroFaseIntervalo);
  }

  cronometroFaseIntervalo = setInterval(() => {
    tempoFase++;
    // O frontend pode usar getTempoFase() para exibir o tempo
  }, 1000);
}

/**
 * Inicia o cronômetro para um item específico.
 * Deve ser chamado no início de cada nova fruta.
 * @param {object} item O objeto do item (fruta) atual, vindo da API.
 * @param {Function} onDicaCallback Função para notificar a UI quando uma dica for liberada.
 */
function iniciarCronometroItem(item, onDicaCallback) {
  itemAtual = item;
  tempoItemAtual = 0;
  dicasItemAtual = 0;
  onShowDica = onDicaCallback;

  // Limpa o cronômetro do item anterior e inicia um novo
  if (cronometroItemIntervalo) {
    clearInterval(cronometroItemIntervalo);
  }

  cronometroItemIntervalo = setInterval(() => {
    tempoItemAtual++;

    // Lógica para liberar as dicas do item atual
    if (tempoItemAtual === TEMPO_1_MIN && dicasItemAtual === 0) {
      dicasItemAtual = 1;
      dicasTotaisUsadas++; // Registra a dica usada no contador total
      if (onShowDica && itemAtual.dica1) {
        onShowDica(itemAtual.dica1, dicasItemAtual);
        console.log(`Dica 1 liberada para ${itemAtual.resposta}!`);
      }
    } else if (tempoItemAtual === TEMPO_3_MIN && dicasItemAtual === 1) {
      dicasItemAtual = 2;
      dicasTotaisUsadas++; // Registra a dica usada no contador total
      if (onShowDica && itemAtual.dica2) {
        onShowDica(itemAtual.dica2, dicasItemAtual);
        console.log(`Dica 2 liberada para ${itemAtual.resposta}!`);
      }
    }
  }, 1000);
}

/**
 * Para o cronômetro do item e o prepara para o próximo.
 * Deve ser chamado quando a criança resolver a fruta.
 */
function pararCronometroItem() {
    clearInterval(cronometroItemIntervalo);
}

/**
 * Para o cronômetro da fase e calcula a pontuação de estrelas.
 * Deve ser chamado apenas no final da fase.
 * @param {string} id_jogador O ID do jogador.
 * @param {number} fase_id O ID da fase atual.
 * @returns {Promise<object>} O resultado da requisição de salvar progresso.
 */
async function pararECalcularProgressoFase(id_jogador, fase_id) {
  clearInterval(cronometroFaseIntervalo);
  clearInterval(cronometroItemIntervalo); // Apenas por segurança

  let estrelas = 0;

  // --- NOVA LÓGICA PARA CALCULAR AS ESTRELAS ---
  if (tempoFase <= TEMPO_1_MIN) {
    estrelas = 3;
  } else if (tempoFase <= TEMPO_3_MIN) {
    estrelas = 2;
  } else if (tempoFase <= TEMPO_5_MIN) {
    estrelas = 1;
  } else {
    estrelas = 0;
  }

  // Lógica para reduzir estrelas se o jogador usou mais dicas do que o limite
  if (dicasTotaisUsadas > LIMITE_DICAS) {
    estrelas = Math.max(0, estrelas - 1);
  }

  console.log(`Fase ${fase_id} concluída em ${tempoFase}s.`);
  console.log(`Total de dicas usadas: ${dicasTotaisUsadas}. Estrelas obtidas: ${estrelas}`);

  // Chama a função da API para salvar o progresso apenas UMA VEZ
  try {
    const resultado = await salvarProgresso(id_jogador, fase_id, estrelas, tempoFase);
    return resultado;
  } catch (error) {
    console.error('Falha ao salvar progresso:', error);
    throw error;
  }
}

/**
 * Retorna o tempo gasto na fase atual.
 * @returns {number} O tempo gasto em segundos.
 */
function getTempoFase() {
  return tempoFase;
}

// Exporta as funções para que o desenvolvedor do frontend possa usá-las
export {
    iniciarCronometroFase,
    iniciarCronometroItem,
    pararCronometroItem,
    pararECalcularProgressoFase,
    getTempoFase
};