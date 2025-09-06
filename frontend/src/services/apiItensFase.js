// services/apiItensFase.js

/**
 * Busca todos os itens (e as letras associadas) de uma fase específica.
 * @param {number} fase_id O ID da fase cujos itens devem ser buscados.
 * @returns {Promise<Array<object>>} Uma lista de objetos de itens.
 */
async function buscarItensPorFase(fase_id) {
  try {
    const response = await fetch(`http://localhost:3000/itens-fase/${fase_id}`);
    
    // A rota pode retornar 400 (ID inválido) ou 404 (nenhum item encontrado)
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || errorData.message || 'Erro ao buscar itens da fase.');
    }

    const data = await response.json();
    console.log(`Itens encontrados para a fase ${fase_id}:`, data.length);
    return data;

  } catch (error) {
    console.error('Erro na requisição:', error);
    throw error;
  }
}

// Exporta a função para que possa ser importada e usada em outros arquivos
export { buscarItensPorFase };