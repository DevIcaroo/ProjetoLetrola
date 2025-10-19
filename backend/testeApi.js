// testeApi.js (versão para testar TODAS as fases do Mundo 4 e as Configurações)

// Importa a função de criar jogadores
import { criarJogador } from '../frontend/src/services/apiJogadores.js';

// Importa as funções de progresso
import { 
    salvarProgresso, 
    buscarTotalEstrelas,
    verificarProgressoAtivo,
    iniciarNovoJogo 
} from '../frontend/src/services/apiProgresso.js';

// Importa as funções de Configurações de Áudio
import {
    buscarConfiguracoesDeAudio,
    salvarConfiguracoesDeAudio
} from '../frontend/src/services/apiSettings.js';

// Importa as funções do Caça-Palavras
import {
    buscarPalavrasDoNivel,
    validarPalavraEncontrada
} from '../frontend/src/services/apiCacapalavras.js';


/**
 * Função principal para executar uma suíte de testes completa da API.
 */
async function executarTestesCompletos() {
  console.log('--- Iniciando Suíte de Testes da API ---');
  let jogador;

  try {
    // --- SETUP: Criar um jogador de teste para todos os cenários ---
    const nomeJogadorUnico = `jogador_${Date.now().toString().slice(-7)}`;
    console.log(`\n[SETUP] Criando jogador: "${nomeJogadorUnico}"`);
    jogador = await criarJogador(nomeJogadorUnico);
    if (!jogador || !jogador.id) {
        throw new Error('FALHA CRÍTICA: Não foi possível criar o jogador para os testes.');
    }
    console.log('✅ Jogador criado com ID:', jogador.id);

    // --- CENÁRIO 1: Testes de Configurações de Áudio (apiSettings) ---
    console.log('\n--- Cenário 1: Testando Configurações de Áudio ---');
    
    console.log('\n[TESTE 1.1] Buscando configurações iniciais (esperado: música e sfx LIGADOS)');
    let configs = await buscarConfiguracoesDeAudio(jogador.id);
    if (configs.musica_mutada !== 0 || configs.sfx_mutado !== 0) {
        throw new Error(`FALHA: Configurações iniciais incorretas. Recebido: ${JSON.stringify(configs)}`);
    }
    console.log('✅ SUCESSO! Configurações padrão (0, 0) encontradas.');

    console.log('\n[TESTE 1.2] Salvando novas configurações (música MUTADA, sfx LIGADO)');
    await salvarConfiguracoesDeAudio({ id_jogador: jogador.id, musica_mutada: true, sfx_mutado: false });
    
    console.log('\n[TESTE 1.3] Verificando se as configurações foram salvas corretamente');
    configs = await buscarConfiguracoesDeAudio(jogador.id);
    if (configs.musica_mutada !== 1 || configs.sfx_mutado !== 0) {
        throw new Error(`FALHA: As configurações não foram atualizadas. Recebido: ${JSON.stringify(configs)}`);
    }
    console.log('✅ SUCESSO! Configurações atualizadas para (1, 0) com sucesso.');

    // --- CENÁRIO 2: Testes do Caça-Palavras (apiCacapalavras) ---
    console.log('\n--- Cenário 2: Testando API do Caça-Palavras (TODAS AS FASES) ---');
    const MUNDO_TESTE = 4;

    // Loop para testar todas as 5 fases do Mundo 4
    for (let faseAtual = 1; faseAtual <= 5; faseAtual++) {
        console.log(`\n--- Testando Mundo ${MUNDO_TESTE}, Fase ${faseAtual} ---`);

        console.log(`[TESTE 2.${faseAtual}.1] Buscando palavras...`);
        const palavras = await buscarPalavrasDoNivel(MUNDO_TESTE, faseAtual);
        if (!palavras || !Array.isArray(palavras) || palavras.length === 0) {
            throw new Error(`FALHA [Fase ${faseAtual}]: Não foi possível buscar a lista de palavras.`);
        }
        console.log(`✅ SUCESSO! [Fase ${faseAtual}] Palavras recebidas: ${palavras.join(', ')}`);
        
        // Pega a primeira palavra da lista para usar como teste de validação correta
        const palavraCorreta = palavras[0];
        console.log(`[TESTE 2.${faseAtual}.2] Validando uma palavra correta ("${palavraCorreta}")`);
        let validacao = await validarPalavraEncontrada({ mundo: MUNDO_TESTE, fase: faseAtual, palavra: palavraCorreta });
        if (!validacao || !validacao.correta) {
            throw new Error(`FALHA [Fase ${faseAtual}]: Palavra correta "${palavraCorreta}" foi considerada incorreta.`);
        }
        console.log(`✅ SUCESSO! [Fase ${faseAtual}] Palavra "${palavraCorreta}" validada corretamente.`);

        const palavraIncorreta = "JOGUINHO";
        console.log(`[TESTE 2.${faseAtual}.3] Validando uma palavra incorreta ("${palavraIncorreta}")`);
        validacao = await validarPalavraEncontrada({ mundo: MUNDO_TESTE, fase: faseAtual, palavra: palavraIncorreta });
        if (!validacao || validacao.correta) {
            throw new Error(`FALHA [Fase ${faseAtual}]: Palavra incorreta "${palavraIncorreta}" foi considerada correta.`);
        }
        console.log(`✅ SUCESSO! [Fase ${faseAtual}] Palavra "${palavraIncorreta}" invalidada corretamente.`);
    }


    // --- CENÁRIO 3: Testes de Jogo Salvo vs Novo Jogo (Lógica Original Mantida) ---
    console.log('\n--- Cenário 3: Testando Lógica de Jogo Salvo vs Novo Jogo ---');

    console.log('\n[TESTE 3.1] Verificando se existe progresso ativo (esperado: false)');
    let temProgresso = await verificarProgressoAtivo(jogador.id);
    if (temProgresso) {
      throw new Error('FALHA: Jogador novo não deveria ter progresso ativo.');
    }
    console.log('✅ SUCESSO! Nenhum progresso ativo encontrado.');
    
    console.log('\n[TESTE 3.2] Jogador joga e salva 9 estrelas...');
    await salvarProgresso(jogador.id, 1, 1, 3);
    await salvarProgresso(jogador.id, 1, 2, 3);
    await salvarProgresso(jogador.id, 1, 3, 3);
    
    console.log('\n[TESTE 3.3] Verificando total de estrelas (esperado: 9)');
    let totalEstrelas = await buscarTotalEstrelas(jogador.id);
    if (totalEstrelas !== 9) {
      throw new Error(`FALHA: Total de estrelas incorreto. Esperado: 9, Recebido: ${totalEstrelas}`);
    }
    console.log(`✅ SUCESSO! Total de 9 estrelas encontrado.`);

    console.log('\n[TESTE 3.4] Iniciando um "Novo Jogo" para arquivar o progresso...');
    const resultadoNovoJogo = await iniciarNovoJogo(jogador.id);
    console.log(`✅ SUCESSO! ${resultadoNovoJogo.message}`);
    
    console.log('\n[TESTE 3.5] Verificando se ainda existe progresso ativo (esperado: false)');
    temProgresso = await verificarProgressoAtivo(jogador.id);
    if (temProgresso) {
      throw new Error('FALHA: Progresso não foi arquivado corretamente.');
    }
    console.log('✅ SUCESSO! Nenhum progresso ativo encontrado após reiniciar.');

    console.log('\n\n--- TODOS OS TESTES DA SUÍTE PASSARAM COM SUCESSO! ---');

  } catch (erro) {
    console.error('\n--- UM TESTE FALHOU! ---');
    console.error('Detalhes do erro:', erro.message);
  } finally {
    console.log('\n--- Fim da execução dos testes ---');
  }
}

// Executa a função de testes
executarTestesCompletos();