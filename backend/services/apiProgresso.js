// services/apiProgresso.js

/**
 * Salva ou atualiza o progresso do jogador em uma fase específica.
 * @param {string} id_jogador O ID único do jogador.
 * @param {number} fase O número da fase.
 * @param {number} estrelas O número de estrelas obtidas (0 a 3).
 * @param {number} tempo_gasto O tempo gasto na fase, em segundos.
 * @returns {Promise<object>} Um objeto com a mensagem de sucesso da API.
 */
async function salvarProgresso(id_jogador, fase, estrelas, tempo_gasto) {
  try {
    // URL ajustada para /salvar-progresso
    const response = await fetch('http://localhost:3000/salvar-progresso', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id_jogador,
        fase,
        estrelas,
        tempo_gasto
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erro ao salvar progresso.');
    }

    console.log(data.message);
    return data;

  } catch (error) {
    console.error('Erro na requisição:', error);
    throw error;
  }
}

/**
 * Busca a fase mais avançada que o jogador alcançou.
 * @param {string} id_jogador O ID único do jogador.
 * @returns {Promise<number>} O número da fase atual do jogador.
 */
async function buscarFaseAtual(id_jogador) {
  try {
    // URL ajustada para /progresso/:id_jogador
    const response = await fetch(`http://localhost:3000/progresso/${id_jogador}`);

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erro ao buscar fase atual.');
    }
    
    console.log(`Fase atual para o jogador ${id_jogador}:`, data.fase_atual);
    return data.fase_atual;

  } catch (error) {
    console.error('Erro na requisição:', error);
    throw error;
  }
}

/**
 * Busca o número de estrelas que um jogador obteve em uma fase específica.
 * @param {string} id_jogador O ID único do jogador.
 * @param {number} fase O número da fase.
 * @returns {Promise<number>} O número de estrelas obtidas.
 */
async function buscarEstrelas(id_jogador, fase) {
  try {
    // URL ajustada para /estrelas/:id_jogador/:fase
    const response = await fetch(`http://localhost:3000/estrelas/${id_jogador}/${fase}`);

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 400) {
        throw new Error(data.error || 'Parâmetros inválidos.');
      }
      throw new Error('Erro ao buscar estrelas.');
    }
    
    console.log(`Estrelas na fase ${fase} para o jogador ${id_jogador}:`, data.estrelas);
    return data.estrelas;

  } catch (error) {
    console.error('Erro na requisição:', error);
    throw error;
  }
}

// Exporta as funções para que possam ser importadas e usadas em outros arquivos
export { salvarProgresso, buscarFaseAtual, buscarEstrelas };