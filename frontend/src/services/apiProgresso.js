// A URL base da API
const BASE_URL = 'http://localhost:3000';

/**
 * Salva ou atualiza o progresso do jogador.
 * @param {number} jogadorId - O ID numérico do jogador.
 * @param {number} mundo
 * @param {number} fase
 * @param {number} estrelas
 * @param {number} tempo_gasto
 * @returns {Promise<object>}
 */
export async function salvarProgresso(jogadorId, mundo, fase, estrelas, tempo_gasto) {
  try {
    const response = await fetch(`${BASE_URL}/salvar-progresso`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // MUDANÇA: O backend agora espera o ID numérico do jogador.
      body: JSON.stringify({ id_jogador: jogadorId, mundo, fase, estrelas, tempo_gasto }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Erro ao salvar progresso.');
    }
    return data;
  } catch (error) {
    console.error('Erro na requisição para salvar progresso:', error);
    throw error;
  }
}

/**
 * Busca a fase mais avançada que o jogador pode acessar em um mundo.
 * @param {number} jogadorId - O ID numérico do jogador.
 * @param {number} mundo_id
 * @returns {Promise<number>}
 */
export async function buscarFaseAtual(jogadorId, mundo_id) {
  try {
    // MUDANÇA: A URL agora usa o ID numérico do jogador.
    const response = await fetch(`${BASE_URL}/progresso/${jogadorId}/${mundo_id}`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Erro ao buscar fase atual.');
    }
    return data.fase_atual;
  } catch (error) {
    console.error('Erro na requisição para buscar fase atual:', error);
    // Retorna 1 como padrão em caso de erro para não travar o jogo
    return 1;
  }
}

/**
 * Busca o número de estrelas de um jogador em uma fase específica.
 * @param {number} jogadorId - O ID numérico do jogador.
 * @param {number} mundo_id
 * @param {number} fase
 * @returns {Promise<number>}
 */
export async function buscarEstrelas(jogadorId, mundo_id, fase) {
  try {
    // MUDANÇA: A URL agora usa o ID numérico do jogador.
    const response = await fetch(`${BASE_URL}/estrelas/${jogadorId}/${mundo_id}/${fase}`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error('Erro ao buscar estrelas.');
    }
    return data.estrelas || 0;
  } catch (error) {
    console.error('Erro na requisição para buscar estrelas:', error);
    // Retorna 0 como padrão em caso de erro
    return 0;
  }
}

/**
 * Busca o total de estrelas de um jogador em um mundo específico.
 * @param {number} jogadorId - O ID numérico do jogador.
 * @param {number} mundo_id
 * @returns {Promise<number>}
 */
export async function buscarTotalEstrelas(jogadorId, mundo_id) {
    try {
      const response = await fetch(`${BASE_URL}/progresso/total-estrelas/${jogadorId}/${mundo_id}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error('Erro ao buscar total de estrelas.');
      }
      return data.total_estrelas || 0;
    } catch (error) {
      console.error('Erro na requisição para buscar total de estrelas:', error);
      return 0; // Retorna 0 em caso de erro
    }
  }