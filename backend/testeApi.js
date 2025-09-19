// testeApi.js (versão para testar a lógica de Jogo Salvo vs Novo Jogo)

// Importa a função de criar jogadores
import { criarJogador } from '../frontend/src/services/apiJogadores.js';
// ✅ Importa as novas funções de progresso que vamos testar
import { 
    salvarProgresso, 
    buscarTotalEstrelas,
    verificarProgressoAtivo,
    iniciarNovoJogo 
} from '../frontend/src/services/apiProgresso.js';

/**
 * Função principal para executar os testes da lógica de Jogo Salvo.
 */
async function executarTestesDeJogoSalvo() {
  console.log('--- Iniciando Testes de Jogo Ativo vs Arquivado ---');
  let jogador;

  try {
    // --- SETUP: Criar um jogador de teste ---
    const nomeJogadorUnico = `jogador_${Date.now().toString().slice(-7)}`;
    console.log(`\n[SETUP] Criando jogador: "${nomeJogadorUnico}"`);
    jogador = await criarJogador(nomeJogadorUnico);
    console.log('✅ Jogador criado com ID:', jogador.id);

    // --- CENÁRIO 1: Primeira vez jogando ---
    console.log('\n--- Cenário 1: Primeira Jogatina ---');

    console.log('\n[TESTE 1.1] Verificando se existe progresso ativo (esperado: false)');
    let temProgresso = await verificarProgressoAtivo(jogador.id);
    if (temProgresso) {
      throw new Error('FALHA: Jogador novo não deveria ter progresso ativo.');
    }
    console.log('✅ SUCESSO! Nenhum progresso ativo encontrado.');

    console.log('\n[TESTE 1.2] Jogador joga e salva 9 estrelas...');
    await salvarProgresso(jogador.id, 1, 1, 3);
    await salvarProgresso(jogador.id, 1, 2, 3);
    await salvarProgresso(jogador.id, 1, 3, 3);
    
    console.log('\n[TESTE 1.3] Verificando total de estrelas (esperado: 9)');
    let totalEstrelas = await buscarTotalEstrelas(jogador.id);
    if (totalEstrelas !== 9) {
      throw new Error(`FALHA: Total de estrelas incorreto. Esperado: 9, Recebido: ${totalEstrelas}`);
    }
    console.log(`✅ SUCESSO! Total de 9 estrelas encontrado.`);

    console.log('\n[TESTE 1.4] Verificando novamente se existe progresso ativo (esperado: true)');
    temProgresso = await verificarProgressoAtivo(jogador.id);
    if (!temProgresso) {
      throw new Error('FALHA: Jogador com progresso salvo deveria ter um jogo ativo.');
    }
    console.log('✅ SUCESSO! Progresso ativo encontrado.');

    // --- CENÁRIO 2: Jogador decide começar um "Novo Jogo" ---
    console.log('\n--- Cenário 2: Iniciando um Novo Jogo ---');

    console.log('\n[TESTE 2.1] Arquivando o progresso antigo...');
    const resultadoNovoJogo = await iniciarNovoJogo(jogador.id);
    console.log(`✅ SUCESSO! ${resultadoNovoJogo.message}`);
    
    console.log('\n[TESTE 2.2] Verificando se ainda existe progresso ativo (esperado: false)');
    temProgresso = await verificarProgressoAtivo(jogador.id);
    if (temProgresso) {
      throw new Error('FALHA: Progresso não foi arquivado corretamente.');
    }
    console.log('✅ SUCESSO! Nenhum progresso ativo encontrado após reiniciar.');

    console.log('\n[TESTE 2.3] Verificando o total de estrelas do jogo ATIVO (esperado: 0)');
    totalEstrelas = await buscarTotalEstrelas(jogador.id);
    if (totalEstrelas !== 0) {
      throw new Error(`FALHA: Total de estrelas deveria ser 0. Recebido: ${totalEstrelas}`);
    }
    console.log('✅ SUCESSO! Total de estrelas do jogo ativo foi zerado.');

    // --- CENÁRIO 3: Segunda vez jogando ---
    console.log('\n--- Cenário 3: Segunda Jogatina ---');
    console.log('\n[TESTE 3.1] Jogador joga novamente e salva 6 estrelas...');
    await salvarProgresso(jogador.id, 1, 1, 3);
    await salvarProgresso(jogador.id, 1, 2, 3);

    console.log('\n[TESTE 3.2] Verificando o novo total de estrelas (esperado: 6)');
    totalEstrelas = await buscarTotalEstrelas(jogador.id);
    if (totalEstrelas !== 6) {
      throw new Error(`FALHA: Total de estrelas da nova jogatina incorreto. Esperado: 6, Recebido: ${totalEstrelas}`);
    }
    console.log(`✅ SUCESSO! Novo total de 6 estrelas encontrado.`);

    console.log('\n\n--- TODOS OS TESTES DE "NOVO JOGO" PASSARAM COM SUCESSO! ---');

  } catch (erro) {
    console.error('\n--- UM TESTE FALHOU! ---');
    console.error('Detalhes do erro:', erro.message);
  } finally {
    console.log('\n--- Fim da execução dos testes ---');
  }
}

// Executa a função de testes
executarTestesDeJogoSalvo();