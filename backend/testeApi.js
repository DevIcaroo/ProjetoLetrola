// testeApi.js

// Importa todas as funções dos arquivos de serviço
import { salvarProgresso, buscarFaseAtual, buscarEstrelas } from '../frontend/src/services/apiProgresso.js';
import { verificarAcessoFase } from '../frontend/src/services/apiFases.js';
import { buscarItensPorFase } from '../frontend/src/services/apiItensFase.js';
import { buscarDialogosPorFase } from '../frontend/src/services/apiDialogos.js';
import { 
    iniciarSubFase,
    iniciarItem,
    pararItem,
    pararESalvarSubFase,
    getTempoSubFase,
    getFeedbackMensagem
} from '../frontend/src/services/gameLogic.js';

// Define um ID de jogador para os testes
const ID_JOGADOR_TESTE = 'teste_user_123';

/**
 * Função para criar um atraso (em milissegundos).
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Função principal para executar todos os testes.
 */
async function executarTestes() {
  console.log('--- Iniciando Testes Completos do Sistema Letrola ---');

  try {
    // --- Testes da API de Progresso ---
    console.log('\n### Seção 1: Testes da API de Progresso');
    console.log('\nTeste 1.1: Salvando progresso na Fase 1 (1.1)...');
    let resultadoSalvar = await salvarProgresso(ID_JOGADOR_TESTE, 1, 3, 60);
    console.log(`- Status: ${resultadoSalvar.message}`);

    console.log('\nTeste 1.2: Buscando fase atual...');
    let faseAtual = await buscarFaseAtual(ID_JOGADOR_TESTE);
    console.log(`- Fase atual: ${faseAtual}`);

    // --- Testes da API de Diálogos ---
    console.log('\n### Seção 2: Testes da API de Diálogos');
    console.log('\nTeste 2.1: Buscando diálogos da Fase 1 (1.1)...');
    const dialogosFase1 = await buscarDialogosPorFase(1);
    console.log(`- Diálogos encontrados: ${dialogosFase1.length}`);
    if (dialogosFase1.length > 0) {
      console.log('  Exemplo de diálogo:', dialogosFase1[0]);
    }

    // --- Testes da Lógica de Jogo (por Sub-Fase) ---
    console.log('\n### Seção 3: Testes da Lógica de Jogo (por Sub-Fase)');

    // ----------------------------------------------------
    // Cenário 1: Conclusão da Fase 1.1 (ID: 1) com 3 estrelas
    // ----------------------------------------------------
    console.log('\n--- Cenário 1: Simulando a Fase 1.1 (3 estrelas) ---');
    const itensFase1 = await buscarItensPorFase(1);
    console.log(`- Itens para Fase 1.1: ${itensFase1.length}`);

    // Inicia a sub-fase 1.1
    iniciarSubFase();
    console.log('  Iniciando Sub-fase 1.1...');
    console.log('  Simulando conclusão dos 3 itens em 50 segundos.');
    await delay(50000); // Simula um tempo rápido

    pararItem(); // Para o último item e registra as dicas
    
    // Para a sub-fase e salva o progresso
    console.log('  Parando sub-fase e salvando progresso...');
    const resultadoSubFase1 = await pararESalvarSubFase(ID_JOGADOR_TESTE, 1);
    console.log(`- Resultado: ${resultadoSubFase1.message}`);
    
    // Testa o feedback
    const tempoFase1 = getTempoSubFase();
    console.log(`- Mensagem de Feedback: "${getFeedbackMensagem(tempoFase1)}"`);


    // ----------------------------------------------------
    // Cenário 2: Conclusão da Fase 1.2 (ID: 2) com 2 estrelas
    // ----------------------------------------------------
    console.log('\n--- Cenário 2: Simulando a Fase 1.2 (2 estrelas) ---');
    const itensFase2 = await buscarItensPorFase(2);
    console.log(`- Itens para Fase 1.2: ${itensFase2.length}`);
    
    // Inicia a sub-fase 1.2
    iniciarSubFase();
    console.log('  Iniciando Sub-fase 1.2...');
    console.log('  Simulando conclusão dos 3 itens em 75 segundos.');
    await delay(75000); // Simula um tempo intermediário

    pararItem(); // Para o último item e registra as dicas
    
    // Para a sub-fase e salva o progresso
    console.log('  Parando sub-fase e salvando progresso...');
    const resultadoSubFase2 = await pararESalvarSubFase(ID_JOGADOR_TESTE, 2);
    console.log(`- Resultado: ${resultadoSubFase2.message}`);
    
    // Testa o feedback
    const tempoFase2 = getTempoSubFase();
    console.log(`- Mensagem de Feedback: "${getFeedbackMensagem(tempoFase2)}"`);


    console.log('\n--- Testes Concluídos com Sucesso! ---');

  } catch (erro) {
    console.error('\n--- Teste Falhou! ---');
    console.error('Detalhes do erro:', erro.message);
  } finally {
    console.log('\n--- Fim da Execução dos Testes ---');
  }
}

executarTestes();