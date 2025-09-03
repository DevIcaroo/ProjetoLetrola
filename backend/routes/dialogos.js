const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/dialogos/:fase', (req, res) => {
  const fase = parseInt(req.params.fase);

  if (isNaN(fase) || fase < 1) {
    return res.status(400).json({ error: 'Parâmetro de fase inválido.' });
  }

  db.all(
    `SELECT d.ordem, p.nome AS personagem, d.fala, d.expressao
     FROM dialogos d
     JOIN personagens p ON d.personagem_id = p.id
     WHERE d.fase = ?
     ORDER BY d.ordem ASC`,
    [fase],
    (err, rows) => {
      if (err) {
        console.error('Erro ao buscar diálogos:', err);
        return res.status(500).json({ error: 'Erro ao buscar diálogos.' });
      }
      res.json(rows);
    }
  );
});

module.exports = router;
