// testeApi.js

// Importa as funções dos arquivos de serviço
import { buscarItensPorFase } from './services/apiItensFase.js';
import { 
    iniciarCronometroFase, 
    iniciarCronometroItem, 
    pararCronometroItem,
    pararECalcularProgressoFase
} from './services/gameLogic.js';

// Define um ID de jogador para os testes
const ID_JOGADOR_TESTE = 'teste_user_123';
const FASE_TESTE = 1;

/**
 * Função para criar um atraso.
 * @param {number} ms O tempo de atraso em milissegundos.
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Função principal para executar os testes
 */
async function executarTestes() {
  console.log('--- Iniciando Testes da Lógica de Jogo (Lógica Combinada) ---');
  console.log('--- Simulação: Jogador completando 10 frutas com tempos variados. ---');

  try {
    const itensFase = await buscarItensPorFase(FASE_TESTE);
    if (itensFase.length !== 10) {
      throw new Error(`Este teste requer exatamente 10 itens na fase. Encontrado: ${itensFase.length}`);
    }

    // Define os tempos de espera para cada item para simular o jogo
    // (0 dicas, 1 dica, 2 dicas, 0 dicas...)
    const delaysSimulacao = [15000, 40000, 65000, 15000, 40000, 65000, 15000, 40000, 65000, 15000];
    
    const onDicaCallback = (dica, numero) => {
      console.log(`  > Callback: Dica ${numero} liberada: "${dica}"`);
    };

    // --- Inicia o cronômetro principal da fase ---
    console.log(`\n--- Iniciando a Fase ${FASE_TESTE} com um único cronômetro. ---`);
    iniciarCronometroFase();
    await delay(1000); // Pequena espera para o cronômetro iniciar

    let ordem = 1;
    // Simula a conclusão de cada fruta uma por uma
    for (const item of itensFase) {
      console.log(`\nSimulando a conclusão da fruta ${ordem}: ${item.resposta}`);

      // Inicia o cronômetro para o item atual
      iniciarCronometroItem(item, onDicaCallback);

      const tempoAtual = delaysSimulacao[ordem - 1];
      console.log(`  - Aguardando ${tempoAtual / 1000} segundos...`);
      await delay(tempoAtual);

      // Para o cronômetro do item
      pararCronometroItem();
      
      console.log(`  - Fruta ${item.resposta} concluída.`);
      ordem++;
    }

    // --- Fim da fase! Para o cronômetro e salva o progresso final. ---
    console.log('\n--- Fim da fase! Parando cronômetro e salvando progresso. ---');
    const resultadoProgresso = await pararECalcularProgressoFase(ID_JOGADOR_TESTE, FASE_TESTE);
    
    console.log(`- Resultado do salvamento final:`, resultadoProgresso.message);
    
    console.log('\n--- Testes Concluídos com Sucesso! ---');

  } catch (erro) {
    console.error('\n--- Teste Falhou! ---');
    console.error('Detalhes do erro:', erro.message);
  } finally {
    console.log('\n--- Fim da Execução dos Testes ---');
  }
}

executarTestes();