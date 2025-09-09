// services/apiProgresso.js

/**
 * Salva ou atualiza o progresso do jogador.
 * @param {string} id_jogador
 * @param {number} mundo
 * @param {number} fase
 * @param {number} estrelas
 * @param {number} tempo_gasto
 * @returns {Promise<object>}
 */
export async function salvarProgresso(id_jogador, mundo, fase, estrelas, tempo_gasto) {
  try {
    const response = await fetch('http://localhost:3000/salvar-progresso', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_jogador, mundo, fase, estrelas, tempo_gasto }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Erro ao salvar progresso.');
    }
    return data;
  } catch (error) {
    console.error('Erro na requisição:', error);
    throw error;
  }
}

/**
 * Busca a fase mais avançada que o jogador alcançou em um mundo.
 * @param {string} id_jogador
 * @param {number} mundo_id
 * @returns {Promise<number>}
 */
export async function buscarFaseAtual(id_jogador, mundo_id) {
  try {
    // ✅ CORREÇÃO: Adiciona o mundo_id à URL da API
    const response = await fetch(`http://localhost:3000/progresso/${id_jogador}/${mundo_id}`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Erro ao buscar fase atual.');
    }
    return data.fase_atual;
  } catch (error) {
    console.error('Erro na requisição:', error);
    // Retorna 1 como padrão em caso de erro para não travar o jogo
    return 1;
  }
}

/**
 * Busca o número de estrelas de um jogador em uma fase específica.
 * @param {string} id_jogador
 * @param {number} mundo_id
 * @param {number} fase
 * @returns {Promise<number>}
 */
export async function buscarEstrelas(id_jogador, mundo_id, fase) {
  try {
    // ✅ CORREÇÃO: Adiciona o mundo_id à URL da API
    const response = await fetch(`http://localhost:3000/estrelas/${id_jogador}/${mundo_id}/${fase}`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error('Erro ao buscar estrelas.');
    }
    return data.estrelas || 0;
  } catch (error) {
    console.error('Erro na requisição:', error);
    // Retorna 0 como padrão em caso de erro
    return 0;
  }
}