// routes/progresso.js
const express = require("express");
const router = express.Router();
const db = require("../db");

// --- Funções de Validação ---

/**
 * Valida se o ID fornecido é um número inteiro positivo.
 * Usado para 'id_jogador'.
 * @param {*} id O ID a ser validado.
 * @returns {boolean}
 */
function validarIdJogador(id) {
  const num = parseInt(id, 10);
  return !isNaN(num) && num > 0;
}

// --- Rotas da API ---

/**
 * Rota para salvar ou atualizar o progresso de uma fase.
 * Sempre opera no progresso ATIVO (ativo = 1) do jogador.
 */
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

  // ✅ [MELHORIA] Esta é a única parte que mudamos.
  // Usamos ON CONFLICT para garantir que a pontuação só seja atualizada se a nova for MELHOR.
  const sql = `
    INSERT INTO progresso (id_jogador, mundo, fase, estrelas, tempo_gasto, ativo) 
    VALUES (?, ?, ?, ?, ?, 1)
    ON CONFLICT(id_jogador, mundo, fase, ativo) 
    DO UPDATE SET 
        estrelas = excluded.estrelas, 
        tempo_gasto = excluded.tempo_gasto,
        data = CURRENT_TIMESTAMP
    WHERE excluded.estrelas > progresso.estrelas`;

  db.run(
    sql,
    [id_jogador, mundo, fase, estrelas, tempo_gasto],
    function (err) {
      if (err) {
        console.error("Erro ao salvar/atualizar progresso:", err);
        return res.status(500).json({ error: "Erro ao salvar/atualizar progresso." });
      }
      return res.status(201).json({ message: "Progresso salvo/atualizado com sucesso." });
    }
  );
});

/**
 * Rota para iniciar um "Novo Jogo".
 * Arquiva todo o progresso ativo de um jogador, marcando-o como inativo (ativo = 0).
 */
router.post("/novo-jogo", (req, res) => {
    const { id_jogador } = req.body;
 
    if (!validarIdJogador(id_jogador)) {
      return res.status(400).json({ error: "ID do jogador inválido." });
    }
 
    const sql = `UPDATE progresso SET ativo = 0 WHERE id_jogador = ? AND ativo = 1`;
 
    db.run(sql, [id_jogador], function (err) {
      if (err) {
        console.error("Erro ao iniciar novo jogo:", err);
        return res.status(500).json({ error: "Erro ao iniciar novo jogo." });
      }
 
      res.status(200).json({ 
          message: "Novo jogo iniciado. O progresso anterior foi arquivado.",
          progresso_arquivado: this.changes
      });
    });
  });

/**
 * Rota para VERIFICAR se um jogador tem um jogo ATIVO para continuar.
 */
router.get("/status/:id_jogador", (req, res) => {
    const { id_jogador } = req.params;
 
    if (!validarIdJogador(id_jogador)) {
      return res.status(400).json({ error: "ID do jogador inválido." });
    }
 
    const sql = `SELECT 1 FROM progresso WHERE id_jogador = ? AND ativo = 1 LIMIT 1`;
 
    db.get(sql, [id_jogador], (err, row) => {
      if (err) {
        console.error("Erro ao verificar progresso:", err);
        return res.status(500).json({ error: "Erro ao verificar progresso." });
      }
      res.status(200).json({ tem_progresso: !!row });
    });
  });

/**
 * Rota para buscar o TOTAL de estrelas do jogo ATIVO de um jogador.
 */
router.get("/total-estrelas/:id_jogador", (req, res) => {
  const { id_jogador } = req.params;
  if (!validarIdJogador(id_jogador)) {
    return res.status(400).json({ error: "ID do jogador inválido." });
  }

  const sql = `SELECT SUM(estrelas) as total_estrelas FROM progresso WHERE id_jogador = ? AND ativo = 1`;

  db.get(sql, [id_jogador], (err, row) => {
    if (err) {
      console.error("Erro ao buscar total de estrelas:", err);
      return res.status(500).json({ error: "Erro interno ao buscar o total de estrelas." });
    }
    res.status(200).json({ total_estrelas: row.total_estrelas || 0 });
  });
});

/**
 * Rota para buscar a FASE ATUAL do jogo ATIVO de um jogador em um mundo.
 */
router.get("/:id_jogador/:mundo_id", (req, res) => {
    const { id_jogador, mundo_id } = req.params;
    const mundoNum = parseInt(mundo_id);

    if (!validarIdJogador(id_jogador) || isNaN(mundoNum) || mundoNum < 1) {
        return res.status(400).json({ error: "ID do jogador ou mundo inválido." });
    }

    // A sua lógica aqui é mais robusta, vamos mantê-la.
    const sql = `SELECT MAX(fase) as fase_maxima FROM progresso WHERE id_jogador = ? AND mundo = ? AND ativo = 1`;
    db.get(sql, [id_jogador, mundoNum], (err, row) => {
        if (err) {
            return res.status(500).json({ error: "Erro ao buscar progresso." });
        }

        if (!row || !row.fase_maxima) {
            return res.json({ fase_atual: 1 });
        }

        const faseMax = row.fase_maxima;
        const sqlEstrelas = `SELECT estrelas FROM progresso WHERE id_jogador = ? AND mundo = ? AND fase = ? AND ativo = 1`;
        db.get(sqlEstrelas, [id_jogador, mundoNum, faseMax], (err, estrelasRow) => {
            if (err) {
                return res.status(500).json({ error: "Erro ao verificar estrelas da última fase." });
            }

            if (estrelasRow && estrelasRow.estrelas > 0) {
                return res.json({ fase_atual: Math.min(faseMax + 1, 5) });
            } else {
                return res.json({ fase_atual: faseMax });
            }
        });
    });
});

/**
 * Rota para buscar as estrelas de uma FASE ESPECÍFICA do jogo ATIVO.
 */
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
    `SELECT estrelas FROM progresso WHERE id_jogador = ? AND mundo = ? AND fase = ? AND ativo = 1`,
    [id_jogador, mundoNum, faseNum],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: "Erro ao buscar estrelas." });
      }
      res.json({ estrelas: row ? row.estrelas : 0 });
    }
  );
});

module.exports = router;