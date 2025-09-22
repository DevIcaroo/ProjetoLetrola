const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'progresso.db');
const db = new sqlite3.Database(dbPath);

db.on('open', () => {
  db.run('PRAGMA foreign_keys = ON');
  console.log('Banco de dados conectado com sucesso e foreign keys ativadas.');
});

db.on('error', (err) => {
  console.error('Erro ao abrir banco de dados:', err.message);
});

module.exports = db;
