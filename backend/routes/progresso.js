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

  // Validação dos dados recebidos do front-end.
  if (
    !validarIdJogador(id_jogador) ||
    typeof mundo !== "number" || mundo < 1 ||
    typeof fase !== "number" || fase < 1 ||
    (estrelas !== undefined && (typeof estrelas !== "number" || estrelas < 0 || estrelas > 3)) ||
    (tempo_gasto !== undefined && (typeof tempo_gasto !== "number" || tempo_gasto < 0))
  ) {
    return res.status(400).json({ error: "Dados inválidos." });
  }

  // Garante que o valor de estrelas esteja sempre no intervalo [0, 3].
  const estrelasValidadas = Math.max(0, Math.min(estrelas ?? 0, 3));

  // 'INSERT OR REPLACE' cria uma nova linha ou substitui uma existente se violar a constraint UNIQUE.
  // Adicionamos 'ativo' e o valor '1' para garantir que a operação ocorra no jogo ativo.
  db.run(
    `INSERT OR REPLACE INTO progresso (id_jogador, mundo, fase, estrelas, tempo_gasto, ativo) VALUES (?, ?, ?, ?, ?, 1)`,
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

/**
 * Rota para iniciar um "Novo Jogo".
 * Arquiva todo o progresso ativo de um jogador, marcando-o como inativo (ativo = 0).
 */
router.post("/novo-jogo", (req, res) => {
    const { id_jogador } = req.body;
  
    if (!validarIdJogador(id_jogador)) {
      return res.status(400).json({ error: "ID do jogador inválido." });
    }
  
    // Comando SQL que encontra todos os registros de progresso ATIVOS e os torna INATIVOS.
    const sql = `UPDATE progresso SET ativo = 0 WHERE id_jogador = ? AND ativo = 1`;
  
    db.run(sql, [id_jogador], function (err) {
      if (err) {
        console.error("Erro ao iniciar novo jogo:", err);
        return res.status(500).json({ error: "Erro ao iniciar novo jogo." });
      }
  
      res.status(200).json({ 
          message: "Novo jogo iniciado. O progresso anterior foi arquivado.",
          progresso_arquivado: this.changes // 'this.changes' informa quantas linhas foram atualizadas.
      });
    });
  });

/**
 * ✅ [NOVA ROTA ADICIONADA]
 * Rota para VERIFICAR se um jogador tem um jogo ATIVO para continuar.
 */
router.get("/status/:id_jogador", (req, res) => {
    const { id_jogador } = req.params;
  
    if (!validarIdJogador(id_jogador)) {
      return res.status(400).json({ error: "ID do jogador inválido." });
    }
  
    // Consulta otimizada: seleciona o valor '1' do primeiro registro que encontrar.
    // É mais rápido do que contar todos os registros (COUNT).
    const sql = `SELECT 1 FROM progresso WHERE id_jogador = ? AND ativo = 1 LIMIT 1`;
  
    db.get(sql, [id_jogador], (err, row) => {
      if (err) {
        console.error("Erro ao verificar progresso:", err);
        return res.status(500).json({ error: "Erro ao verificar progresso." });
      }
      // Se 'row' existir, '!!row' se torna 'true'. Se for nulo, se torna 'false'.
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

  // A cláusula "AND ativo = 1" garante que estamos somando estrelas apenas do jogo atual.
  const sql = `SELECT SUM(estrelas) as total_estrelas FROM progresso WHERE id_jogador = ? AND ativo = 1`;

  db.get(sql, [id_jogador], (err, row) => {
    if (err) {
      console.error("Erro ao buscar total de estrelas:", err);
      return res.status(500).json({ error: "Erro interno ao buscar o total de estrelas." });
    }
    // Retorna o total ou 0 se o jogador não tiver estrelas no jogo ativo.
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

  // Busca a fase mais alta jogada no jogo ATIVO.
  db.get(
    `SELECT MAX(fase) as fase_atual FROM progresso WHERE id_jogador = ? AND mundo = ? AND ativo = 1`,
    [id_jogador, mundoNum],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: "Erro ao buscar progresso." });
      }
      
      // Se não houver progresso, a fase atual é a 1.
      if (!row || !row.fase_atual) {
        return res.json({ fase_atual: 1 });
      }

      // Verifica se a última fase jogada foi concluída (tem > 0 estrelas) para liberar a próxima.
      db.get(
        `SELECT estrelas FROM progresso WHERE id_jogador = ? AND mundo = ? AND fase = ? AND ativo = 1`,
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

  // Busca estrelas apenas do jogo ATIVO.
  db.get(
    `SELECT estrelas FROM progresso WHERE id_jogador = ? AND mundo = ? AND fase = ? AND ativo = 1`,
    [id_jogador, mundoNum, faseNum],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: "Erro ao buscar estrelas." });
      }
      // Se não houver registro, retorna 0 estrelas.
      if (!row) {
        return res.json({ estrelas: 0 }); 
      }
      res.json({ estrelas: row.estrelas });
    }
  );
});

module.exports = router;