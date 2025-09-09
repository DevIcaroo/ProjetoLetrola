const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/fase/:id_jogador/:mundo/:fase", (req, res) => {
  const { id_jogador, mundo, fase } = req.params;
  const mundoRequisitado = parseInt(mundo);
  const faseRequisitada = parseInt(fase);

  if (
    !id_jogador ||
    isNaN(mundoRequisitado) ||
    mundoRequisitado < 1 ||
    isNaN(faseRequisitada) ||
    faseRequisitada < 1
  ) {
    return res.status(400).json({ error: "Parâmetros inválidos." });
  }

  db.get(
    `SELECT MAX(fase) as fase_atual FROM progresso WHERE id_jogador = ? AND mundo = ?`,
    [id_jogador, mundoRequisitado],
    (err, row) => {
      if (err) {
        console.error("Erro ao verificar acesso à fase:", err);
        return res.status(500).json({ error: "Erro interno." });
      }

      const faseAtual = row?.fase_atual || 0;

      if (faseRequisitada > faseAtual + 1) {
        return res.status(403).json({
          permitido: false,
          mensagem: `Fase ${faseRequisitada} bloqueada. Conclua a fase ${
            faseAtual + 1
          } primeiro.`,
        });
      } // A consulta agora busca dados da fase usando MUNDO e FASE

      db.get(
        `SELECT nome, descricao FROM fases WHERE mundo = ? AND fase = ?`,
        [mundoRequisitado, faseRequisitada],
        (faseErr, faseRow) => {
          if (faseErr) {
            console.error("Erro ao buscar dados da fase:", faseErr);
            return res.status(500).json({ error: "Erro interno." });
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
