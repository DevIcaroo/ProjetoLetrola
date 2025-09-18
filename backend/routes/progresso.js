const express = require("express");
const router = express.Router();
const db = require("../db");

// Validação para IDs numéricos.
function validarIdJogador(id) {
  const num = parseInt(id, 10);
  return !isNaN(num) && num > 0;
}

router.post("/salvar-progresso", (req, res) => {
  const { id_jogador, mundo, fase, estrelas, tempo_gasto } = req.body;

  if (
    !validarIdJogador(id_jogador) ||
    typeof mundo !== "number" || mundo < 1 ||
    typeof fase !== "number" || fase < 1 ||
    (estrelas !== undefined && (typeof estrelas !== "number" || estrelas < 0 || estrelas > 3)) ||
    (tempo_gasto !== undefined && (typeof tempo_gasto !== "number" || tempo_gasto < 0))
  ) {
    return res.status(400).json({ error: "Dados inválidos." });
  }

  const estrelasValidadas = Math.max(0, Math.min(estrelas ?? 0, 3));

  db.run(
    `INSERT OR REPLACE INTO progresso (id_jogador, mundo, fase, estrelas, tempo_gasto) VALUES (?, ?, ?, ?, ?)`,
    [id_jogador, mundo, fase, estrelasValidadas, tempo_gasto],
    function (err) {
      if (err) {
        console.error("Erro ao salvar/atualizar progresso:", err);
        return res.status(500).json({ error: "Erro ao salvar/atualizar progresso." });
      }
      return res.status(201).json({ message: "Progresso salvo/atualizado com sucesso." });
    }
  );
});

// ✅ CORREÇÃO DE ORDEM: A ROTA MAIS ESPECÍFICA FOI MOVIDA PARA CIMA
router.get("/progresso/total-estrelas/:id_jogador", (req, res) => {
  const { id_jogador } = req.params;
  if (!validarIdJogador(id_jogador)) {
    return res.status(400).json({ error: "ID do jogador inválido." });
  }

  const sql = `SELECT SUM(estrelas) as total_estrelas FROM progresso WHERE id_jogador = ?`;

  db.get(sql, [id_jogador], (err, row) => {
    if (err) {
      console.error("Erro ao buscar total de estrelas:", err);
      return res.status(500).json({ error: "Erro interno ao buscar o total de estrelas." });
    }
    res.status(200).json({ total_estrelas: row.total_estrelas || 0 });
  });
});

// A ROTA MAIS GENÉRICA AGORA FICA DEPOIS
router.get("/progresso/:id_jogador/:mundo_id", (req, res) => {
  const { id_jogador, mundo_id } = req.params;
  const mundoNum = parseInt(mundo_id);

  if (!validarIdJogador(id_jogador) || isNaN(mundoNum) || mundoNum < 1) {
    return res.status(400).json({ error: "ID do jogador ou mundo inválido." });
  }

  db.get(
    `SELECT MAX(fase) as fase_atual FROM progresso WHERE id_jogador = ? AND mundo = ?`,
    [id_jogador, mundoNum],
    (err, row) => {
      if (err) {
        console.error("Erro ao buscar progresso:", err);
        return res.status(500).json({ error: "Erro ao buscar progresso." });
      }
      
      if (!row || !row.fase_atual) {
        return res.json({ fase_atual: 1 });
      }

      db.get(
        `SELECT estrelas FROM progresso WHERE id_jogador = ? AND mundo = ? AND fase = ?`,
        [id_jogador, mundoNum, row.fase_atual],
        (err, estrelasRow) => {
            if (err) {
                return res.status(500).json({ error: "Erro ao verificar estrelas." });
            }
            if (estrelasRow && estrelasRow.estrelas > 0) {
                return res.json({ fase_atual: row.fase_atual + 1 });
            }
            return res.json({ fase_atual: row.fase_atual });
        }
      )
    }
  );
});


router.get("/estrelas/:id_jogador/:mundo/:fase", (req, res) => {
  const { id_jogador, mundo, fase } = req.params;
  const mundoNum = parseInt(mundo);
  const faseNum = parseInt(fase);

  if (
    !validarIdJogador(id_jogador) ||
    isNaN(mundoNum) || mundoNum < 1 ||
    isNaN(faseNum) || faseNum < 1
  ) {
    return res.status(400).json({ error: "Parâmetros inválidos." });
  }

  db.get(
    `SELECT estrelas FROM progresso WHERE id_jogador = ? AND mundo = ? AND fase = ?`,
    [id_jogador, mundoNum, faseNum],
    (err, row) => {
      if (err) {
        console.error("Erro ao buscar estrelas:", err);
        return res.status(500).json({ error: "Erro ao buscar estrelas." });
      }
      if (!row) {
        return res.json({ estrelas: 0 }); 
      }
      res.json({ estrelas: row.estrelas });
    }
  );
});

module.exports = router;