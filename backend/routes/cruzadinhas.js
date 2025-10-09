// routes/cruzadinhas.js
const express = require('express');
const router = express.Router();
const db = require('../db');

/**
 * Rota para buscar a estrutura completa da cruzadinha de uma fase.
 * O front-end usará esta rota para saber quais palavras existem e onde desenhá-las na grade.
 */
router.get('/:mundo/:fase', (req, res) => {
    const { mundo, fase } = req.params;

    // Validação simples dos parâmetros
    if (isNaN(parseInt(mundo)) || isNaN(parseInt(fase))) {
        return res.status(400).json({ error: 'Parâmetros de mundo ou fase inválidos.' });
    }

    const sql = `SELECT palavra, dica, posicao_x, posicao_y, orientacao FROM cruzadinhas WHERE mundo = ? AND fase = ?`;

    db.all(sql, [mundo, fase], (err, rows) => {
        if (err) {
            console.error("Erro ao buscar dados da cruzadinha:", err);
            return res.status(500).json({ error: 'Erro ao buscar dados da cruzadinha.' });
        }
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Cruzadinha não encontrada para esta fase.' });
        }
        // Retorna um array com todas as palavras e suas propriedades para a fase
        res.json(rows);
    });
});

/**
 * Rota para validar uma única palavra enviada pelo jogador.
 * O front-end usará esta rota para verificar se o jogador acertou uma palavra.
 */
router.post('/validar', (req, res) => {
    const { mundo, fase, palavra } = req.body;

    // Validação simples
    if (!mundo || !fase || !palavra) {
        return res.status(400).json({ error: 'Dados incompletos para validação.' });
    }
    
    // Busca no banco se a palavra enviada existe para aquela fase específica.
    // Usamos toUpperCase() para garantir que a comparação não diferencia maiúsculas de minúsculas.
    const sql = `SELECT palavra FROM cruzadinhas WHERE mundo = ? AND fase = ? AND palavra = ?`;
    
    db.get(sql, [mundo, fase, palavra.toUpperCase()], (err, row) => {
        if (err) {
            console.error("Erro ao validar palavra:", err);
            return res.status(500).json({ error: 'Erro ao validar palavra.' });
        }
        
        if (row) {
            // A palavra está correta
            res.json({ correta: true, palavra: row.palavra });
        } else {
            // A palavra está incorreta
            res.json({ correta: false });
        }
    });
});

module.exports = router;