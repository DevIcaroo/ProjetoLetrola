/**
 * Verifica se o jogador tem permissão para acessar uma fase específica.
 * @param {string} id_jogador O ID único do jogador.
 * @param {number} mundo O número do mundo que o jogador quer acessar.
 * @param {number} fase O número da fase que o jogador quer acessar.
 * @returns {Promise<object>} Um objeto com o status da permissão e os dados da fase.
 */
async function verificarAcessoFase(id_jogador, mundo, fase) {
  try {
    // A URL CORRETA ESTÁ AQUI: com o prefixo /fases
    const response = await fetch(
      `http://localhost:3000/fases/fase/${id_jogador}/${mundo}/${fase}`
    );

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 403) {
        console.warn("Acesso negado:", data.mensagem);
      } else {
        console.error(
          "Erro na requisição:",
          data.error || "Erro desconhecido."
        );
      }
      return data;
    }

    console.log(`Acesso permitido para a fase ${mundo}.${fase}.`);
    return data;
  } catch (error) {
    console.error("Erro na requisição:", error);
    // Retorna um objeto de erro padrão para o frontend lidar
    return { permitido: false, mensagem: "Não foi possível verificar o acesso à fase. Tente novamente." };
  }
}

// Exporta a função para que possa ser importada e usada em outros arquivos
export { verificarAcessoFase };