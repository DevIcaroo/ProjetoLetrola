// routes/settings.js
const express = require('express');
const router = express.Router();
const db = require('../db');

/**
 * Rota para BUSCAR as configurações de som de um jogador.
 * O front-end chamará esta rota logo após o login.
 */
router.get('/:id_jogador', (req, res) => {
    const { id_jogador } = req.params;
    const sql = `SELECT musica_mutada, sfx_mutado FROM jogadores WHERE id = ?`;

    db.get(sql, [id_jogador], (err, row) => {
        if (err) {
            console.error("Erro ao buscar configurações:", err);
            return res.status(500).json({ error: 'Erro ao buscar configurações de som.' });
        }
        if (!row) {
            return res.status(404).json({ error: 'Jogador não encontrado.' });
        }
        // Retorna o estado atual. Ex: { musica_mutada: 0, sfx_mutado: 1 }
        // O front-end interpretará 0 como 'false' e 1 como 'true'.
        res.json(row);
    });
});

/**
 * Rota para ATUALIZAR as configurações de som de um jogador.
 * O front-end chamará esta rota toda vez que o jogador clicar nos botões de som.
 */
router.post('/', (req, res) => {
    const { id_jogador, musica_mutada, sfx_mutado } = req.body;

    // Validação básica dos dados recebidos
    if (!id_jogador || musica_mutada === undefined || sfx_mutado === undefined) {
        return res.status(400).json({ error: 'Dados incompletos para atualizar configurações.' });
    }

    // Converte os booleanos (true/false) do front-end para inteiros (1/0) para o banco de dados.
    const musicaValue = musica_mutada ? 1 : 0;
    const sfxValue = sfx_mutado ? 1 : 0;

    const sql = `UPDATE jogadores SET musica_mutada = ?, sfx_mutado = ? WHERE id = ?`;

    db.run(sql, [musicaValue, sfxValue, id_jogador], function (err) {
        if (err) {
            console.error("Erro ao atualizar configurações:", err);
            return res.status(500).json({ error: 'Erro ao salvar configurações de som.' });
        }
        res.json({ message: 'Configurações de som salvas com sucesso.' });
    });
});

module.exports = router;