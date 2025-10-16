// routes/cacapalavras.js
const express = require('express');
const router = express.Router();
const db = require('../db');

/**
 * Rota para buscar a lista de palavras de uma fase do caça-palavras.
    * Isto cumpre os critérios: "Buscar palavras" e "Retornar lista de palavras".
 */
router.get('/:mundo/:fase', (req, res) => {
    const { mundo, fase } = req.params;

    // Consulta para buscar todas as palavras da fase especificada.
    const sql = `SELECT palavra FROM cacapalavras_palavras WHERE mundo = ? AND fase = ?`;

    db.all(sql, [mundo, fase], (err, rows) => {
        if (err) {
            console.error("Erro ao buscar palavras do caça-palavras:", err);
            return res.status(500).json({ error: 'Erro ao buscar palavras do caça-palavras.' });
        }
        // Retorna um array simples com as palavras. Ex: ["BOLO", "PUDIM", "TORTA"]
        res.json(rows.map(r => r.palavra));
    });
});

/**
 * Rota para validar uma palavra encontrada pelo jogador.
 * Isto cumpre os critérios: "Função de validação" e "Retornar feedback".
 */
router.post('/validar', (req, res) => {
    const { mundo, fase, palavra } = req.body;
    
    // Valida se os dados necessários foram enviados.
    if (!mundo || !fase || !palavra) {
        return res.status(400).json({ error: 'Dados incompletos para validação.' });
    }

    // Consulta para verificar se a palavra enviada existe no banco de dados para aquela fase.
    // Usamos toUpperCase() para garantir que a comparação não diferencia maiúsculas de minúsculas.
    const sql = `SELECT palavra FROM cacapalavras_palavras WHERE mundo = ? AND fase = ? AND palavra = ?`;
    
    db.get(sql, [mundo, fase, palavra.toUpperCase()], (err, row) => {
        if (err) {
            console.error("Erro ao validar palavra:", err);
            return res.status(500).json({ error: 'Erro ao validar palavra.' });
        }
        
        // Se 'row' for encontrado, a palavra está correta. A resposta é { "correta": true }.
        // Se 'row' for nulo, a palavra está incorreta. A resposta é { "correta": false }.
        res.json({ correta: !!row });
    });
});

module.exports = router;