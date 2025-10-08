// routes/fases.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// Rota para verificar o acesso a uma fase
router.get('/fase/:id_jogador/:mundo/:fase', (req, res) => {
    const { id_jogador, mundo, fase } = req.params;

    // A primeira fase de qualquer mundo está sempre liberada
    if (parseInt(fase, 10) === 1) {
        return res.json({ permitido: true });
    }

    // Para fases > 1, verifica se a fase anterior foi completada com PELO MENOS 1 ESTRELA.
    const faseAnterior = parseInt(fase, 10) - 1;
    const sql = `
        SELECT estrelas 
        FROM progresso 
        WHERE id_jogador = ? AND mundo = ? AND fase = ? AND ativo = 1 AND estrelas > 0`; // <-- A MUDANÇA IMPORTANTE ESTÁ AQUI

    db.get(sql, [id_jogador, mundo, faseAnterior], (err, row) => {
        if (err) {
            console.error("Erro no DB:", err.message);
            return res.status(500).json({ error: 'Erro ao verificar progresso.' });
        }
        
        // Se a consulta encontrou um resultado, o acesso é permitido
        if (row) {
            return res.json({ permitido: true });
        } else {
            // Se não encontrou, o acesso é negado
            return res.status(403).json({ 
                permitido: false, 
                mensagem: `Você precisa completar a Fase ${faseAnterior} primeiro!` 
            });
        }
    });
});

module.exports = router;