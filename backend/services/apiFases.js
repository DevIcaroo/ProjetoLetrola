// services/apiFases.js

/**
 * Verifica se o jogador tem permissão para acessar uma fase específica.
 * @param {string} id_jogador O ID único do jogador.
 * @param {number} fase O número da fase que o jogador quer acessar.
 * @returns {Promise<object>} Um objeto com o status da permissão e os dados da fase.
 */
async function verificarAcessoFase(id_jogador, fase) {
  try {
    const response = await fetch(`http://localhost:3000/fase/${id_jogador}/${fase}`);

    const data = await response.json();

    // A API de fases pode retornar 400 (parâmetros inválidos) ou 403 (acesso negado)
    if (!response.ok) {
      if (response.status === 403) {
        console.warn('Acesso negado:', data.mensagem);
      } else {
        console.error('Erro na requisição:', data.error || 'Erro desconhecido.');
      }
      return data;
    }

    // Se o status for 200 (OK), o acesso é permitido
    console.log(`Acesso permitido para a fase ${fase}.`);
    return data;

  } catch (error) {
    console.error('Erro na requisição:', error);
    throw error;
  }
}

// Exporta a função para que possa ser importada e usada em outros arquivos
export { verificarAcessoFase };