const express = require('express');
const router = express.Router(); // Usamos o Router do Express
const db = require('../db'); // Assumindo que o db.js está na pasta raiz

// POST /jogadores - Rota para criar um novo jogador
router.post('/', (req, res) => {
  const { nome } = req.body;
  if (!nome || nome.trim() === '') {
    return res.status(400).json({ error: 'O nome do jogador é obrigatório.' });
  }

  const sql = `INSERT INTO jogadores (nome) VALUES (?)`;
  db.run(sql, [nome.trim()], function(err) {
    if (err) {
      if (err.code === 'SQLITE_CONSTRAINT') {
        return res.status(409).json({ error: 'Este nome de jogador já está em uso.' });
      }
      console.error("Erro ao inserir jogador:", err.message);
      return res.status(500).json({ error: 'Erro interno ao criar o jogador.' });
    }

    res.status(201).json({
      id: this.lastID,
      nome: nome.trim()
    });
  });
});

// GET /jogadores/:nome - Rota para buscar um jogador pelo nome
router.get('/:nome', (req, res) => {
  const { nome } = req.params;

  const sql = `SELECT * FROM jogadores WHERE nome = ?`;
  db.get(sql, [nome], (err, row) => {
    if (err) {
      console.error("Erro ao buscar jogador:", err.message);
      return res.status(500).json({ error: 'Erro interno ao buscar o jogador.' });
    }

    if (row) {
      // Jogador encontrado
      res.status(200).json(row);
    } else {
      // Jogador não encontrado
      res.status(404).json({ error: 'Jogador não encontrado.' });
    }
  });
});

module.exports = router; // Exporta o router com as rotas configuradas