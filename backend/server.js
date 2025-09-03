const express = require('express');
const cors = require('cors'); 
const app = express();
const PORT = 3000;

const criarTabelas = require('./initDatabase');

app.use(cors());

app.use(express.json());

criarTabelas();

const progressoRoutes = require('./routes/progresso');
const dialogosRoutes = require('./routes/dialogos');
const fasesRoutes = require('./routes/fases');
const itensFaseRoutes = require('./routes/itensFase');

app.use(progressoRoutes);
app.use(dialogosRoutes);
app.use(fasesRoutes);
app.use('/itens-fase', itensFaseRoutes);

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

