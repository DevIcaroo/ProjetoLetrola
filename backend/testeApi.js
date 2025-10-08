// testeApi.js (versão completa para testar toda a API da Cruzadinha)

import { 
    buscarCruzadinhaPorFase, 
    validarPalavraCruzadinha 
} from '../frontend/src/services/apiCruzadinhas.js';

/**
 * Função principal para executar os testes da API da Cruzadinha.
 */
async function executarTestesDeCruzadinha() {
  console.log('--- Iniciando Testes Completos da API da Cruzadinha ---');

  try {
    // --- Cenário 1: Buscar dados de todas as fases da cruzadinha ---
    console.log('\n[CENÁRIO 1] A buscar dados de todas as 5 fases do Mundo 3...');
    
    for (let fase = 1; fase <= 5; fase++) {
      const cruzadinhaData = await buscarCruzadinhaPorFase(3, fase);
      if (!cruzadinhaData || cruzadinhaData.length === 0) {
        throw new Error(`FALHA: Não foram encontrados dados para a cruzadinha do Mundo 3, Fase ${fase}.`);
      }
      console.log(`✅ SUCESSO! Encontradas ${cruzadinhaData.length} palavras para a Fase ${fase}.`);
    }

    // --- Cenário 2: Testar o tratamento de erro para uma fase sem cruzadinha ---
    console.log('\n[CENÁRIO 2] A tentar buscar uma cruzadinha para o Mundo 1, Fase 1 (esperado: erro)...');
    try {
        await buscarCruzadinhaPorFase(1, 1);
        throw new Error('FALHA: A API retornou dados para uma cruzadinha que não deveria existir.');
    } catch (error) {
        if (error.message.includes('não encontrada')) {
            console.log('✅ SUCESSO! A API retornou corretamente um erro de "não encontrada".');
        } else {
            throw error;
        }
    }

    // --- Cenário 3: Validar palavras de diferentes fases ---
    console.log('\n[CENÁRIO 3] A validar palavras específicas...');
    
    // Teste com uma palavra correta da Fase 1
    let resultadoValidacao = await validarPalavraCruzadinha(3, 1, 'FITA');
    if (!resultadoValidacao.correta) {
        throw new Error(`FALHA: A validação da palavra "FITA" da Fase 1 falhou.`);
    }
    console.log(`✅ SUCESSO! A palavra "FITA" foi validada como correta.`);

    // Teste com uma palavra correta da Fase 5
    resultadoValidacao = await validarPalavraCruzadinha(3, 5, 'DECORAÇÃO');
    if (!resultadoValidacao.correta) {
        throw new Error(`FALHA: A validação da palavra "DECORAÇÃO" da Fase 5 falhou.`);
    }
    console.log(`✅ SUCESSO! A palavra "DECORAÇÃO" foi validada como correta.`);

    // Teste com uma palavra incorreta
    resultadoValidacao = await validarPalavraCruzadinha(3, 1, 'GATO');
    if (resultadoValidacao.correta) {
        throw new Error(`FALHA: A validação da palavra incorreta "GATO" foi aceite.`);
    }
    console.log(`✅ SUCESSO! A palavra "GATO" foi validada como incorreta.`);


    console.log('\n\n--- ✅ TODOS OS TESTES DA CRUZADINHA PASSARAM COM SUCESSO! ---');

  } catch (erro) {
    console.error('\n--- ❌ UM TESTE FALHOU! ---');
    console.error('Detalhes do erro:', erro.message);
  } finally {
    console.log('\n--- Fim da execução dos testes ---');
  }
}

// --- Execução ---
executarTestesDeCruzadinha();