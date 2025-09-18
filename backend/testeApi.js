// testeApi.js (versão para testar o desbloqueio de 5 mundos)

import { criarJogador } from '../frontend/src/services/apiJogadores.js';
import { salvarProgresso, buscarTotalEstrelas } from '../frontend/src/services/apiProgresso.js';

// --- Lógica de Verificação de Acesso e Requisitos ---
const REQUISITOS_MUNDO = {
  1: 0,
  2: 11,
  3: 22,
  4: 33,
  5: 44,
};

async function verificarAcessoMundo(mundoId, id_jogador) {
  const totalEstrelas = await buscarTotalEstrelas(id_jogador);
  const estrelasNecessarias = REQUISITOS_MUNDO[mundoId];
  console.log(`(Verificação: Jogador ${id_jogador} tem ${totalEstrelas} estrelas, precisa de ${estrelasNecessarias} para o Mundo ${mundoId})`);
  return totalEstrelas >= estrelasNecessarias;
}
// --- Fim da Lógica ---

/**
 * Função helper para simular o progresso do jogador em várias fases.
 */
async function adicionarProgresso(jogadorId, mundo, faseInicial, numFases, estrelasPorFase = 3) {
  console.log(`\n-> Adicionando progresso: ${numFases * estrelasPorFase} estrelas no Mundo ${mundo}...`);
  for (let i = 0; i < numFases; i++) {
    const faseAtual = faseInicial + i;
    await salvarProgresso(jogadorId, mundo, faseAtual, estrelasPorFase);
  }
  console.log('✅ Progresso salvo.');
}

/**
 * Função principal para executar todos os testes.
 */
async function executarTestesDeMundos() {
  console.log('--- Iniciando Testes Completos de Desbloqueio de Mundos ---');
  let jogador;

  try {
    // SETUP: Criar um jogador novo
    const nomeJogadorUnico = `explorador_${Date.now().toString().slice(-6)}`;
    console.log(`\n[SETUP] Criando jogador: "${nomeJogadorUnico}"`);
    jogador = await criarJogador(nomeJogadorUnico);
    console.log('✅ Jogador criado com ID:', jogador.id);

    // --- TESTE MUNDO 2 ---
    console.log('\n[TESTE] Verificando desbloqueio do Mundo 2...');
    if (await verificarAcessoMundo(2, jogador.id)) throw new Error('Mundo 2 liberado indevidamente.');
    console.log('OK! Mundo 2 bloqueado.');
    await adicionarProgresso(jogador.id, 1, 1, 4); // Adiciona 12 estrelas (4 fases * 3 estrelas)
    if (!(await verificarAcessoMundo(2, jogador.id))) throw new Error('Mundo 2 não foi liberado.');
    console.log('✅ SUCESSO! Mundo 2 desbloqueado.');

    // --- TESTE MUNDO 3 ---
    console.log('\n[TESTE] Verificando desbloqueio do Mundo 3...');
    if (await verificarAcessoMundo(3, jogador.id)) throw new Error('Mundo 3 liberado indevidamente.');
    console.log('OK! Mundo 3 bloqueado.');
    await adicionarProgresso(jogador.id, 1, 5, 4); // Adiciona mais 12 estrelas (total 24)
    if (!(await verificarAcessoMundo(3, jogador.id))) throw new Error('Mundo 3 não foi liberado.');
    console.log('✅ SUCESSO! Mundo 3 desbloqueado.');

    // --- TESTE MUNDO 4 ---
    console.log('\n[TESTE] Verificando desbloqueio do Mundo 4...');
    if (await verificarAcessoMundo(4, jogador.id)) throw new Error('Mundo 4 liberado indevidamente.');
    console.log('OK! Mundo 4 bloqueado.');
    await adicionarProgresso(jogador.id, 1, 9, 4); // Adiciona mais 12 estrelas (total 36)
    if (!(await verificarAcessoMundo(4, jogador.id))) throw new Error('Mundo 4 não foi liberado.');
    console.log('✅ SUCESSO! Mundo 4 desbloqueado.');

    // --- TESTE MUNDO 5 ---
    console.log('\n[TESTE] Verificando desbloqueio do Mundo 5...');
    if (await verificarAcessoMundo(5, jogador.id)) throw new Error('Mundo 5 liberado indevidamente.');
    console.log('OK! Mundo 5 bloqueado.');
    await adicionarProgresso(jogador.id, 1, 13, 4); // Adiciona mais 12 estrelas (total 48)
    if (!(await verificarAcessoMundo(5, jogador.id))) throw new Error('Mundo 5 não foi liberado.');
    console.log('✅ SUCESSO! Mundo 5 desbloqueado.');

    console.log('\n\n--- TODOS OS TESTES DE DESBLOQUEIO PASSARAM COM SUCESSO! ---');

  } catch (erro) {
    console.error('\n--- UM TESTE FALHOU! ---');
    console.error('Detalhes do erro:', erro.message);
  } finally {
    console.log('\n--- Fim da execução dos testes ---');
  }
}

executarTestesDeMundos();