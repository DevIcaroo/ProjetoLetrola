
const express = require('express');
const router = express.Router();
const db = require('../db');

function validarIdJogador(id) {
  return /^[a-zA-Z0-9_-]{3,20}$/.test(id);
}

router.post('/salvar-progresso', (req, res) => {
  // Novo parâmetro adicionado: tempo_gasto
  const { id_jogador, fase, estrelas, tempo_gasto } = req.body;

  // Atualização validada para incluir o tempo_gasto
  if (
    !validarIdJogador(id_jogador) ||
    typeof fase !== 'number' ||
    fase < 1 ||
    (estrelas !== undefined && (typeof estrelas !== 'number' || estrelas < 0 || estrelas > 3)) ||
    (tempo_gasto !== undefined && (typeof tempo_gasto !== 'number' || tempo_gasto < 0))
  ) {
    return res.status(400).json({ error: 'Dados inválidos.' });
  }

  const estrelasValidadas = Math.max(0, Math.min(estrelas ?? 0, 3));

  // A consulta agora usa `INSERT OR REPLACE` para simplificar a lógica
  // Isso insere um novo registro se não existir ou substitui o registro existente
  // O `id_jogador` e a `fase` formam uma chave composta única
  db.run(
    `INSERT OR REPLACE INTO progresso (id_jogador, fase, estrelas, tempo_gasto) VALUES (?, ?, ?, ?)`,
    [id_jogador, fase, estrelasValidadas, tempo_gasto],
    function (err) {
      if (err) {
        console.error('Erro ao salvar/atualizar progresso:', err);
        return res.status(500).json({ error: 'Erro ao salvar/atualizar progresso.' });
      }
      return res.status(201).json({ message: 'Progresso salvo/atualizado com sucesso.' });
    }
  );
});

router.get('/progresso/:id_jogador', (req, res) => {
  const { id_jogador } = req.params;

  if (!validarIdJogador(id_jogador)) {
    return res.status(400).json({ error: 'ID do jogador inválido.' });
  }

  db.get(
    `SELECT MAX(fase) as fase_atual FROM progresso WHERE id_jogador = ?`,
    [id_jogador],
    (err, row) => {
      if (err) {
        console.error('Erro ao buscar progresso:', err);
        return res.status(500).json({ error: 'Erro ao buscar progresso.' });
      }
      if (!row) {
        return res.status(404).json({ message: 'Nenhum progresso encontrado para esse jogador.' });
      }
      res.json({ fase_atual: row.fase_atual || 0 });
    }
  );
});

router.get('/estrelas/:id_jogador/:fase', (req, res) => {
  const { id_jogador, fase } = req.params;
  const faseNum = parseInt(fase);

  if (!validarIdJogador(id_jogador) || isNaN(faseNum) || faseNum < 1) {
    return res.status(400).json({ error: 'Parâmetros inválidos.' });
  }

  db.get(
    `SELECT estrelas FROM progresso WHERE id_jogador = ? AND fase = ? ORDER BY data DESC LIMIT 1`,
    [id_jogador, faseNum],
    (err, row) => {
      if (err) {
        console.error('Erro ao buscar estrelas:', err);
        return res.status(500).json({ error: 'Erro ao buscar estrelas.' });
      }
      if (!row) {
        return res.json({ estrelas: 0 }); 
      }
      res.json({ estrelas: row.estrelas });
    }
  );
});

module.exports = router;