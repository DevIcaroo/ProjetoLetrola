const express = require('express');
const router = express.Router();
const db = require('../db');

/**
 * Rota para buscar a estrutura completa da cruzadinha de uma fase.
 */
router.get('/:mundo/:fase', (req, res) => {
    const mundoNum = parseInt(req.params.mundo);
    const faseNum = parseInt(req.params.fase);

    // Validação agora usa as variáveis convertidas
    if (isNaN(mundoNum) || isNaN(faseNum)) {
        return res.status(400).json({ error: 'Parâmetros de mundo ou fase inválidos.' });
    }

    const sql = `SELECT palavra, dica, posicao_x, posicao_y, orientacao FROM cruzadinhas WHERE mundo = ? AND fase = ?`;

    // A consulta agora usa os números, garantindo a correspondência no banco de dados
    db.all(sql, [mundoNum, faseNum], (err, rows) => {
        if (err) {
            console.error("Erro ao buscar dados da cruzadinha:", err);
            return res.status(500).json({ error: 'Erro ao buscar dados da cruzadinha.' });
        }
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Cruzadinha não encontrada para esta fase.' });
        }
        res.json(rows);
    });
});

/**
 * Rota para validar uma única palavra enviada pelo jogador.
 */
router.post('/validar', (req, res) => {
    const { mundo, fase, palavra } = req.body;

    if (!mundo || !fase || !palavra) {
        return res.status(400).json({ error: 'Dados incompletos para validação.' });
    }
    
    const sql = `SELECT palavra FROM cruzadinhas WHERE mundo = ? AND fase = ? AND palavra = ?`;
    
    db.get(sql, [mundo, fase, palavra.toUpperCase()], (err, row) => {
        if (err) {
            console.error("Erro ao validar palavra:", err);
            return res.status(500).json({ error: 'Erro ao validar palavra.' });
        }
        
        if (row) {
            res.json({ correta: true, palavra: row.palavra });
        } else {
            res.json({ correta: false });
        }
    });
});

module.exports = router;