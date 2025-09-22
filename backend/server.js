const express = require('express');
const cors = require('cors'); 
const app = express();
const PORT = 3000;

const criarTabelas = require('./initDatabase');

// --- Middlewares ---
// O cors permite que o seu front-end (mesmo que esteja num domínio diferente) aceda à API.
app.use(cors());
// O express.json permite que o servidor entenda os dados em formato JSON enviados no corpo das requisições POST.
app.use(express.json());

// --- Inicialização da Base de Dados ---
// Chama a função que cria as tabelas se elas não existirem.
criarTabelas();

// --- Carregamento dos Ficheiros de Rotas ---
const progressoRoutes = require('./routes/progresso');
const dialogosRoutes = require('./routes/dialogos');
const fasesRoutes = require('./routes/fases');
const itensFaseRoutes = require('./routes/itensFase');
const jogadoresRoutes = require('./routes/jogadores');

// --- Registo das Rotas com Prefixos ---
// ✅ MODIFICAÇÃO: Todas as rotas agora têm um prefixo base claro.
app.use('/progresso', progressoRoutes);
app.use('/dialogos', dialogosRoutes);
app.use('/fases', fasesRoutes);
app.use('/itens-fase', itensFaseRoutes);
app.use('/jogadores', jogadoresRoutes);

// --- Arranque do Servidor ---
app.listen(PORT, () => {
  console.log(`Servidor a correr em http://localhost:${PORT}`);
});