const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/dialogos/:mundo/:fase', (req, res) => {
  const { mundo, fase } = req.params;
  const mundoNum = parseInt(mundo);
  const faseNum = parseInt(fase);

  if (isNaN(mundoNum) || mundoNum < 1 || isNaN(faseNum) || faseNum < 1) {
    return res.status(400).json({ error: 'Parâmetros de mundo ou fase inválidos.' });
  }

  db.all(
    `SELECT d.ordem, p.nome AS personagem, d.fala, d.expressao
     FROM dialogos d
     JOIN personagens p ON d.personagem_id = p.id
     WHERE d.mundo = ? AND d.fase = ?
     ORDER BY d.ordem ASC`,
    [mundoNum, faseNum],
    (err, rows) => {
      if (err) {
        console.error('Erro ao buscar diálogos:', err);
        return res.status(500).json({ error: 'Erro ao buscar diálogos.' });
      }
      // Se não houver diálogos, retorna um array vazio.
      // O front-end pode decidir como lidar com isso.
      res.json(rows || []);
    }
  );
});

module.exports = router;