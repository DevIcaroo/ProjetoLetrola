// backend/routes/cacapalavras.js
const express = require('express');
const router = express.Router();
const db = require('../db');

/**
 * Rota para buscar a lista de palavras de uma fase do caça-palavras.
 */
router.get('/:mundo/:fase', (req, res) => {
    // ✅ Converter parâmetros para números inteiros
    const mundoNum = parseInt(req.params.mundo, 10);
    const faseNum = parseInt(req.params.fase, 10);

    // ✅ Adicionar validação para garantir que são números válidos
    if (isNaN(mundoNum) || isNaN(faseNum) || mundoNum < 1 || faseNum < 1) {
        console.error(`[Backend] Parâmetros inválidos recebidos: Mundo=${req.params.mundo}, Fase=${req.params.fase}`);
        return res.status(400).json({ error: 'Parâmetros de mundo ou fase inválidos.' });
    }

    console.log(`[Backend] Rota /cacapalavras GET recebida para Mundo: ${mundoNum}, Fase: ${faseNum}`);

    // Consulta para buscar todas as palavras da fase especificada.
    const sql = `SELECT palavra FROM cacapalavras_palavras WHERE mundo = ? AND fase = ?`;

    // ✅ Usar as variáveis numéricas na consulta
    db.all(sql, [mundoNum, faseNum], (err, rows) => {
        if (err) {
            console.error("[Backend] Erro ao buscar palavras do caça-palavras:", err);
            return res.status(500).json({ error: 'Erro ao buscar palavras do caça-palavras.' });
        }
        console.log(`[Backend] Palavras encontradas no DB para ${mundoNum}/${faseNum}:`, rows);
        
        // Retorna um array simples com as palavras. Ex: ["BOLO", "PUDIM", "TORTA"]
        res.json(rows.map(r => r.palavra));
    });
});

/**
 * Rota para validar uma palavra encontrada pelo jogador.
 */
router.post('/validar', (req, res) => {
    // ✅ Converter parâmetros para números inteiros
    const mundoNum = parseInt(req.body.mundo, 10);
    const faseNum = parseInt(req.body.fase, 10);
    const palavra = req.body.palavra;
    
    // ✅ Adicionar validação
    if (isNaN(mundoNum) || isNaN(faseNum) || !palavra) {
        return res.status(400).json({ error: 'Dados incompletos ou inválidos para validação.' });
    }

    const sql = `SELECT palavra FROM cacapalavras_palavras WHERE mundo = ? AND fase = ? AND palavra = ?`;
    
    // ✅ Usar as variáveis numéricas e converter palavra para maiúsculas
    db.get(sql, [mundoNum, faseNum, palavra.toUpperCase()], (err, row) => {
        if (err) {
            console.error("[Backend] Erro ao validar palavra:", err);
            return res.status(500).json({ error: 'Erro ao validar palavra.' });
        }
        res.json({ correta: !!row });
    });
});

module.exports = router;