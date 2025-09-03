const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/fase/:id_jogador/:fase', (req, res) => {
  const { id_jogador, fase } = req.params;
  const faseRequisitada = parseInt(fase);

  if (!id_jogador || isNaN(faseRequisitada) || faseRequisitada < 1) {
    return res.status(400).json({ error: 'Parâmetros inválidos.' });
  }

  db.get(
    `SELECT MAX(fase) as fase_atual FROM progresso WHERE id_jogador = ?`,
    [id_jogador],
    (err, row) => {
      if (err) {
        console.error('Erro ao verificar acesso à fase:', err);
        return res.status(500).json({ error: 'Erro interno.' });
      }

      const faseAtual = row?.fase_atual || 0;

      if (faseRequisitada > faseAtual + 1) {
        return res.status(403).json({
          permitido: false,
          mensagem: `Fase ${faseRequisitada} bloqueada. Conclua a fase ${faseAtual + 1} primeiro.`,
        });
      }

      // Buscar dados da fase para enviar junto (opcional)
      db.get(
        `SELECT nome, descricao FROM fases WHERE id = ?`,
        [faseRequisitada],
        (faseErr, faseRow) => {
          if (faseErr) {
            console.error('Erro ao buscar dados da fase:', faseErr);
            return res.status(500).json({ error: 'Erro interno.' });
          }

          res.json({
            permitido: true,
            mensagem: `Acesso liberado para a fase ${faseRequisitada}.`,
            fase: faseRow || null,
          });
        }
      );
    }
  );
});

module.exports = router;
