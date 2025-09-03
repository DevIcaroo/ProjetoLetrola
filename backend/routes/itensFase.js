// routes/itensFase.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// Rota para buscar todos os itens de uma fase
router.get('/:fase_id', (req, res) => {
    const faseId = parseInt(req.params.fase_id);

    if (isNaN(faseId) || faseId < 1) {
        return res.status(400).json({ error: 'ID da fase inválido.' });
    }

    db.all(
        `SELECT * FROM itens_fase WHERE fase_id = ? ORDER BY ordem ASC`,
        [faseId],
        (err, rows) => {
            if (err) {
                console.error('Erro ao buscar itens da fase:', err);
                return res.status(500).json({ error: 'Erro ao buscar itens da fase.' });
            }

            if (!rows.length) {
                return res.status(404).json({ message: 'Nenhum item encontrado para essa fase.' });
            }

            const itens = rows.map(item => {
                let letrasParsed = [];
                try {
                    letrasParsed = JSON.parse(item.letras);
                } catch (parseErr) {
                    console.warn(`Falha ao parsear letras para item ID ${item.id}:`, parseErr);
                }
                return {
                    ...item,
                    letras: letrasParsed,
                };
            });

            res.json(itens);
        }
    );
});

// Rota para buscar os itens do jogo dinamicamente
router.get('/:fase_id/jogo', (req, res) => {
    const { fase_id } = req.params;

    db.all('SELECT * FROM itens_fase WHERE fase_id = ?', [fase_id], (err, rows) => {
        if (err) {
            return res.status(500).json({ erro: err.message });
        }

        if (rows.length === 0) {
            return res.status(404).json({ mensagem: "Nenhum item encontrado para esta fase." });
        }

        // Lógica para selecionar 4 itens aleatoriamente
        const shuffled = rows.sort(() => 0.5 - Math.random());
        const itensSelecionados = shuffled.slice(0, 4);

        res.json(itensSelecionados);
    });
});

// Rota para verificar a resposta do jogador
router.post('/verificar-resposta', (req, res) => {
    const { resposta_do_jogador, resposta_correta } = req.body;

    if (!resposta_do_jogador || !resposta_correta) {
        return res.status(400).json({ erro: "Dados de resposta inválidos." });
    }

    const estaCorreto = resposta_do_jogador.toUpperCase() === resposta_correta.toUpperCase();

    res.json({ correto: estaCorreto });
});

module.exports = router;